from django.urls import path

from susanoo.stage.api.v2.views import StageListView

app_name = "susanoo.stage"
urlpatterns = [
    path("", view=StageListView.as_view(), name='stage-list'),
]
