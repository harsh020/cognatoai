from dataclasses import dataclass
from typing import Optional


@dataclass
class UserProfile:
    uid: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    full_name: Optional[str] = None
    picture: Optional[str] = None
    raw: dict = None
