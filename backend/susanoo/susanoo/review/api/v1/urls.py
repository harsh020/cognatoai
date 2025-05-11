from django.urls import path

from susanoo.review.api.v1.views import ReviewCreateListView, ReviewRetrieveView

app_name = "susanoo.review"
urlpatterns = [
    path("", view=ReviewCreateListView.as_view(), name='review-create-list'),
    path("<uuid:id>/", view=ReviewRetrieveView.as_view(), name='review-retrieve'),
]
