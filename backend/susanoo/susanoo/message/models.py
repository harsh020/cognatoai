import os

from django.db import models
from django.utils import timezone
from django.utils.deconstruct import deconstructible
from django.utils.translation import gettext_lazy as _
from model_utils.models import TimeStampedModel

from susanoo.core.behaviours import UUIDMixin, StatusMixin
from susanoo.message.enums import MessageType, SentinelType


@deconstructible
class AudioFileRename(object):
    def __call__(self, instance, filename):
        if instance:
            ext = filename.split('.')[-1]
            filename = f'{instance.id}.{ext}'
            return os.path.join('interviews', str(instance.interview.id), 'audios',  str(instance.type), filename)
        return None


class Message(UUIDMixin, TimeStampedModel, StatusMixin):
    type = models.CharField(_('Type'), max_length=50, choices=MessageType.choices, blank=True, null=True, db_index=True)
    content = models.TextField(_('Content'), blank=True, null=True)
    stage = models.ForeignKey('stage.Stage', blank=True, null=True, on_delete=models.SET_NULL, related_name='stage_messages', db_index=True)
    interview = models.ForeignKey('interview.Interview', blank=True, null=True, on_delete=models.CASCADE, related_name='interview_messages', db_index=True)

    def __str__(self):
        return f'{self.type} - {self.stage.stage_id} - {self.interview.id}'


class MessageV2(UUIDMixin, TimeStampedModel, StatusMixin):
    type = models.CharField(_('Type'), max_length=50, choices=MessageType.choices, blank=True, null=True, db_index=True)
    content = models.TextField(_('Content'), blank=True, null=True)
    stage = models.ForeignKey('stage.StageV2', blank=True, null=True, on_delete=models.SET_NULL, related_name='stage_messages_v2', db_index=True)
    node = models.ForeignKey('graph.NodeV2', blank=True, null=True, on_delete=models.SET_NULL, related_name='node_messages_v2', db_index=True)
    interview = models.ForeignKey('interview.InterviewV2', blank=True, null=True, on_delete=models.CASCADE, related_name='interview_messages_v2', db_index=True)

    audio = models.FileField(_('Audio'), upload_to=AudioFileRename(), blank=True, null=True)
    metadata = models.JSONField('metadata', blank=True, null=True)

    def __str__(self):
        return f'{self.type} - {self.stage.stage_id} - {self.interview.id}'


class Sentinel(UUIDMixin, TimeStampedModel, StatusMixin):
    type = models.CharField(_('Type'), max_length=50, choices=SentinelType.choices, blank=True, null=True, db_index=True)
    sentinel = models.CharField(_('Sentinel'), max_length=50, blank=True, null=True)
    interview = models.ForeignKey('interview.InterviewV2', blank=True, null=True, on_delete=models.CASCADE,
                                  related_name='interview_sentinels', db_index=True)
    node = models.ForeignKey('graph.NodeV2', blank=True, null=True, on_delete=models.SET_NULL,
                             related_name='node_sentinels', db_index=True)

    def __str__(self):
        return f'{self.type}'


class Thought(UUIDMixin, TimeStampedModel, StatusMixin):
    stage = models.ForeignKey('stage.StageV2', blank=True, null=True, on_delete=models.SET_NULL,
                              related_name='stage_thoughts', db_index=True)
    node = models.ForeignKey('graph.NodeV2', blank=True, null=True, on_delete=models.SET_NULL,
                             related_name='node_thoughts', db_index=True)
    interview = models.ForeignKey('interview.InterviewV2', blank=True, null=True, on_delete=models.CASCADE,
                                  related_name='interview_thoughts', db_index=True)
    content = models.TextField(_('Content'), blank=True, null=True)

    def __str__(self):
        return f'{self.interview}:{self.stage}'