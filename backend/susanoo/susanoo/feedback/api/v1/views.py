from rest_framework import generics, permissions, status
from rest_framework.response import Response

from common.responses import error_response
from rasengan.interview.feedback import FeedbackExecutor
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
    feedback_executor = FeedbackExecutor()

    def get(self, request):
        interview = request.GET.get('interview', None)
        if not interview:
            return error_response(
                errors={
                    'interview': ['required'],
                },
                message='Invalid data',
                status=400
            )

        interview = Interview.objects.get(id=interview)
        llm = request.GET.get('llm', 'gemini-1.0-pro')
        llm = LLM.objects.get(model=llm)

        feedback = self.feedback_executor._call(interview, llm=llm)
        feedback_instances = []
        for key, value in feedback.items():
            instance = InterviewFeedback.objects.create(
                category=key.upper(),
                score=value.get('score'),
                comment=value.get('comment'),
                interview=interview
            )
            feedback_instances.append(instance)

        response = InterviewFeedbackSerializer(feedback_instances, many=True).data
        return Response({
            'feedbacks': response
        }, status=status.HTTP_200_OK)

