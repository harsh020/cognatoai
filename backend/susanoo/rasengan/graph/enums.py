from django.db import models
from django.utils.translation import gettext_lazy as _


class NodeType(models.TextChoices):
    IO = 'io', _('IO')
    WORKER = 'worker', _('Worker')
    SUPERVISOR = 'supervisor', _('Supervisor')
    AUTONOMOUS = 'autonomous', _('Autonomous')
    TERMINAL = 'terminal', _('Terminal')
    SENTINEL = 'sentinel', _('Sentinel')


class GraphType(models.TextChoices):
    DSA = 'dsa', _('DSA')
    SWE = 'swe', _('SWE')
    JOB = 'job', _('Job')
    PITCH = 'pitch', _('Pitch')


class MemoryLevel(models.TextChoices):
    ALL = 'all', _('All')
    STAGE = 'stage', _('Stage')
    ISOLATED = 'isolated', _('Isolated')
    NONE = 'None', _('None')
