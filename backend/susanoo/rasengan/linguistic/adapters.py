import re
import uuid
import requests


from django.conf import settings
from django.core.files.base import ContentFile

from common.utils import encoding_to_extension


class BaseAdapter:
    def __init__(self, base_url):
        self.base_url = base_url

    def _post(self, endpoint, data=None, files=None, headers=None):
        """
        Sends a POST request to the service.
        :param endpoint: API endpoint (relative to base_url).
        :param data: Dictionary of form data to send (for JSON or key-value pairs).
        :param files: Dictionary of files to send (for multipart form-data).
        :param headers: Optional headers to include in the request.
        :return: Parsed JSON response or raw content.
        """
        url = f"{self.base_url}/{endpoint}"
        response = requests.post(url, data=data, files=files, headers=headers)
        response.raise_for_status()
        try:
            return response.json()
        except ValueError:
            return response


class OneirosAdapter(BaseAdapter):
    def __init__(self):
        if not settings.LINGUISTIC.get('BASE_URL', None):
            raise ValueError('Cannot find base url for adapter')
        super().__init__(settings.LINGUISTIC.get('BASE_URL'))

    def speech_to_text(self, id, audio_file):
        """
        Sends an audio file to the speech-to-text service and returns the transcription.
        :param audio_file: BinaryIO or file-like object containing audio data.
        :return: Transcription (str).
        """
        files = {'file': audio_file}
        data = {'id': id}
        response = self._post('api/v1/listen/', data=data, files=files)
        return response

    def text_to_speech(self, id, text, encoding='mp3'):
        """
        Sends text to the text-to-speech service and returns the generated audio.
        :param encoding: Media type of the audio file.
        :param text: Text to convert to speech.
        :return: Binary content of the audio file.
        """
        data = {'id': id, 'text': text, 'encoding': encoding}
        response = self._post('api/v1/speak/', data=data)
        extension = encoding_to_extension(encoding)

        content_disposition = response.headers.get('Content-Disposition')
        print(content_disposition)
        if content_disposition:
            filename_match = re.search(r'filename="(?P<filename>[^"]+)"', content_disposition)
            if filename_match:
                filename = filename_match.group('filename')
            else:
                # Fallback if filename is not in Content-Disposition
                filename = f"{uuid.uuid4().hex}.{extension}"
        else:
            # Default fallback filename
            filename = f"{uuid.uuid4().hex}.{extension}"

        print(filename)
        return ContentFile(response.content, name=filename)
