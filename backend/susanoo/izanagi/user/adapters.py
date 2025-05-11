from typing import Optional

# from allauth.account.adapter import DefaultAccountAdapter
# from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
# from allauth.headless.tokens.base import AbstractTokenStrategy
# from django.contrib.sessions.backends.base import SessionBase
# from django.http import HttpRequest
from rest_framework_simplejwt.tokens import RefreshToken

from izanagi.social.adapters.account import DefaultSocialAccountAdapter
from izanagi.social.schemas import UserProfile
from izanagi.user.models import User


class JWTTokenStrategy():
    def create_access_token(self, request):
        # Called after successful login/signup
        user = request.user
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh) if user.is_email_verified else None,
            'access':  str(refresh.access_token) if user.is_email_verified else None,
        }

    def create_access_token_payload(self, request):
        # Final payload returned
        user = request.user
        tokens = self.create_access_token(request)
        return {
            'id': user.id,
            'email': user.email,
            'is_email_verified': user.is_email_verified,
            'access_token':  tokens['access'],
            'refresh_token': tokens['refresh'],
        }

    def generate(self, request):
        return self.create_access_token_payload(request)

#
# class AccountAdapter(DefaultAccountAdapter):
#     def save_user(self, request, user, form, commit=True):
#         # Populate first_name, last_name, email, password…
#         user = super().save_user(request, user, form, commit=False)
#         # Enforce username == email
#         user.username = user.email
#         if commit:
#             user.save()
#         return user
#
#
# class SocialAccountAdapter(DefaultSocialAccountAdapter):
#     def save_user(self, request, sociallogin, form=None):
#         user = super().save_user(request, sociallogin, form)
#         # Enforce username == email
#         user.username = user.email
#         user.save(update_fields=['username'])
#         return user
#
#     def is_open_for_signup(self, request, socialaccount):
#         # Example: restrict signups to certain email domains
#         # email = socialaccount.user.email
#         # return email.endswith('@example.com')
#         return super().is_open_for_signup(request, socialaccount)
#


class SocialAccountAdapter(DefaultSocialAccountAdapter):
    def save_user(self, profile: UserProfile, commit=True) -> User:
        user = super().save_user(profile, commit=False)
        user.is_email_verified = True
        user.save()
        return user