import abc
from typing import Optional


class TextToSpeech(abc.ABC):
    def __init__(self, *args, **kwargs):
        self.model = None
        self.prices = {}

    @abc.abstractmethod
    def speak(self, text: str, output: Optional[str] = None, stream: bool = False, **kwargs):
        raise NotImplementedError(f'`speak` not implemented for {self.__class__}')

    def cost(self, tokens):
        return {
            'model': self.model,
            'cost': tokens * self.prices.get(self.model, 0)
        }


class Client(abc.ABC):
    AUTHORIZATION_HEADER = 'Authorization'
    API_KEY_HEADER = 'Api-Key'

    def __init__(self, url: str, **kwargs):
        self.url = url

    @abc.abstractmethod
    def generate(self, text: str, output: str, **kwargs):
        raise NotImplementedError(f'`generate` not implemented for client {self.__class__}')

    @abc.abstractmethod
    def stream(self, text: str, **kwargs):
        raise NotImplementedError(f'`stream` not implemented for client {self.__class__}')
