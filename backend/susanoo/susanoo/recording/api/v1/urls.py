from django.urls import path

from susanoo.recording.api.v1.views import VideoRecordingView

app_name = "susanoo.recording"
urlpatterns = [
    path("interviews/<uuid:interview>/", view=VideoRecordingView.as_view(), name='video-recording'),
]
