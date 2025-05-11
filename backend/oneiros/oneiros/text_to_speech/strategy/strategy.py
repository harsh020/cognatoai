import io
import json
import logging
from oneiros.text_to_speech.strategy.base import TextToSpeech, Client
from typing import Dict, Union, Optional, BinaryIO

import requests

from oneiros.text_to_speech.strategy.dataclass import ModalOptions, DeepgramOptions
from oneiros.utils import utils

logger = logging.getLogger(__file__)


class GenericTextToSpeechClient(Client, TextToSpeech):
    def __init__(self, url: str, model: str, **kwargs):
        super().__init__(url=url, **kwargs)
        self.model = model
        self.api_key = None
        self.token = None
        if kwargs.get('api_key'):
            self.api_key = kwargs.get("api_key")
        elif kwargs.get('token'):
            self.token = f'Bearer {kwargs.get("token")}'
        elif kwargs.get('username') and kwargs.get('password'):
            base64_encoded = utils.base64_encode(f'{kwargs.get("username")}:{kwargs.get("password")}')
            self.token = f'Basic {base64_encoded}'
        self.options = kwargs

    def speak(self, text: str, output: Optional[str] = None, stream: bool = False, **kwargs):
        if stream:
            raise NotImplementedError('Streaming is currently not supported.')

        return self.generate(text=text, output=output, **kwargs)

    def _request(self, payload: dict, headers: Optional[dict] = None, params: Optional[dict] = None,
                 stream: bool = False, **kwargs) -> BinaryIO:
        payload = json.dumps(payload)

        chunks = []
        audio_bytes = io.BytesIO()
        try:
            if stream:
                with requests.post(self.url, headers=headers, data=payload, stream=True, params=params) as stream:
                    if not str(stream.status_code).startswith('2'):
                        logger.error(f'Could not complete request due to {stream.content}')
                        raise Exception(f'Could not complete request due to {stream.content}')

                    for chunk in stream.iter_content(chunk_size=1024):
                        if chunk:
                            chunks.append(chunk)
                    audio_bytes = io.BytesIO(b''.join(chunks))
            else:
                response = requests.post(
                    self.url,
                    headers=headers,
                    data=payload,
                    params=params
                )
                if not str(response.status_code).startswith('2'):
                    logger.error(f'Could not complete request due to {response.content}')
                    raise Exception(f'Could not complete request due to {response.content}')
                audio_bytes = io.BytesIO(response.content)
            return audio_bytes

        except requests.exceptions.Timeout:
            raise Exception(f'Client took too long to response.')
        except requests.exceptions.TooManyRedirects:
            raise Exception(f'Client made too many redirects.')
        except requests.exceptions.RequestException as ex:
            raise Exception(str(ex))

    def generate(self, text: str, output: Optional[str] = None, **kwargs) -> Union[BinaryIO, Dict]:
        headers = {
            self.API_KEY_HEADER: self.api_key,
            self.AUTHORIZATION_HEADER: self.token
        }
        payload = {
            'text': text,
            **kwargs
        }
        audio_bytes = self._request(payload=payload, headers=headers, stream=True)

        if output:
            with open(output, 'w+b') as f:
                f.write(audio_bytes.read())
            return {'file': output}
        return audio_bytes

    def stream(self, text: str, chunk_size: int = 10240, **kwargs) -> bytes:
        headers = {
            self.API_KEY_HEADER: self.api_key,
            self.AUTHORIZATION_HEADER: self.token
        }
        params = {
            # 'stream': True
        }

        try:
            session = requests.Session()
            stream = session.post(
                self.url,
                headers=headers,
                params=params,
                data=kwargs,
                stream=True
            )
            with stream.iter_content(chunk_size=chunk_size) as response:
                if not str(response.status_code).startswith('2'):
                    logger.error(f'Could not complete request due to {response.content}')
                    raise Exception(f'Could not complete request due to {response.content}')

                yield response.content
        except requests.exceptions.Timeout:
            raise Exception(f'Client took too long to response.')
        except requests.exceptions.TooManyRedirects:
            raise Exception(f'Client made too many redirects.')
        except requests.exceptions.RequestException as ex:
            raise Exception(str(ex))


class ModalTextToSpeech(GenericTextToSpeechClient):
    def __init__(self, url: str, model: str, **kwargs):
        super().__init__(url=url, model=model, **kwargs)
        self.url += '/api/v1/linguistics/tts/'

        self.prices = {
            'am_fenrir': 0.000306,
        }

    def generate(self, text: str, output: Optional[str] = None, **kwargs) -> Union[BinaryIO, Dict]:
        headers = {
            self.API_KEY_HEADER: self.api_key,
            self.AUTHORIZATION_HEADER: self.token
        }
        options = ModalOptions(model=self.model, **kwargs)
        payload = {
            'text': text,
            **options.to_dict()
        }
        audio_bytes = self._request(payload=payload, headers=headers, stream=True, output=output)

        if output:
            with open(output, 'w+b') as f:
                f.write(audio_bytes.read())
            return {'file': output}
        return audio_bytes


class DeepgramTextToSpeech(GenericTextToSpeechClient):
    def __init__(self, url: str, model: str, **kwargs):
        super().__init__(url=url, model=model, **kwargs)
        self.url += '/v1/speak'
        self.model = model
        if not kwargs.get('api_key'):
            raise ValueError('Api Key is required for deepgram model.')
        self.api_key = f'Token {kwargs.get("api_key")}'

        self.prices = {
            'aura-orpheus-en': 0.000015,
        }

    def generate(self, text: str, output: Optional[str] = None, **kwargs) -> Union[BinaryIO, Dict]:
        headers = {
            'Content-Type': 'application/json',
            self.AUTHORIZATION_HEADER: self.api_key
        }
        payload = {
            'text': text,
        }
        options = DeepgramOptions(model=self.model, **kwargs).to_dict()
        audio_bytes = self._request(payload=payload, headers=headers, stream=True, output=output, params=options)

        if output:
            with open(output, 'w+b') as f:
                f.write(audio_bytes.read())
            return {'file': output}
        return audio_bytes
