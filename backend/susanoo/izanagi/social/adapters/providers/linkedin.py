from django.conf import settings

from izanagi.social.adapters.providers.base import OIDCProviderAdapter
from izanagi.social.schemas import UserProfile


class LinkedInAdapter(OIDCProviderAdapter):
    provider_name = 'linkedin'
    auth_url = settings.SOCIAL_AUTH_PROVIDERS['linkedin'].get('AUTH_URL', 'https://www.linkedin.com/oauth/v2/authorization')
    token_url = settings.SOCIAL_AUTH_PROVIDERS['linkedin'].get('TOKEN_URL', 'https://www.linkedin.com/oauth/v2/accessToken')
    userinfo_url = settings.SOCIAL_AUTH_PROVIDERS['linkedin'].get('USERINFO_URL', 'https://api.linkedin.com/v2/userinfo')
    scopes = settings.SOCIAL_AUTH_PROVIDERS['linkedin'].get('SCOPES', ['openid', 'profile', 'email', 'w_member_social'])

    def fetch_userinfo(self, tokens) -> UserProfile:
        return super().fetch_userinfo(tokens['access_token'])