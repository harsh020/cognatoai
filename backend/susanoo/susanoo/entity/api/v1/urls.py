from django.urls import path

from susanoo.entity.api.v1.views import CandidateView, CandidateUpdateView


app_name = "susanoo.entity"
urlpatterns = [
    path("candidates/", view=CandidateView.as_view(), name='candidate-create-list'),
    path("candidates/<uuid:id>/", view=CandidateUpdateView.as_view(), name='candidate-update'),
]