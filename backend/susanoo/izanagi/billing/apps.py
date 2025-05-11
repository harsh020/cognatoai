from django.apps import AppConfig


class BillingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'izanagi.billing'

    def ready(self):
        from izanagi.billing.signals import create_default_subscription
