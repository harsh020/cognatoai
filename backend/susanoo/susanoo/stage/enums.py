from django.db import models
from django.utils.translation import gettext_lazy as _


class StageType(models.TextChoices):
    BASE = 'base', _('Base')
    SWE = 'swe', _('SWE')
    DSA = 'dsa', _('DSA')
    TECHNICAL = 'technical', _('Technical')
    BEHAVIORAL = 'behavioral', _('Behavioral')
    CODING = 'coding', _('Coding')
    PITCH = 'pitch', _('Pitch')


class Module(models.TextChoices):
    BASE = 'base', _('Base')
    DSA = 'dsa', 'DSA'
