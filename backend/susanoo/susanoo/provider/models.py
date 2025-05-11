from django.db import models
from django.utils.translation import gettext_lazy as _
from model_utils.models import TimeStampedModel

from susanoo.core.behaviours import UUIDMixin, StatusMixin


class Provider(UUIDMixin, TimeStampedModel, StatusMixin):
    provider_id = models.CharField(_('Provider Id'), max_length=100, blank=True, null=True, unique=True)
    provider_name = models.CharField(_('Provider Name'), max_length=100, blank=True, null=True, unique=True)

    def __str__(self):
        return self.provider_id


class LLM(UUIDMixin, TimeStampedModel, StatusMixin):
    provider = models.ForeignKey(Provider, on_delete=models.CASCADE, blank=True, null=True, related_name='llms')
    model = models.CharField(_('Model'), max_length=100, blank=True, null=True)
    input_price = models.DecimalField(_('Input Price (per token in $)'), max_digits=60, decimal_places=50, blank=True, null=True)
    output_price = models.DecimalField(_('Output Price (per token in $)'), max_digits=60, decimal_places=50, blank=True, null=True)

    class Meta:
        unique_together = (
            ('provider', 'model')
        )

    def __str__(self):
        return self.model


class LLMConfig(UUIDMixin, TimeStampedModel, StatusMixin):
    llm = models.ForeignKey(LLM, on_delete=models.CASCADE, blank=True, null=True, related_name='configs')
    temperature = models.FloatField(_('Temperature'), default=0.8)
    top_p = models.FloatField(_('Top p'), default=0.9)
    top_k = models.FloatField(_('Top k'), default=40)
    max_tokens = models.BigIntegerField(_('Max Tokens'), default=4096)
    configs = models.JSONField(_('Kwargs'), blank=True, null=True)

    def __str__(self):
        return str(self.temperature)
