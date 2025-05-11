from django.urls import path

from rasengan.linguistic.api.v1.views import STTView

app_name = "rasengan.linguistic"
urlpatterns = [
    path("transcribe/", view=STTView.as_view(), name='stt'),
]
