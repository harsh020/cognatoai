from django.urls import resolve
from rest_framework import status
from rest_framework.response import Response

from common.responses import error_response


class CheckEmailVerifiedMiddleware:
    EXCLUDED_URLS = [
        'login',
        'signup',
        'otp',
    ]

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Get the view name of the current request
        resolver_match = resolve(request.path)
        view_name = resolver_match.url_name

        # Check if the view is excluded
        if not (request.user.is_superuser or request.user.is_staff):
            if view_name not in self.EXCLUDED_URLS:
                # Check if the user is authenticated
                if request.user.is_authenticated:
                    # Check if the user's email is verified
                    if not request.user.is_email_verified:
                        return error_response(
                            errors={
                                'email': ['unverified']
                            },
                            message='Please verify email',
                            status=status.HTTP_401_UNAUTHORIZED
                        )
                else:
                    # If the user is not authenticated, let the request proceed
                    pass

        response = self.get_response(request)
        return response
