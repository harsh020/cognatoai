from django.db.models import TextChoices
from django.utils.translation import gettext_lazy as _


class ReviewStatus(TextChoices):
    PENDING = 'pending', _('Pending')
    IN_REVIEW = 'in_review', _('In Review')
    SUCCESSFUL = 'successful', _('Successful')
    FAILED = 'failed', _('Failed')