from django.urls import path

from susanoo.usage.api.v1.views import CostView

app_name = "susanoo.usage"
urlpatterns = [
    path("cost/", view=CostView.as_view(), name='cost'),
]
