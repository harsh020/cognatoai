import base64
import hashlib
import os
from datetime import timedelta
from importlib import import_module

from django.utils import timezone
from django.conf import settings
from django.utils.module_loading import import_string
from rest_framework_simplejwt.tokens import RefreshToken

from izanagi.social.models import OAuthState


def generate_pkce_pair_and_state():
    """
    Create PKCE pair and persist code_challenge with state.
    """
    verifier = base64.urlsafe_b64encode(os.urandom(32)).rstrip(b'=').decode()
    digest = hashlib.sha256(verifier.encode()).digest()
    challenge = base64.urlsafe_b64encode(digest).rstrip(b'=').decode()
    state = base64.urlsafe_b64encode(os.urandom(16)).rstrip(b'=').decode()
    OAuthState.objects.create(state=state, verifier=verifier)
    return state, challenge, verifier


def validate_pkce_and_state(state, verifier):
    """
    Validate that state exists, not expired, and challenge matches.
    """
    try:
        record = OAuthState.objects.get(state=state)
    except OAuthState.DoesNotExist:
        return False
    if record.is_expired():
        record.delete()
        return False
    digest = hashlib.sha256(verifier.encode()).digest()
    expected = base64.urlsafe_b64encode(digest).rstrip(b'=').decode()
    record.delete()
    return expected == record.code_challenge

def validate_state_and_get_verifier(state):
    """
    Validate that state exists, not expired, and retrieves the corresponding verifier.
    """
    try:
        record = OAuthState.objects.get(state=state)
    except OAuthState.DoesNotExist:
        return False, None
    if record.is_expired():
        record.delete()
        return False, None
    verifier = record.verifier
    record.delete()
    return True, verifier


def jwt_for_user(request):
    user = request.user
    strategy_path = getattr(settings, 'JWT_STRATEGY', None)
    if strategy_path:
        try:
            strategy_class = import_string(strategy_path)
            return strategy_class().generate(request)
        except (ImportError, AttributeError) as e:
            # Log the error if necessary
            pass  # Proceed to fallback
    # Fallback to default implementation
    refresh = RefreshToken.for_user(user)
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }