from django.contrib import admin
from django.utils.translation import gettext_lazy as _

from izanagi.user.models import User, OTP


@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ('id', 'email', 'expiration')
    list_filter = ('user__email', 'expiration')
    sortable_by = '-created'

    @admin.display(ordering='user__email', description='User Email')
    def email(self, obj):
        if obj.user:
            return obj.user.email
        return None

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {"fields": ("email", "username", "password")}),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    # "is_verified",
                    "is_email_verified",
                    # "role",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )
    list_display = ["email", "is_superuser"]
    search_fields = ["email"]
    ordering = ["id"]
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "password1", "password2"),
            },
        ),
    )
