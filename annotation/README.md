[Overview](../README.md) | [Frontend](../frontend/README.md) | [Backend](../backend/README.md) | [Dataset](./README.md)
___

# Dataset

[![CC BY-SA 4.0](https://img.shields.io/badge/License%20Dataset-CC%20BY--SA%204.0-lightgrey.svg)][cc-by-sa]

The dataset contains 340 entries of the MathDial-Bridge dataset, which have been augmented with emotion ratings. Each sample is associated with one conversation history and adds annotations for the last student utterance in the respective conversation. These annotations consist of one of three emotion classes $C = \{engagement, neutral, boredom\}$ and a polarity rating within the intensities $I = \{1, 2, 3\}$, where $1$ = low, $2$ = moderate, and $3$ = high.
All annotations were manually created to ensure agreement within the Project Mathbuddy Team.


## Metadata

The following table illustrates the distribution of emotions across the different intensities, revealing how these two variables interact within the dataset.

| emotion 🠋 ︱ intensity 🠊 |   1 |   2 |   3 |   Total |
|:--------------------------|----:|----:|----:|--------:|
| boredom                   | 103 |  58 |   5 |     166 |
| engagement                |  11 |  32 |  42 |      85 |
| neutral                   |   6 |  24 |  59 |      89 |
| **Total**                 | 120 | 114 | 106 |     340 |


## Structure

All data is provided via one JSON file.
Each entry within the JSON file represents an annotated conversation from the MathDial-Bridge dataset.
The data adheres to the following JSON schema:

```json
{
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "id": { 
        "description": "The unique identifier of the sample.",
        "type": "integer"
      },
      "emotion": {
        "description": "The main emotion assigned to the last utterance of the sample's conversation.",
        "type": "string",
        "enum": ["engagement", "neutral", "boredom"]
      },
      "polarity": {
        "description": "The intensity of the assigned emotion.",
        "type": "integer",
        "enum": [1, 2, 3]
      },
      "utterance": {
        "description": "The last and annotated utterance of the sample's conversation.",
        "type": "string"
      },
      "history": {
        "description": "The entire conversation history of this sample as text. This text represents a JSON list of message objects, each storing the sender ('user'), the message content ('text'), and optionally the intent behind a teacher response ('dialog_act'; defaults to an empty string)",
        "type": "string"
      }
    }
  }
}
```

Example entry:

```json
{
  "id": 274,
  "emotion": "neutral",
  "polarity": 3,
  "utterance": "yes",
  "history": "[\n    {\n        \"text\": \"Remember to show your work on the board.\",\n        \"dialog_act\": \"\",\n        \"user\": \"Teacher\"\n    },\n    {\n        \"text\": \"24\",\n        \"dialog_act\": \"\",\n        \"user\": \"Student\"\n    },\n    {\n        \"text\": \"Is this your final answer?\",\n        \"dialog_act\": \"\",\n        \"user\": \"Teacher\"\n    },\n    {\n        \"text\": \"yes\",\n        \"dialog_act\": \"\",\n        \"user\": \"Student\"\n    },\n    {\n        \"text\": \"Your work looks great but there's a small mistake\",\n        \"dialog_act\": \"\",\n        \"user\": \"Teacher\"\n    }\n]"
}
```

## License

The provided dataset is licensed under the
[Creative Commons Attribution-ShareAlike 4.0 International License][cc-by-sa]. It is based on the MathDialBridge Dataset by Macina et al., available as part of the [MathTutorBench GitHub repository](https://github.com/eth-lre/mathtutorbench/tree/main), licensed under [Creative Commons Attribution-ShareAlike 4.0 International][cc-by-sa].
Modifications were made by the Project MathBuddy Team.

[cc-by-sa]: http://creativecommons.org/licenses/by-sa/4.0/
