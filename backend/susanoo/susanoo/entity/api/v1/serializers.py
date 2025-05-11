import uuid

from rest_framework import serializers

from izanagi.organization.models import Organization
from susanoo.entity.models import Candidate, Interviewer


class CandidateCreateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()

    class Meta:
        model = Candidate
        fields = ('first_name', 'last_name', 'email', 'phone', 'resume')

class CandidateSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    def get_name(self, obj):
        return f'{obj.first_name} {obj.last_name}'

    class Meta:
        model = Candidate
        fields = '__all__'


class CandidateListSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    def get_name(self, obj):
        return f'{obj.first_name} {obj.last_name}'

    class Meta:
        model = Candidate
        fields = ('id', 'name', 'first_name', 'last_name', 'email', 'phone', 'resume')


class InterviewerSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    def get_name(self, obj):
        return f'{obj.first_name} {obj.last_name}'

    class Meta:
        model = Interviewer
        fields = '__all__'