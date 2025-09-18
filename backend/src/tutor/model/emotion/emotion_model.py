from abc import ABC, abstractmethod

from tutor.model.emotion import SentimentRating


class EmotionModel(ABC):

    @abstractmethod
    def analyze(self, sentence: str) -> SentimentRating | None:
        pass

class NullEmotionModel(EmotionModel):
    def analyze(self, sentence: str) -> SentimentRating | None:
        return None