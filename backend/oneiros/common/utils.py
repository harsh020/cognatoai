import os

from django.core.files.storage import default_storage


def save_to_storage(file, path):
    if not os.path.exists(path):
        os.makedirs(path)

    default_storage.save(path + file.name, file)


def encoding_to_container(encoding: str) -> str:
    # Dictionary mapping encoding to container
    encoding_to_container_dict = {
        "linear16": "wav",
        "mulaw": "wav",
        "alaw": "wav",
        "mp3": None,
        "opus": "ogg",
        "flac": None,
        "aac": None
    }
    return encoding_to_container_dict.get(encoding)


def encoding_to_extension(encoding: str) -> str:
    # Dictionary mapping encoding to file extension
    encoding_to_extension_dict = {
        "linear16": "wav",
        "mulaw": "wav",
        "alaw": "wav",
        "mp3": "mp3",
        "opus": "ogg",
        "flac": "flac",
        "aac": "aac"
    }
    return encoding_to_extension_dict.get(encoding)
