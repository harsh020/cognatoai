from django.apps import AppConfig


class ResumeConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'susanoo.review'

    def ready(self) -> None:
        import susanoo.review.signals
