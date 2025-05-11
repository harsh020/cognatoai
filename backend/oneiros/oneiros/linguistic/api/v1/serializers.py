from rest_framework import serializers


class UsageRequestSerializer(serializers.Serializer):
    start = serializers.DateTimeField()
    end = serializers.DateTimeField()
    tokens = serializers.IntegerField()
