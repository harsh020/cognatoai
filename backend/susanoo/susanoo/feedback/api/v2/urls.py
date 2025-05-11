from django.urls import path

from susanoo.feedback.api.v2.views import PlatformFeedbackView, InterviewFeedbackView

app_name = "susanoo.feedback"
urlpatterns = [
    path("platform/", view=PlatformFeedbackView.as_view(), name='platform-feedback'),
    path("interviews/<uuid:id>", view=InterviewFeedbackView.as_view(), name='interview-feedback'),
]
