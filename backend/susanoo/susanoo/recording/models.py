from django.db import models
from django.utils.translation import gettext_lazy as _
from model_utils.models import TimeStampedModel

from susanoo.core.behaviours import UUIDMixin, StatusMixin
from susanoo.recording.enums import RecordingStatus


class VideoRecording(UUIDMixin, StatusMixin, TimeStampedModel):
    interview = models.ForeignKey('interview.InterviewV2', on_delete=models.SET_NULL, blank=True, null=True, related_name='video_recordings')
    status = models.CharField(_('Status'), choices=RecordingStatus.choices, default=RecordingStatus.PENDING)
    url = models.URLField(_('URL'), blank=True, null=True)
    reason = models.TextField(_('Reason'), blank=True, null=True)

    def __str__(self):
        return str(self.interview)
