import google.generativeai as genai

from tutor.model.language import LanguageModel


class GeminiLanguageModel(LanguageModel):

    def __init__(self, api_key: str, model_name: str, max_new_tokens: int = 512) -> None:
        self.api_key = api_key
        self.model_name = model_name
        self.max_new_tokens = max_new_tokens
        self._model = genai.GenerativeModel(model_name=self.model_name)

    def prompt(self, prompt: str, temperature: float = 0.0) -> str | None:
        genai.configure(api_key=self.api_key)
        config = genai.GenerationConfig(max_output_tokens=self.max_new_tokens, temperature=temperature)
        response = self._model.generate_content(prompt, generation_config=config)
        return response.text
