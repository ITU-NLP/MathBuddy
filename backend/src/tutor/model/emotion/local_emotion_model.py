from transformers import PreTrainedTokenizerFast
import torch

from tutor.model.emotion import SentimentRating, EmotionModel, PreTrainedEmotionModel


class LocalEmotionModel(EmotionModel):

    def __init__(self, tokenizer: PreTrainedTokenizerFast, model: PreTrainedEmotionModel) -> None:
        super().__init__()
        self.tokenizer = tokenizer
        self.model = model
        self.model_device = self._get_device(model)

    @staticmethod
    def _get_device(obj: PreTrainedTokenizerFast | PreTrainedEmotionModel) -> torch.device:
        return next(obj.parameters()).device

    def analyze(self, sentence: str) -> SentimentRating | None:
        tokenizer = self.tokenizer
        model = self.model
        model_device = self.model_device

        input_t = tokenizer(sentence, return_tensors="pt")
        input_ids = input_t.input_ids.to(model_device)
        attention_mask = input_t.attention_mask.to(model_device)
        sentiment = model.get_emotion_pred(input_ids, attention_mask)

        return sentiment