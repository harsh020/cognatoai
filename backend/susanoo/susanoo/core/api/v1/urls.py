from django.urls import path

from susanoo.core.api.v1.views import CountryView, StateView, CityView, ContactUsCreateView, FileUploadView

app_name = "core"
urlpatterns = [
    path("countries/", view=CountryView.as_view(), name="list-countries"),
    path("states/", view=StateView.as_view(), name="list-states"),
    path("cities/", view=CityView.as_view(), name="list-cities"),
    path("contact-us/", view=ContactUsCreateView.as_view(), name="contact-us"),
    path("upload/", view=FileUploadView.as_view(), name="file-upload"),
]
