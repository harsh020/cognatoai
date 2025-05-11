from django.urls import path, re_path

from oneiros.speech_to_text.api.v1.views import TranscriptionView

urlpatterns = [
    path("", view=TranscriptionView.as_view(), name='transcript'),
]
