import os

from django.db import models
from django.utils import timezone
from django.utils.deconstruct import deconstructible
from model_utils.models import TimeStampedModel
from django.utils.translation import gettext_lazy as _

from susanoo.core.behaviours import StatusMixin, UUIDMixin
from susanoo.review.enums import ReviewStatus


@deconstructible
class PathAndRename(object):

    def __init__(self, path_prefix=None):
        self.path = path_prefix

    def __call__(self, instance, filename):
        ext = filename.split('.')[-1]
        filename = f'{instance.id}-{timezone.now()}.{ext}'
        return os.path.join(self.path, filename)


class Review(TimeStampedModel, StatusMixin, UUIDMixin):
    organization = models.ForeignKey('organization.Organization', on_delete=models.SET_NULL, blank=True, null=True,
                                     related_name='organization_reviews')
    created_by = models.ForeignKey('user.User', on_delete=models.SET_NULL, blank=True, null=True,
                                   related_name='user_reviews')
    status = models.CharField(_('Status'), choices=ReviewStatus.choices, default=ReviewStatus.PENDING, max_length=12, blank=True, null=True)
    role = models.CharField(_('Role'), max_length=50, blank=True, null=True)
    resume = models.FileField(_('Resume'), upload_to=PathAndRename("resume/review/"), blank=True, null=True)
    review = models.JSONField(_('Review'), blank=True, null=True)

    def __str__(self):
        return f'{self.created_by.email}:{self.id}'
