import concurrent.futures
import threading
from datetime import timedelta

from django.contrib import admin
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from django.template.loader import render_to_string

from common import utils
from rasengan.feedback.engine import FeedbackEngine
from susanoo.feedback.models import InterviewFeedbackV2, InterviewFeedbackV3
from susanoo.interview.enums import InterviewStatus
from susanoo.recording.enums import RecordingStatus
from susanoo.recording.models import VideoRecording


def _send_email_invite(interview, url):
    html_message = render_to_string('interview/interview-invite.html', {
        'candidate': interview.candidate.first_name,
        'role': interview.metadata.get('job').get('role') if interview.metadata.get('job') else 'Software Engineer',
        'interviewer': interview.interviewer.get_full_name(),
        'start': interview.start_datetime.strftime("%d-%m-%Y %H:%M:%S") + " UTC" if interview.start_datetime else None,
        'end': interview.end_datetime.strftime("%d-%m-%Y %H:%M:%S") + " UTC" if interview.end_datetime else None,
        'link': url,
    })

    # html_message = interview_invite.format(
    #     candidate=interview.candidate.first_name,
    #     role=interview.metadata.get('job').get('role') if interview.metadata.get('job') else 'Software Engineer',
    #     interviewer=interview.interviewer.get_full_name(),
    #     link=url,
    # )

    send_mail(
        auth_user=settings.EMAIL_HOST_USER,
        auth_password=settings.EMAIL_HOST_PASSWORD,
        subject='Interview Invitation via Cognato AI',
        message='',
        from_email='team@cognatoai.com',
        recipient_list=[interview.candidate.email],
        fail_silently=False,
        html_message=html_message
    )


@admin.action(description="Send interview invite")
def send_interview_link(modeladmin, request, queryset):
    with concurrent.futures.ThreadPoolExecutor() as executor:
        for obj in queryset:
            if obj.status == InterviewStatus.PENDING or obj.status == InterviewStatus.SCHEDULED:
                obj.status = InterviewStatus.SCHEDULED
                if obj.start_datetime == None:
                    obj.start_datetime = timezone.now()
                    obj.end_datetime = timezone.now() + timedelta(days=1)
                obj.save()

            executor.submit(_send_email_invite, obj, f'{settings.MEETING_URL}/{str(obj.id)}')

    modeladmin.message_user(request, "Interview invite send request submitted successfully.")


# @admin.action(description="Generate feedback for completed interview")
# def generate_feedback(modeladmin, request, queryset):
#     for obj in queryset:
#         if obj.status == InterviewStatus.COMPLETED:
#             interview_completed.send(sender=InterviewV2, instance=obj, created=False)
#     modeladmin.message_user(request, "Interview feedback generate request submitted successfully.")


def _generate_feedback(interview):
    feedback_engine = FeedbackEngine()
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

@admin.action(description="Generate feedback for completed interview")
def generate_feedback(modeladmin, request, queryset):
    for obj in queryset:
        if obj.status == InterviewStatus.COMPLETED:
            thread = threading.Thread(target=_generate_feedback, args=(obj,), daemon=True)
            thread.start()
    modeladmin.message_user(request, "Interview feedback generate request submitted successfully.")


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


@admin.action(description="Process Interview Recording")
def process_recording(modeladmin, request, queryset):
    for obj in queryset:
        if obj.status == InterviewStatus.COMPLETED:
            recording = VideoRecording.objects.create(interview=obj)
            thread = threading.Thread(target=process_recording_for_hls, args=(obj, recording), daemon=True)
            thread.start()

    modeladmin.message_user(request, "Video processing request submitted successfully.")
