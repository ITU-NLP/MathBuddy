from enum import StrEnum


class Sentiment(StrEnum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"
    BOREDOM = "boredom"
    ENGAGEMENT = "engagement"
