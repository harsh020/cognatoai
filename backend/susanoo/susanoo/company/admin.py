from django.contrib import admin

from susanoo.company.models import Company


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    model = Company
    list_display = ('id', 'name')
    ordering = ('-created', '-modified')
