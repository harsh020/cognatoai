import dataclasses
from typing import Dict, Optional, Union


@dataclasses.dataclass
class TokenUsage:
    input_tokens: int
    output_tokens: int
    total_tokens: int


@dataclasses.dataclass
class GenerationResponse:
    id: str
    usage: TokenUsage
    input: str
    raw_output: str
    output: Union[str | Dict]
    metadata: Dict
    name: Optional[str] = None
    type: str = 'ai'
