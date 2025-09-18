import torch
from transformers import PreTrainedTokenizerFast, PreTrainedModel, AutoTokenizer, AutoModelForCausalLM

from tutor.model.language import LanguageModel


class LocalLanguageModel(LanguageModel):

    def __init__(self, tokenizer: PreTrainedTokenizerFast, model: PreTrainedModel, max_new_tokens: int = 512):
        super().__init__()
        self.tokenizer = tokenizer
        self.model = model
        self.model_device = self._get_device(model)
        self.max_new_tokens = max_new_tokens

    @staticmethod
    def _get_device(obj: PreTrainedTokenizerFast | PreTrainedModel) -> torch.device:
        return next(obj.parameters()).device

    def prompt(self, prompt: str, temperature: float = 0.0) -> str | None:
        tokenizer = self.tokenizer
        model = self.model
        model_device = self.model_device

        input_t = tokenizer(prompt, return_tensors="pt")
        input_ids = input_t.input_ids.to(model_device)
        attention_mask = input_t.attention_mask.to(model_device)

        output_t = model.generate(
            input_ids=input_ids,
            attention_mask=attention_mask,
            max_new_tokens=self.max_new_tokens,
            pad_token_id=tokenizer.eos_token_id,
            temperature=temperature,
        )

        generated_ids = output_t[0][input_ids.shape[-1]:]

        return tokenizer.decode(generated_ids)
