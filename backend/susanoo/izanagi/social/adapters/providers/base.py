from typing import List

import requests
from urllib.parse import urlencode
from django.conf import settings

from izanagi.social.schemas import UserProfile


class BaseProviderAdapter:
    """
    Generic OAuth2/OIDC flow. Override endpoints & userinfo in subclasses.
    """
    provider_name: str
    auth_url: str
    token_url: str
    userinfo_url: str
    scopes: List

    def __init__(self):
        cfg = settings.SOCIAL_AUTH_PROVIDERS[self.provider_name]
        self.client_id = cfg['CLIENT_ID']
        self.client_secret = cfg['CLIENT_SECRET']

    def build_authorize_url(self, redirect_uri, state, code_challenge=None):
        params = {
            'response_type': 'code',
            'client_id':     self.client_id,
            'redirect_uri':  redirect_uri,
            'scope':         ' '.join(self.scopes),
            'state':         state,
        }
        if code_challenge:
            params.update({'code_challenge': code_challenge, 'code_challenge_method': 'S256'})
        return f"{self.auth_url}?{urlencode(params)}"

    def exchange_code(self, code, redirect_uri, code_verifier=None):
        data = {'grant_type': 'authorization_code', 'code': code,
                'redirect_uri': redirect_uri, 'client_id': self.client_id,
                'client_secret': self.client_secret}
        if code_verifier:
            data['code_verifier'] = code_verifier
        resp = requests.post(self.token_url, data=data)
        resp.raise_for_status()
        return resp.json()

    def retrieve_userinfo(self, token):
        response = requests.get(
            self.userinfo_url,
            headers={'Authorization': f"Bearer {token}"}
        )
        response.raise_for_status()
        return response.json()

    def fetch_userinfo(self, tokens):
        """Return raw profile JSON"""
        raise NotImplementedError


class OIDCProviderAdapter(BaseProviderAdapter):

    def fetch_userinfo(self, access_token) -> UserProfile:
        data = self.retrieve_userinfo(access_token)
        return UserProfile(
            uid=data['sub'],
            email=data['email'],
            first_name=data.get('given_name'),
            last_name=data.get('family_name'),
            full_name=data.get('name'),
            picture=data.get('picture'),
            raw=data
        )