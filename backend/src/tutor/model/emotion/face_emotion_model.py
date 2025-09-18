from abc import ABC, abstractmethod

from tutor.model.emotion import SentimentRating, Emotion


class FaceEmotionModel(ABC):

    @abstractmethod
    def analyze(self, sentence: str) -> tuple[Emotion, float] | None:
        pass

class NullEmotionModel(FaceEmotionModel):
    def analyze(self, sentence: str) -> tuple[Emotion, float] | None:
        return None