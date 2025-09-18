from typing import Final

import torch
import torch.nn as nn

from transformers import BertModel

from tutor.model.emotion import SentimentRating

from tutor.model.emotion.pre_trained_emotion_model import PreTrainedEmotionModel

NUM_LABELS: Final[int] = 3
NUM_CLASSES: Final[int] = 3

NEUTRAL_INDEX: Final[int] = 0
BOREDOM_INDEX: Final[int] = 1
ENGAGEMENT_INDEX: Final[int] = 2

class EmotionBert(nn.Module, PreTrainedEmotionModel):

    def __init__(self):
        super().__init__()
        # download the pre-trained model 
        self.bert = BertModel.from_pretrained("bert-base-uncased")
        # create the hidden layer
        hidden_size = self.bert.config.hidden_size
        # create the final classification layer
        self.classifier = nn.Linear(hidden_size, NUM_LABELS * NUM_CLASSES)


    def forward(self, input_ids, attention_mask) -> torch.Tensor:
        output = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        pooled = output.pooler_output
        logits = self.classifier(pooled)
        return logits.view(-1, NUM_LABELS, NUM_CLASSES)


    def get_emotion_pred(self, input_ids, attention_mask) -> SentimentRating:
        with torch.no_grad():
            results = self.forward(input_ids, attention_mask)
        squeezed = results.squeeze(0)
        pred_indices = torch.argmax(squeezed, dim=1)

        # convert logits to confidence scores for the highest scores per class
        confidences = squeezed[torch.arange(3), pred_indices].softmax(dim=0)

        return SentimentRating(
            neutral=int(pred_indices[NEUTRAL_INDEX].item()),
            boredom=int(pred_indices[BOREDOM_INDEX].item()),
            engagement=int(pred_indices[ENGAGEMENT_INDEX].item()),
            neutral_confidence=float(confidences[NEUTRAL_INDEX].item()),
            boredom_confidence=float(confidences[BOREDOM_INDEX].item()),
            engagement_confidence=float(confidences[ENGAGEMENT_INDEX].item()),
        )
