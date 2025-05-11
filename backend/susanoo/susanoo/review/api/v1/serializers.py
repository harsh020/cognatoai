from rest_framework import serializers

from susanoo.review.models import Review


class ReviewSerializer(serializers.ModelSerializer):
    resume = serializers.SerializerMethodField()

    def get_resume(self, obj):
        if obj.resume:
            return obj.resume.url
        return None

    class Meta:
        model = Review
        fields = '__all__'


class ReviewCreateSerializer(serializers.Serializer):
    role = serializers.CharField()
    resume = serializers.FileField()


class ReviewResponseSerializer(serializers.ModelSerializer):
    resume = serializers.SerializerMethodField()

    def get_resume(self, obj):
        if obj.resume:
            return obj.resume.url
        return None

    class Meta:
        model = Review
        fields = ('id', 'created', 'role', 'status', 'resume')