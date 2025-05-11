from google.oauth2 import service_account

from .base import *

SECRET_KEY = env('DJANGO_SECRET_KEY')
ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS", default=["cognatoai.com"])

ADMIN_URL = env('DJANGO_ADMIN_URL', default='admin/')
CSRF_TRUSTED_ORIGINS = env.list('CSRF_TRUSTED_ORIGINS', default=["cognatoai.com"])

# LLM API Keys
GOOGLE_AI_API_KEY = env('GOOGLE_AI_API_KEY')
OPENAI_API_KEY = env('OPENAI_API_KEY')
PREMAI_API_KEY = env('PREMAI_API_KEY')
CLOUDFLARE_API_KEY = env('CLOUDFLARE_API_KEY')
CLOUDFLARE_ACCOUNT_ID = env('CLOUDFLARE_ACCOUNT_ID')
GROQ_API_KEY = env('GROQ_API_KEY')
CEREBRAS_API_KEY = env('CEREBRAS_API_KEY')

LINGUISTICS_URL = env('LINGUISTICS_URL')
MEETING_URL = env('MEETING_URL')

# All auth settings
ACCOUNT_EMAIL_VERIFICATION = 'mandatory'

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
# https://docs.djangoproject.com/en/dev/topics/security/#ssl-https
# https://docs.djangoproject.com/en/dev/ref/settings/#secure-hsts-seconds
# TODO: set this to 60 seconds first and then to 518400 once you prove the former works
SECURE_HSTS_SECONDS = 60
# https://docs.djangoproject.com/en/dev/ref/settings/#secure-hsts-include-subdomains
SECURE_HSTS_INCLUDE_SUBDOMAINS = env.bool(
    "DJANGO_SECURE_HSTS_INCLUDE_SUBDOMAINS", default=True
)
# https://docs.djangoproject.com/en/dev/ref/settings/#secure-hsts-preload
SECURE_HSTS_PRELOAD = env.bool("DJANGO_SECURE_HSTS_PRELOAD", default=True)
# https://docs.djangoproject.com/en/dev/ref/middleware/#x-content-type-options-nosniff
SECURE_CONTENT_TYPE_NOSNIFF = env.bool(
    "DJANGO_SECURE_CONTENT_TYPE_NOSNIFF", default=True
)

# DATABASES
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#databases
if env('POSTGRES_SSL_MODE', default=None):
    DATABASES['default']['OPTIONS'] = {
        'sslmode': env('POSTGRES_SSL_MODE'),
        'sslrootcert': env('POSTGRES_SSL_ROOT_CERT')
    }

# EMAIL
# ------------------------------------------------------------------------------
EMAIL_BACKEND = env("DJANGO_EMAIL_BACKEND", default="django.core.mail.backends.console.EmailBackend")
EMAIL_HOST = env("DJANGO_EMAIL_HOST", default="smtp.gmail.com")
EMAIL_PORT = env.int("DJANGO_EMAIL_PORT", default=587)
EMAIL_HOST_USER = env("DJANGO_EMAIL_HOST_USER", default="sora@gmail.com")
EMAIL_HOST_PASSWORD = env("DJANGO_EMAIL_HOST_PASSWORD", default="")
EMAIL_USE_TLS = env.bool("DJANGO_EMAIL_USE_TLS", default=True)
EMAIL_USE_SSL = env.bool("DJANGO_EMAIL_USE_SSL", default=False)

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


CORS_ORIGIN_WHITELIST = [
    'https://meet.cognatoai.com',
    'https://cognatoai.com',
    'https://yume.cognatoai.com',
]


# Payment
RAZORPAY_KEY_ID = 'rzp_test_iMzZ5kihm43qTB'
RAZORPAY_KEY_SECRET = 'vu4wl9g85OzGjRPpu1fEKVgh'
LINGUISTICS_URL = env('LINGUISTICS_URL')
MEETING_URL = env('MEETING_URL')

LINGUISTIC = {
    'BACKEND': 'rasengan.linguistic.adapters.OneirosAdapter',
    'BASE_URL': env('LINGUISTICS_URL'),
    'PATHS': {
        'TEXT_TO_SPEECH': '',
        'SPEECH_TO_TEXT': '',
    }
}