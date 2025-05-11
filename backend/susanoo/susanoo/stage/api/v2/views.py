from django.db.models import Q, FloatField, ExpressionWrapper, Func, F, IntegerField, Value
from django.db.models.functions import Cast

from rest_framework import generics, permissions, parsers

from common.responses import error_response, list_response
import common.permissions as perms
from susanoo.stage.models import StageV2
from susanoo.stage.api.v2.serializers import StageListSerializer
from susanoo.stage.enums import Module
from pickle import OBJ


class StageListView(generics.GenericAPIView):
    ## ----- Create ----- ##
    # permission_classes = [permissions.IsAuthenticated, perms.IsMember, perms.HasRolePermissions]  ## TODO: add role permissions
    permission_classes = [permissions.IsAuthenticated, perms.IsMember]

    ## ----- List ----- ##
    serializer_class = StageListSerializer
    queryset = StageV2.objects.all()

    # Order settings
    ordering_fields = ('created',)
    ordering = ('-created',)

    exclude_stages = ['INTRODUCTION', 'END']

    def get(self, request):
        stages = StageV2.objects.filter(
            Q(module=Module.BASE) &
            ~Q(code__in=self.exclude_stages)
        )

        def sort_stage(x):
            parts = x.stage_id.split('.')
            if len(parts) == 1:
                return int(parts[0]) * 100

            else:
                return int(parts[0]) * 100 + int(parts[1])

        stages = sorted(stages, key=sort_stage)

        return list_response(entity='stage', data=self.get_serializer(stages, many=True).data)
