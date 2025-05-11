from django.contrib import admin

from izanagi.billing.models import Plan, Subscription, Order


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    model = Plan
    list_display = ('id', 'name', 'duration')
    list_filter = ('id', 'name')
    ordering = ('-created',)


@admin.register(Subscription)
class OrganizationAdmin(admin.ModelAdmin):
    model = Subscription
    list_display = ('organization', 'plan', 'status')
    list_filter = ('organization', 'plan', 'start', 'end')
    ordering = ('-created',)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    model = Order
    list_display = ('organization', 'type', 'transaction_type')
    list_filter = ('organization', 'type', 'transaction_type')
    ordering = ('-created',)
