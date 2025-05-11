from django.db import models
from django.utils.translation import gettext_lazy as _


class MemberRole(models.TextChoices):
    READER = 'reader', _('Reader')
    OWNER = 'owner', _('Owner')