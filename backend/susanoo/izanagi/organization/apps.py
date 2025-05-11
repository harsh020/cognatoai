from django.apps import AppConfig


class OrganizationConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "izanagi.organization"

    def ready(self):
        from izanagi.organization.signals import create_default_organization
