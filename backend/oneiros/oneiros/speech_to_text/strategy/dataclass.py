import enum
import dataclasses
import dataclasses_json
from typing import Optional, BinaryIO


class WebsocketEvent(enum.Enum):
    MESSAGE = 'MESSAGE',
    ERROR = 'ERROR'
    OPEN = 'OPEN'
    CLOSE = 'CLOSE'
    METADATA = 'METADATA'


@dataclasses_json.dataclass_json
@dataclasses.dataclass(init=False)
class ModalPayload:
    id: str = None
    language: str = 'en'
    beam_size: int = 5
    condition_on_previous_text: bool = False
    prefix: Optional[str] = None
    initial_prompt: Optional[str] = None
    file: Optional[BinaryIO] = None

    def __init__(self, **kwargs):
        names = set([f.name for f in dataclasses.fields(self)])
        for k, v in kwargs.items():
            if k in names:
                setattr(self, k, v)


@dataclasses_json.dataclass_json
@dataclasses.dataclass(init=False)
class DeepgramOptions:
    model: str = 'nova-2'
    language: str = 'en-US'
    smart_format: bool = True

    def __init__(self, **kwargs):
        names = set([f.name for f in dataclasses.fields(self)])
        for k, v in kwargs.items():
            if k in names:
                setattr(self, k, v)


@dataclasses_json.dataclass_json
@dataclasses.dataclass(init=False)
class GroqOptions:
    model: str = 'distil-whisper-large-v3-en'
    language: str = 'en'
    temperature: float = 0
    response_format: str = 'json'

    def __init__(self, **kwargs):
        names = set([f.name for f in dataclasses.fields(self)])
        for k, v in kwargs.items():
            if k in names:
                setattr(self, k, v)
