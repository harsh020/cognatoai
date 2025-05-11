from django.contrib import admin

from susanoo.question.models import Question


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    model = Question
    list_display = ('id', 'interview', 'stage')
    list_filter = ('interview', 'stage')
    ordering = ('-created', '-modified')