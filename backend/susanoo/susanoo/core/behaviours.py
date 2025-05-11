import uuid

from django.db import models
from django.utils.translation import gettext_lazy as _


class UUIDMixin(models.Model):
    id = models.UUIDField(_('Id'), primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class StatusMixin(models.Model):
    is_active = models.BooleanField(_('is_active'), blank=True, null='True', default=True)
    is_deleted = models.BooleanField(_('is_deleted'), blank=True, null='True', default=False)

    class Meta:
        abstract = True


class PhoneMixin(models.Model):
    country_code = models.CharField(_('Country Code'), max_length=3, blank=True, null=True)

    # TODO: Add validator
    mobile = models.CharField(_('Mobile No'), max_length=10, blank=True, null=True)

    class Meta:
        abstract = True


class ProfileMixin(models.Model):
    alternate_mobile = models.CharField(_('Mobile No'), max_length=10, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)

    GENDER_CHOICES = (('M', 'Male'), ('F', 'Female'))
    gender = models.CharField(choices=GENDER_CHOICES, max_length=1, blank=True, null=True)

    class Meta:
        abstract = True
