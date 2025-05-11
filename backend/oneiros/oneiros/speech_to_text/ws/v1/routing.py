from django.urls import re_path

from oneiros.speech_to_text.ws.v1.consumers import SpeechToTextConsumer

websocket_urlpatterns = [
    re_path(r'ws/v1/listen/$', view=SpeechToTextConsumer.as_asgi(), name='live-transcript'),
]
