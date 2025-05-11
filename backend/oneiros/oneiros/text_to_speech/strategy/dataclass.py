import dataclasses
import dataclasses_json
from typing import Optional


@dataclasses_json.dataclass_json
@dataclasses.dataclass(init=False)
class ModalOptions:
    # text: str
    speed: float = 1.0
    stream: bool = False
    id: Optional[str] = None
    model: Optional[str] = None

    def __init__(self, **kwargs):
        names = set([f.name for f in dataclasses.fields(self)])
        for k, v in kwargs.items():
            if k in names:
                setattr(self, k, v)


@dataclasses_json.dataclass_json
@dataclasses.dataclass(init=False)
class DeepgramOptions:
    model: Optional[str] = "aura-orpheus-en"
    encoding: Optional[str] = 'linear16'
    container: Optional[str] = 'wav'
    sample_rate: Optional[int] = None
    bit_rate: Optional[int] = None

    def __init__(self, **kwargs):
        names = set([f.name for f in dataclasses.fields(self)])
        for k, v in kwargs.items():
            if k in names:
                setattr(self, k, v)
