import uuid
from datetime import timedelta

from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import UserManager, AbstractUser
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.core.mail import send_mail
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.db import models
from model_utils.models import TimeStampedModel

from phonenumber_field import modelfields

from susanoo.core.behaviours import UUIDMixin, StatusMixin


class User(UUIDMixin, AbstractUser):
    is_email_verified = models.BooleanField(_('Email Verified'), default=False)
    phone = modelfields.PhoneNumberField(_('Phone Number'), blank=True, null=True)

    class Meta:
        verbose_name = _("user")
        verbose_name_plural = _("users")
        swappable = 'AUTH_USER_MODEL'

    def __str__(self):
        return self.email


class OTP(UUIDMixin, StatusMixin, TimeStampedModel):
    otp = models.CharField(_('OTP'), max_length=6, blank=True, null=True)
    user = models.ForeignKey(User, blank=True, null=True, on_delete=models.SET_NULL)
    expiration = models.DateTimeField(_('Expiration'), blank=True, null=True)

    def __str__(self):
        return f'{str(self.id)} - {self.created} -> {self.expiration}'

    def save(self, *args, **kwargs):
        self.expiration = self.modified + timezone.timedelta(hours=24)
        super().save(*args, **kwargs)


class EmailVerification(UUIDMixin, StatusMixin, TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True)
    expiration = models.DateTimeField(_('Expiration'), blank=True, null=True)

    def save(self, *args, **kwargs):
        self.expiration = self.created + timezone.timedelta(minutes=20)
        super().save(*args, **kwargs)
