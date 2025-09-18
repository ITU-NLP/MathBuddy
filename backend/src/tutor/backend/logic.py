import os
from enum import Enum
from pathlib import Path

from accelerate import Accelerator
import torch
from transformers import BertTokenizer, AutoTokenizer, AutoModelForCausalLM, ViTImageProcessor, ViTForImageClassification
from peft import PeftModel, PeftConfig

from tutor.model import Tutor, ReturnPromptTutor, LLMTutor, MockTutor, EchoTutor, BasicPromptGenerator
from tutor.model.emotion import EmotionModel, LocalEmotionModel, EmotionBert, FaceEmotionModel, LocalFaceEmotionModel
from tutor.model.language import LanguageModel, LanguageModelEndpoint, LocalLanguageModel, GeminiLanguageModel


class TutorType(Enum):
    ReturnPrompt = 0
    LLM = 1
    Mock = 2
    Echo = 3


def make_sentiment_model(models_root: str, device: torch.device) -> EmotionModel | None:
    bert_model_path = os.path.join(models_root, "sentiment/BERT_model_3emo_3cls_deepseek.pt")
    bert_tokenizer_dir = os.path.join(models_root, "sentiment")

    bert_model = EmotionBert()
    bert_model.load_state_dict(torch.load(bert_model_path, map_location=device))
    bert_model.eval()
    bert_tokenizer = BertTokenizer.from_pretrained(bert_tokenizer_dir)

    return LocalEmotionModel(bert_tokenizer, bert_model)

def make_face_emotion_model(models_root: str, device: torch.device) -> FaceEmotionModel | None:
    model_path = r"jayanta/google-vit-base-patch16-224-cartoon-face-recognition"
    model_weights_path = os.path.join(models_root, "face_emotion", "model.pt")
    processor = ViTImageProcessor.from_pretrained(model_path)
    model = ViTForImageClassification.from_pretrained(model_path, num_labels=3, ignore_mismatched_sizes=True)
    model.load_state_dict(torch.load(model_weights_path, map_location=device))
    model.eval()
    return LocalFaceEmotionModel(processor, model)


def make_description_model(models_root: str, device: torch.device) -> LanguageModel | None:
    # desc_model = LanguageModelEndpoint(
    #     api_endpoint="https://api.groq.com/openai/v1/chat/completions",  # groq
    #     model_name="deepseek-r1-distill-llama-70b",
    #     bearer=os.environ.get("GROQ_API_KEY")
    # )
    # return desc_model
    return None


def make_qa_model(models_root: str, device: torch.device) -> LanguageModel | None:
    # qa_model_dir = os.path.join(models_root, "question_answer/Mistral7B_QA_5/checkpoint-2030")
    # peft_config = PeftConfig.from_pretrained(qa_model_dir)
    # base_model_name = peft_config.base_model_name_or_path
    # base_model = AutoModelForCausalLM.from_pretrained(base_model_name, device_map=device, torch_dtype="auto")
    # qa_model = PeftModel.from_pretrained(base_model, qa_model_dir, device_map=device, torch_dtype="auto")
    # qa_model.eval()
    # qa_tokenizer = AutoTokenizer.from_pretrained(qa_model_dir, device_map=device, torch_dtype="auto")
    # return LocalLanguageModel(qa_tokenizer, qa_model)
    return None


def make_tutor_model(models_root: str, device: torch.device) -> LanguageModel | None:
    api_key = os.getenv("GOOGLE_AI_API_KEY")
    return GeminiLanguageModel(api_key=api_key, model_name="learnlm-2.0-flash-experimental")


def make_tutor(tutor_type: TutorType = TutorType.LLM) -> Tutor:
    match tutor_type:
        case TutorType.LLM | TutorType.ReturnPrompt:
            models_root = os.getenv("MODELS_ROOT")
            if models_root.startswith("~"):
                models_root = os.path.expanduser(models_root)

            main_device = torch.device("cuda") if torch.cuda.is_available() else torch.device("cpu")

            accelerator = Accelerator()
            accelerator.wait_for_everyone()

            prompt_generator = BasicPromptGenerator()

            face_emotion_model = make_face_emotion_model(models_root, main_device)
            sentiment_model = make_sentiment_model(models_root, main_device)
            desc_model = make_description_model(models_root, main_device)
            qa_model = make_qa_model(models_root, main_device)
            if tutor_type == TutorType.LLM:
                tutor_model = make_tutor_model(models_root, main_device)
                tutor = LLMTutor(prompt_generator, tutor_model, face_emotion_model, sentiment_model, desc_model, qa_model)
            else:
                tutor = ReturnPromptTutor(prompt_generator, face_emotion_model, sentiment_model, desc_model, qa_model)
        case TutorType.Echo:
            tutor = EchoTutor()
        case _:
            tutor = MockTutor()
    return tutor