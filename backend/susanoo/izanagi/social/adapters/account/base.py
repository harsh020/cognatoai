# social_auth/adapters.py
import logging
from typing import TYPE_CHECKING, Optional, Tuple

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import transaction
from django.http import HttpRequest
from django.utils import timezone
from datetime import timedelta

# Avoid circular imports if models are in the same app
# if TYPE_CHECKING:
from izanagi.social.models import SocialAccount, OAuthState
from izanagi.social.schemas import UserProfile

logger = logging.getLogger(__name__)
User = get_user_model()


class BaseSocialAccountAdapter:
    """
    Abstract adapter class for handling social account connections and user creation.
    Subclass this to customize behavior for specific projects or providers.
    """

    def __init__(self, request: Optional[HttpRequest] = None):
        self.request = request

    def get_social_account_model(self):
        """Hook for accessing the SocialAccount model."""
        # Import locally to avoid potential app loading issues
        from izanagi.social.models import SocialAccount
        return SocialAccount

    def get_social_token_model(self):
        """Hook for accessing the SocialToken model (if used separately)."""
        # If you store tokens separately, define this.
        # from .models import SocialToken
        # return SocialToken
        # For this example, tokens are on SocialAccount
        return None

    def get_user_model(self):
        """Hook for accessing the User model."""
        return User

    def is_auto_signup_allowed(self, provider: str, profile: UserProfile) -> bool:
        """
        Check if automatic signup is allowed for this provider/profile.
        Defaults to True. Override for custom logic (e.g., invite-only).
        """
        return True

    def validate_signup(self, provider: str, profile: UserProfile) -> None:
        """
        Perform validation before creating a new user.
        Raises ValidationError if signup should be prevented (e.g., email exists).
        """
        UserModel = self.get_user_model()
        if UserModel.objects.filter(email__iexact=profile.email).exists():
            # Consider if you want to link accounts automatically here or raise error
            logger.warning(f"Signup attempt failed: Email '{profile.email}' already exists.")
            raise ValidationError("An account already exists with this email address. Please log in.")
        # Add other validation rules here if needed

    def populate_user(self, user: User, profile: UserProfile) -> User:
        """
        Populate the User model instance with data from the UserProfile.
        This is called *before* the user is saved for the first time (during signup).
        """
        user.email = profile.email
        user.first_name = profile.first_name or ''
        user.last_name = profile.last_name or ''
        # Set username - ensure it's unique. Using email is common.
        if not user.username:
            user.username = profile.email # Or generate a unique username

        # Ensure username uniqueness if using something other than email
        # Implement username generation/checking logic if needed

        return user

    def save_user(self, profile: UserProfile, commit=True) -> User:
        """
        Creates and saves a new User instance based on the profile data.
        Handles the transaction.
        """
        UserModel = self.get_user_model()
        user = UserModel()
        user = self.populate_user(user, profile)
        # User needs a password, set an unusable one for social-only accounts
        user.set_unusable_password()

        if commit:
            # Save the user
            user.save()
        logger.info(f"Created new user: {user.email} via social signup.")
        return user

    def save_social_account(self, user: User, provider: str, profile: UserProfile, tokens: dict) -> SocialAccount:
        """
        Creates and saves a new SocialAccount instance linking the user and provider.
        """
        SocialAccountModel = self.get_social_account_model()

        expires_in = tokens.get('expires_in')
        expires_at = timezone.now() + timedelta(seconds=expires_in) if isinstance(expires_in, (int, float)) else None

        social_account = SocialAccountModel.objects.create(
            user=user,
            provider=provider,
            uid=profile.uid,
            extra_data=profile.raw or {}, # Store the raw profile data
            access_token=tokens.get('access_token'),
            refresh_token=tokens.get('refresh_token'),
            expires_at=expires_at,
        )
        logger.info(f"Created new social account for user {user.email}, provider {provider}, uid {profile.uid}")
        return social_account

    def update_social_account(self, social_account: SocialAccount, profile: UserProfile, tokens: dict) -> SocialAccount:
        """
        Updates an existing SocialAccount instance with fresh tokens and profile data.
        """
        expires_in = tokens.get('expires_in')
        social_account.access_token = tokens.get('access_token')
        social_account.refresh_token = tokens.get('refresh_token') # Update if provided
        social_account.expires_at = timezone.now() + timedelta(seconds=expires_in) if isinstance(expires_in, (int, float)) else None
        social_account.extra_data = profile.raw or {} # Update raw profile data
        social_account.save()
        logger.info(f"Updated social account for user {social_account.user.email}, provider {social_account.provider}")

        # Optionally: Update user details (name, picture) on login if they changed
        user = social_account.user
        updated = False
        if profile.first_name and user.first_name != profile.first_name:
            user.first_name = profile.first_name
            updated = True
        # ... check other fields ...
        if updated:
            user.save()

        return social_account

    def pre_social_login(self, provider: str, profile: UserProfile, social_account: Optional[SocialAccount] = None):
        """
        Hook called before finalizing login/signup.
        Can be used for custom checks or data manipulation.
        `social_account` is None during signup, and the existing account during login.
        """
        pass

    def connect(self, user: User, provider: str, profile: UserProfile, tokens: dict) -> SocialAccount:
        """
        Connects an existing user to a new social account.
        Handles potential conflicts (e.g., social account already linked to another user).
        """
        SocialAccountModel = self.get_social_account_model()
        try:
            # Check if this specific social account (provider + uid) already exists
            existing_account = SocialAccountModel.objects.select_related('user').get(
                provider=provider, uid=profile.uid
            )
            # If it exists and belongs to the *current* user, just update it
            if existing_account.user == user:
                logger.info(f"Social account ({provider}, {profile.uid}) already linked to user {user.email}. Updating tokens.")
                return self.update_social_account(existing_account, profile, tokens)
            else:
                # Belongs to a different user - this is usually an error scenario
                logger.error(f"Social account ({provider}, {profile.uid}) is already linked to a different user ({existing_account.user.email}). Cannot connect to {user.email}.")
                raise ValidationError(f"This {provider} account is already linked to another user.")
        except SocialAccountModel.DoesNotExist:
            # Doesn't exist, safe to create a new connection
            logger.info(f"Connecting new social account ({provider}, {profile.uid}) to existing user {user.email}.")
            return self.save_social_account(user, provider, profile, tokens)

    @transaction.atomic
    def perform_login_signup(self, provider: str, profile: UserProfile, tokens: dict, *args, **kwargs) -> Tuple[User, bool]:
        """
        Handles the core logic: find existing account/user or create new ones.
        Returns a tuple of (user, created), where 'created' is True if a new User was created.
        """
        SocialAccountModel = self.get_social_account_model()
        created_user = False
        user = None

        is_connect_allowed = kwargs.get('connect', False)

        try:
            # 1. Check if the SocialAccount already exists
            social_account = SocialAccountModel.objects.select_related('user').get(
                provider=provider, uid=profile.uid
            )
            user = social_account.user
            logger.info(f"Social login: Found existing SocialAccount for user {user.email}, provider {provider}.")
            self.pre_social_login(provider, profile, social_account)
            self.update_social_account(social_account, profile, tokens)

        except SocialAccountModel.DoesNotExist:
            logger.info(f"Social login/signup: No existing SocialAccount for provider {provider}, uid {profile.uid}. Checking for user by email.")
            # 2. No SocialAccount, check if a User with this email exists
            UserModel = self.get_user_model()
            try:
                user = UserModel.objects.get(email__iexact=profile.email)
                # User exists, but no social account for this provider. Connect it.
                logger.info(f"Found existing user by email: {user.email}. Connecting social account.")
                # Optional: Check if connection should be allowed based on settings/policy
                if not is_connect_allowed:
                   raise ValidationError("Connecting this social account is not allowed.")
                self.pre_social_login(provider, profile, None) # Pass None for social_account during connect/signup
                self.connect(user, provider, profile, tokens)

            except UserModel.DoesNotExist:
                logger.info(f"No user found with email {profile.email}. Proceeding with auto-signup.")
                # 3. No User exists, proceed with signup if allowed
                if not self.is_auto_signup_allowed(provider, profile):
                    logger.warning(f"Auto-signup denied for provider {provider}, email {profile.email}.")
                    raise ValidationError("Automatic signup is not allowed.") # Or redirect, etc.

                # Validate before creating (e.g., checks if email format is valid, etc.)
                # Note: The default validate_signup checks for existing email again,
                # which is slightly redundant here but safe.
                self.validate_signup(provider, profile)

                self.pre_social_login(provider, profile, None)
                user = self.save_user(profile)
                self.save_social_account(user, provider, profile, tokens)
                created_user = True

        return user, created_user


