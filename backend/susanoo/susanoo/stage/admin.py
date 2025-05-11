from django.contrib import admin

from susanoo.stage.models import Stage, StageV2


@admin.register(Stage)
class StageAdmin(admin.ModelAdmin):
    model = Stage
    list_display = ('id', 'stage_id', 'type', 'name')
    list_filter = ('type',)
    ordering = ('-created', '-modified')


@admin.register(StageV2)
class StageV2Admin(admin.ModelAdmin):
    model = StageV2
    list_display = ('id', 'stage_id', 'type', 'code', 'name')
    list_filter = ('type',)
    ordering = ('-created', '-modified')