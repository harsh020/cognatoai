import random
import tempfile
import threading
from datetime import datetime
import time

from django.utils import timezone
from django.core.files import File
from django.conf import settings
from django.http import HttpResponse, FileResponse, StreamingHttpResponse

from rest_framework import permissions, status
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response

from oneiros.text_to_speech.strategy.factory import text_to_speech_factory
from oneiros.utils import utils
from common.utils import save_to_storage, encoding_to_extension, encoding_to_container
from oneiros.text_to_speech.strategy.strategy import ModalTextToSpeech, DeepgramTextToSpeech
from oneiros.text_to_speech.serializers import SpeakingRequestSerializer


class SpeakingView(GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = SpeakingRequestSerializer
    # speaking_strategy = DeepgramTextToSpeech(
    #     **settings.TEXT_TO_SPEECH.get('deepgram')
    # )
    # speaking_strategy = ModalTextToSpeech(
    #     **settings.TEXT_TO_SPEECH.get('modal')
    # )
    speaking_strategy = text_to_speech_factory(
        settings.TEXT_TO_SPEECH.get('default', 'deepgram'),
        settings.TEXT_TO_SPEECH.get(
            settings.TEXT_TO_SPEECH.get('default', 'deepgram')
        )
    )

    def post(self, request):
        serializer = self.get_serializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        validated_data = serializer.validated_data
        print(validated_data)
        text = validated_data.get('text')
        validated_data.pop('text')
        encoding = validated_data.get('encoding', 'mp3')
        extension = encoding_to_extension(encoding)

        timestamp = int(timezone.now().timestamp() * 1000)
        fname = f'{validated_data.get("id")}:{timestamp}.{extension}' if validated_data.get('id') else f'audio-{datetime.now().timestamp()}-{utils.generate_random_string(random.randrange(8, 48))}.{extension}'
        # output = settings.MEDIA_ROOT + f'/{fname}'

        validated_data['container'] = encoding_to_container(encoding)
        result = self.speaking_strategy.speak(text=text, output=None, **validated_data)
        # return Response({
        #     'url': f'{settings.SITE_URL}{settings.MEDIA_URL}{fname}',
        #     **result
        # }, status=status.HTTP_200_OK)

        # Save the audio file
        if settings.SAVE_GENERATED_AUDIO:
            id = validated_data.get('id')
            path = f'{id}/audios/tts/'
            thread = threading.Thread(target=save_to_storage, args=(File(result, name=f'{timestamp}.{extension}'), path), daemon=True)
            thread.start()


        response = FileResponse(
            result,
            content_type=f'audio/{extension}',
            status=status.HTTP_200_OK,
        )
        response['Content-Disposition'] = f'attachment; filename="{fname}"'
        return response
