import os

from django.db import models
from django.utils import timezone
from django.utils.deconstruct import deconstructible
from django.utils.translation import gettext_lazy as _


from model_utils.models import TimeStampedModel

from susanoo.core.behaviours import StatusMixin, UUIDMixin


@deconstructible
class PathAndRename(object):

    def __init__(self, sub_path=''):
        self.path = sub_path

    def __call__(self, instance, filename, *args, **kwargs):
        ext = filename.split('.')[-1]
        filename = f'{instance.id}-{timezone.now().timestamp()}.{ext}'
        return os.path.join(self.path, instance.type, filename)


class Country(TimeStampedModel, StatusMixin, UUIDMixin):
    name = models.CharField(_('Country'), max_length=100, blank=True, null=True)
    code = models.CharField(_('Code'), max_length=2, unique=True, blank=True, null=True)
    phone_code = models.CharField(_('Phone Code'), max_length=15, blank=True, null=True)
    currency = models.CharField(_('Currency'), max_length=3, blank=True, null=True)

    def __str__(self):
        return self.name


class State(TimeStampedModel, StatusMixin, UUIDMixin):
    name = models.CharField(_('State'), max_length=100, blank=True, null=True)
    code = models.CharField(_('Code'), max_length=5, blank=True, null=True)
    country = models.ForeignKey(Country, on_delete=models.SET_NULL, blank=True, null=True, related_name='states')

    def __str__(self):
        return self.name

    class Meta:
        unique_together = (
            ('code', 'country')
        )


class City(TimeStampedModel, StatusMixin, UUIDMixin):
    name = models.CharField(_('State'), max_length=100, blank=True, null=True)
    state = models.ForeignKey(State, on_delete=models.SET_NULL, blank=True, null=True, related_name='cities')

    def __str__(self):
        return self.name

    # class Meta:
    #     unique_together = (
    #         ('name', 'state')
    #     )


class Address(TimeStampedModel, StatusMixin, UUIDMixin):
    address_line_1 = models.CharField(_("Address Line 1"), max_length=100, blank=True, null=True)
    address_line_2 = models.CharField(_("Address Line 2"), max_length=100, blank=True, null=True)
    country = models.ForeignKey("core.Country", on_delete=models.SET_NULL, blank=True, null=True)
    state = models.ForeignKey("core.State", on_delete=models.SET_NULL, blank=True, null=True)
    city = models.ForeignKey("core.City", on_delete=models.SET_NULL, blank=True, null=True)
    pincode = models.CharField(_('Pincode'), max_length=10, blank=True, null=True)

    def __str__(self):
        return str(self.id)


class ContactUs(TimeStampedModel, StatusMixin, UUIDMixin):
    name = models.CharField(_('Name'), max_length=100, blank=True, null=True)
    email = models.EmailField(_('Email'), blank=True, null=True)
    is_user = models.BooleanField(_('Is User'), default=False)
    is_brand = models.BooleanField(_('Is Brand'), default=False)
    message = models.TextField(_('Message'), blank=True, null=True)

    def __str__(self):
        return str(self.id)


class File(TimeStampedModel, StatusMixin, UUIDMixin):
    file = models.FileField(_('File'), upload_to=PathAndRename())
    type = models.CharField(_('Type'), max_length=100, blank=True, null=True)
    mime_type = models.CharField(_('Mime Type'), max_length=50, blank=True, null=True)

    def __str__(self):
        return str(self.id)