import io
from typing import Any, TypeVar, Final

import numpy as np
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS

from tutor.backend.parse import parse_conversation, parse_message_face_emotions
from tutor.model import Tutor

_T = TypeVar('_T')

SESSION_ID_FIELD: Final[str] = "sessionId"
CONVERSATION_FIELD: Final[str] = "conversation"
USE_EMOTIONS_FIELD: Final[str] = "useEmotions"
MESSAGE_FACE_EMOTION_FILED: Final[str] = "messageEmotions"

IMAGE_FIELD: Final[str] = "image"

def make_app(tutor_model: Tutor, use_error_handler: bool = True) -> Flask:

    app = Flask(__name__)
    CORS(app)

    @app.route("/tutor", methods=["POST"])
    def tutor() -> tuple[Any, int]:
        """
        Take a conversation and generate the next tutor response.
        """
        data = request.get_json()

        for field in (CONVERSATION_FIELD, USE_EMOTIONS_FIELD, MESSAGE_FACE_EMOTION_FILED):
            if field not in data:
               return jsonify({"error": f"JSON data is missing required '{field}' value"}), 400

        # session_id = str(data[SESSION_ID_FIELD])
        conversation_raw = data[CONVERSATION_FIELD]
        use_emotions_raw = data[USE_EMOTIONS_FIELD]
        msg_face_emotions_raw = data[MESSAGE_FACE_EMOTION_FILED]


        conversation = parse_conversation(conversation_raw)
        use_emotions = bool(use_emotions_raw)
        msg_face_emotions = parse_message_face_emotions(msg_face_emotions_raw)

        response, add_content = tutor_model.generate_response(conversation, use_emotions, msg_face_emotions)
        result = jsonify({"response": response, **add_content})
        return result, 200


    @app.route("/faceEmotion", methods=["POST"])
    def faceEmotion() -> tuple[Any, int]:
        if IMAGE_FIELD not in request.files:
            return jsonify({"error": "No image part in the request"}), 400

        file = request.files[IMAGE_FIELD]
        if file.filename == "":
            return jsonify({"error": "No file selected for uploading"}), 400

        img_bytes = file.read()
        img = Image.open(io.BytesIO(img_bytes))

        emotion, confidence = tutor_model.predict_face_emotion(img)

        result = jsonify({
            "emotion": emotion,
            "confidence": confidence,
        })

        return result, 200

    if use_error_handler:
        @app.errorhandler(Exception)
        def handle_exception(_: Exception) -> tuple[Any, int]:
            return jsonify({"error": "Something went wrong."}), 500

    return app