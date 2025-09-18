from enum import StrEnum
from typing import Final, Collection

from tutor.model.emotion import Sentiment


class Emotion(StrEnum):
    ANGRY = "angry"
    BORED = "bored"
    CONFUSED = "confused"
    CONTEMPT = "contempt"
    DISGUSTED = "disgusted"
    ENGAGED = "engaged"
    FEARFUL = "fearful"
    FRUSTRATED = "frustrated"
    HAPPY = "happy"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"
    POSITIVE = "positive"
    SAD = "sad"
    SURPRISED = "surprised"

    def to_sentiment(self) -> Sentiment:
        if self in POSITIVE_EMOTIONS:
            return Sentiment.POSITIVE
        if self in NEGATIVE_EMOTIONS:
            return Sentiment.NEGATIVE
        if self in NEUTRAL_EMOTIONS:
            return Sentiment.NEUTRAL
        raise ValueError("Invalid emotion")

POSITIVE_EMOTIONS: Final[Collection[Emotion]] = {Emotion.HAPPY, Emotion.POSITIVE, Emotion.ENGAGED}
NEUTRAL_EMOTIONS: Final[Collection[Emotion]] = {Emotion.NEUTRAL, Emotion.SURPRISED}
NEGATIVE_EMOTIONS: Final[Collection[Emotion]] = {Emotion.ANGRY, Emotion.BORED, Emotion.CONFUSED, Emotion.CONTEMPT,
                                                 Emotion.DISGUSTED, Emotion.FEARFUL, Emotion.FRUSTRATED,
                                                 Emotion.NEGATIVE, Emotion.SAD}
