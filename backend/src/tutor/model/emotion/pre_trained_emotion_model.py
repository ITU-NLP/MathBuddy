from abc import ABC, abstractmethod

from tutor.model.emotion.emotion_model import SentimentRating


class PreTrainedEmotionModel(ABC):

    @abstractmethod
    def get_emotion_pred(self, input_ids, attention_mask) -> SentimentRating:
        pass
