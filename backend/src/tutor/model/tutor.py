import random
from abc import ABC, abstractmethod
from collections import defaultdict
from datetime import timedelta
from typing import Sequence, Final

import numpy as np
from PIL import Image
from scipy.special import softmax
from tutor.model import PromptGenerator
from tutor.model.emotion import EmotionModel, Sentiment, FaceEmotionRating, SentimentRating, FaceEmotionModel, Emotion
from tutor.model.language import LanguageModel, Message


FACE_EMOTION_HALF_LIFE: Final[float] = 120.0  # in seconds

class Tutor(ABC):

    @abstractmethod
    def generate_response(
        self,
        conversation: Sequence[Message],
        use_emotion: bool = True,
        face_emotions: Sequence[FaceEmotionRating] | None = None
    ) -> str:
        pass

    @abstractmethod
    def predict_face_emotion(self, image: Image) -> tuple[Emotion, float]:
        pass


class ReturnPromptTutor(Tutor):

    def __init__(self,
                 prompt_generator: PromptGenerator,
                 face_emotion_model: FaceEmotionModel,
                 sentiment_model: EmotionModel | None = None,
                 desc_model: LanguageModel | None = None,
                 qa_model: LanguageModel | None = None,
                 ) -> None:
        self.prompt_generator = prompt_generator
        self.face_emotion_model = face_emotion_model
        self._sentiment_model = sentiment_model
        self._desc_model = desc_model
        self._qa_model = qa_model

    @staticmethod
    def _agg_text_emotions(sentiment_rating: SentimentRating) -> tuple[Sentiment, float]:
        n_conf = sentiment_rating.neutral_confidence
        b_conf = sentiment_rating.boredom_confidence
        e_conf = sentiment_rating.engagement_confidence

        if e_conf > n_conf:
            if e_conf >= b_conf:
                return Sentiment.POSITIVE, e_conf
            else: # bored is highest
                return Sentiment.NEGATIVE, b_conf
        elif n_conf >= b_conf:  # neutral is highest
            return Sentiment.NEUTRAL, n_conf
        else:  # bored is highest
            return Sentiment.NEGATIVE, b_conf

    @staticmethod
    def _agg_face_emotions(msg_face_emotions: Sequence[FaceEmotionRating]) -> tuple[Sentiment, float] | None:
        # aggregate all face emotions into one sentiment-confidence tuple
        if len(msg_face_emotions) == 0:
            return None

        now = msg_face_emotions[-1].timestamp + timedelta(seconds=0.25)
        end_times = [fe.timestamp for fe in msg_face_emotions[1:]]
        end_times.append(now)

        # aggregate the emotions based on their timeframe with time based decay
        decay_scores = defaultdict(float)

        for face_emotion, end_time in zip(msg_face_emotions, end_times):
            start_time = face_emotion.timestamp
            duration_seconds = (end_time - start_time).total_seconds()
            age_seconds = (now - end_time).total_seconds()
            decay_weight = np.exp(-age_seconds * 0.693 / FACE_EMOTION_HALF_LIFE)
            weighted_duration = duration_seconds * decay_weight

            # map emotions to their sentiment for scoring
            decay_scores[face_emotion.emotion.to_sentiment()] += weighted_duration

        keys = []
        scores = []
        for k, v in decay_scores.items():
            keys.append(k)
            scores.append(v)
        confidences = softmax(scores)
        decay_confidences = {k: v for k, v in zip(keys, confidences)}
        max_key = max(decay_confidences, key=decay_confidences.get)

        return max_key, decay_confidences[max_key]

    @staticmethod
    def _merge_sentiment(
        text: tuple[Sentiment, float] | None = None,
        face: tuple[Sentiment, float] | None = None,
    ) -> Sentiment:
        if text is None:
            if face is None:
                return Sentiment.NEUTRAL
            return face[0]
        elif face is None:
            return text[0]

        text_sentiment, text_confidence = text
        face_sentiment, face_confidence = face

        if text_sentiment == face_sentiment:
            return text_sentiment
        else:
            if face_sentiment == Sentiment.NEUTRAL:
                return text_sentiment  # text cannot be neutral because text != face at this point
            elif text_sentiment == Sentiment.NEUTRAL:
                return face_sentiment  # face cannot be neutral because text != face at this point
            elif text_confidence > face_confidence:
                return text_sentiment
            else:
                return face_sentiment


    def generate_response(
            self,
            conversation: Sequence[Message],
            use_emotion: bool = True,
            face_emotions: Sequence[FaceEmotionRating] | None = None
    ) -> tuple[str, dict]:
        used_input = dict()
        prompt_generator = self.prompt_generator
        recent_response = conversation[-1]

        merged_sentiment = None
        if use_emotion:
            if self._sentiment_model is not None:
                sentiment = self._sentiment_model.analyze(recent_response.content)
                text_sentiment = self._agg_text_emotions(sentiment)
                face_sentiment = self._agg_face_emotions(face_emotions)
                merged_sentiment = self._merge_sentiment(text_sentiment, face_sentiment)
                used_input["sentiment"] = {
                    "neutral": sentiment.neutral ,
                    "confidenceNeutral": sentiment.neutral_confidence,
                    "boredom": sentiment.boredom,
                    "confidenceBoredom": sentiment.boredom_confidence,
                    "engagement": sentiment.engagement,
                    "confidenceEngagement": sentiment.engagement_confidence,
                }
                if face_sentiment is not None:
                    used_input["sentimentAggFaceEmotion"] = face_sentiment[0]
                    used_input["confidenceAggFaceEmotion"] = face_sentiment[1]
                used_input["mergedSentiment"] = merged_sentiment

        qa_tuples = None
        if self._desc_model is not None and self._qa_model is not None:
            desc_prompt = prompt_generator.generate_description_prompt(conversation)
            desc = self._desc_model.prompt(desc_prompt)
            qa_prompt = prompt_generator.generate_qa_prompt(conversation, desc)
            qa_tuples = self._qa_model.prompt(qa_prompt)
            used_input["description"] = desc
            used_input["qaTuples"] = qa_tuples

        tutor_prompt = prompt_generator.generate_tutor_prompt(
            conversation=conversation,
            merged_sentiment=merged_sentiment,
            qa_pairs=qa_tuples,
        )

        return tutor_prompt, used_input


    def predict_face_emotion(self, image: Image) -> tuple[Emotion, float]:
        return self.face_emotion_model.analyze(image)


