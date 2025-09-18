from abc import ABC, abstractmethod
from collections import defaultdict
from datetime import timedelta
from typing import Final, Sequence
import re

import numpy as np
from tutor.model.language import Message
from tutor.model.emotion import Sentiment, FaceEmotionRating, SentimentRating

EXAMPLE_DESCRIPTION_A: Final[str] = "The student's answer shows the summation of positive and negative integers, negative 6, 12, and negative 4, using a number line. With even-numbered intervals, the directions of the arrows illustrate three summation steps, 0 plus negative 6 equals negative 6, then negative 6 plus 12 equals negative 6, and 6 plus negative 4 equals 2."
EXAMPLE_DESCRIPTION_B: Final[str] = "This is a digital hand drawn image with a number line digitally given. \n\nA horizontal number line is drawn. \n\nThe minimum number on this number line is -10 and the maximum number is 10. Each consecutive whole number between -10 and 10 is plotted on the number line and indicated with a tick mark. \n\nThe number 2 is the answer and the arrows stop there. 2 is the sum of the problem which is -6 + 12 + -4. \n\nThe student found this answer by drawing lines on this number line. \n\nA green line begins from 0 and goes left to -6. This indicates the starting value of -6 from the game.  \n\nA black line begins from -6 and goes right to +5, which is an error. This should have gone to +6 to indicates the change of +12. An error was made here.\n\nA blue line begins from +5 and goes left to +2. This indicates the change of -3, but it should be a change of -4. 5 was the wrong starting point, but 2 is the answer."
EXAMPLE_DESCRIPTION_C: Final[str] = "This is a hand-drawn image on pre-printed paper. The question has been pre-printed on that paper. The student drew a right triangle. The base and the height of the right triangle are labeled leg, and the hypotenuse is labeled hypotenuse. Where the base and the height, which are both labeled leg, intersect, the student has drawn a little square in the corner to represent the 90-degree angle of that right triangle."
EXAMPLE_DESCRIPTIONS: Final[str] = "\n\n\n".join((EXAMPLE_DESCRIPTION_A, EXAMPLE_DESCRIPTION_B, EXAMPLE_DESCRIPTION_C))

DESCRIPTION_SYSTEM_PROMPT: Final[str] = f"""You are an educational assistant who interprets math tutoring conversations.
Given a JSON-formatted conversation between a student and a teacher, describe what the student's problem-solving notes would look like.
Focus on the student, the tutor does not extend or edit the student's notes.

Imagine and describe visuals such as number lines, equations, diagrams, or written steps.
Use clear, specific language to explain what appears on a worksheet or whiteboard.
The result should be a normal text without headlines. You must not use any markup like Markdown or LaTeX.
Include numeric values, directional arrows, or other visual elements that correspond with the student’s reasoning.
Focus only on the visual elements directly implied by the student's responses.
Try to keep the description neutral, objective, and to a reasonable length, ideally fairly concise.
You must not include the students name.
Do not add a summery at the end.

### Examples:
Keep the descriptions in a format and length similar to the following example descriptions:
{EXAMPLE_DESCRIPTIONS}

### Input:
{{}}
"""

QA_SYSTEM_PROMPT: Final[str] = """Below is an instruction that describes a task, paired with an input that provides further context. Write a response that appropriately completes the request.

### Instruction:
Given a student's solution to a math problem, a teacher has provided a written description of it. 
Look at the given teacher's description and generate question-answer pairs that will help the teacher analyse the solution better.
This might help the tutor come up with a better response for the student.

### Dialogue History:
{}

### Input:
{}

### Response:
"""

TUTOR_SYSTEM_PROMPT: Final[str] = """Below is an instruction that describes a task, paired with an input that provides further context. Write a response that appropriately completes the request.

### Instruction:
You are an experienced math teacher and you are going to respond to a student in a useful and caring way.
Gently nudge the student towards the correct answer using guiding questions as your response.
{}
### Full Conversation:
{}

"""

TUTOR_SYSTEM_PROMPT_PEDAGOGICAL_MAPPING: Final[str] = """Also consider the student's emotional state. 
Positive emotions include engagement and joy.
Neutral emotions include neutral and surprise.
Negative emotions include angriness, boredom, confusion, contempt, disgust, fear, frustration, and sadness.
If the student's last response indicates negative emotion, please motivate the student as a teacher.
If the student's last response indicates positive emotion or neutral emotion, please challenge the student as a teacher.

"""

