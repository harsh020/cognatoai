from django.db import models
from django.utils.translation import gettext_lazy as _
from model_utils.models import TimeStampedModel

from susanoo.core.behaviours import UUIDMixin, StatusMixin
from susanoo.usage.enums import UsageType


class Usage(UUIDMixin, TimeStampedModel, StatusMixin):
    type = models.CharField(_('Type'), choices=UsageType.choices, max_length=20, blank=True, null=True)
    interview = models.ForeignKey('interview.Interview', on_delete=models.SET_NULL, blank=True, null=True)
    llm = models.ForeignKey('provider.LLM', on_delete=models.SET_NULL, blank=True, null=True)
    input = models.TextField(_('Input'), blank=True, null=True)
    output = models.TextField(_('Output'), blank=True, null=True)
    prompt_tokens = models.BigIntegerField(_('Prompt Tokens'), default=0)
    completion_tokens = models.BigIntegerField(_('Completion Tokens'), default=0)

    def __str__(self):
        return str(self.id)


class UsageV2(UUIDMixin, TimeStampedModel, StatusMixin):
    type = models.CharField(_('Type'), choices=UsageType.choices, max_length=20, blank=True, null=True)
    interview = models.ForeignKey('interview.InterviewV2', on_delete=models.SET_NULL, blank=True, null=True)
    llm = models.ForeignKey('provider.LLM', on_delete=models.SET_NULL, blank=True, null=True)
    input = models.TextField(_('Input'), blank=True, null=True)
    output = models.TextField(_('Output'), blank=True, null=True)
    prompt_tokens = models.BigIntegerField(_('Prompt Tokens'), default=0)
    completion_tokens = models.BigIntegerField(_('Completion Tokens'), default=0)

    metadata = models.JSONField(_('Metadata'), blank=True, null=True)

    def __str__(self):
        return str(self.id)