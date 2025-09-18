from typing import Final

from PIL import Image
from transformers import PreTrainedTokenizerFast
import torch

from tutor.model.emotion import Emotion, PreTrainedEmotionModel, FaceEmotionModel

NEGATIVE_INDEX: Final[int] = 0
NEUTRAL_INDEX: Final[int] = 1
POSITIVE_INDEX: Final[int] = 2

CLASS_TO_EMOTION: Final[tuple[Emotion, Emotion, Emotion]] = (Emotion.NEGATIVE, Emotion.NEUTRAL, Emotion.POSITIVE)

class LocalFaceEmotionModel(FaceEmotionModel):

    def __init__(self, processor, model) -> None:
        super().__init__()
        self.processor = processor
        self.model = model
        self.model_device = self._get_device(model)

    @staticmethod
    def _get_device(obj) -> torch.device:
        return next(obj.parameters()).device

    def analyze(self, image: Image) -> tuple[Emotion, float] | None:
        processor = self.processor
        model = self.model
        device = self.model_device

        image = image.convert("RGB")
        inputs = processor(images=image, return_tensors="pt")

        inputs = {k: v.to(device) for k, v in inputs.items()}

        with torch.no_grad():
            outputs = model(**inputs)

        confidences = outputs.logits[0].softmax(dim=0)
        predicted_class = torch.argmax(confidences, dim=-1).item()

        emotion = CLASS_TO_EMOTION[predicted_class]
        confidence = confidences[predicted_class].item()

        return emotion, confidence
