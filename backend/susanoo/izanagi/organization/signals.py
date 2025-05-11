from django.db.models.signals import post_save
from django.dispatch import receiver

from izanagi.user.models import User
from izanagi.organization.models import Organization, Member, Role
from izanagi.organization.enums import MemberRole


@receiver(post_save, sender=User)
def create_default_organization(sender, instance, created, **kwargs):
    if created:
        organization = Organization.objects.create(
            name='Personal',
            description=f"{instance.email}'s Organization",
        )

        ## TODO: Create default owner role from admin panel
        try:
            role = Role.objects.get(name=MemberRole.OWNER)
        except Role.DoesNotExist:
            role = None
        Member.objects.create(user=instance, organization=organization, role=role, is_default=True)
