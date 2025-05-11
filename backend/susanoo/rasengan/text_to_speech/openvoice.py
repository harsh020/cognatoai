import json
import requests
from rasengan.text_to_speech.text_to_speech import TextToSpeech


class OpenVoice(TextToSpeech):
    url: str = 'https://harshsoni082--linguistics-web.modal.run/api/v1/linguistics/tts/'

    def run(self, id, text, **kwargs):
        payload = json.dumps({
            'id': id,
            'text': text,
            'speed': 1.2
        })
        headers = {
            'Content-Type': 'application/json'
        }
        response = requests.post(self.url, data=payload, headers=headers)
        return response.json()