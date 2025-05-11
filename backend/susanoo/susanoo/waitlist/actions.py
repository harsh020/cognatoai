import concurrent.futures

from django.utils import timezone
from django.contrib import admin
from django.conf import settings
from django.core.mail import send_mail

from common.templates import platform_invite


def _send_email_invite(user):
    html_message = platform_invite.format(
        user=user.name if user.name else 'there',
    )

    send_mail(
        auth_user=settings.EMAIL_HOST_USER,
        auth_password=settings.EMAIL_HOST_PASSWORD,
        subject='Cognato AI - Try Our Beta: Your Wait is Over!',
        message='',
        from_email='team@cognatoai.com',
        recipient_list=[user.email],
        fail_silently=False,
        html_message=html_message
    )


@admin.action(description="Send beta invite")
def send_beta_invite(modeladmin, request, queryset):
    with concurrent.futures.ThreadPoolExecutor() as executor:
        for obj in queryset:
            if obj.email is not None:
                obj.invited = timezone.now()
                obj.save()

                executor.submit(_send_email_invite, obj)

    modeladmin.message_user(request, "Beta invite sent successfully.")