import json
from datetime import datetime
from typing import Sequence

from tutor.model.language import Message
from tutor.model.emotion import Emotion, FaceEmotionRating


def parse_conversation(data: str | list[dict] | dict) -> Sequence[Message] | None:
    if isinstance(data, str):
        try:
            data = json.loads(data)
        except json.decoder.JSONDecodeError:
            return None

    if not isinstance(data, list):
        data = [data]

    result = []
    for message in data:
        content = message.get("content")
        role = message.get("role")

        if content and role:
            cur_msg = Message(content=content, role=role)
            result.append(cur_msg)

    return result


def parse_message_face_emotions(data: str | list[dict] | dict) -> Sequence[FaceEmotionRating] | None:
    if isinstance(data, str):
        try:
            data = json.loads(data)
        except json.decoder.JSONDecodeError:
            return None

    if not isinstance(data, list):
        data = [data]

    result = []
    for face_emotion in data:
        emotion = Emotion(face_emotion.get("emotion"))
        confidence = face_emotion.get("confidence")
        timestamp = datetime.fromisoformat(face_emotion.get("timestamp"))

        if all((emotion, confidence, timestamp)):
            cur_face_emotion = FaceEmotionRating(emotion=emotion, confidence=confidence, timestamp=timestamp)
            result.append(cur_face_emotion)

    return sorted(result, key=lambda fe: fe.timestamp)



