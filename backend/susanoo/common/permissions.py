from rest_framework import permissions

from izanagi.organization.enums import MemberRole
from izanagi.organization.models import Member


class IsMember(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool((
                request.user.is_superuser or
                request.user.is_staff
            ) or (
                request.user and
                request.user.is_authenticated and
                request.organization
            )
        )


class IsOwner(IsMember):
    def has_permission(self, request, view):
        super().has_permission(request, view)
        membership = Member.objects.get(organization=request.organization, user=request.user)
        return bool(membership.role and membership.role.name == MemberRole.OWNER)


class IsReader(IsMember):
    def has_permission(self, request, view):
        super().has_permission(request, view)
        membership = Member.objects.get(organization=request.organization, user=request.user)
        return bool(membership.role and (
                membership.role.name == MemberRole.OWNER or
                membership.role.name == MemberRole.READER
        ))


class HasRolePermissions(permissions.DjangoModelPermissions):
    def has_permission(self, request, view):
        if getattr(view, '_ignore_model_permissions', False):
            return True

        if not request.user or (
                not request.user.is_authenticated and self.authenticated_users_only) or (
                not request.organization):
            return False

        if request.user.is_superuser or request.user.is_staff:
            return True

        queryset = self._queryset(view)
        perms = self.get_required_permissions(request.method, queryset.model)

        membership = Member.objects.get(organization=request.organization, user=request.user)

        return membership.role.has_perms(perms)
