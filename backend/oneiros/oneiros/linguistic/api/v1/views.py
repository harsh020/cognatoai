from django.conf import settings
from rest_framework import generics, status
from rest_framework.response import Response

from common.responses import error_response
from oneiros.linguistic.api.v1.serializers import UsageRequestSerializer
from oneiros.speech_to_text.strategy.factory import speech_to_text_factory
from oneiros.text_to_speech.strategy.factory import text_to_speech_factory


class UsageView(generics.GenericAPIView):
    serializer_class = UsageRequestSerializer
    transcription_strategy = speech_to_text_factory(
        settings.SPEECH_TO_TEXT.get('default', 'modal'),
        settings.SPEECH_TO_TEXT.get(
            settings.SPEECH_TO_TEXT.get('default', 'modal')
        )
    )
    speaking_strategy = text_to_speech_factory(
        settings.TEXT_TO_SPEECH.get('default', 'deepgram'),
        settings.TEXT_TO_SPEECH.get(
            settings.TEXT_TO_SPEECH.get('default', 'deepgram')
        )
    )

    def get(self, request):
        serializer = self.get_serializer(data=request.GET, partial=True)
        if not serializer.is_valid():
            return error_response(
                errors={
                    key: [error for error in errors]
                    for key, errors in serializer.errors.items()
                },
                message='Invalid data',
                status=status.HTTP_400_BAD_REQUEST
            )

        validated_data = serializer.validated_data

        return Response(
            {
                'usage': [
                    self.transcription_strategy.cost(validated_data.get('start'), validated_data.get('end')),
                    self.speaking_strategy.cost(validated_data.get('tokens'))
                ]
            }, status=status.HTTP_200_OK
        )
