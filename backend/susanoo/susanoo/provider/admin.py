from django.contrib import admin
from susanoo.provider.models import Provider, LLM, LLMConfig


@admin.register(Provider)
class ProviderAdmin(admin.ModelAdmin):
    model = Provider
    list_display = ('id', 'provider_id')


@admin.register(LLM)
class LLMAdmin(admin.ModelAdmin):
    model = LLM
    list_display = ('id', 'model')


@admin.register(LLMConfig)
class LLMAdmin(admin.ModelAdmin):
    model = LLMConfig
    list_display = ('id', 'temperature')


