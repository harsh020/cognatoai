from django.db import models
from django.utils.translation import gettext_lazy as _


class RecordingStatus(models.TextChoices):
    PENDING = 'pending', _('Pending')
    PROCESSING = 'processing', _('Processing')
    PROCESSED = 'processed', _('Processed')
    FAILED = 'failed', _('Failed')