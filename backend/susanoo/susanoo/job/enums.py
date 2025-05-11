from django.db import models
from django.utils.translation import gettext_lazy as _


class JobStatus(models.TextChoices):
    active = 'active', _('active')
    closed = 'closed', _('closed')