import os
from datetime import timezone

from django.db import models
from django.utils.deconstruct import deconstructible
from model_utils.models import TimeStampedModel
from django.utils.translation import gettext_lazy as _

from susanoo.core.behaviours import StatusMixin, UUIDMixin


@deconstructible
class PathAndRename(object):

    def __init__(self, path_prefix=None):
        self.path = path_prefix

    def __call__(self, instance, filename):
        ext = filename.split('.')[-1]
        filename = f'{instance.type}/{instance.id}-{timezone.now()}.{ext}'
        if self.path:
            return os.path.join(self.path, filename)
        return filename


class File(TimeStampedModel, StatusMixin, UUIDMixin):
    type = models.CharField(_('Type'), max_length=20, blank=True, null=True)
    file = models.FileField(_('File'), upload_to=PathAndRename(), blank=True, null=True)
    checksum = models.CharField(_('Checksum'), max_length=82, blank=True, null=True)

    def __str__(self):
        return f'{self.type}:{self.checksum}'
