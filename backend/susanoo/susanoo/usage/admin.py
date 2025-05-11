from django.contrib import admin
from susanoo.usage.models import Usage


@admin.register(Usage)
class UsageAdmin(admin.ModelAdmin):
    model = Usage
    list_display = ('id', 'interview', 'llm', 'pruned_input', 'pruned_output')
    list_filter = ('interview__id', 'llm__model', 'llm__provider__id')

    @admin.display(ordering='interview__id', description='Interview')
    def interview(self, obj):
        return obj.interview.id

    @admin.display(ordering='llm__model', description='Model Name')
    def llm(self, obj):
        return obj.llm.model

    @admin.display(ordering='input', description='Input Prompt')
    def pruned_input(self, obj):
        return obj.input if len(obj.input) < 50 else obj.input[:50] + '...'

    @admin.display(ordering='output', description='Output Prompt')
    def pruned_output(self, obj):
        return obj.output if len(obj.output) < 50 else obj.output[:50] + '...'
