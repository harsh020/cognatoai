import io
import json
import base64
import random
import logging
import time
import requests
import asyncio
import functools
from urllib import parse
from datetime import datetime
from contextlib import closing
from typing import Union, BinaryIO, Dict, Any, Optional

import websocket as websocket_client
from dataclasses import asdict

from deepgram import (
    DeepgramClient,
    DeepgramClientOptions,
    LiveTranscriptionEvents,
    LiveOptions,
)

from oneiros.speech_to_text.strategy.base import SpeechToText, Client, WebsocketClient, GenericWebsocketClient
from oneiros.speech_to_text.strategy.dataclass import ModalPayload, WebsocketEvent, DeepgramOptions, GroqOptions
from oneiros.speech_to_text.ws.v1.handlers import WebsocketEventHandler
from oneiros.utils import utils

logger = logging.getLogger(__file__)


class ModalSpeechToText(Client, SpeechToText):
    def __init__(self, url: str, model: str, **kwargs):
        super().__init__(url, **kwargs)
        # self.url = url
        self.base_url = url
        self.url += '/api/v1/linguistics/stt/'
        # self.url += '/inference'
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

        self.prices = {
            'whisper-distil-large-v2': 0.000306,
        }

    def warmup(self):
        url = self.base_url + '/api/v1/internal/_hidden/warmup'
        try:
            response = requests.get(url)
            if not str(response.status_code).startswith('2'):
                logger.error(f'Could not complete request due to {response.content}')
                raise Exception(f'Could not complete request due to {response.content}')

            response = response.json()
            return {
                'success': True,
                'total_time': response['stt_time']
            }
        except requests.exceptions.Timeout:
            raise Exception(f'Client took too long to response.')
        except requests.exceptions.TooManyRedirects:
            raise Exception(f'Client made too many redirects.')
        except requests.exceptions.RequestException as ex:
            raise Exception(str(ex))


    def generate(self, file: Union[str, BinaryIO], **kwargs) -> Dict:
        headers = {
            self.API_KEY_HEADER: self.api_key,
            self.AUTHORIZATION_HEADER: self.token
        }
        files = [
            ('file',
             (f'audio-{datetime.now().timestamp()}-{utils.generate_random_string(random.randrange(8, 48))}.wav',
              open(file, 'rb') if isinstance(file, str) else file, 'audio/wav'))
        ]
        params = {}
        payload = ModalPayload(**kwargs).to_dict()

        try:
            response = requests.post(
                self.url,
                headers=headers,
                files=files,
                params=params,
                data=payload,
            )
            if not str(response.status_code).startswith('2'):
                logger.error(f'Could not complete request due to {response.content}')
                raise Exception(f'Could not complete request due to {response.content}')

            return response.json()
        except requests.exceptions.Timeout:
            raise Exception(f'Client took too long to response.')
        except requests.exceptions.TooManyRedirects:
            raise Exception(f'Client made too many redirects.')
        except requests.exceptions.RequestException as ex:
            raise Exception(str(ex))

    def transcribe(self, file: Union[str, BinaryIO], **kwargs):
        return self.generate(file, **kwargs)


class DeepgramSpeechToText(Client, SpeechToText):
    AUTHORIZATION_HEADER = 'Authorization'

    def __init__(self, url: str, model: str, **kwargs):
        super().__init__(url, **kwargs)
        self.url += '/v1/listen'
        self.model = model
        self.api_key = None
        if kwargs.get('api_key'):
            self.api_key = f'Token {kwargs.get("api_key")}'
        else:
            raise ValueError('Api Key required for deepgram.')

        self.prices = {
            'nova-2': 0.0000717,
            'whisper-large': 0.00008,
        }

    def generate(self, file: Union[str, BinaryIO], **kwargs) -> Dict:
        headers = {
            self.AUTHORIZATION_HEADER: self.api_key,
            'Content-Type': 'audio/wav'
        }

        params = asdict(DeepgramOptions(model=self.model, **kwargs))
        if 'smart_format' in params.keys():
            params['smart_format'] = 'true' if params['smart_format'] else 'false'
        payload = open(file, 'rb').read() if isinstance(file, str) else file.read()

        try:
            start = time.time()
            response = requests.post(
                self.url,
                headers=headers,
                params=params,
                data=payload,
            )
            end = time.time()

            if not str(response.status_code).startswith('2'):
                logger.error(f'Could not complete request due to {response.content}')
                raise Exception(f'Could not complete request due to {response.content}')

            response = json.loads(response.content)
            text = response.get('results').get('channels')[0].get('alternatives')[0].get('transcript')
            return {
                'text': text,
                'total_time': end - start
            }
        except requests.exceptions.Timeout:
            raise Exception(f'Client took too long to response.')
        except requests.exceptions.TooManyRedirects:
            raise Exception(f'Client made too many redirects.')
        except requests.exceptions.RequestException as ex:
            raise Exception(str(ex))

    def transcribe(self, file: Union[str, BinaryIO], **kwargs):
        return self.generate(file, **kwargs)


