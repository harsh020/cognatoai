from django.urls import path

from susanoo.activity.api.v1.views import ActivityView, ActivityBulkCreateView

app_name = "susanoo.activity"
urlpatterns = [
    path("bulk/", view=ActivityBulkCreateView.as_view(), name='activity-bulk-create'),
    path("interviews/<uuid:interview>/", view=ActivityView.as_view(), name='activity-analysis'),
]
