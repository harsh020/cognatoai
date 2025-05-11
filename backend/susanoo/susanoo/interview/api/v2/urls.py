from django.urls import path

from susanoo.interview.api.v2.views import InterviewCreateView, InterviewView, InterviewViewE2E, EndInterviewView, \
    InterviewReplayView, VideoRecordingView, InterviewResultView, InterviewBulkCreateView, InterviewSummaryView, \
    InterviewDailySummaryView, InterviewRecentUpcomingView, InterviewsScheduledOnView

app_name = "susanoo.interview"
urlpatterns = [
    path("", view=InterviewCreateView.as_view(), name='interview-create'),
    path("bulk/", view=InterviewBulkCreateView.as_view(), name='interview-bulk-create'),
    path("<uuid:id>/", view=InterviewView.as_view(), name='interview'),
    path("<uuid:id>/e2e/", view=InterviewViewE2E.as_view(), name='interview-e2e'),
    path("<uuid:id>/replay/", view=InterviewReplayView.as_view(), name='replay-interview'),
    path("<uuid:id>/end/", view=EndInterviewView.as_view(), name='end-interview'),
    path("<uuid:id>/result", view=InterviewResultView.as_view(), name='interview-result'),
    # path("linguistic/transcribe/", view=TranscribeView.as_view(), name='transcribe'),
    path("record/", view=VideoRecordingView.as_view(), name='video'),
    path("summary/", view=InterviewSummaryView.as_view(), name='interviews-summary'),
    path("daily-summary/", view=InterviewDailySummaryView.as_view(), name='interview-daily-summary'),
    path("recent-upcoming/", view=InterviewRecentUpcomingView.as_view(), name='interview-recent-upcoming'),
    path("scheduled/", view=InterviewsScheduledOnView.as_view(), name='interview-scheduled'),
]