class GroqSpeechToText(Client, SpeechToText):
    def __init__(self, url: str, model: str, **kwargs):
        super().__init__(url, **kwargs)
        self.url += '/openai/v1/audio/transcriptions'
        self.model = model

        if not kwargs.get('api_key', None):
            raise ValueError('Api Key required to invoke api.')
        self.api_key = f'bearer {kwargs.get("api_key")}'

        # FIXME: groq charges for 10 sec at least if audio < 10 sec. So we are taking charge of 1 sec = charge of 10 sec
        self.prices = {
            'whisper-large-v3': 0.00031,
            'whisper-large-v3-turbo': 0.00012,
            'distil-whisper-large-v3-en': 0.00006,
        }

    def generate(self, file: Union[str, BinaryIO], **kwargs) -> Dict:
        print(self.api_key)
        headers = {
            self.AUTHORIZATION_HEADER: self.api_key,
            # 'Content-Type': 'multipart/form-data'
        }

        payload = asdict(GroqOptions(model=self.model, **kwargs))
        binary = open(file, 'rb').read() if isinstance(file, str) else file.read()
        files = [
            ('file', ('test.wav', binary, 'application/octet-stream'))
        ]

        try:
            start = time.time()
            response = requests.post(
                self.url,
                headers=headers,
                data=payload,
                files=files
            )
            end = time.time()

            if not str(response.status_code).startswith('2'):
                logger.error(f'Could not complete request due to {response.content}')
                raise Exception(f'Could not complete request due to {response.content}')

            response = json.loads(response.content)
            text = response.get('text')
            return {
                'text': text,
                'total_time': end - start
            }
        except requests.exceptions.Timeout:
            raise Exception(f'Client took too long to response.')
        except requests.exceptions.TooManyRedirects:
            raise Exception(f'Client made too many redirects.')
        except requests.exceptions.RequestException as ex:
            raise Exception(str(ex))

    def transcribe(self, file: Union[str, BinaryIO], **kwargs):
        return self.generate(file, **kwargs)



class ModalWebsocketSpeechToText(WebsocketClient, SpeechToText):
    def __init__(self, url: str, model: str, **kwargs):
        super().__init__(url, **kwargs)
        self.url += '/ws/v1/linguistics/stt/'
        self.model = model

    def transcribe(self, file: Union[str, BinaryIO], **kwargs):
        payload = asdict(ModalPayload(file=file, **kwargs))
        self.send(json.dumps(payload))

    def register_event_handlers(self, on_message=None, on_error=None, on_close=None, on_open=None, on_metadata=None,
                                **kwargs):
        self.event_handlers = {
            WebsocketEvent.MESSAGE.name: on_message,
            WebsocketEvent.ERROR.name: on_error,
            WebsocketEvent.OPEN.name: on_open,
            WebsocketEvent.CLOSE.name: on_close,
            WebsocketEvent.METADATA: on_metadata
        }

    def start(self, **kwargs):
        ## FIXME: Websocket connection is opened evertime a request has to be sent, just like http. There are no
        ##        libraries that allows to keep the connection open and be async.
        self.websocket = websocket_client.WebSocketApp(
            self.url,
            # "ws://host.docker.internal:8080/ws",
            on_open=self.event_handlers.get(WebsocketEvent.OPEN.name),
            on_message=self.event_handlers.get(WebsocketEvent.MESSAGE.name),
            on_close=self.event_handlers.get(WebsocketEvent.CLOSE.name),
            on_error=self.event_handlers.get(WebsocketEvent.ERROR.name),
            header=kwargs.get('headers')
        )
        # self.websocket.keep_running = True
        self.websocket.run_forever()

    def on_create(self, websocket):
        self.websocket = websocket

    def receive(self, result: Any, **kwargs):
        if self.event_handlers.get(WebsocketEvent.MESSAGE.name):
            self.event_handlers.get(WebsocketEvent.MESSAGE.name)(result)

    def send(self, message: str, **kwargs):
        # audio_byte = base64.b64decode(message)
        # print(message)
        print(len(message))
        self.websocket.send(message)

    def close(self, **kwargs):
        if self.websocket:
            print('Websocket Modal - Disconnect raised')
            self.websocket.close()


