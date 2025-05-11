from common.utils import to_camel_case
from rest_framework import serializers

from susanoo.feedback.models import PlatformFeedback, InterviewFeedback


class PlatformFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformFeedback
        fields = '__all__'


class InterviewFeedbackSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()

    def get_title(self, obj):
        if obj.category:
            return to_camel_case(obj.category)

    class Meta:
        model = InterviewFeedback
        fields = ('category', 'score', 'comment', 'title')
