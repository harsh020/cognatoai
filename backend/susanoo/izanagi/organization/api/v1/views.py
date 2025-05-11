from rest_framework import generics, permissions

import common.permissions as perms
from izanagi.organization.models import Organization, Member
from izanagi.organization.api.v1.serializers import OrganizationSerializer, MemberSerializer


class OrganizationCreateView(generics.CreateAPIView):
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAdminUser]


class OrganizationListView(generics.ListAPIView):
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Organization.objects.all()

    def get_queryset(self):
        return Organization.objects.filter(members__user=self.request.user)


class MemberListView(generics.ListAPIView):
    serializer_class = MemberSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Member.objects.all()

    def get_queryset(self):
        return self.queryset.filter(organization=self.request.organization)


class OrganizationRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = OrganizationSerializer
    # permission_classes = [permissions.IsAuthenticated, perms.HasRolePermissions]
    permission_classes = [permissions.IsAuthenticated, perms.IsOwner]
    queryset = Organization.objects.all()
    lookup_field = 'id'

    def get_object(self):
        return self.request.organization

