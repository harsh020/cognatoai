from functools import lru_cache

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, status, parsers, permissions, filters
from rest_framework.response import Response

import common.permissions as perms
from common.responses import error_response
from common.utils import create_interview_graph
from rasengan.graph.enums import GraphType
from susanoo.job.api.v1.serializers import JobSerializer, JobCreateSerializer, JobListSerializer
from susanoo.job.filters import JobFilterSet
from susanoo.job.models import Job
from susanoo.question.api.v1.serializers import QuestionCreateSerializer
from susanoo.stage.models import StageV2


@lru_cache(maxsize=None)
def _required_stages():
    return StageV2.objects.filter(required=True)


class JobCreateListView(generics.CreateAPIView, generics.ListAPIView, generics.UpdateAPIView, generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated, perms.IsMember]
    serializer_class = JobSerializer
    queryset = Job.objects.all()

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ('title', 'role', 'created')
    filterset_class = JobFilterSet
    lookup_field = 'id'

    ordering_fields = ('created',)
    ordering = '-created'

    def create(self, request, *args, **kwargs) -> Response:
        serializer = JobCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                errors={
                    key: [error for error in errors]
                    for key, errors in serializer.errors.items()
                },
                message='Incomplete or invalid data',
                status=status.HTTP_400_BAD_REQUEST
            )

        validated_data = serializer.validated_data

        stages = validated_data.pop('stages')
        graph = create_interview_graph(stages)
        graph.type = GraphType.SWE
        graph.save()

        validated_data['graph'] = graph
        job, created = Job.objects.get_or_create(
            **validated_data,
            organization=request.organization
        )
        if not created:
            return error_response(
                errors={
                    'exists': 'job already exists'
                },
                message='Job with same job id and skills already exist.',
                status=status.HTTP_400_BAD_REQUEST
            )
        required_stages = _required_stages()

        job.stages.set(stages | required_stages)
        job.save()

        return Response(
            JobSerializer(job).data,
            status=status.HTTP_201_CREATED
        )

    def get_queryset(self):
        return self.queryset.filter(organization=self.request.organization)


class JobUpdateRetrieveView(generics.UpdateAPIView, generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated, perms.IsMember]
    serializer_class = JobSerializer
    queryset = Job.objects.all()

    lookup_field = 'id'

    def update(self, request, *args, **kwargs) -> Response:
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = JobCreateSerializer(instance, data=request.data, partial=partial)

        if not serializer.is_valid():
            return error_response(
                errors={
                    key: [error for error in errors]
                    for key, errors in serializer.errors.items()
                },
                message='Incomplete or invalid data',
                status=status.HTTP_400_BAD_REQUEST
            )

        validated_data = serializer.validated_data
        stages = validated_data.pop('stages', None)
        if stages and len(stages) > 0:
            graph = create_interview_graph(stages)
            graph.type = GraphType.SWE
            graph.save()
            instance.graph = graph

        # Now update the instance manually
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if stages:
            required_stages = _required_stages()
            instance.stages.set(stages | required_stages)

        instance.save()

        return Response(
            self.get_serializer(instance).data,
            status=status.HTTP_201_CREATED
        )
