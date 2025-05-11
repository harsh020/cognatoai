import datetime

from django.db import models
from django.utils.translation import gettext_lazy as _
from model_utils.models import TimeStampedModel

from izanagi.billing.enums import TransactionType, SubscriptionStatus, OrderType, PlanType
from susanoo.core.behaviours import UUIDMixin, StatusMixin


class Plan(UUIDMixin, TimeStampedModel, StatusMixin):
    name = models.CharField(_('Name'), max_length=100, blank=True, null=True, unique=True)
    price = models.DecimalField(_('Price'), max_digits=10, decimal_places=4, default=0)
    type = models.CharField(_('Type'), choices=PlanType.choices, max_length=5, blank=True, null=True)
    credits = models.DecimalField(_('Credits'), max_digits=10, decimal_places=4)
    duration = models.IntegerField(_('Duration'), blank=True, null=True)
    permissions = models.ManyToManyField('auth.Permission', blank=True, null=True)
    features = models.JSONField(_('Features'), blank=True, null=True)

    metadata = models.JSONField(_('Metadata'), blank=True, null=True)  # Store -> per_interview_price, additional_interview_price, payment_provider_plan_id

    def __str__(self):
        return self.name


class Subscription(UUIDMixin, TimeStampedModel, StatusMixin):
    organization = models.ForeignKey('organization.Organization', on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.ForeignKey(Plan, on_delete=models.CASCADE, related_name='subscriptions', blank=True, null=True)
    start = models.DateTimeField(_('Start'), auto_now_add=True)
    end = models.DateTimeField(_('End'), blank=True, null=True)
    status = models.CharField(_('Status'), choices=SubscriptionStatus.choices, blank=True, null=True, max_length=50)

    def __str__(self):
        return f'{self.organization} - {self.plan}'

    def save(self, *args, **kwargs):
        if self.start and self.plan and self.plan.duration:
            self.end = self.start + datetime.timedelta(days=self.plan.duration)
        super().save(*args, **kwargs)


class Order(UUIDMixin, TimeStampedModel, StatusMixin):
    type = models.CharField(_('Type'), max_length=15, choices=OrderType.choices)
    transaction_type = models.CharField(_('Type'), max_length=10, choices=TransactionType.choices)
    organization = models.ForeignKey('organization.Organization', on_delete=models.SET_NULL, blank=True, null=True, related_name='organization_orders')
    created_by = models.ForeignKey('user.User', on_delete=models.SET_NULL, blank=True, null=True, related_name='user_orders')
    amount = models.DecimalField(_('Amount'), max_digits=10, decimal_places=4)

    metadata = models.JSONField(_('Metadata'))  # Store -> subscription_id, interview_id, description

    def __str__(self):
        return f'{self.type} - {self.amount} - {self.organization}'

