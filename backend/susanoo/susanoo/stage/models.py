from django.db import models
from django.utils.translation import gettext_lazy as _
from model_utils.models import TimeStampedModel

from susanoo.core.behaviours import UUIDMixin, StatusMixin
from susanoo.stage.enums import StageType, Module


class Stage(UUIDMixin, TimeStampedModel, StatusMixin):
    stage_id = models.CharField(_('Stage Id'), max_length=20, blank=True, null=True)
    name = models.CharField(_('Name'), max_length=100, blank=True, null=True)
    description = models.TextField(_('Description'), blank=True, null=True)
    timeout = models.BigIntegerField(_('Timeout'), blank=True, null=True)
    purpose = models.TextField(_('Purpose'), blank=True, null=True)
    type = models.CharField(_('Type'), choices=StageType.choices, max_length=20, blank=True, null=True)

    class Meta:
        unique_together = (
            ('stage_id', 'type')
        )

    def __str__(self):
        return f'{self.type}-{self.stage_id}: {self.name}'


class StageV2(UUIDMixin, TimeStampedModel, StatusMixin):
    code = models.CharField(_('Code'), max_length=50, blank=True, null=True)
    stage_id = models.CharField(_('Stage Id'), max_length=20, blank=True, null=True)
    name = models.CharField(_('Name'), max_length=100, blank=True, null=True)
    description = models.TextField(_('Description'), blank=True, null=True)
    timeout = models.BigIntegerField(_('Timeout'), blank=True, null=True)
    purpose = models.TextField(_('Purpose'), blank=True, null=True)
    type = models.CharField(_('Type'), choices=StageType.choices, max_length=20, blank=True, null=True)
    module = models.CharField(_('Module'), choices=Module.choices, max_length=10, blank=True, null=True)
    submodule = models.CharField(_('Submodule'), choices=Module.choices, max_length=10, blank=True, null=True)
    required = models.BooleanField(_('Required'), default=False)
    supervised = models.BooleanField(_('Supervised'), default=True)

    metadata = models.JSONField(_('Metadata'), blank=True, null=True)

    class Meta:
        unique_together = (
            ('stage_id', 'type')
        )

    def __str__(self):
        return f'{self.module}:{self.type}:{self.stage_id}:{self.name}'
