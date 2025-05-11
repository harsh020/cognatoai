import os

from django.conf import settings
from django.core.files.storage import default_storage
from rest_framework import generics, permissions, status, parsers
from rest_framework.response import Response

import common.permissions as perms
from common.responses import error_response
from susanoo.interview.enums import InterviewStatus
from susanoo.interview.models import InterviewV2
from susanoo.recording.api.v1.serializers import VideoRecordingSerializer
from susanoo.recording.enums import RecordingStatus
from susanoo.recording.models import VideoRecording


class VideoRecordingView(generics.GenericAPIView):
    serializer_class = VideoRecordingSerializer
    permission_classes = [permissions.IsAuthenticated, perms.IsMember]
    parser_classes = [parsers.MultiPartParser, parsers.FileUploadParser, parsers.FormParser, parsers.JSONParser]

    def post(self, request, interview=None):
        # interview = Interview.objects.get(id=id)
        chunk = request.FILES.get('file')
        id = request.data.get('id')

        # ms = time.time_ns()
        path = settings.INTERVIEW_RECORDING.get('VIDEO', {}).get('CHUNK_PATH')
        if not path:
            path = f'interviews/{id}/videos/chunks/'
        else:
            path = path.format(interview=str(id))
        if not os.path.exists(path):
            os.makedirs(path)

        # path += chunk.name
        # path += f'/{ms}.wav'
        default_storage.save(path + chunk.name, chunk)

        return Response({
            'url': path
        }, status=status.HTTP_200_OK)

    def get(self, request, interview=None):
        try:
            interview = InterviewV2.objects.get(id=interview)
        except InterviewV2.DoesNotExist:
            return error_response(
                errors={
                    'not_found': ['interview not found']
                },
                message='Interview not found',
                status=status.HTTP_404_NOT_FOUND
            )

        if interview.status == InterviewStatus.COMPLETED:
            recording = interview.video_recordings.order_by('-created').first()
            if not recording:
                error_response(
                    errors={
                        'not_found': ['recording not found']
                    },
                    message='Something went wrong. Please contact the team to know more.',
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            recording = VideoRecording(interview=interview, status=RecordingStatus.PENDING)
        return Response(self.get_serializer(recording).data, status=status.HTTP_200_OK)
