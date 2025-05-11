from django.urls import path

from susanoo.usage.api.v2.views import CostView

app_name = "susanoo.usage"
urlpatterns = [
    path("interviews/<uuid:id>/cost/", view=CostView.as_view(), name='cost'),
]
