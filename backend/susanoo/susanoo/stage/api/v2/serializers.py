from rest_framework import serializers

from susanoo.stage.models import StageV2


class StageSerializer(serializers.ModelSerializer):

    class Meta:
        model = StageV2
        fields = '__all__'


class StageListSerializer(serializers.ModelSerializer):

    class Meta:
        model = StageV2
        fields = ('id', 'stage_id', 'name', 'type', 'module', 'code')


class InterviewStageSerializer(serializers.ModelSerializer):

    class Meta:
        model = StageV2
        fields = ('id', 'name', 'description', 'type', 'timeout',)