TUTOR_SYSTEM_PROMPT_TEXT_SENTIMENT: Final[str] = """### Text based Emotional Ratings on a Likert scale (0 - Not at all; 1 - Moderately, 2 - Extremely):
{}

"""

TUTOR_SYSTEM_PROMPT_FACE_SENTIMENT: Final[str] = """### Facial Expression based Sentiment (out of Positive, Neutral, Negative):
{}

"""

TUTOR_SYSTEM_PROMPT_MERGED_SENTIMENT: Final[str] = """### Sentiment based on Student's Facial Expression and Text Input (out of Positive, Neutral, Negative):
{}

"""

TUTOR_SYSTEM_PROMPT_QA_PAIRS: Final[str] = """### Question-Answer Feedback Pairs :
{}

"""

TUTOR_SYSTEM_PROMPT_RESPONSE: Final[str] = """### Tutors Response:
"""

THOUGHTS_PATTERN: Final[re.Pattern] = re.compile(r"(<think>([^<]*</think>)?|(<think>[^<]*)?</think>)")


class PromptGenerator(ABC):

    @abstractmethod
    def generate_description_prompt(self, conversation: Sequence[Message]) -> str:
        pass

    @abstractmethod
    def generate_qa_prompt(self, conversation: Sequence[Message], description: str) -> str:
        pass

    @abstractmethod
    def generate_tutor_prompt(
            self,
            conversation: Sequence[Message],
            conv_sentiment: SentimentRating | None = None,
            msg_face_emotions: Sequence[FaceEmotionRating] | None = None,
            merged_sentiment: Sentiment | None = None,
            qa_pairs: str | None = None
    ) -> str:
        pass


class BasicPromptGenerator(PromptGenerator):

    @staticmethod
    def make_sentiment_str(sentiment: SentimentRating) -> str:
        return f"Neutral: {sentiment.neutral}\nBoredom: {sentiment.boredom}\nEngagement: {sentiment.engagement}"

    @staticmethod
    def make_conversation_json(conversation: Sequence[Message]) -> str:
        conv_json_str = "["
        conv_json_str += ",".join(
            f"{{\"text\":\"{response.content}\", \"user\": \"{response.role}\"}}" for response in conversation)
        conv_json_str += "]"
        return conv_json_str

    def generate_description_prompt(self, conversation: Sequence[Message]) -> str:
        conv_json_str = self.make_conversation_json(conversation)
        return DESCRIPTION_SYSTEM_PROMPT.format(conv_json_str)

    def generate_qa_prompt(self, conversation: Sequence[Message], description: str) -> str:
        conv_json_str = self.make_conversation_json(conversation)
        return QA_SYSTEM_PROMPT.format(conv_json_str, description)

    def generate_tutor_prompt(
            self,
            conversation: Sequence[Message],
            conv_sentiment: SentimentRating | None = None,
            msg_face_emotions: Sequence[FaceEmotionRating] | None = None,
            merged_sentiment: Sentiment | None = None,
            qa_pairs: str | None = None
    ) -> str:
        conv_str = self.make_conversation_json(conversation)
        if any((conv_sentiment, msg_face_emotions, merged_sentiment)):
            prompt = TUTOR_SYSTEM_PROMPT.format(TUTOR_SYSTEM_PROMPT_PEDAGOGICAL_MAPPING, conv_str)
        else:
            prompt = TUTOR_SYSTEM_PROMPT.format("", conv_str)

        if conv_sentiment is not None:
            sentiment_str = self.make_sentiment_str(conv_sentiment)
            prompt += TUTOR_SYSTEM_PROMPT_TEXT_SENTIMENT.format(sentiment_str)

        if msg_face_emotions is not None:
            facial_sentiment = self.map_facial_emotions(msg_face_emotions)
            prompt += TUTOR_SYSTEM_PROMPT_FACE_SENTIMENT.format(facial_sentiment)

        if merged_sentiment is not None:
            prompt += TUTOR_SYSTEM_PROMPT_MERGED_SENTIMENT.format(merged_sentiment)

        if qa_pairs is not None:
            prompt += TUTOR_SYSTEM_PROMPT_QA_PAIRS.format(qa_pairs)

        prompt += TUTOR_SYSTEM_PROMPT_RESPONSE

        return prompt
