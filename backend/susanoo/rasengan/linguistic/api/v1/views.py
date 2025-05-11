import tempfile

from openai import OpenAI
from django.conf import settings
from rest_framework.response import Response
from rest_framework import status, generics, parsers

from rasengan.linguistic.strategy.transcription import OpenAITranscriptionStrategy, CloudFlareTranscriptionStrategy
from rasengan.text_to_speech.pyttsx3 import PyTTSX3
from susanoo.interview.models import Interview


client = OpenAI(api_key=settings.OPENAI_API_KEY)

class TTSView(generics.GenericAPIView):
    permission_classes = []

    def post(self, request, id=None):
        interview = Interview.objects.get(id=id)
        file = f'{settings.MEDIA_ROOT}/messages/{interview.id}.wav'

        tts = PyTTSX3(
            rate=160,
            voice='com.apple.voice.enhanced.en-US.Tom'
        )
        tts.save(request.data.get('text'), file)
        return Response({
            'url': f'https://localhost:8000/media/messages/{interview.id}.wav'
        }, status=status.HTTP_200_OK)


class STTView(generics.GenericAPIView):
    permission_classes = []
    parser_classes = [parsers.MultiPartParser, parsers.FileUploadParser, parsers.FormParser, parsers.JSONParser]
    transcription_strategy = CloudFlareTranscriptionStrategy()

    def post(self, request):
        print(request, request.FILES.get('file').file)
        print(type(request.FILES.get('file').file))

        buffer = request.FILES.get('file').file
        buffer.name = 'speech.wav'
        with tempfile.NamedTemporaryFile(suffix='.wav', mode='r+b') as f:
            f.write(buffer.getbuffer())
            f.seek(0)
            transcript = self.transcription_strategy.transcribe(file=f.name)
        return Response(transcript, status=status.HTTP_200_OK)
