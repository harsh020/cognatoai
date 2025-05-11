from rest_framework import serializers

from susanoo.stage.models import Stage, StageV2


class StageSerializer(serializers.ModelSerializer):

    class Meta:
        model = Stage
        fields = '__all__'


class InterviewStageSerializer(serializers.ModelSerializer):

    class Meta:
        model = Stage
        fields = ('id', 'name', 'description', 'type', 'timeout',)
