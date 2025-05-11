from rest_framework import serializers

from susanoo.recording.models import VideoRecording


class VideoRecordingSerializer(serializers.ModelSerializer):
    interview = serializers.SerializerMethodField()

    def get_interview(self, obj):
        if obj.interview:
            return str(obj.interview.id)
        return None

    class Meta:
        model = VideoRecording
        fields = ('id', 'interview', 'status', 'url')