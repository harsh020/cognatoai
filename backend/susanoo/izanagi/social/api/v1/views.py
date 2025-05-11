import logging


from django.core.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from django.conf import settings

from common.responses import error_response
from izanagi.social.adapters.account.base import get_account_adapter
from izanagi.social.api.v1.serializers import SocialAuthRedirectSerializer, SocialAuthCallbackSerializer
from izanagi.social.schemas import UserProfile
from izanagi.social.utils import (
    generate_pkce_pair_and_state, validate_pkce_and_state, jwt_for_user, validate_state_and_get_verifier
)
from izanagi.social.adapters.providers import GoogleAdapter, LinkedInAdapter
from izanagi.user.models import User

ADAPTER_REGISTRY = {
    'google': GoogleAdapter,
    'linkedin': LinkedInAdapter
}

logger = logging.getLogger(__name__)


class SocialAuthRedirectView(generics.GenericAPIView):
    serializer_class = SocialAuthRedirectSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print(serializer.errors)
            return error_response(
                errors={
                    key: [error.code for error in errors]
                    for key, errors in serializer.errors.items()
                },
                message='Invalid data',
                status=status.HTTP_400_BAD_REQUEST
            )

        validated_data = serializer.validated_data
        redirect_uri = validated_data.get('redirect_uri')
        provider = validated_data.get('provider')

        adapter = ADAPTER_REGISTRY[provider]()
        state, challenge, _ = generate_pkce_pair_and_state()
        url = adapter.build_authorize_url(redirect_uri, state, challenge)
        return Response({'url': url}, status=status.HTTP_200_OK)


class SocialAuthCallbackView(generics.GenericAPIView):
    """
    Handles the callback from social providers after user authentication.
    Exchanges the code for tokens, fetches user profile, and performs login or signup.
    Uses a SocialAccountAdapter for user/account management logic.
    """
    serializer_class = SocialAuthCallbackSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        """
        Handles the POST request containing code, state, etc. from the frontend.
        """
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                errors={
                    key: [error.code for error in errors]
                    for key, errors in serializer.errors.items()
                },
                message='Invalid data',
                status=status.HTTP_400_BAD_REQUEST
            )

        validated_data = serializer.validated_data
        redirect_uri = validated_data.get('redirect_uri')
        code = validated_data.get('code')
        state = validated_data.get('state')
        provider = validated_data.get('provider')

        # PKCE support
        # verifier = data.get('code_verifier') # Optional, depends on provider flow

        valid, verifier = validate_state_and_get_verifier(state)

        # --- 1. Basic Validation ---
        if not code or not state or not redirect_uri:
            logger.warning("Callback missing required parameters (code, state, redirect_uri).")

            return error_response(
                errors={
                    'missing_parameter': ['missing_parameter']
                },
                message='Something went wrong. Please contact the admin.',
                status=status.HTTP_400_BAD_REQUEST
            )

        # --- 2. State and PKCE Validation ---
        # Pass verifier=None if not using PKCE for this provider/flow
        if not valid:
            logger.warning("Invalid state or PKCE verifier.")
            return error_response(
                errors={
                    'invalid_state': ['invalid_state']
                },
                message='Something went wrong. The server detected a malicious activity.',
                status=status.HTTP_400_BAD_REQUEST
            )

        # --- 3. Get Provider Adapter ---
        try:
            # Get the specific adapter for the OAuth provider (e.g., Google, LinkedIn)
            # This adapter handles the OAuth protocol details (exchange code, fetch userinfo)
            provider_adapter = ADAPTER_REGISTRY[provider]() # Assumes registry holds instances or classes
        except KeyError:
            logger.error(f"Invalid provider specified: {provider}")
            return error_response(
                errors={
                    'invalid_provider': ['invalid_provider']
                },
                message=f'Invalid provider: {provider}',
                status=status.HTTP_400_BAD_REQUEST
            )

        # --- 4. Exchange Code for Tokens ---
        try:
            tokens = provider_adapter.exchange_code(code, redirect_uri, verifier)
            # Basic check if token exchange was successful
            if not tokens or 'access_token' not in tokens:
                return error_response(
                    errors={
                        'failed': ['token_request_failed']
                    },
                    message=f'Something went wrong with the {provider}. Unable to authenticate.',
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        except Exception as e:
            # Catch specific exceptions from your provider adapter if possible
            logger.exception(f"Error exchanging code for provider {provider}: {e}")
            return error_response(
                errors={
                    'network_error': ['network_error']
                },
                message=f'Something went wrong with the {provider}. Unable to authenticate.',
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # --- 5. Fetch User Profile ---
        try:
            # Fetch user info using the obtained tokens
            # This method should return the UserProfile dataclass instance
            profile: UserProfile = provider_adapter.fetch_userinfo(tokens)
            print(profile)
            if not profile or not profile.uid or not profile.email:
                logger.error(f"Failed to fetch valid user profile from provider {provider}. Profile data: {profile}")
                return error_response(
                    errors={
                        'internal_server': ['internal_server']
                    },
                    message=f'Something went wrong with the {provider}. Unable to authenticate.',
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        except Exception as e:
            logger.exception(f"Error fetching user info for provider {provider}: {e}")
            return error_response(
                errors={
                    'network_error': ['network_error']
                },
                message=f'Something went wrong with the {provider}. Unable to authenticate.',
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # --- 6. Perform Login or Signup via Social Account Adapter ---
        # Get the adapter responsible for Django User/SocialAccount interaction
        account_adapter = get_account_adapter(request)
        try:
            # Delegate the core logic to the adapter
            # This handles finding/creating User and SocialAccount, linking, etc.
            connect = getattr(settings, 'SOCIAL_AUTH_CONNECT', True)
            user, created = account_adapter.perform_login_signup(provider, profile, tokens, connect=connect)

            # Log success
            action = "signed up" if created else "logged in"
            logger.info(f"User {user.email} successfully {action} via {provider}.")

            # --- 7. Generate JWT and Return Response ---
            request.user = user
            jwt_token_data = jwt_for_user(request) # Your function to generate JWT payload
            return Response(jwt_token_data, status=status.HTTP_200_OK)

        except ValidationError as e:
            # Handle validation errors raised by the adapter (e.g., email exists, signup disabled)
            logger.warning(f"Social login/signup validation failed for {profile.email} via {provider}: {e.message}")
            # Return specific error messages from the ValidationError if available
            return error_response(
                errors={
                    'login_failed': ['login_failed']
                },
                message=getattr(e, 'message', 'Login/Signup failed.'),
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            # Catch unexpected errors during the adapter's operations
            logger.exception(f"Unexpected error during social login/signup for {profile.email} via {provider}: {e}")
            return error_response(
                errors={
                    'internal_server_error': ['internal_server_error']
                },
                message='An unexpected error occurred during login/signup.',
                status=status.HTTP_400_BAD_REQUEST
            )

