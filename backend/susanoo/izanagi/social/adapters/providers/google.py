from django.conf import settings

from izanagi.social.adapters.providers.base import OIDCProviderAdapter
from izanagi.social.schemas import UserProfile


class GoogleAdapter(OIDCProviderAdapter):
    provider_name = 'google'
    auth_url = settings.SOCIAL_AUTH_PROVIDERS['google'].get('AUTH_URL', 'https://accounts.google.com/o/oauth2/v2/auth')
    token_url = settings.SOCIAL_AUTH_PROVIDERS['google'].get('TOKEN_URL', 'https://oauth2.googleapis.com/token')
    userinfo_url = settings.SOCIAL_AUTH_PROVIDERS['google'].get('USERINFO_URL', 'https://openidconnect.googleapis.com/v1/userinfo')
    scopes = settings.SOCIAL_AUTH_PROVIDERS['google'].get('SCOPES', ['openid', 'email', 'profile'])

    def fetch_userinfo(self, tokens) -> UserProfile:
        return super().fetch_userinfo(tokens['access_token'])