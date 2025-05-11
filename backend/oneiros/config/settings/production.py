# ruff: noqa: E501
from .base import *  # noqa: F403
from .base import DATABASES
from .base import INSTALLED_APPS
from .base import SPECTACULAR_SETTINGS
from .base import env

from google.oauth2 import service_account

# GENERAL
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#secret-key
SECRET_KEY = env("DJANGO_SECRET_KEY")
# https://docs.djangoproject.com/en/dev/ref/settings/#allowed-hosts
ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS", default=["yume.cognatoai.com"])
SITE_URL = env("DJANGO_SITE_URL", default='https://yume.cognatoai.com')
# DATABASES
# ------------------------------------------------------------------------------
DATABASES["default"]["CONN_MAX_AGE"] = env.int("CONN_MAX_AGE", default=60)

# CACHES
# ------------------------------------------------------------------------------
if env('REDIS_URL', default=None):
    CACHES = {
        "default": {
            "BACKEND": "django_redis.cache.RedisCache",
            "LOCATION": env("REDIS_URL"),
            "OPTIONS": {
                "CLIENT_CLASS": "django_redis.client.DefaultClient",
                # Mimicing memcache behavior.
                # https://github.com/jazzband/django-redis#memcached-exceptions-behavior
                "IGNORE_EXCEPTIONS": True,
            },
        },
    }
else:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "",
        },
    }

# SECURITY
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#secure-proxy-ssl-header
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
# https://docs.djangoproject.com/en/dev/ref/settings/#secure-ssl-redirect
SECURE_SSL_REDIRECT = env.bool("DJANGO_SECURE_SSL_REDIRECT", default=True)
# https://docs.djangoproject.com/en/dev/ref/settings/#session-cookie-secure
SESSION_COOKIE_SECURE = True
# https://docs.djangoproject.com/en/dev/ref/settings/#csrf-cookie-secure
CSRF_COOKIE_SECURE = True
CSRF_TRUSTED_ORIGINS = env.list('CSRF_TRUSTED_ORIGINS', default=["cognatoai.com"])
# https://docs.djangoproject.com/en/dev/topics/security/#ssl-https
# https://docs.djangoproject.com/en/dev/ref/settings/#secure-hsts-seconds
# TODO: set this to 60 seconds first and then to 518400 once you prove the former works
SECURE_HSTS_SECONDS = 60
# https://docs.djangoproject.com/en/dev/ref/settings/#secure-hsts-include-subdomains
SECURE_HSTS_INCLUDE_SUBDOMAINS = env.bool(
    "DJANGO_SECURE_HSTS_INCLUDE_SUBDOMAINS",
    default=True,
)
# https://docs.djangoproject.com/en/dev/ref/settings/#secure-hsts-preload
SECURE_HSTS_PRELOAD = env.bool("DJANGO_SECURE_HSTS_PRELOAD", default=True)
# https://docs.djangoproject.com/en/dev/ref/middleware/#x-content-type-options-nosniff
SECURE_CONTENT_TYPE_NOSNIFF = env.bool(
    "DJANGO_SECURE_CONTENT_TYPE_NOSNIFF",
    default=True,
)

# STORAGES
# ------------------------------------------------------------------------------
# https://django-storages.readthedocs.io/en/latest/#installation
# INSTALLED_APPS += ["storages"]
# GS_BUCKET_NAME = env("DJANGO_GCP_STORAGE_BUCKET_NAME")
# GS_DEFAULT_ACL = "publicRead"
# STATIC & MEDIA
# ------------------------
# STORAGES = {
#     "default": {
#         "BACKEND": "storages.backends.gcloud.GoogleCloudStorage",
#         "OPTIONS": {
#             "location": "media",
#             "file_overwrite": False,
#         },
#     },
#     "staticfiles": {
#         "BACKEND": "storages.backends.gcloud.GoogleCloudStorage",
#         "OPTIONS": {
#             "location": "static",
#             "default_acl": "publicRead",
#         },
#     },
# }
# MEDIA_URL = f"https://storage.googleapis.com/{GS_BUCKET_NAME}/media/"
# COLLECTFAST_STRATEGY = "collectfast.strategies.gcloud.GoogleCloudStrategy"
# STATIC_URL = f"https://storage.googleapis.com/{GS_BUCKET_NAME}/static/"

# EMAIL
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#default-from-email
DEFAULT_FROM_EMAIL = env(
    "DJANGO_DEFAULT_FROM_EMAIL",
    default="oneiros <noreply@yume.cognatoai.com>",
)
# https://docs.djangoproject.com/en/dev/ref/settings/#server-email
SERVER_EMAIL = env("DJANGO_SERVER_EMAIL", default=DEFAULT_FROM_EMAIL)
# https://docs.djangoproject.com/en/dev/ref/settings/#email-subject-prefix
EMAIL_SUBJECT_PREFIX = env(
    "DJANGO_EMAIL_SUBJECT_PREFIX",
    default="[oneiros] ",
)

# ADMIN
# ------------------------------------------------------------------------------
# Django Admin URL regex.
ADMIN_URL = env("DJANGO_ADMIN_URL")

# Anymail
# ------------------------------------------------------------------------------
# https://anymail.readthedocs.io/en/stable/installation/#installing-anymail
# INSTALLED_APPS += ["anymail"]
# https://docs.djangoproject.com/en/dev/ref/settings/#email-backend
# https://anymail.readthedocs.io/en/stable/installation/#anymail-settings-reference
# https://anymail.readthedocs.io/en/stable/esps
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
ANYMAIL = {}

