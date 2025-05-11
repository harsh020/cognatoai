from datetime import timedelta

from django.db import models
from django.utils import timezone
from model_utils.models import TimeStampedModel
from django.conf import settings

from susanoo.core.behaviours import UUIDMixin, StatusMixin


class SocialAccount(UUIDMixin, StatusMixin, TimeStampedModel):
    """
    Stores each user's social account and tokens.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='social_accounts'
    )
    provider = models.CharField(max_length=50)
    uid = models.CharField(max_length=255)
    access_token = models.TextField()
    refresh_token = models.TextField(blank=True, null=True)
    expires_at = models.DateTimeField(blank=True, null=True)
    extra_data = models.JSONField(blank=True, null=True)
    last_login = models.DateTimeField(auto_now=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = (('provider', 'uid'),)

    def __str__(self):
        return f"{self.provider}:{self.uid}"


class OAuthState(UUIDMixin, StatusMixin, TimeStampedModel):
    """
    Persists PKCE code_challenge and state across distributed services.
    """
    state = models.CharField(max_length=255, unique=True)
    verifier = models.CharField(max_length=255)

    def is_expired(self):
        return (self.created + timedelta(minutes=10)) < timezone.now()
