"""susanoo URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions

schema_view = get_schema_view(
   openapi.Info(
      title="Cognato AI API",
      default_version='v1',
      description="Apis",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="contact@cognatoai.com"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    re_path(r'^swagger/$', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    re_path(r'^redoc/$', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

    # # all auth urls
    # # Social OAuth callbacks (required even in headless)
    # path('accounts/', include('allauth.urls')),
    # # Headless API endpoints
    # path('_allauth/', include('allauth.headless.urls')),

    path(settings.ADMIN_URL, admin.site.urls),

    path('api/v1/users/', include('izanagi.user.api.v1.urls')),
    path('api/v1/social/', include('izanagi.social.api.v1.urls')),
    path('api/v1/organizations/', include('izanagi.organization.api.v1.urls')),
    path('api/v1/billings/', include('izanagi.billing.api.v1.urls')),

    path('api/v1/core/', include('susanoo.core.api.v1.urls')),
    path('api/v1/entities/', include('susanoo.entity.api.v1.urls')),
    path('api/v1/interviews/', include('susanoo.interview.api.v1.urls')),
    path('api/v1/traces/', include('susanoo.usage.api.v1.urls')),
    path('api/v1/feedbacks/', include('susanoo.feedback.api.v1.urls')),
    path('api/v1/waitlists/', include('susanoo.waitlist.api.v1.urls')),
    path('api/v1/reviews/', include('susanoo.review.api.v1.urls')),
    path('api/v1/activities/', include('susanoo.activity.api.v1.urls')),
    path('api/v1/recordings/', include('susanoo.recording.api.v1.urls')),
    path('api/v1/jobs/', include('susanoo.job.api.v1.urls')),

    # v2 apis
    path('api/v2/interviews/', include('susanoo.interview.api.v2.urls')),
    path('api/v2/traces/', include('susanoo.usage.api.v2.urls')),
    path('api/v2/feedbacks/', include('susanoo.feedback.api.v2.urls')),
    path('api/v2/stages/', include('susanoo.stage.api.v2.urls')),

    # path('api/v1/linguistics/', include('rasengan.linguistic.api.v1.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) + \
              static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) # just for local
