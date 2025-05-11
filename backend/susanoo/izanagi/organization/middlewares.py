from django.shortcuts import get_object_or_404
from rest_framework.authtoken.models import Token
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import AccessToken

from izanagi.organization.models import Organization, Member
from izanagi.user.models import User


class OrganizationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        org_id = request.headers.get('X-Organization')

        # TODO: Return forbidden error when not able to get org.

        # TODO: Find a better way to get user, if possible
        # auth middleware does not send user so fetch it manually
        request.organization = None
        token = request.META.get('HTTP_AUTHORIZATION', None)
        if not token:
            return self.get_response(request)
        token = token.replace('Bearer ', '')
        try:
            token = AccessToken(token=token)
            user = User.objects.get(id=token.get('user_id'))
        except TokenError:
            return self.get_response(request)
        if org_id:
            organization = get_object_or_404(Organization, id=org_id)
            if not user.is_superuser or not user.is_staff:
                membership = get_object_or_404(Member, organization=organization, user=user)
            request.organization = organization
        else:
            request.organization = None
        response = self.get_response(request)
        return response
