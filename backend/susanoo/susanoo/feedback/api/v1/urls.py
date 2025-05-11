from django.urls import path

from susanoo.feedback.api.v1.views import PlatformFeedbackView, InterviewFeedbackView

app_name = "susanoo.feedback"
urlpatterns = [
    path("platform/", view=PlatformFeedbackView.as_view(), name='platform-feedback'),
    path("interview/", view=InterviewFeedbackView.as_view(), name='interview-feedback'),
]