class LLMTutor(ReturnPromptTutor):

    def __init__(self,
                 prompt_generator: PromptGenerator,
                 tutor_model: LanguageModel,
                 face_emotion_model: FaceEmotionModel,
                 sentiment_model: EmotionModel | None = None,
                 desc_model: LanguageModel | None = None,
                 qa_model: LanguageModel | None = None,
                 ) -> None:
        super().__init__(
            prompt_generator=prompt_generator,
            face_emotion_model=face_emotion_model,
            sentiment_model=sentiment_model,
            desc_model=desc_model,
            qa_model=qa_model
        )
        self.tutor_model = tutor_model

    def generate_response(
            self,
            conversation: Sequence[Message],
            use_emotion: bool = True,
            face_emotions: Sequence[FaceEmotionRating] | None = None
    ) -> tuple[str, dict]:
        tutor_prompt, used_input = super().generate_response(conversation, use_emotion, face_emotions)
        tutor_response = self.tutor_model.prompt(tutor_prompt)

        return tutor_response, used_input


class MockTutor(Tutor):

    def __init__(self, *_, **__) -> None:
        pass

    def generate_response(
            self,
            conversation: Sequence[Message],
            use_emotion: bool = True,
            face_emotions: Sequence[FaceEmotionRating] | None = None
    ) -> tuple[str, dict]:
        return random.choice(("Yes", "No")), {}

    def predict_face_emotion(self, image: Image) -> tuple[Emotion, float]:
        return Emotion.NEUTRAL, 0.0


class EchoTutor(Tutor):

    def __init__(self, *_, **__) -> None:
        pass

    def generate_response(
            self,
            conversation: Sequence[Message],
            use_emotion: bool = True,
            face_emotions: Sequence[FaceEmotionRating] | None = None
    ) -> tuple[str, dict]:
        return conversation[-1].content, {}

    def predict_face_emotion(self, image: Image) -> tuple[Emotion, float]:
        return Emotion.NEUTRAL, 0.0