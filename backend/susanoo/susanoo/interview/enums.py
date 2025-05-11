from django.db import models
from django.utils.translation import gettext_lazy as _


class InterviewType(models.TextChoices):
    DSA = 'dsa', _('DSA')
    JOB = 'job', _('Job')
    PITCH = 'pitch', _('Pitch')


class InterviewStatus(models.TextChoices):
    PENDING = 'pending', _('Pending')
    SCHEDULED = 'scheduled', _('Scheduled')
    IN_PROGRESS = 'in_progress', _('In Progress')
    COMPLETED = 'completed', _('Completed')
    INCOMPLETE = 'incomplete', _('Incomplete')
    CANCELLED = 'cancelled', _('Cancelled')
    ERROR = 'error', _('Error')
    EXPIRED = 'expired', _('Expired')
