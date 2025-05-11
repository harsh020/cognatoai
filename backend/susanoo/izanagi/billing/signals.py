from django.db.models.signals import post_save
from django.dispatch import receiver

from izanagi.billing.enums import PlanType, SubscriptionStatus
from izanagi.billing.models import Subscription, Plan
from izanagi.user.models import User
from izanagi.organization.models import Organization, Member, Role
from izanagi.organization.enums import MemberRole


@receiver(post_save, sender=Organization)
def create_default_subscription(sender, instance, created, **kwargs):
    if created:
        try:
            trial = Plan.objects.get(name='Trial', type=PlanType.FREE)
        except Plan.DoesNotExist:
            trial = None

        subscription = Subscription.objects.create(
            plan=trial,
            organization=instance,
            status=SubscriptionStatus.ACTIVE
        )


@receiver(post_save, sender=Subscription)
def update_organization_credits(sender, instance, created, **kwargs):
    if created and instance.organization and instance.plan:
        instance.organization.credits = instance.plan.credits
        instance.organization.save()
