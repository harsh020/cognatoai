import uuid

from rest_framework import serializers

from susanoo.entity.models import Candidate
from susanoo.interview.models import Interview
from susanoo.job.api.v1.serializers import JobSerializer
from susanoo.company.api.v1.serializers import CompanySerializer
from susanoo.stage.api.v1.serializers import InterviewStageSerializer
from susanoo.entity.api.v1.serializers import InterviewerSerializer, CandidateSerializer, CandidateCreateSerializer


class MessageSerializer(serializers.Serializer):
    content = serializers.CharField(allow_null=True)
    type = serializers.CharField()


class ConversationSerializer(serializers.Serializer):
    conversation = serializers.ListField(
        child=MessageSerializer()
    )

class InterviewCreateSerializer(serializers.ModelSerializer):
    interviewer = InterviewerSerializer()
    candidate = CandidateCreateSerializer(partial=True)
    # TODO: If want to use following keys, add them to meta `fields` and uncomment below
    # company = serializers.SerializerMethodField(required=False, allow_null=False)
    # job = serializers.SerializerMethodField(required=False, allow_null=False)
    metadata = serializers.JSONField()

    # def to_internal_value(self, data):
    #     data['candidate'] = uuid.UUID(data['candidate'])
    #     print(f'hereherer --> {data}')
    #     return super().to_internal_value(data)

    def get_job(self, obj):
        return JobSerializer(obj.metadata.get('job')).data

    def get_company(self, obj):
        return CompanySerializer(obj.metadata.get('company')).data

    class Meta:
        model = Interview
        fields = ('id', 'status', 'type', 'start_datetime', 'end_datetime', 'started_datetime', 'ended_datetime', 'resume', 'interviewer', 'candidate', 'metadata')

class InterviewSerializer(serializers.ModelSerializer):
    interviewer = InterviewerSerializer()
    candidate = CandidateSerializer(partial=True)
    # candidate = serializers.PrimaryKeyRelatedField(queryset=Candidate.objects.all(), pk_field=serializers.UUIDField(format='hex'))
    # TODO: If want to use following keys, add them to meta `fields` and uncomment below
    # company = serializers.SerializerMethodField(required=False, allow_null=False)
    # job = serializers.SerializerMethodField(required=False, allow_null=False)
    metadata = serializers.JSONField()

    # def to_internal_value(self, data):
    #     data['candidate'] = uuid.UUID(data['candidate'])
    #     print(f'hereherer --> {data}')
    #     return super().to_internal_value(data)

    def get_job(self, obj):
        return JobSerializer(obj.metadata.get('job')).data

    def get_company(self, obj):
        return CompanySerializer(obj.metadata.get('company')).data

    class Meta:
        model = Interview
        fields = ('id', 'status', 'type', 'start_datetime', 'end_datetime', 'started_datetime', 'ended_datetime', 'resume', 'interviewer', 'candidate', 'metadata')


class InterviewConversationResponseSerializer(serializers.ModelSerializer):
    conversation = ConversationSerializer()
    stage = InterviewStageSerializer()


class InterviewListSerializer(serializers.ModelSerializer):
    interviewer = serializers.SerializerMethodField()
    candidate = serializers.SerializerMethodField()

    def get_interviewer(self, obj):
        return obj.interviewer.get_full_name()

    def get_candidate(self, obj):
        return obj.interviewer.email

    class Meta:
        model = Interview
        fields = ('id', 'status', 'created', 'interviewer', 'candidate')