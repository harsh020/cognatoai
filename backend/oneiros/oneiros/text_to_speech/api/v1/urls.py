from django.urls import path

from oneiros.text_to_speech.api.v1.views import SpeakingView

urlpatterns = [
    path("", view=SpeakingView.as_view(), name='speak'),
]


