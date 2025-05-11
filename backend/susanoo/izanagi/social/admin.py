from django.contrib import admin

from izanagi.social.models import SocialAccount, OAuthState


@admin.register(SocialAccount)
class SocialAccountAdmin(admin.ModelAdmin):
    model = SocialAccount
    list_display = ('email', 'provider')
    list_filter = ('provider',)
    sortable_by = '-created'

    def email(self, obj):
        return obj.user.email


@admin.register(OAuthState)
class OAuthStateAdmin(admin.ModelAdmin):
    model = OAuthState
    list_display = ('id', 'state')
    sortable_by = '-created'
