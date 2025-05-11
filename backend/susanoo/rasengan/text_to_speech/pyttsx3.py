from typing import Dict

import pyttsx3
from pydantic import model_validator, ConfigDict
from pydantic.v1 import root_validator

from rasengan.text_to_speech.text_to_speech import TextToSpeech


class PyTTSX3(TextToSpeech):
    model_config = ConfigDict(arbitrary_types_allowed=True)  # Allow abstract strategy

    driver: str = None
    """driver to use"""

    voice: str = None
    """ID of the voice"""

    rate: int = 160
    """speech rate in words per minute"""

    volume: float = 1.0
    """point volume of speech in the range[0.0, 1.0]"""

    engine: pyttsx3.Engine = None

    @model_validator(mode='before')
    def build_model_kwargs(cls, values: Dict) -> Dict:
        supported_kwargs = ['voice', 'rate', 'volume']

        engine = pyttsx3.init(values.get('driver', None))
        for arg in supported_kwargs:
            if values.get(arg):
                engine.setProperty(arg, values.get(arg))
        values['engine'] = engine
        return values

    def run(self, text: str) -> None:
        self.engine.say(text)
        self.engine.runAndWait()

    def save(self, text: str, path: str) -> None:
        self.engine.save_to_file(text, path)
        self.engine.runAndWait()
