import os

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.utils.deconstruct import deconstructible
from django.utils.translation import gettext_lazy as _
from model_utils.models import TimeStampedModel

from phonenumber_field import modelfields

from susanoo.core.behaviours import UUIDMixin, StatusMixin
from susanoo.entity.enums import LLM


@deconstructible
class PathAndRename(object):

    def __init__(self, sub_path):
        self.path = sub_path

    def __call__(self, instance, filename):
        ext = filename.split('.')[-1]
        filename = f'{instance.id} {timezone.now()}.{ext}'
        return os.path.join(self.path, filename)


class BaseProfile(UUIDMixin, TimeStampedModel, StatusMixin):
    first_name = models.CharField(_('First Name'), max_length=100, blank=True, null=True)
    last_name = models.CharField(_('Last Name'), max_length=100, blank=True, null=True)
    profile_picture = models.ImageField(_('Profile Picture'), upload_to=PathAndRename('interviewers/profiles/'), blank=True, null=True)
    email = models.EmailField(_('Email'), blank=True, null=True, unique=True)

    def get_full_name(self):
        return f'{self.first_name} {self.last_name}'

    class Meta:
        abstract = True


class Interviewer(BaseProfile):
    # company = models.ForeignKey('company.Company', blank=True, null=True, on_delete=models.SET_NULL,
    #                                  related_name='interviewers')
    role = models.CharField(_('Role'), max_length=100, blank=True, null=True)
    # llm = models.CharField(_('LLM'), max_length=50, choices=LLM.choices, blank=True, null=True)

    def __str__(self):
        return f'{self.get_full_name()}'


class Candidate(BaseProfile):
    added_by = models.ForeignKey('organization.Organization', on_delete=models.SET_NULL, blank=True, null=True)  # To check the account whose candidate profile it is (in case of user) and to check which account added this candidate profile (in case of org)
    phone = modelfields.PhoneNumberField(_('Phone'), blank=True, null=True)
    resume = models.FileField(_('Resume'), upload_to=PathAndRename('resumes/'), blank=True, null=True)

    metadata = models.JSONField(_('Metadata'), blank=True, null=True)

    def __str__(self):
        return f'{self.get_full_name()}'

    class Meta:
        unique_together = (
            ('added_by', 'email')
        )