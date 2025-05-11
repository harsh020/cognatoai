from django.db import models
from django.utils.translation import gettext_lazy as _


class UsageType(models.TextChoices):
    INTERVIEW = 'interview', _('Interview')
    FEEDBACK = 'feedback', _('Feedback')
    REVIEW = 'review', _('Review')