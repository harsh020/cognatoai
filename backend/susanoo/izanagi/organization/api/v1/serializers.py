from rest_framework import serializers

from izanagi.organization.models import Organization, Role, Member


class OrganizationSerializer(serializers.ModelSerializer):
    total_interviews = serializers.SerializerMethodField()
    plan = serializers.SerializerMethodField()

    def get_total_interviews(self, obj):
        return obj.organization_interviews_v2.count()

    def get_plan(self, obj):
        subscription = obj.subscriptions.order_by('-created').first()
        if subscription:
            return subscription.plan.name
        return 'Trial'

    class Meta:
        model = Organization
        fields = ('id', 'name', 'credits', 'description', 'personal', 'total_interviews', 'plan')


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ('name', 'description',)


class MemberSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    def get_name(self, obj):
        return obj.user.get_full_name()

    def get_email(self, obj):
        return obj.user.email

    def get_role(self, obj):
        return obj.role.name

    class Meta:
        model = Member
        fields = ('id', 'name', 'email', 'role', 'date_joined')


class UserOrganizationSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    # description = serializers.SerializerMethodField()
    personal = serializers.SerializerMethodField()
    # role = serializers.SerializerMethodField()
    total_interviews = serializers.SerializerMethodField()

    def get_id(self, obj):
        return obj.organization.id

    def get_name(self, obj):
        return obj.organization.name

    def get_serializer(self, obj):
        return obj.organization.description

    def get_personal(self, obj):
        return obj.organization.personal

    def get_description(self, obj):
        return obj.organization.description

    def get_role(self, obj):
        return obj.role.name

    def get_total_interviews(self, obj):
        return obj.organization.organization_interviews_v2.count()

    class Meta:
        model = Member
        # fields = ('id', 'name', 'description', 'date_joined', 'role', 'personal', 'is_default',)
        fields = ('id', 'name', 'personal', 'is_default', 'total_interviews')