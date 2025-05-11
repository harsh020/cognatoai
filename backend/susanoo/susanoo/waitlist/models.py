from django.db import models
from django.utils.translation import gettext_lazy as _
from model_utils.models import TimeStampedModel

from susanoo.core.behaviours import UUIDMixin, StatusMixin


class Waitlist(UUIDMixin, TimeStampedModel, StatusMixin):
    name = models.CharField(_('Name'), max_length=100, blank=True, null=True)
    email = models.EmailField(_('Email'), max_length=100, unique=True, blank=True, null=True)
    invited = models.DateTimeField(_('Invited at'), blank=True, null=True)  # Indicates date user is invited to use the product.
    acknowledged = models.DateTimeField(_('Acknowledged at'), blank=True, null=True)  # Indicates date user has responded.

    def __str__(self):
        return str(self.id)
