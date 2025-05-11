from django.db import models
from django.utils.translation import gettext_lazy as _


class LLM(models.TextChoices):
    OPEN_AI = 'OPEN_AI', _('OPEN_AI')
    GOOGLE_AI = 'GOOGLE_AI', _('GOOGLE_AI'),
    MISTRAL = 'MISTRAL', _('MISTRAL')
