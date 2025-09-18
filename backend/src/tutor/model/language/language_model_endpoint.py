import json
import requests

from tutor.model.language import LanguageModel


class LanguageModelEndpoint(LanguageModel):

    def __init__(self, api_endpoint: str, model_name: str, bearer: str | None = None) -> None:
        super().__init__()
        self.api_endpoint = api_endpoint
        self.model_name = model_name
        self.bearer = bearer

    def prompt(
        self, 
        prompt: str,
        temperature: float = 0.0, 
        add_headers: dict | None = None,
        add_payload: dict | None = None
    ) -> str | None:

        headers = {
            "Content-Type": "application/json",
        }
        if add_headers is not None:
            headers.update(add_headers)

        if self.bearer is not None:
            headers["Authorization"] = f"Bearer {self.bearer}"

        messages = [{"role": "user", "content": prompt}]
        payload = {
            "model": self.model_name,
            "messages": messages,
            "temperature": temperature
        }
        if add_payload is not None:
            payload.update(add_payload)

        response = requests.post(self.api_endpoint, headers=headers, data=json.dumps(payload))

        if response.status_code == 200:
            return response.json()["choices"][0]["message"]["content"]

        return None
