from django.contrib import admin

from susanoo.recording.models import VideoRecording


@admin.register(VideoRecording)
class VideoRecordingAdmin(admin.ModelAdmin):
    model = VideoRecording
    list_display = ('interview', 'status')
    list_filter = ('interview', 'status')
    ordering = ('-created', '-modified')