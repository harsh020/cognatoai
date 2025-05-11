from django.urls import path

from susanoo.interview.api.v1.views import InterviewCreateView, InterviewView, EndInterviewView, InterviewViewV2

app_name = "susanoo.interview"
urlpatterns = [
    path("", view=InterviewCreateView.as_view(), name='interview-create'),
    path("<uuid:id>/", view=InterviewView.as_view(), name='interview'),
    path("v2/<uuid:id>/", view=InterviewViewV2.as_view(), name='interview'),
    path("<uuid:id>/end/", view=EndInterviewView.as_view(), name='end-interview'),
    # path("linguistic/transcribe/", view=TranscribeView.as_view(), name='transcribe'),
    # path("record/", view=VideoRecordingView.as_view(), name='video'),
]
