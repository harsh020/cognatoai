from django.db import models
from model_utils.models import TimeStampedModel
from django.utils.translation import gettext_lazy as _

from susanoo.core.behaviours import UUIDMixin, StatusMixin
from susanoo.feedback.enums import InterviewFeedbackCategory


class PlatformFeedback(UUIDMixin, TimeStampedModel, StatusMixin):
    interview = models.ForeignKey('interview.Interview', on_delete=models.SET_NULL, blank=True, null=True,
                                  related_name='platform_feedback')
    email = models.EmailField(_('Email'), max_length=100, blank=True, null=True)
    message = models.TextField(_('Message'), blank=True, null=True)

    def __str__(self):
        return f'{str(self.interview)} - {self.email}'


class InterviewFeedback(UUIDMixin, TimeStampedModel, StatusMixin):
    category = models.CharField(_('Category'), choices=InterviewFeedbackCategory.choices, max_length=25, blank=True,
                                null=True)
    score = models.DecimalField(_('Score'), max_digits=4, decimal_places=2, blank=True, null=True)
    comment = models.TextField(_('Comment'), blank=True, null=True)
    interview = models.ForeignKey('interview.Interview', on_delete=models.SET_NULL, blank=True, null=True,
                                  related_name='feedbacks')

    def __str__(self):
        return f'{str(self.interview)} - {self.category}'


class InterviewFeedbackV2(UUIDMixin, TimeStampedModel, StatusMixin):
    category = models.CharField(_('Category'), choices=InterviewFeedbackCategory.choices, max_length=25, blank=True,
                                null=True)
    score = models.DecimalField(_('Score'), max_digits=4, decimal_places=2, blank=True, null=True)
    comment = models.TextField(_('Comment'), blank=True, null=True)
    interview = models.ForeignKey('interview.InterviewV2', on_delete=models.SET_NULL, blank=True, null=True,
                                  related_name='feedbacksV2')

    def __str__(self):
        return f'{str(self.interview)} - {self.category}'


class InterviewFeedbackV3(UUIDMixin, TimeStampedModel, StatusMixin):
    interview = models.ForeignKey('interview.InterviewV2', on_delete=models.SET_NULL, blank=True, null=True,
                                  related_name='interview_feedbacksV3')
    stage = models.ForeignKey('stage.StageV2', on_delete=models.SET_NULL, blank=True, null=True, related_name='stage_feedbackV3')
    detail = models.TextField('Details', blank=True, null=True)
    score = models.FloatField('Score', blank=True, null=True)
    level = models.CharField('Level', max_length=8, blank=True, null=True)

    def __str__(self):
        return f'{str(self.interview)} - {self.stage.code}'