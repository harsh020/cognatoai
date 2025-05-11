import os

from google.oauth2 import service_account

from .base import *

# Email Auth
# EMAIL_HOST = 'smtp-server'
# EMAIL_PORT = '1025'

SECRET_KEY = 'django-insecure--ddf&r#+9zqcfoi0tzkg1qou6nih$+a=9ouq=9axdvuy2o-p0t'

# ALL AUTH
# ------------------------------------------------------------------------------
# https://docs.allauth.org/en/latest/account/configuration.html
ACCOUNT_EMAIL_VERIFICATION = 'mandatory'
SOCIALACCOUNT_PROVIDERS = {
    "github": {
        "APP": {
            "client_id": "123",
            "secret": "456",
        }
    }
}

# EMAIL
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#email-backend
# EMAIL_BACKEND = env(
#     "DJANGO_EMAIL_BACKEND", default="django.core.mail.backends.console.EmailBackend",
# )
EMAIL_BACKEND = env("DJANGO_EMAIL_BACKEND", default="django.core.mail.backends.smtp.EmailBackend")
EMAIL_HOST = env("DJANGO_EMAIL_HOST", default="smtp-relay.gmail.com")
EMAIL_PORT = env.int("DJANGO_EMAIL_PORT", default=587)
EMAIL_HOST_USER = env("DJANGO_EMAIL_HOST_USER", default="admin@cognatoai.com")
EMAIL_HOST_PASSWORD = env("DJANGO_EMAIL_HOST_PASSWORD", default="")
EMAIL_USE_TLS = env.bool("DJANGO_EMAIL_USE_TLS", default=True)
EMAIL_USE_SSL = env.bool("DJANGO_EMAIL_USE_SSL", default=False)

# CACHES
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#caches
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "",
    },
}

# ------------------------------------------------------------------------------
# User Settings
# ------------------------------------------------------------------------------

# Payments
# ------------------------------------------------------------------------------
RAZORPAY_KEY_ID = 'rzp_test_iMzZ5kihm43qTB'
RAZORPAY_KEY_SECRET = 'vu4wl9g85OzGjRPpu1fEKVgh'

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": os.getenv("DJANGO_LOG_LEVEL", "INFO"),
            "propagate": False,
        },
    },
}
SENDER_EMAIL = 'soniharsh020@gmail.com'
MEDIA_URL = '/media/'
OTP_VALIDATION_TIMEOUT = 600

# LLM Api Keys
# ------------------------------------------------------------------------------


LINGUISTIC = {
    'BACKEND': 'rasengan.linguistic.adapters.OneirosAdapter',
    'BASE_URL': 'http://host.docker.internal:8001',
    'PATHS': {
        'TEXT_TO_SPEECH': '',
        'SPEECH_TO_TEXT': '',
    }
}

# STORAGES = {
#     "default": {
#         "BACKEND": "storages.backends.gcloud.GoogleCloudStorage",
#         "OPTIONS": {
#             "project_id": env('GS_PROJECT_ID'),
#             "bucket_name": env('GS_BUCKET_NAME'),
#             "credentials": service_account.Credentials.from_service_account_file(
#                 env('GS_CREDENTIALS'),
#             ),
#             "location": "media",
#             "file_overwrite": False,
#             # "default_acl": "publicRead",  # Cannot use ACL when Uniform access is set
#         },
#     },
#     "staticfiles": {
#         "BACKEND": "storages.backends.gcloud.GoogleCloudStorage",
#         "OPTIONS": {
#             "project_id": env('GS_PROJECT_ID'),
#             "bucket_name": env('GS_BUCKET_NAME'),
#             "credentials": service_account.Credentials.from_service_account_file(
#                 env('GS_CREDENTIALS'),
#             ),
#             "location": "static",
#             # "default_acl": "publicRead",  # Cannot use ACL when Uniform access is set
#         },
#     },
# }
# STATIC_URL = f'https://storage.googleapis.com/{env("GS_BUCKET_NAME")}/static/'
# MEDIA_URL = f'https://storage.googleapis.com/{env("GS_BUCKET_NAME")}/media/'

# Emulated google cloud storage (run fake gcs emulator for this to work
if env.bool('USE_GCS_EMULATOR', default=False):
    GCS_EMULATOR_ENDPOINT = env('GCS_EMULATOR_ENDPOINT', default=None)
    STORAGES = {
        "default": {
            "BACKEND": "common.storage_backends.EmulatorGoogleCloudStorage",
            "OPTIONS": {
                "project_id": env('GS_PROJECT_ID', default='local'),
                "bucket_name": env('GS_BUCKET_NAME', default='cognato-ai'),
                "credentials": None,
                "location": "media",
                "file_overwrite": False,
                # "default_acl": "publicRead",  # Cannot use ACL when Uniform access is set
                "default_acl": None,  # Cannot use ACL when Uniform access is set
                "querystring_auth": False,
            },
        },
        "staticfiles": {
            "BACKEND": "common.storage_backends.EmulatorGoogleCloudStorage",
            "OPTIONS": {
                "project_id": env('GS_PROJECT_ID', default='local'),
                "bucket_name": env('GS_BUCKET_NAME', default='cognato-ai'),
                "credentials": None,
                "location": "staticfiles",
                "file_overwrite": False,
                # "default_acl": "publicRead",  # Cannot use ACL when Uniform access is set
                "default_acl": None,  # Cannot use ACL when Uniform access is set
                "querystring_auth": False,
            },
        },
    }
