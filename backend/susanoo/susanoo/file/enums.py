from django.db.models import TextChoices
from django.utils.translation import gettext_lazy as _


class FileType(TextChoices):
    RESUME = 'resume', _('Resume')
    STARTUP_SUMMARY = 'startup_summary', _('Startup Summary')