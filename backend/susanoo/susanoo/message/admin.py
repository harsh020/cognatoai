from django.contrib import admin

from susanoo.message.models import Message, MessageV2, Sentinel, Thought


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    model = Message
    list_display = ('id', 'type', 'created', 'interview')
    list_filter = ('interview', 'type')
    ordering = ('-created', '-modified')


@admin.register(MessageV2)
class MessageV2Admin(admin.ModelAdmin):
    model = MessageV2
    list_display = ('id', 'type', 'created', 'interview')
    list_filter = ('interview', 'type')
    ordering = ('-created', '-modified')


@admin.register(Sentinel)
class SentinelAdmin(admin.ModelAdmin):
    model = Sentinel
    list_display = ('id', 'type', 'created', 'interview')
    list_filter = ('interview', 'type')
    ordering = ('-created', '-modified')


@admin.register(Thought)
class SentinelAdmin(admin.ModelAdmin):
    model = Thought
    list_display = ('id', 'created', 'interview')
    list_filter = ('interview',)
    ordering = ('-created', '-modified')
