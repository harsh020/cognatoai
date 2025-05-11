from django.contrib import admin

from susanoo.interview.actions import send_interview_link, generate_feedback, process_recording
from susanoo.interview.models import Interview, InterviewV2



@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    model = Interview
    list_display = ('id', 'interviewer', 'candidate', 'start_datetime', 'status')
    list_filter = ('interviewer', 'candidate')
    ordering = ('-created', '-modified')
    actions = [send_interview_link]

    @admin.display(ordering='interviewer__first_name', description='Interviewer Name')
    def interviewer(self, obj):
        if not obj.interviewer:
            return None
        return obj.interviewer.get_full_name()

    @admin.display(ordering='candidate__first_name', description='Candidate Name')
    def candidate(self, obj):
        if not self.candidate:
            return None
        return obj.candidate.get_full_name()


@admin.register(InterviewV2)
class InterviewV2Admin(admin.ModelAdmin):
    model = InterviewV2
    list_display = ('id', 'interviewer', 'candidate', 'start_datetime', 'status')
    list_filter = ('interviewer', 'candidate')
    ordering = ('-created', '-modified')
    actions = [send_interview_link, generate_feedback, process_recording]

    @admin.display(ordering='interviewer__first_name', description='Interviewer Name')
    def interviewer(self, obj):
        if not obj.interviewer:
            return None
        return obj.interviewer.get_full_name()

    @admin.display(ordering='candidate__first_name', description='Candidate Name')
    def candidate(self, obj):
        if not self.candidate:
            return None
        return obj.candidate.get_full_name()
