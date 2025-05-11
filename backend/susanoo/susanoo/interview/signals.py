import threading
import os
import subprocess
import tempfile
from concurrent import futures

from django.conf import settings
from django.core.mail import send_mail
from django.db.models.signals import post_save
from django.dispatch import receiver, Signal
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage

from common import utils
from izanagi.billing.enums import OrderType, TransactionType
from izanagi.billing.models import Order
from rasengan.feedback.engine import FeedbackEngine
from susanoo.feedback.models import InterviewFeedbackV2, InterviewFeedbackV3
from susanoo.interview.enums import InterviewStatus
from susanoo.interview.models import Interview, InterviewV2
from susanoo.recording.models import VideoRecording
from susanoo.recording.enums import RecordingStatus

interview_completed = Signal()
feedback_engine = FeedbackEngine()


def _send_notification(interview):
    message = f'Interview - {str(interview.id)} requested by {interview.created_by.email}'
    if interview.status == InterviewStatus.ERROR:
        message = f'Somthing went wrong with interview {interview.id}. Please check ASAP.'
    send_mail(
        auth_user=settings.EMAIL_HOST_USER,
        auth_password=settings.EMAIL_HOST_PASSWORD,
        subject='Interview request',
        message=message,
        from_email='no-reply@cognatoai.com',
        recipient_list=["admin@cognatoai.com"],
        fail_silently=False,
    )


def _send_user_notification(interview):
    subject = "Your Interview Schedule Request is Under Review!"
    message = f"""Hi there,
    
Thank you for scheduling your interview with Cognato AI! We're excited to help you prepare.

Please note that the interview approval process is manual and may take a little time, ranging from a few minutes to a couple of hours. \
Depending on time zones (or if We're catching some sleep!), there could be a slight delay.

Rest assured, we'll get back to you as soon as possible. You'll receive an invitation email once everything is ready to go!

Thanks for your patience, and good luck with your practice!

Best regards,
Cognato AI Team
    """
    send_mail(
        auth_user=settings.EMAIL_HOST_USER,
        auth_password=settings.EMAIL_HOST_PASSWORD,
        subject=subject,
        message=message,
        from_email='no-reply@cognatoai.com',
        recipient_list=[interview.candidate.email],
        fail_silently=False,
    )


@receiver(post_save, sender=Interview)
def notify_admin(sender, instance, created, **kwargs):
    if created and settings.SETTINGS_MODULE.find('local') == -1:
        thread = threading.Thread(target=_send_notification, args=(instance,), daemon=True)
        thread.start()


@receiver(post_save, sender=Interview)
def notify_user(sender, instance, created, **kwargs):
    if created:
        thread = threading.Thread(target=_send_user_notification, args=(instance,), daemon=True)
        thread.start()


@receiver(post_save, sender=Interview)
def create_order(sender, instance, created, **kwargs):
    if created:
        Order.objects.create(
            type=OrderType.CREDIT,
            transaction_type=TransactionType.DEBIT,
            created_by=instance.created_by,
            organization=instance.organization,
            amount=8,
            metadata={
                'type': 'interview',
                'interview': str(instance.id),
            }
        )
    else:
        if instance.status == InterviewStatus.CANCELLED:
            Order.objects.create(
                type=OrderType.CREDIT,
                transaction_type=TransactionType.CREDIT,
                created_by=instance.created_by,
                organization=instance.organization,
                amount=8,
                metadata={
                    'type': 'interview',
                    'interview': str(instance.id),
                }
            )
            instance.organization.credits += 8
            instance.organization.save()


@receiver(post_save, sender=InterviewV2)
def notify_admin_v2(sender, instance, created, **kwargs):
    if created and settings.SETTINGS_MODULE.find('local') == -1:
        thread = threading.Thread(target=_send_notification, args=(instance,), daemon=True)
        thread.start()


@receiver(post_save, sender=InterviewV2)
def create_order_v2(sender, instance, created, **kwargs):
    if created:
        Order.objects.create(
            type=OrderType.CREDIT,
            transaction_type=TransactionType.DEBIT,
            created_by=instance.created_by,
            organization=instance.organization,
            amount=8,
            metadata={
                'type': 'interview',
                'interview': str(instance.id),
            }
        )
    else:
        if instance.status == InterviewStatus.CANCELLED:
            Order.objects.create(
                type=OrderType.CREDIT,
                transaction_type=TransactionType.CREDIT,
                created_by=instance.created_by,
                organization=instance.organization,
                amount=8,
                metadata={
                    'type': 'interview',
                    'interview': str(instance.id),
                }
            )
            instance.organization.credits += 8
            instance.organization.save()


def _generate_feedback(interview):
    response = feedback_engine.generate(provider='cerebras', model='llama-3.3-70b', interview=interview)
    for key, feedback in response.items():
        InterviewFeedbackV3.objects.create(
            interview=interview,
            stage=interview.job.stages.filter(code=key).first(),
            **feedback.output
        )
    # for key, value in response.output.items():
    #     category = InterviewFeedbackCategory._value2member_map_.get(key)
    #     if category:
    #         InterviewFeedbackV2.objects.create(
    #             category=category,
    #             interview=interview,
    #             **value
    #         )


@receiver(interview_completed, sender=InterviewV2)
def feedback_generation(sender, instance, created, **kwargs):
    thread = threading.Thread(target=_generate_feedback, args=(instance,), daemon=True)
    thread.start()


def process_recording_for_hls(interview, recording):
    input_path = settings.INTERVIEW_RECORDING.get('SCREEN', {}).get('CHUNK_PATH')
    if not input_path:
        input_path = f'interviews/{interview.id}/screens/chunks/'
    else:
        input_path = input_path.format(interview=str(interview.id))
    output_path = settings.INTERVIEW_RECORDING.get('SCREEN', {}).get('HLS_PATH')
    if not output_path:
        output_path = f'interviews/{interview.id}/screens/hls/'
    else:
        output_path = output_path.format(interview=str(interview.id))

    recording.status = RecordingStatus.PROCESSING
    recording.save()

    try:
        playlist_url = utils.process_recording_for_hls(
            input_path=input_path,
            output_path=output_path
        )

        if not playlist_url:
            # There was no video
            VideoRecording.objects.delete(recording)
        else:
            recording.status = RecordingStatus.PROCESSED
            recording.url = playlist_url
            recording.save()
    except Exception as e:
        recording.status = RecordingStatus.FAILED
        recording.reason = str(e)
        recording.save()


# @receiver(interview_completed, sender=InterviewV2)
# def process_recording(sender, instance, created, **kwargs):
#     recording = VideoRecording.objects.create(interview=instance)
#     thread = threading.Thread(target=process_recording_for_hls, args=(instance, recording), daemon=True)
#     thread.start()
