from django.shortcuts import render
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, permissions, filters, status
from rest_framework.response import Response

import common.permissions as perms
from izanagi.billing.enums import SubscriptionStatus
from izanagi.billing.filters import OrderFilterSet
from izanagi.billing.models import Plan, Subscription, Order
from izanagi.billing.api.v1.serializers import PlanSerializer, SubscriptionSerializer, OrderSerializer, \
    BillingSerializer
from izanagi.organization.api.v1.serializers import OrganizationSerializer
from izanagi.organization.models import Organization, Member


class BillingView(generics.GenericAPIView):
    serializer_class = BillingSerializer
    # permission_classes = [permissions.IsAuthenticated, perms.IsMember, perms.HasRolePermissions]
    permission_classes = [permissions.IsAuthenticated, perms.IsMember]

    def get(self, request, *args, **kwargs):
        # Just a precaution while getting current active subscription
        subscription = Subscription.objects.filter(organization=request.organization, status=SubscriptionStatus.ACTIVE).order_by('-created').first()

        return Response(self.get_serializer({
            'subscription': subscription,
            'credits': request.organization.credits,
            'organization': request.organization.id,
        }).data, status=status.HTTP_200_OK)




class PlanCreateView(generics.CreateAPIView):
    serializer_class = PlanSerializer
    permission_classes = [permissions.IsAdminUser]


class PlanListView(generics.ListAPIView):
    serializer_class = PlanSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Plan.objects.all()


class PlanRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PlanSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Plan.objects.all()
    lookup_field = 'id'

    def get_object(self):
        pass


class SubscriptionView(generics.CreateAPIView, generics.ListAPIView):
    serializer_class = SubscriptionSerializer
    permission_classes = [perms.HasRolePermissions]
    # permission_classes = [perms.IsOwner]  ##TODO: Temp permissions. Just for testing, remove once done
    queryset = Subscription.objects.all()

    def get_queryset(self):
        if not self.request.organization:
            self.request.organization = Member.objects.get(user=self.request.user, is_default=True).organization
        return Subscription.objects.filter(organization=self.request.organization)


# class SubscriptionListView(generics.ListAPIView):
#     serializer_class = SubscriptionSerializer
#     permission_classes = [perms.IsReader, perms.HasRolePermissions]
#     queryset = Subscription.objects.all()
#
#     def get_queryset(self):
#         return Subscription.objects.filter(members__user=self.request.user)


class SubscriptionRetrieveView(generics.RetrieveAPIView):
    serializer_class = SubscriptionSerializer
    # permission_classes = [perms.IsOwner, perms.HasRolePermissions]
    permission_classes = [permissions.IsAuthenticated, perms.IsOwner]  ##TODO: Temp permissions. Just for testing, remove once done

    def get_object(self):
        return self.request.organization.subscriptions.filter(status=SubscriptionStatus.ACTIVE).first()


class SubscriptionRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SubscriptionSerializer
    # permission_classes = [perms.IsOwner, perms.HasRolePermissions]
    permission_classes = [perms.IsOwner]  ##TODO: Temp permissions. Just for testing, remove once done
    queryset = Subscription.objects.all()
    lookup_field = 'id'


class OrderView(generics.CreateAPIView, generics.ListAPIView):
    serializer_class = OrderSerializer
    # permission_classes = [perms.HasRolePermissions]
    permission_classes = [perms.IsOwner]  ##TODO: Temp permissions. Just for testing, remove once done
    queryset = Order.objects.all()
    # Filter settings
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ('candidate__email', 'created')
    filterset_class = OrderFilterSet
    # Search settings
    search_fields = ()
    # Order settings
    ordering_fields = ('created',)
    ordering = ('-created',)

    def get_queryset(self):
        if not self.request.organization:
            self.request.organization = Member.objects.get(user=self.request.user, is_default=True).organization
        return Order.objects.filter(organization=self.request.organization)


# class OrderListView(generics.ListAPIView):
#     serializer_class = OrderSerializer
#     permission_classes = [perms.IsReader, perms.HasRolePermissions]
#     queryset = Order.objects.all()
#
#     def get_queryset(self):
#         return Order.objects.filter(members__user=self.request.user)


class OrderRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = OrderSerializer
    permission_classes = [perms.IsOwner, perms.HasRolePermissions]
    queryset = Order.objects.all()
    lookup_field = 'id'

    def get_object(self):
        pass

