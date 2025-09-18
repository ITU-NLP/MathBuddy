from dataclasses import dataclass

from tutor.model.emotion import Sentiment


@dataclass
class SentimentRating:
    neutral: float
    neutral_confidence: float
    boredom: float
    boredom_confidence: float
    engagement: float
    engagement_confidence: float