from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from model_utils.models import TimeStampedModel

from susanoo.activity.enums import Type
from susanoo.core.behaviours import UUIDMixin, StatusMixin


class Activity(UUIDMixin, TimeStampedModel, StatusMixin):
    interview = models.ForeignKey('interview.InterviewV2', on_delete=models.CASCADE, blank=True, null=True, related_name='activities')
    type = models.CharField(_('Type'), max_length=15, choices=Type.choices, blank=True, null=True)
    timestamp = models.DateTimeField(_('Timestamp'), auto_now=True)

