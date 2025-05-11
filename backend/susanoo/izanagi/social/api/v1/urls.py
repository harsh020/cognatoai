from django.urls import path

from izanagi.social.api.v1.views import SocialAuthRedirectView, SocialAuthCallbackView

app_name = "social"
urlpatterns = [
    path("auth/redirect/", view=SocialAuthRedirectView.as_view(), name="social-auth-redirect"),
    path("auth/callback/", view=SocialAuthCallbackView.as_view(), name="social-auth-callback"),
]
