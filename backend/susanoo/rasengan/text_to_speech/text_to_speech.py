import abc

from pydantic import BaseModel


class TextToSpeech(abc.ABC, BaseModel):
    def __call__(self, *args, **kwargs):
        return self.run(*args, **kwargs)

    @abc.abstractmethod
    def run(self, *args, **kwargs):
        raise NotImplementedError('Method not implemented')