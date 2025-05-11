import threading
import random

from django.core.mail import EmailMessage
from django.core.mail import send_mail
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings

from izanagi.user.models import User, OTP
from common.templates import email_otp

def _create_otp_html_message(name, otp):
    return email_otp.format(user=name, otp=otp)


def _send_otp_email(instance):
    send_mail(
        auth_user=settings.EMAIL_HOST_USER,
        auth_password=settings.EMAIL_HOST_PASSWORD,
        subject='Your code for verification',
        message=f'Your OTP code is {instance.otp}',
        from_email='no-reply@cognatoai.com',
        recipient_list=[instance.user.email],
        fail_silently=False,
        html_message=_create_otp_html_message(instance.user.first_name if instance.user.first_name else 'User',
                                              instance.otp)
    )

@receiver(post_save, sender=User)
def send_otp(sender, instance, created, **kwargs):
    if created:
        otp = str(random.randint(100000, 999999))
        # otp = OTP.objects.create(otp=otp, user=instance)
        otp_instance = OTP.objects.filter(user=instance).first()
        if otp_instance:
            otp_instance.otp = otp
            otp_instance.save()
        else:
            OTP.objects.create(otp=otp, user=instance)

        # print('Sending email...')
        # res = send_mail(
        #     auth_user=settings.EMAIL_HOST_USER,
        #     auth_password=settings.EMAIL_HOST_PASSWORD,
        #     subject='Your code for verification',
        #     message=f'Your OTP code is {otp.otp}',
        #     from_email='no-reply@cognatoai.com',
        #     recipient_list=[instance.email],
        #     fail_silently=False,
        #     html_message=_create_otp_html_message(instance.first_name if instance.first_name else 'User', otp.otp)
        # )
        # print('Email sent')
        # print(res)


@receiver(post_save, sender=OTP)
def send_otp_on_create(sender, instance, created, **kwargs):
    # if created:
    thread = threading.Thread(target=_send_otp_email, args=(instance,), daemon=True)
    thread.start()

