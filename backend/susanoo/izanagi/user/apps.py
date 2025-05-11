from django.apps import AppConfig


class UserConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "izanagi.user"
    label = 'user'

    def ready(self):
        from izanagi.user.signals import send_otp