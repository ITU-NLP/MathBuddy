from abc import ABC, abstractmethod


class LanguageModel(ABC):

    @abstractmethod
    def prompt(self, prompt: str, temperature: float = 0.0) -> str | None:
        pass


class NullLanguageModel(LanguageModel):

    def prompt(self, prompt: str, temperature: float = 0.0) -> str | None:
        return None