class DefaultSocialAccountAdapter(BaseSocialAccountAdapter):
    """
    Default implementation using the base logic.
    You can inherit from this and override specific methods if needed,
    or inherit directly from BaseSocialAccountAdapter for full control.
    """
    pass


class UserAwareSocialAccountAdapter(BaseSocialAccountAdapter):
    """
    User aware social account adapter logic.
    If the user exists and the social account does not exists then it will throw error.
    Else it will work like normal account adapter
    """
    @transaction.atomic
    def perform_login_signup(self, provider: str, profile: UserProfile, tokens: dict) -> Tuple[User, bool]:
        SocialAccountModel = self.get_social_account_model()
        created_user = False
        user = None

        try:
            # 1. Check if the SocialAccount already exists
            social_account = SocialAccountModel.objects.select_related('user').get(
                provider=provider, uid=profile.uid
            )
            user = social_account.user
            logger.info(f"Social login: Found existing SocialAccount for user {user.email}, provider {provider}.")
            self.pre_social_login(provider, profile, social_account)
            self.update_social_account(social_account, profile, tokens)

        except SocialAccountModel.DoesNotExist:
            logger.info(f"Social login/signup: No existing SocialAccount for provider {provider}, uid {profile.uid}. Checking for user by email.")
            # 2. No SocialAccount, check if a User with this email exists
            self.validate_signup(provider, profile)
            # User does not exists, Create user and account both.
            created_user = True
            logger.info(f"User by email: {user.email}. Does not exist. Creating user.")
            self.pre_social_login(provider, profile, None)
            user = self.save_user(profile)
            self.connect(user, provider, profile, tokens)

        return user, created_user



# Helper function to get the configured adapter
def get_account_adapter(request: Optional[HttpRequest] = None) -> BaseSocialAccountAdapter:
    """
    Retrieves the social account adapter instance.
    Loads the adapter class specified in settings, defaulting to DefaultSocialAccountAdapter.
    """
    from django.conf import settings
    from django.utils.module_loading import import_string

    adapter_path = getattr(settings, 'SOCIAL_ACCOUNT_ADAPTER', 'izanagi.social.adapters.account.DefaultSocialAccountAdapter')
    try:
        AdapterClass = import_string(adapter_path)
        return AdapterClass(request)
    except ImportError:
        logger.error(f"Could not import SOCIAL_AUTH_ADAPTER: {adapter_path}. Falling back to default.")
        # Fallback gracefully
        from izanagi.social.adapters.account import DefaultSocialAccountAdapter
        return DefaultSocialAccountAdapter(request)

