from django.urls import path

from susanoo.waitlist.api.v1.views import WaitlistView

app_name = "susanoo.waitlist"
urlpatterns = [
    path("", view=WaitlistView.as_view(), name='create-list'),
    path("<uuid:id>/", view=WaitlistView.as_view(), name='update'),
]
