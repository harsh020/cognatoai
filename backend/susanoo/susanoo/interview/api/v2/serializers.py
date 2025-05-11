import uuid

from rest_framework import serializers

from susanoo.entity.models import Candidate
from susanoo.feedback.enums import FeedbackStatus
from susanoo.interview.enums import InterviewStatus
from susanoo.interview.models import Interview, InterviewV2
from susanoo.job.api.v1.serializers import JobSerializer, JobListSerializer
from susanoo.company.api.v1.serializers import CompanySerializer
from susanoo.recording.api.v1.serializers import VideoRecordingSerializer
from susanoo.stage.api.v1.serializers import InterviewStageSerializer
from susanoo.entity.api.v1.serializers import InterviewerSerializer, CandidateSerializer, CandidateCreateSerializer, \
    CandidateListSerializer
from susanoo.stage.models import StageV2


class MessageSerializer(serializers.Serializer):
    content = serializers.CharField(allow_null=True)
    type = serializers.CharField()

class MessageStreamSerializer(serializers.Serializer):
    content = serializers.CharField(allow_null=True)
    type = serializers.CharField()
    stream = serializers.BooleanField(default=False)
    uid = serializers.CharField(allow_null=True, default=None)
    encoding = serializers.CharField(default='webm')

class MessageSerializerV2(serializers.Serializer):
    content = serializers.CharField(allow_null=True)
    audio = serializers.URLField()
    type = serializers.CharField()


class ConversationSerializer(serializers.Serializer):
    conversation = serializers.ListField(
        child=MessageSerializer()
    )

class InterviewCreateSerializer(serializers.ModelSerializer):
    interviewer = InterviewerSerializer()
    candidate = CandidateCreateSerializer(partial=True)
    # stages = InterviewStageSerializer(many=True)
    stages = serializers.ListField(
        child=serializers.UUIDField()
    )
    custom_questions = serializers.JSONField(
        allow_null=True
    )

    # TODO: If want to use following keys, add them to meta `fields` and uncomment below
    # company = serializers.SerializerMethodField(required=False, allow_null=False)
    # job = serializers.SerializerMethodField(required=False, allow_null=False)
    metadata = serializers.JSONField()
    config = serializers.JSONField()

    # def to_internal_value(self, data):
    #     data['candidate'] = uuid.UUID(data['candidate'])
    #     print(f'hereherer --> {data}')
    #     return super().to_internal_value(data)

    def validate_stages(self, value):
        # Fetch the stage objects based on the provided IDs
        stages = StageV2.objects.filter(id__in=value)
        if len(stages) != len(value):
            raise serializers.ValidationError("One or more stage IDs are invalid.")
        return stages

    def get_job(self, obj):
        return JobSerializer(obj.metadata.get('job')).data

    def get_company(self, obj):
        return CompanySerializer(obj.metadata.get('company')).data

    class Meta:
        model = InterviewV2
        fields = ('id', 'status', 'type', 'start_datetime', 'end_datetime', 'started_datetime', 'ended_datetime', 'resume', 'interviewer', 'candidate', 'custom_questions', 'metadata', 'stages', 'config')

class InterviewBulkCrateSerializer(serializers.ModelSerializer):
    candidates = serializers.ListField(
        child=serializers.UUIDField()
    )
    custom_questions = serializers.JSONField()
    metadata = serializers.JSONField()
    config = serializers.JSONField()

    class Meta:
        model = InterviewV2
        fields = (
            'start_datetime',
            'end_datetime',
            'job',
            'interviewer',
            'config',
            'metadata',
            'candidates',
            'custom_questions'
        )

class InterviewSerializer(serializers.ModelSerializer):
    interviewer = InterviewerSerializer()
    candidate = CandidateSerializer(partial=True)
    recording = serializers.SerializerMethodField()
    feedback_status = serializers.SerializerMethodField()
    job = JobListSerializer()
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

    def get_feedback_status(self, obj):
        feedbacks = obj.interview_feedbacksV3.all()
        if feedbacks and len(feedbacks) > 0:
            return FeedbackStatus.COMPLETED
        return FeedbackStatus.PENDING

    def get_recording(self, obj):
        recording = obj.video_recordings.order_by('-created').first()
        if recording:
            return VideoRecordingSerializer(recording).data
        return None

    class Meta:
        model = InterviewV2
        fields = ('id', 'status', 'type', 'start_datetime', 'end_datetime', 'started_datetime', 'ended_datetime', 'resume', 'feedback_status', 'interviewer', 'candidate', 'recording', 'metadata', 'config', 'job')


class InterviewConversationResponseSerializer(serializers.ModelSerializer):
    conversation = ConversationSerializer()
    stage = InterviewStageSerializer()


class InterviewListSerializer(serializers.ModelSerializer):
    interviewer = serializers.SerializerMethodField()
    candidate = CandidateListSerializer()
    job = JobListSerializer()
    feedback_status = serializers.SerializerMethodField()
    score = serializers.SerializerMethodField()

    def get_interviewer(self, obj):
        return obj.interviewer.get_full_name()

    def get_candidate(self, obj):
        return obj.interviewer.email

    def get_feedback_status(self, obj):
        feedbacks = obj.interview_feedbacksV3.all()
        if feedbacks and len(feedbacks) > 0:
            return FeedbackStatus.COMPLETED
        return FeedbackStatus.PENDING

    def get_score(self, obj):
        if obj.status == InterviewStatus.COMPLETED:
            feedbacks = obj.interview_feedbacksV3.filter(score__isnull=False)
            if feedbacks and len(feedbacks) > 0:
                return sum([feedback.score for feedback in feedbacks]) / len(feedbacks)
        return None

    class Meta:
        model = InterviewV2
        fields = ('id', 'status', 'created', 'interviewer', 'candidate', 'job', 'feedback_status', 'start_datetime', 'end_datetime', 'started_datetime', 'ended_datetime', 'score')


class InterviewSummarySerializer(serializers.Serializer):
    status = serializers.CharField()
    total = serializers.IntegerField()


class InterviewDailySummarySerializer(serializers.Serializer):
    date = serializers.DateField(format='%Y-%m-%d')
    scheduled = serializers.IntegerField()
    completed = serializers.IntegerField()
