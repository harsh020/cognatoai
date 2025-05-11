from django.urls import path, re_path

from oneiros.linguistic.api.v1.views import UsageView

urlpatterns = [
    path("usage/", view=UsageView.as_view(), name='usage'),
]
