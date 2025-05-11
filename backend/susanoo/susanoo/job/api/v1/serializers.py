from rest_framework import serializers

from susanoo.job.models import Job
from susanoo.stage.api.v2.serializers import StageListSerializer
from susanoo.stage.models import StageV2


class JobSerializer(serializers.ModelSerializer):

    class Meta:
        model = Job
        fields = '__all__'


class JobListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = ('id', 'created', 'title', 'job_id', 'role')


class JobCreateSerializer(serializers.ModelSerializer):
    stages = serializers.ListField(
        child=serializers.UUIDField()
    )

    def validate_stages(self, value):
        # Fetch the stage objects based on the provided IDs
        stages = StageV2.objects.filter(id__in=value)
        if len(stages) != len(value):
            raise serializers.ValidationError("One or more stage IDs are invalid.")
        return stages

    class Meta:
        model = Job
        fields = ('title', 'job_id', 'description', 'role', 'stages')