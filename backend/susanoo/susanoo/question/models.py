from django.db import models
from django.utils.translation import gettext_lazy as _
from model_utils.models import TimeStampedModel

from susanoo.core.behaviours import UUIDMixin, StatusMixin


class Question(UUIDMixin, StatusMixin, TimeStampedModel):
    interview = models.ForeignKey('interview.InterviewV2', on_delete=models.SET_NULL, blank=True, null=True,
                                  related_name='interview_questions')
    stage = models.ForeignKey('stage.StageV2', blank=True, null=True, on_delete=models.SET_NULL,
                              related_name='stage_questions')
    questions = models.JSONField(_('Questions'), blank=True, null=True)

    def __str__(self):
        if self.interview and self.stage:
            return f'{self.interview}:{self.stage.code}'
        return str(self.id)