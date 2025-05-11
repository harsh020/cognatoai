import abc
import time
import json
import threading

from oneiros.speech_to_text.serializers import TranscriptResponseSerializer


class WebsocketEventHandler(abc.ABC):
    def on_open(self, ws, **kwargs):
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

    @abc.abstractmethod
    def on_message(self, ws, result, **kwargs):
        raise NotImplementedError()

    @abc.abstractmethod
    def on_error(self, ws, **kwargs):
        raise NotImplementedError()

    @abc.abstractmethod
    def on_close(self, ws, **kwargs):
        raise NotImplementedError()


class ModalWebsocketEventHandler(WebsocketEventHandler):

    def on_message(self, ws, result, **kwargs):
        if result.lower() == 'pong':
            return
        # sentence = result.channel.alternatives[0].transcript
        result = json.loads(result)
        response = TranscriptResponseSerializer(result, partial=True).data
        return response

    def on_error(self, ws, **kwargs):
        pass

    def on_close(self, ws, **kwargs):
        pass


class DeepgramWebsocketEventHandler(WebsocketEventHandler):
    def on_message(self, ws, result, **kwargs):
        sentence = result.channel.alternatives[0].transcript
        result = {
            'text': sentence
        }
        response = TranscriptResponseSerializer(result, partial=True).data
        return response

    def on_error(self, ws, **kwargs):
        pass

    def on_close(self, ws, **kwargs):
        pass
