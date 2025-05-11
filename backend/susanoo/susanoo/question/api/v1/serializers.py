from rest_framework import serializers


class QuestionCreateSerializer(serializers.Serializer):
    interview = serializers.UUIDField()
    stage = serializers.UUIDField()
    questions = serializers.ListField(
        child=serializers.CharField()
    )