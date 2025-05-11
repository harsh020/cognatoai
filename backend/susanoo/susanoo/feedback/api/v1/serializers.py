from rest_framework import serializers

from susanoo.feedback.models import PlatformFeedback, InterviewFeedback


class PlatformFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformFeedback
        fields = '__all__'


class InterviewFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewFeedback
        fields = ('category', 'score', 'comment')