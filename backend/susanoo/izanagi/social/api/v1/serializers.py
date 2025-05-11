from rest_framework import serializers


class SocialAuthRedirectSerializer(serializers.Serializer):
    redirect_uri = serializers.URLField()
    provider = serializers.CharField()


class SocialAuthCallbackSerializer(serializers.Serializer):
    redirect_uri = serializers.URLField()
    code = serializers.CharField()
    state = serializers.CharField()
    provider = serializers.CharField()