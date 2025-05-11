from django.urls import path

from izanagi.user.api.v1.views import UserLoginView, UserSignupView, UserRetrieveUpdateDestroyView, UserListView, \
    OTPView, UserUpdatePasswordView

app_name = "user"
urlpatterns = [
    path("login/", view=UserLoginView.as_view(), name="login"),
    path("signup/", view=UserSignupView.as_view(), name="signup"),
    path("change-password/", view=UserUpdatePasswordView.as_view(), name="change-password"),
    path("otp/", view=OTPView.as_view(), name="otp"),
    path("", view=UserRetrieveUpdateDestroyView.as_view(), name="user-crud"),
]
