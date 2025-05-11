from typing import List

from django.shortcuts import render

from rest_framework import generics, permissions, status
from rest_framework.response import Response

from common import permissions as perms
from common.responses import error_response, success_response, list_response
from susanoo.activity.api.v1.serializers import ActivitySerializer
from susanoo.activity.enums import Type
from susanoo.activity.models import Activity
from susanoo.interview.enums import InterviewStatus
from susanoo.interview.models import InterviewV2
from susanoo.stage.models import Stage, StageV2


def process_interview_activities(interview: InterviewV2) -> List:
    response = []
    activities = interview.activities
    stages = interview.job.stages
    messages = interview.interview_messages_v2
    skip_stages = ['END']
    for stage in stages.order_by('stage_id').all():
        if stage.code in skip_stages:
            continue

        # print(stage.code)
        if stage.submodule:
            submodule_stages = StageV2.objects.filter(module=stage.submodule).all()
            stage_messages = messages.filter(stage__in=submodule_stages).order_by('created')
            stage_activities = activities.filter(timestamp__gte=stage_messages.first().created,
                                                 timestamp__lte=stage_messages.last().created)
        else:
            stage_messages = messages.filter(stage=stage).order_by('created')
            stage_activities = activities.filter(timestamp__gte=stage_messages.first().created,
                                                 timestamp__lte=stage_messages.last().created)
        # print('done')
        # TODO: Improve logic for counting by groups based on activity type
        response.append({
            'stage': stage.name,
            f'{Type.TAB_SWITCH}': stage_activities.count()
        })
    return response


class ActivityView(generics.GenericAPIView):
    serializer_class = ActivitySerializer
    permission_classes = [permissions.IsAuthenticated, perms.IsMember]

    def get(self, request, interview=None):
        try:
            interview = InterviewV2.objects.get(id=interview)
        except InterviewV2.DoesNotExist:
            return error_response(
                errors={
                    'not_found': ['interview not found']
                },
                message='Interview not found',
                status=status.HTTP_404_NOT_FOUND
            )

        if interview.status != InterviewStatus.COMPLETED:
            return list_response(entity='activities', data=None, status=status.HTTP_200_OK)

        response = process_interview_activities(interview)

        return list_response(entity='activities', data=response, status=status.HTTP_200_OK)


class ActivityBulkCreateView(generics.GenericAPIView):
    serializer_class = ActivitySerializer

    # permission_classes = [permissions.IsAuthenticated, perms.IsMember]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, many=True)
        if not serializer.is_valid():
            return error_response(
                errors={
                    key: [error for error in errors]
                    for key, errors in serializer.errors.items()
                },
                message='Invalid data',
                status=status.HTTP_400_BAD_REQUEST
            )
        validated_data = serializer.validated_data

        activities = [Activity(**data) for data in validated_data]
        activities = Activity.objects.bulk_create(activities)

        return success_response(
            message='Activities created successfully',
            data=self.get_serializer(activities, many=True).data,
        )
