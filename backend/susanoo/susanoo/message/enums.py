from django.db import models
from django.utils.translation import gettext_lazy as _


class MessageType(models.TextChoices):
    AI = 'ai', _('AI')
    USER = 'user', _('User')


class SentinelType(models.TextChoices):
    START = 'start', _('Start')
    END = 'end', _('End')