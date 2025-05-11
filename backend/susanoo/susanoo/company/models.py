from django.db import models
from django.utils.translation import gettext_lazy as _
from model_utils.models import TimeStampedModel

from susanoo.core.behaviours import UUIDMixin, StatusMixin


class Company(UUIDMixin, TimeStampedModel, StatusMixin):
    name = models.CharField(_('Name'), max_length=100, null=True, blank=True)
    email = models.EmailField(_('Email'), blank=True, null=True)
    business = models.TextField(_('Business'), blank=True, null=True)
    value = models.TextField(_('Values'), blank=True, null=True)

    def __str__(self):
        return self.name