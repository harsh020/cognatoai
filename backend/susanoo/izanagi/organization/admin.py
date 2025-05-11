from django.contrib import admin

from izanagi.organization.models import Organization, Role, Member


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    model = Organization
    list_display = ('id', 'name')
    list_filter = ('id', 'name')
    ordering = ('-created',)


@admin.register(Role)
class OrganizationAdmin(admin.ModelAdmin):
    model = Role
    list_display = ('id', 'name')
    list_filter = ('id', 'name')
    ordering = ('-created',)


@admin.register(Member)
class OrganizationAdmin(admin.ModelAdmin):
    model = Member
    list_display = ('organization', 'user', 'date_joined')
    list_filter = ('organization', 'user', 'date_joined')
    ordering = ('-created',)