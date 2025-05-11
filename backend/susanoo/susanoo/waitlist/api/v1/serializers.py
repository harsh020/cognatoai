from django.core import validators
from rest_framework import serializers

from susanoo.waitlist.models import Waitlist


class WaitlistSerializer(serializers.ModelSerializer):
    # email = serializers.EmailField(validators=[validators.EmailValidator])

    class Meta:
        model = Waitlist
        fields = '__all__'
