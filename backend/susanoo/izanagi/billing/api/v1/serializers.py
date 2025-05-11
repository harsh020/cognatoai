from rest_framework import serializers

from izanagi.billing.models import Plan, Subscription, Order


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = ('id', 'name', 'price', 'credits', 'duration', 'features', 'metadata')


class SubscriptionSerializer(serializers.ModelSerializer):
    plan = PlanSerializer()

    class Meta:
        model = Subscription
        fields = ('id', 'organization', 'plan', 'start', 'end', 'status')


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'


class BillingSerializer(serializers.Serializer):
    subscription = SubscriptionSerializer()
    credits = serializers.DecimalField(max_digits=10, decimal_places=4)
    organization = serializers.CharField()