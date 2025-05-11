from django.contrib import admin

from susanoo.job.models import Job


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    model = Job
    list_display = ('id', 'job_id', 'role')
    list_filter = ('role',)
    ordering = ('-created', '-modified')

    @admin.display(ordering='company__name', description='Company Name')
    def company(self, obj):
        return obj.job_id
