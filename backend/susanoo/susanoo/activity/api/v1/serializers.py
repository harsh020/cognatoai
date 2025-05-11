from rest_framework import serializers

from susanoo.activity.models import Activity


class ActivitySerializer(serializers.ModelSerializer):
    # interview = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Activity
        fields = '__all__'