# Collectfast
# ------------------------------------------------------------------------------
# https://github.com/antonagestam/collectfast#installation
# INSTALLED_APPS = ["collectfast", *INSTALLED_APPS]

# LOGGING
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#logging
# See https://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "filters": {"require_debug_false": {"()": "django.utils.log.RequireDebugFalse"}},
    "formatters": {
        "verbose": {
            "format": "%(levelname)s %(asctime)s %(module)s %(process)d %(thread)d %(message)s",
        },
    },
    "handlers": {
        "mail_admins": {
            "level": "ERROR",
            "filters": ["require_debug_false"],
            "class": "django.utils.log.AdminEmailHandler",
        },
        "console": {
            "level": "DEBUG",
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "root": {"level": "DEBUG", "handlers": ["console"]},
    "loggers": {
        "django.request": {
            "handlers": ["mail_admins"],
            "level": "ERROR",
            "propagate": True,
        },
        "django.security.DisallowedHost": {
            "level": "ERROR",
            "handlers": ["console", "mail_admins"],
            "propagate": True,
        },
        'channels': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': True,
        },
        'uvicorn': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': True,
        }
    },
}

# django-rest-framework
# -------------------------------------------------------------------------------
# Tools that generate code samples can use SERVERS to point to the correct domain
SPECTACULAR_SETTINGS["SERVERS"] = [
    {"url": "https://yume.cognatoai.com", "description": "Production server"},
]
# Your stuff...
# ------------------------------------------------------------------------------

# Channel Settings
# ----------------------------------
if env('REDIS_URL', default=None):
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels_redis.core.RedisChannelLayer',
            'CONFIG': {
                "hosts": [{
                    "address": env("REDIS_URL"),
                    # "ssl_cert_reqs": None,
                }]
            }
        },
    }

# STORAGES
# ------------------------------------------------------------------------------
# https://django-storages.readthedocs.io/en/latest/#installation
if env('GS_BUCKET_NAME', default=None):
    STORAGES = {
        "default": {
            "BACKEND": "storages.backends.gcloud.GoogleCloudStorage",
            "OPTIONS": {
                "project_id": env('GS_PROJECT_ID'),
                "bucket_name": env('GS_BUCKET_NAME'),
                "credentials": service_account.Credentials.from_service_account_file(
                    env('GS_CREDENTIALS'),
                ),
                "location": "media",
                "file_overwrite": False,
                # "default_acl": "publicRead",  # Cannot use ACL when Uniform access is set
                "default_acl": None,  # Cannot use ACL when Uniform access is set
                "querystring_auth": False,
            },
        },
        "staticfiles": {
            "BACKEND": "storages.backends.gcloud.GoogleCloudStorage",
            "OPTIONS": {
                "bucket_name": env('GS_BUCKET_NAME'),
                "credentials": service_account.Credentials.from_service_account_file(
                    env('GS_CREDENTIALS'),
                ),
                "location": "static",
                # "default_acl": "publicRead",  # Cannot use ACL when Uniform access is set
                "default_acl": None,  # Cannot use ACL when Uniform access is set
                "querystring_auth": False,
            },
        },
    }
    STATIC_URL = f'https://storage.googleapis.com/{env("GS_BUCKET_NAME")}/static/'
    MEDIA_URL = f'https://storage.googleapis.com/{env("GS_BUCKET_NAME")}/media/'

elif env('AWS_STORAGE_BUCKET_NAME', default=None):
    STORAGES = {
        "default": {
            "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
            "OPTIONS": {
                "bucket_name": env('AWS_STORAGE_BUCKET_NAME'),
                "access_key": env('AWS_ACCESS_KEY_ID'),
                "secret_key": env('AWS_SECRET_ACCESS_KEY'),
                "region_name": env('AWS_S3_REGION_NAME'),
                "location": "media",
            },
        },
        "staticfiles": {
            "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
            "OPTIONS": {
                "bucket_name": env('AWS_STORAGE_BUCKET_NAME'),
                "access_key": env('AWS_ACCESS_KEY_ID'),
                "secret_key": env('AWS_SECRET_ACCESS_KEY'),
                "region_name": env('AWS_S3_REGION_NAME'),
                "location": "static",
            },
        },
    }
    STATIC_URL = f'https://{env("AWS_STORAGE_BUCKET_NAME")}.s3.amazonaws.com/static/'
    MEDIA_URL = f'https://{env("AWS_STORAGE_BUCKET_NAME")}.s3.amazonaws.com/media/'

elif env('AZURE_ACCOUNT_NAME', default=None):
    STORAGES = {
        "default": {
            "BACKEND": "storages.backends.azure_storage.AzureStorage",
            "OPTIONS": {
                "account_name": env('AZURE_ACCOUNT_NAME'),
                "account_key": env('AZURE_ACCOUNT_KEY'),
                "azure_container": env('AZURE_CONTAINER'),
                "location": "media",
            },
        },
        "staticfiles": {
            "BACKEND": "storages.backends.azure_storage.AzureStorage",
            "OPTIONS": {
                "account_name": env('AZURE_ACCOUNT_NAME'),
                "account_key": env('AZURE_ACCOUNT_KEY'),
                "azure_container": env('AZURE_CONTAINER'),
                "location": "static",
            },
        },
    }
    STATIC_URL = f'https://{env("AZURE_ACCOUNT_NAME")}.blob.core.windows.net/{env("AZURE_CONTAINER")}/static/'
    MEDIA_URL = f'https://{env("AZURE_ACCOUNT_NAME")}.blob.core.windows.net/{env("AZURE_CONTAINER")}/media/'
