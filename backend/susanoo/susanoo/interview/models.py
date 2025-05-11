from django.db import models
from django.utils.translation import gettext_lazy as _
from model_utils.models import TimeStampedModel

from susanoo.core.behaviours import UUIDMixin, StatusMixin
from susanoo.interview.enums import InterviewStatus, InterviewType
from susanoo.entity.models import PathAndRename


class Interview(UUIDMixin, TimeStampedModel, StatusMixin):
    organization = models.ForeignKey('organization.Organization', on_delete=models.SET_NULL, blank=True, null=True,
                                     related_name='organization_interviews')
    created_by = models.ForeignKey('user.User', on_delete=models.SET_NULL, blank=True, null=True, related_name='user_interview')
    type = models.CharField('Type', blank=True, null=True, choices=InterviewType.choices, max_length=20, default=InterviewType.JOB)
    interviewer = models.ForeignKey('entity.Interviewer', blank=True, null=True, on_delete=models.SET_NULL, related_name='interviewer_interviews')
    candidate = models.ForeignKey('entity.Candidate', blank=True, null=True, on_delete=models.SET_NULL, related_name='candidate_interviews')
    start_datetime = models.DateTimeField(_('Start'), blank=True, null=True)
    end_datetime = models.DateTimeField(_('End'), blank=True, null=True)
    started_datetime = models.DateTimeField(_('Started'), blank=True, null=True)  # Time when candidate started giving interview
    ended_datetime = models.DateTimeField(_('Ended'), blank=True, null=True)  # Time when candidate ended the interview
    stage = models.ForeignKey('stage.Stage', blank=True, null=True, on_delete=models.SET_NULL, related_name='stage_interviewes')
    graph = models.ForeignKey('graph.Graph', blank=True, null=True, on_delete=models.SET_NULL, related_name='graph_interviews')
    node = models.ForeignKey('graph.Node', blank=True, null=True, on_delete=models.SET_NULL, related_name='node_interviews')
    status = models.CharField(_('Status'), choices=InterviewStatus.choices, max_length=20, blank=True, null=True)
    resume = models.FileField(_('Resume'), upload_to=PathAndRename('resumes/'), blank=True, null=True)

    metadata = models.JSONField(_('Metadata'), blank=True, null=True)

    def __str__(self):
        if self.interviewer is None or self.candidate is None:
            return str(self.id)
        return f'{self.id} - {self.type} - {self.interviewer.get_full_name()} - {self.candidate.get_full_name()} - {self.start_datetime}'


class InterviewV2(UUIDMixin, TimeStampedModel, StatusMixin):
    organization = models.ForeignKey('organization.Organization', on_delete=models.SET_NULL, blank=True, null=True,
                                     related_name='organization_interviews_v2')
    created_by = models.ForeignKey('user.User', on_delete=models.SET_NULL, blank=True, null=True, related_name='user_interview_v2')
    type = models.CharField('Type', blank=True, null=True, choices=InterviewType.choices, max_length=20, default=InterviewType.JOB)
    interviewer = models.ForeignKey('entity.Interviewer', blank=True, null=True, on_delete=models.SET_NULL, related_name='interviewer_interviews_v2')
    candidate = models.ForeignKey('entity.Candidate', blank=True, null=True, on_delete=models.SET_NULL, related_name='candidate_interviews_v2')
    start_datetime = models.DateTimeField(_('Start'), blank=True, null=True)
    end_datetime = models.DateTimeField(_('End'), blank=True, null=True)
    started_datetime = models.DateTimeField(_('Started'), blank=True, null=True)
    ended_datetime = models.DateTimeField(_('Ended'), blank=True, null=True)
    stages = models.ManyToManyField('stage.StageV2', blank=True, null=True, related_name='stage_interviews_v2')
    job = models.ForeignKey('job.Job', blank=True, null=True, on_delete=models.SET_NULL, related_name='job_interviews_v2')
    resume = models.FileField(_('Resume'), upload_to=PathAndRename('resumes/'), blank=True, null=True)

    # State tracking
    stage = models.ForeignKey('stage.StageV2', blank=True, null=True, on_delete=models.SET_NULL, related_name='stage_interviewes_v2')
    node = models.ForeignKey('graph.NodeV2', blank=True, null=True, on_delete=models.SET_NULL, related_name='node_interviews_v2')
    status = models.CharField(_('Status'), choices=InterviewStatus.choices, max_length=20, blank=True, null=True)
    graph = models.ForeignKey('graph.GraphV2', blank=True, null=True, on_delete=models.SET_NULL, related_name='graph_interviews_v2')

    config = models.JSONField(_('Config'), blank=True, null=True)
    metadata = models.JSONField(_('Metadata'), blank=True, null=True)

    def __str__(self):
        if self.interviewer is None or self.candidate is None:
            return str(self.id)
        return f'{self.id}:{self.type}:{self.interviewer.get_full_name()}:{self.candidate.get_full_name()}:{self.start_datetime}'
