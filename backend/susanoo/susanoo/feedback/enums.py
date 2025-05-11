from django.db import models
from django.utils.translation import gettext_lazy as _


class InterviewFeedbackCategory(models.TextChoices):
    KNOWLEDGE = 'knowledge', _('Knowledge')
    PROBLEM_SOLVING = 'problem_solving', _('Problem Solving')
    ALIGNMENT_WITH_JOB = 'alignment_with_job', _('Alignment with Job')
    COMMUNICATION_SKILLS = 'communication_skills', _('Communication Skills')
    OVERALL = 'overall', _('Overall')


class FeedbackStatus(models.TextChoices):
    PENDING = 'pending', _('Pending'),
    COMPLETED = 'completed', _('Completed')