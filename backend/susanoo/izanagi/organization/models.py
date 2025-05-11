from django.contrib import auth
from django.db import models
from django.utils.itercompat import is_iterable
from django.utils.translation import gettext_lazy as _
from model_utils.models import TimeStampedModel
from rest_framework.exceptions import PermissionDenied

from susanoo.core.behaviours import UUIDMixin, StatusMixin
from izanagi.organization.enums import MemberRole


def _role_has_perm(role, perm, obj):
    """
    A backend can raise `PermissionDenied` to short-circuit permission checking.
    """
    for backend in auth.get_backends():
        if not hasattr(backend, "has_perm"):
            continue
        try:
            if backend.has_perm(role, perm, obj):
                return True
        except PermissionDenied:
            return False
    return False


class Organization(UUIDMixin, TimeStampedModel, StatusMixin):
    name = models.CharField(_('Organization Name'), max_length=200, blank=True, null=True)
    credits = models.DecimalField(_('Credits'), max_digits=10, decimal_places=4, default=0)
    discount = models.DecimalField(_('Discount (%)'), max_digits=6, decimal_places=4, default=0)
    description = models.TextField(_('Description'), blank=True, null=True)
    personal = models.BooleanField(_('Personal'),
                                   default=True)  ## TODO: add signal to set this to true when an organization adds more than one user

    def __str__(self):
        return f'{self.id} - {self.name}'


class Role(UUIDMixin, TimeStampedModel, StatusMixin):
    name = models.CharField(_('Name'), max_length=50, choices=MemberRole.choices, unique=True)
    permissions = models.ManyToManyField('auth.Permission', blank=True, null=True)
    description = models.TextField(_('Description'), blank=True, null=True)

    def __str__(self):
        return self.name

    def has_perm(self, perm, obj=None):
        """
        Return True if the user has the specified permission. Query all
        available auth backends, but return immediately if any backend returns
        True. Thus, a user who has permission from a single auth backend is
        assumed to have permission in general. If an object is provided, check
        permissions for that object.
        """
        return _role_has_perm(self, perm, obj)

    def has_perms(self, perm_list, obj=None):
        """
        Return True if the user has each of the specified permissions. If
        object is passed, check if the user has all required perms for it.
        """
        if not is_iterable(perm_list) or isinstance(perm_list, str):
            raise ValueError("perm_list must be an iterable of permissions.")
        return all(self.has_perm(perm, obj) for perm in perm_list)


class Member(UUIDMixin, TimeStampedModel, StatusMixin):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey('user.User', on_delete=models.CASCADE, related_name='memberships')
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True)
    date_joined = models.DateTimeField(_('Date Joined'), auto_now_add=True)
    is_default = models.BooleanField(_('Is Default'), default=False)

    class Meta:
        unique_together = ('organization', 'user')

    def __str__(self):
        return f'{self.user} in {self.organization}'
