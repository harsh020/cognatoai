from rest_framework import serializers


class SpeakingRequestSerializer(serializers.Serializer):
    id = serializers.CharField(allow_null=True)
    text = serializers.CharField()
    encoding = serializers.CharField(default='mp3')
    # container = serializers.CharField(allow_null=True, default=None)
    stream = serializers.BooleanField(default=False)
    sample_rate = serializers.IntegerField(allow_null=True)


class SpeakingResponseSerializer(serializers.Serializer):
    url = serializers.URLField()
    # execution_time = serializers.FloatField()
    total_time = serializers.FloatField()
