from django.db import models
from django.utils.translation import gettext_lazy as _


class Type(models.TextChoices):
    TAB_SWITCH = 'tab_switch', _('Tab Switch')
    TAB_INACTIVE = 'tab_inactive', _('Tab Inactive')