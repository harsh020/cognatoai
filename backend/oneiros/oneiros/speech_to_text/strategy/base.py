import abc
import datetime
import json
from dataclasses import asdict
from typing import Union, BinaryIO, Dict, Any, Optional

import websocket as websocket_client

from oneiros.speech_to_text.strategy.dataclass import WebsocketEvent, ModalPayload


class SpeechToText(abc.ABC):
    def __init__(self, *args, **kwargs):
        self.model = None
        self.prices = {}
        pass

    @abc.abstractmethod
    def transcribe(self, file: Union[str, BinaryIO]):
        raise NotImplementedError(f'`transcribe` method not implemented for {self.__class__}')

    def cost(self, start, end):
        duration = (end - start).seconds
        return {
            'model': self.model,
            'cost': duration * self.prices.get(self.model, 0)
        }

    def warmup(self):
        return {
            'success': True,
            'total_time': 0,
        }


class Client(abc.ABC):
    AUTHORIZATION_HEADER = 'Authorization'
    API_KEY_HEADER = 'Api-Key'

    def __init__(self, url: str, **kwargs):
        self.url = url

    @abc.abstractmethod
    def generate(self, *args, **kwargs) -> Dict:
        raise NotImplementedError(f'`generate` function not implemented in {self.__class__}')


class WebsocketClient(abc.ABC):
    def __init__(self, url: str, **kwargs):
        self.url = url
        self.websocket = None
        self.event_handlers = {}

    @abc.abstractmethod
    def register_event_handlers(self,
                                on_message=None,
                                on_error=None,
                                on_close=None,
                                on_open=None,
                                on_metadata=None, **kwargs):
        raise NotImplementedError()

    @abc.abstractmethod
    async def start(self, **kwargs):
        raise NotImplementedError()

    @abc.abstractmethod
    async def receive(self, result: Any, **kwargs):
        raise NotImplementedError()

    @abc.abstractmethod
    async def send(self, message: str, **kwargs):
        raise NotImplementedError()

    @abc.abstractmethod
    async def close(self, **kwargs):
        raise NotImplementedError()


class GenericWebsocketClient(WebsocketClient):
    def __init__(self, url: str, headers: Optional[Dict] = None,  **kwargs):
        super().__init__(url, **kwargs)
        self.headers = headers or {}

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
            on_open=self.event_handlers.get(WebsocketEvent.OPEN.name),
            on_message=self.event_handlers.get(WebsocketEvent.MESSAGE.name),
            on_close=self.event_handlers.get(WebsocketEvent.CLOSE.name),
            on_error=self.event_handlers.get(WebsocketEvent.ERROR.name),
            header=self.headers
        )
        # self.websocket.keep_running = True
        self.websocket.run_forever()

    def on_create(self, websocket):
        self.websocket = websocket

    def receive(self, result: Any, **kwargs):
        if self.event_handlers.get(WebsocketEvent.MESSAGE.name):
            self.event_handlers.get(WebsocketEvent.MESSAGE.name)(result)

    def send(self, message: str, **kwargs):
        self.websocket.send(message)

    def close(self, **kwargs):
        self.websocket.close()
