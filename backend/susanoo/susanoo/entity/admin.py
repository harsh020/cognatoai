from django.contrib import admin

from susanoo.entity.models import Interviewer, Candidate


@admin.register(Interviewer)
class InterviewerAdmin(admin.ModelAdmin):
    model = Interviewer
    list_display = ('id', 'name')
    # list_filter = ('llm',)
    ordering = ('-created', '-modified')

    @admin.display(ordering='first_name', description='Interviewer Name')
    def name(self, obj):
        return obj.get_full_name()

    # @admin.display(ordering='company__name', description='Company Name')
    # def company(self, obj):
    #     return obj.company.name


@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    model = Candidate
    list_display = ('id', 'name', 'email')
    ordering = ('-created', '-modified')

    @admin.display(ordering='first_name', description='Candidate Name')
    def name(self, obj):
        return obj.get_full_name()
