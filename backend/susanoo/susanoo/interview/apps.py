from django.apps import AppConfig


class InterviewConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'susanoo.interview'

    def ready(self):
        import susanoo.interview.signals
