import threading

from django.conf import settings

from rest_framework import permissions, status
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response

from common.utils import save_to_storage
from common.responses import success_response
from oneiros.speech_to_text.serializers import TranscriptResponseSerializer, TranscriptRequestSerializer
from oneiros.speech_to_text.strategy.factory import speech_to_text_factory
from oneiros.speech_to_text.strategy.strategy import ModalSpeechToText, DeepgramSpeechToText, GroqSpeechToText


class TranscriptionView(GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = TranscriptRequestSerializer
    # transcription_strategy = ModalSpeechToText(
    #     **settings.SPEECH_TO_TEXT.get('modal'),
    # )
    # transcription_strategy = DeepgramSpeechToText(
    #     **settings.SPEECH_TO_TEXT.get('deepgram')
    # )
    # transcription_strategy = GroqSpeechToText(
    #     **settings.SPEECH_TO_TEXT.get(
    #         settings.SPEECH_TO_TEXT.get('default', 'modal')
    #     )
    # )
    transcription_strategy = speech_to_text_factory(
        settings.SPEECH_TO_TEXT.get('default', 'modal'),
        settings.SPEECH_TO_TEXT.get(
            settings.SPEECH_TO_TEXT.get('default', 'modal')
        )
    )

    def get(self, request):
        response = self.transcription_strategy.warmup()
        return success_response(
            message='Warmup successful',
            data=response
        )

    def post(self, request):
        file = request.FILES.get('file')
        serializer = self.get_serializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        validated_data = serializer.validated_data
        validated_data.pop('file')

        # Save the audio file
        if settings.SAVE_GENERATED_AUDIO:
            id = validated_data.pop('id')
            path = f'{id}/audios/asr/'
            thread = threading.Thread(target=save_to_storage, args=(file, path), daemon=True)
            thread.start()

        response = self.transcription_strategy.transcribe(file, **validated_data)

        return Response(TranscriptResponseSerializer(response).data, status=status.HTTP_200_OK)
