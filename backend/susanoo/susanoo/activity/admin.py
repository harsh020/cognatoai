from django.contrib import admin

from susanoo.activity.models import Activity


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    model = Activity
    list_display = ('interview', 'type', 'timestamp')
    list_filter = ('interview',)
    ordering = ('-created', '-modified')

    @admin.display(ordering='interview__id', description='Interview')
    def interview(self, obj):
        if not obj.interview:
            return None
        return obj.interview.id
