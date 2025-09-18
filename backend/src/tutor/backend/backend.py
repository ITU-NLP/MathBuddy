import os
from typing import Final

from dotenv import load_dotenv
import huggingface_hub
import transformers

from tutor.backend.app import make_app
from tutor.backend.logic import TutorType, make_tutor

TRANSFORMERS_SEED: Final[int] = 42


def main():
    load_dotenv()

    hf_token = os.getenv("HF_TOKEN")
    if hf_token is not None:
        huggingface_hub.login(hf_token)

    transformers.set_seed(TRANSFORMERS_SEED)

    tutor = make_tutor(TutorType.LLM)

    app = make_app(tutor, use_error_handler=False)
    app.run(debug=True, use_reloader=False, port=5050)


if __name__ == "__main__":
    main()