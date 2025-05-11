from django.contrib import admin

from susanoo.feedback.models import PlatformFeedback, InterviewFeedback, InterviewFeedbackV2, InterviewFeedbackV3


@admin.register(PlatformFeedback)
class PlatformFeedbackAdmin(admin.ModelAdmin):
    model = PlatformFeedback
    list_display = ('interview', 'email')
    list_filter = ('interview', 'email')


@admin.register(InterviewFeedback)
class InterviewFeedbackAdmin(admin.ModelAdmin):
    model = InterviewFeedback
    list_display = ('interview', 'category')
    list_filter = ('interview', 'category')


@admin.register(InterviewFeedbackV2)
class InterviewFeedbackV2Admin(admin.ModelAdmin):
    model = InterviewFeedbackV2
    list_display = ('interview', 'category')
    list_filter = ('interview', 'category')

@admin.register(InterviewFeedbackV3)
class InterviewFeedbackV3Admin(admin.ModelAdmin):
    model = InterviewFeedbackV3
    list_display = ('interview', 'stage')
    list_filter = ('interview', 'stage')



