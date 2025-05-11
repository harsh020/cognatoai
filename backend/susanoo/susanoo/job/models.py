from django.db import models
from django.utils.translation import gettext_lazy as _
from model_utils.models import TimeStampedModel

from susanoo.core.behaviours import UUIDMixin, StatusMixin
from susanoo.job.enums import JobStatus


class Job(UUIDMixin, TimeStampedModel, StatusMixin):
    organization = models.ForeignKey('organization.Organization', on_delete=models.SET_NULL, blank=True, null=True,
                                     related_name='organization_jobs')
    job_id = models.CharField(_('Job Id'), max_length=50, null=True, blank=True, unique=True)
    title = models.CharField(_('Title'), max_length=50, null=True, blank=True)
    role = models.CharField(_('Role'), max_length=100, null=True, blank=True)
    description = models.TextField(_('Description'), null=True, blank=True)
    status = models.CharField(_('Status'), max_length=15, choices=JobStatus.choices, null=True, blank=True)
    graph = models.ForeignKey('graph.GraphV2', blank=True, null=True, on_delete=models.SET_NULL, related_name='graph_jobs')
    stages = models.ManyToManyField('stage.StageV2', blank=True, null=True, related_name='stage_jobs')
    # company = models.ForeignKey('company.Company', blank=True, null=True, on_delete=models.SET_NULL, related_name='jobs')

    def __str__(self):
        return f'{self.job_id}'

    class Meta:
        unique_together = (
            ('job_id', 'graph')
        )