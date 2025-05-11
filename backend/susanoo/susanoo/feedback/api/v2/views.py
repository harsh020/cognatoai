from rest_framework import generics, permissions, status
from rest_framework.response import Response

from common.responses import list_response
from rasengan.feedback.engine import FeedbackEngine
from susanoo.feedback.api.v1.serializers import PlatformFeedbackSerializer, InterviewFeedbackSerializer
from susanoo.feedback.models import PlatformFeedback, InterviewFeedback
from susanoo.interview.models import Interview, InterviewV2
from susanoo.provider.models import LLM


class PlatformFeedbackView(generics.GenericAPIView):
    serializer_class = PlatformFeedbackSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        validated_data = serializer.validated_data
        feedback = PlatformFeedback.objects.create(**validated_data)

        return Response(self.get_serializer(feedback).data, status=status.HTTP_201_CREATED)


class InterviewFeedbackView(generics.GenericAPIView):
    serializer_class = InterviewFeedbackSerializer
    feedback_engine = FeedbackEngine()

    def get(self, request, id=None):
        interview = id
        if not interview:
            return Response({
                'error': True,
                'message': 'Interview id is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        interview = InterviewV2.objects.get(id=interview)
        feedback = self.feedback_engine.retrieve(interview)
        # response = InterviewFeedbackSerializer(feedbacks, many=True).data
        # return list_response(entity='feedback', data=response)
        return Response(data=feedback, status=status.HTTP_200_OK)

