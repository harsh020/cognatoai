from django.db import models
from django.utils.translation import gettext_lazy as _


class PlanType(models.TextChoices):
    FREE = 'free', _('Free')
    PAID = 'paid', _('Paid')

class SubscriptionStatus(models.TextChoices):
    PENDING = 'pending', _('Pending')
    CREATED = 'created', _('Created')
    ACTIVE = 'active', _('Active')
    EXPIRED = 'expired', _('Expired')
    CANCELLED = 'cancelled', _('Cancelled')

class Period(models.TextChoices):
    DAILY = 'daily', _('Daily')
    WEEKLY = 'weekly', _('Weekly')
    MONTHLY = 'monthly', _('Monthly')
    YEARLY = 'yearly', _('Yearly')


class OrderType(models.TextChoices):
    SUBSCRIPTION = 'subscription', _('Subscription')
    CREDIT = 'credit', _('Credit')

class TransactionType(models.TextChoices):
    CREDIT = 'credit', _('Credit')
    DEBIT = 'debit', _('Debit')