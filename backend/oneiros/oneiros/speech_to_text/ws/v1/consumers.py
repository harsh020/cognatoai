import json
import time
import threading
import logging
from datetime import datetime

from django.conf import settings
from channels.generic.websocket import WebsocketConsumer

from oneiros.speech_to_text.serializers import TranscriptResponseSerializer
from oneiros.speech_to_text.strategy.strategy import ModalWebsocketSpeechToText, DeepgramSdkWebsocketSpeechToText, \
    DeepgramWebsocketSpeechToText

log = logging.getLogger(__file__)


class SpeechToTextConsumer(WebsocketConsumer):
    serializer_class = TranscriptResponseSerializer
    transcription_strategy = ModalWebsocketSpeechToText(
        **settings.SPEECH_TO_TEXT.get('modal-stream')
    )

    def connect(self):
        def on_open(ws):
            print("WebSocket connection established.")

            # Send KeepAlive messages every 3 seconds
            def keep_alive():
                while True:
                    # keep_alive_msg = json.dumps({"type": "KeepAlive"})
                    keep_alive_msg = "Ping"
                    ws.send(keep_alive_msg)
                    # print("Sent KeepAlive message")
                    time.sleep(5)

            # Start a thread for sending KeepAlive messages
            keep_alive_thread = threading.Thread(target=keep_alive)
            keep_alive_thread.daemon = True
            keep_alive_thread.start()

        def on_message(ws, result, **kwargs):
            # print(result)
            if result.lower() == 'pong':
                return
            result = json.loads(result)
            response = self.serializer_class(result, partial=True).data
            self.send(text_data=json.dumps(response))

        # def on_message(ws, result, **kwargs):
        #     print(result)
        #     sentence = result.channel.alternatives[0].transcript
        #     print(sentence)
        #     response = {
        #         'text': sentence
        #     }
        #     self.send(text_data=json.dumps(response))

        self.transcription_strategy.register_event_handlers(on_open=on_open, on_message=on_message)
        start_thread = threading.Thread(target=self.transcription_strategy.start)
        start_thread.start()
        self.accept()

    def disconnect(self, close_code):
        print(f'[{datetime.now()}][INFO] Disconnect request raised.')
        self.transcription_strategy.close()

    def receive(self, text_data=None, bytes_data=None):
        # print(len(text_data))
        self.transcription_strategy.send(text_data)
