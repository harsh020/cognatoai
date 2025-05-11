from django.urls import path

from susanoo.job.api.v1.views import JobCreateListView, JobUpdateRetrieveView


app_name = "susanoo.job"
urlpatterns = [
    path("", view=JobCreateListView.as_view(), name='job-create-list'),
    path("<uuid:id>/", view=JobUpdateRetrieveView.as_view(), name='job-retrieve-update'),
]