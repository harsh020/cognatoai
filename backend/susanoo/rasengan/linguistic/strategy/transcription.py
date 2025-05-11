import abc

import requests
from django.conf import settings
from openai import OpenAI


class TranscriptionStrategy(abc.ABC):
    @abc.abstractmethod
    def transcribe(self, file):
        raise NotImplementedError('Implement transcribe method in child classes')


class OpenAITranscriptionStrategy(TranscriptionStrategy):
    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    def transcribe(self, file):
        with open(file, 'rb') as f:
            response = self.client.audio.transcriptions.create(
                model='whisper-1',
                file=f.read(),
                response_format='json'
            )
        return {
            'text': response.text
        }


class CloudFlareTranscriptionStrategy(TranscriptionStrategy):
    url = f'https://api.cloudflare.com/client/v4/accounts/{settings.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/openai/whisper'
    api_key = settings.CLOUDFLARE_API_KEY

    def transcribe(self, file):
        with open(file, 'rb') as f:
            payload = f.read()
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'text/plain'
            }

        response = requests.request("POST", self.url, headers=headers, data=payload)
        response = response.json()
        result = response.get('result')
        print(result)
        return {
            'text': result.get('text')
        }