class DeepgramSdkWebsocketSpeechToText(WebsocketClient, SpeechToText):
    def __init__(self, url: str, model: str, keep_alive: bool = True, **kwargs):
        super().__init__(url, **kwargs)
        self.api_key = 'bf417af1b63ef5b0ecab0a54791dcaa5f8e4f9ff'
        if not kwargs.get('api_key'):
            raise ValueError('Api Key required to use deepgram model.')

        config = DeepgramClientOptions()
        if keep_alive:
            config = DeepgramClientOptions(
                options={"keepalive": "true"}
            )
        self.client = DeepgramClient(api_key=kwargs.get('api_key'), config=config)
        self.connection = self.client.listen.live.v('1')
        self.model = kwargs.get('model', 'nova-2')
        self.language = kwargs.get('language', 'en-US')
        self.smart_format = kwargs.get('smart_format', True)

    def register_event_handlers(self, on_message=None, on_error=None, on_close=None, on_open=None, on_metadata=None,
                                **kwargs):
        self.connection.on(LiveTranscriptionEvents.Open, on_open)
        self.connection.on(LiveTranscriptionEvents.Transcript, on_message)
        self.connection.on(LiveTranscriptionEvents.Metadata, on_metadata)
        self.connection.on(LiveTranscriptionEvents.Error, on_error)

    def start(self, **kwargs):
        options = LiveOptions(
            model=self.model,
            language=self.language,
            smart_format=self.smart_format,
        )
        self.connection.start(options)

    def receive(self, result: Any, **kwargs):
        print(result)
        if self.event_handlers.get(LiveTranscriptionEvents.Transcript):
            self.event_handlers.get(LiveTranscriptionEvents.Transcript)(result)

    def send(self, message: str, **kwargs):
        audio_byte = base64.b64decode(message)
        self.connection.send(audio_byte)

    def close(self, **kwargs):
        self.connection.finish()

    def transcribe(self, file: Union[str, BinaryIO], **kwargs):
        self.connection.send(file)


class DeepgramWebsocketSpeechToText(GenericWebsocketClient, SpeechToText):
    def __init__(self, url: str, model: str, headers: Optional[Dict] = None, **kwargs):
        super().__init__(url, **kwargs)
        self.api_key = 'bf417af1b63ef5b0ecab0a54791dcaa5f8e4f9ff'
        if not kwargs.get('api_key'):
            raise ValueError('Api Key required to use deepgram model.')

        self.api_key = kwargs.get('api_key')
        self.url += '/v1/listen'
        params = DeepgramOptions(**kwargs).to_dict()
        params['smart_format'] = 'true' if params['smart_format'] else 'false'
        url = list(parse.urlparse(self.url))
        url[4] = parse.urlencode(params)
        self.url = parse.urlunparse(url)
        print(self.url)
        self.headers = headers or {}
        self.headers['Authorization'] = f'Token {self.api_key}'

    def receive(self, result: Any, **kwargs):
        print(result)
        if self.event_handlers.get(WebsocketEvent.MESSAGE.name):
            self.event_handlers.get(WebsocketEvent.MESSAGE.name)(result)

    def send(self, message: str, **kwargs):
        audio_bytes = base64.b64decode(message)
        print(type(audio_bytes))
        self.websocket.send(data=audio_bytes)
