from django.urls import path

from izanagi.billing.api.v1.views import (
    PlanListView,
    PlanCreateView,
    PlanRetrieveUpdateDestroyView,

    SubscriptionView,
    SubscriptionRetrieveUpdateDestroyView,

    OrderView,
    OrderRetrieveUpdateDestroyView, BillingView, SubscriptionRetrieveView
)

app_name = "billing"
urlpatterns = [
    # path("", view=PlanCreateView.as_view(), name="plan-create"),
    path("", view=BillingView.as_view(), name="billing"),

    path("plans/", view=PlanListView.as_view(), name="plan-list"),
    path("plans/<uuid:id>/", view=PlanRetrieveUpdateDestroyView.as_view(), name="retrieve-update-delete"),

    path("subscriptions/", view=SubscriptionView.as_view(), name="subscription-create-list"),
    path("subscriptions/active/", view=SubscriptionRetrieveView.as_view(), name="active-subscription-retrieve"),
    path("subscriptions/<uuid:id>/", view=PlanRetrieveUpdateDestroyView.as_view(), name="retrieve-update-delete"),

    path("orders/", view=OrderView.as_view(), name="order-create-list"),
    path("orders/<uuid:id>/", view=OrderRetrieveUpdateDestroyView.as_view(), name="retrieve-update-delete"),
]
