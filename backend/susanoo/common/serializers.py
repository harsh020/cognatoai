from rest_framework import serializers


class ErrorResponseSerializer(serializers.Serializer):
    error = serializers.DictField()

class DummySwaggerSerializer(serializers.Serializer):
    pass