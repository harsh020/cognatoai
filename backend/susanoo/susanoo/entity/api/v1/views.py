from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, permissions, filters
from rest_framework.parsers import MultiPartParser, FormParser

from common import permissions as perms
from susanoo.entity.api.v1.serializers import CandidateListSerializer, CandidateSerializer
from susanoo.entity.filters import CandidateFilterSet
from susanoo.entity.models import Candidate


class CandidateView(generics.CreateAPIView, generics.ListAPIView):
    serializer_class = CandidateListSerializer
    # permission_classes = [permissions.IsAuthenticated, perms.IsMember, perms.HasRolePermissions]  ## TODO: add role permissions
    permission_classes = [permissions.IsAuthenticated, perms.IsMember]
    parser_classes = [MultiPartParser, FormParser]
    queryset = Candidate.objects.all()
    # Filter settings
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ('email', 'first_name', 'last_name')
    filterset_class = CandidateFilterSet
    # Search settings
    search_fields = ('email', 'first_name', 'last_name')
    # Order settings
    ordering_fields = ('created',)
    ordering = ('-created',)

    def perform_create(self, serializer) -> None:
        serializer.save(
            added_by=self.request.organization
        )

    def get_queryset(self):
        return self.queryset.filter(added_by=self.request.organization)


class CandidateUpdateView(generics.UpdateAPIView):
    queryset = Candidate.objects.all()
    serializer_class = CandidateSerializer
    parser_classes = [MultiPartParser, FormParser]
    lookup_field = 'id'

    def get_queryset(self):
        return self.queryset.filter(added_by=self.request.organization)

