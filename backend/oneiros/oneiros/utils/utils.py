import uuid
import base64


def base64_encode(input: str) -> str:
    return base64.b64encode(input.encode('ascii')).decode('ascii')


def generate_random_string(size: int) -> str:
    if size > 48:
        raise ValueError('Cannot generate random string greater than 48 characters.')
    return base64.b64encode(str(uuid.uuid4()).encode('ascii')).decode('ascii')[:size]
