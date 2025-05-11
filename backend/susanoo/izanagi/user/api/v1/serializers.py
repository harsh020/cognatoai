from rest_framework import serializers

from izanagi.organization.api.v1.serializers import UserOrganizationSerializer
from izanagi.user.models import User, OTP


class UserRegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField()

class UserAuthSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class UserAuthResponseSerializer(serializers.Serializer):
    id = serializers.CharField()
    email = serializers.EmailField()
    is_email_verified = serializers.BooleanField(default=False)
    access_token = serializers.CharField(allow_null=True)
    refresh_token = serializers.CharField(allow_null=True)

class UserPasswordUpdateSerializer(serializers.Serializer):
    current_password = serializers.EmailField()
    new_password = serializers.CharField()

class OTPSerializer(serializers.Serializer):
    otp = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)


class OTPResponseSerializer(serializers.Serializer):
    class Meta:
        model = OTP
        fields = ('id', 'otp', 'created',)


class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    organizations = serializers.SerializerMethodField()
    total_interviews = serializers.SerializerMethodField()

    def get_name(self, obj):
        return obj.get_full_name()

    def get_organizations(self, obj):
        if obj.memberships:
            return UserOrganizationSerializer(obj.memberships.order_by('created'), many=True).data
        return None

    def get_total_interviews(self, obj):
        interviews = 0
        if obj.memberships:
            for member in obj.memberships.all():
                interviews += member.organization.organization_interviews_v2.count()
        return interviews

    class Meta:
        model = User
        fields = ('id', 'email', 'phone', 'first_name', 'last_name', 'name', 'is_email_verified', 'date_joined', 'organizations', 'total_interviews')