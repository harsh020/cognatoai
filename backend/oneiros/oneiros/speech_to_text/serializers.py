from rest_framework import serializers


class TranscriptRequestSerializer(serializers.Serializer):
    id = serializers.CharField(allow_null=True)
    file = serializers.FileField()

class TranscriptResponseSerializer(serializers.Serializer):
    text = serializers.CharField()
    # execution_time = serializers.FloatField()
    total_time = serializers.FloatField(allow_null=True)
