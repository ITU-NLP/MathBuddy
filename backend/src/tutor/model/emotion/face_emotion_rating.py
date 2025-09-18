from dataclasses import dataclass
from datetime import datetime

from tutor.model.emotion import Emotion


@dataclass
class FaceEmotionRating:
    emotion: Emotion
    confidence: float
    timestamp: datetime