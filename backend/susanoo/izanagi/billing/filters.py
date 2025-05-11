import django_filters
from izanagi.billing.models import Order


class OrderFilterSet(django_filters.FilterSet):
    type = django_filters.CharFilter(field_name='type', lookup_expr='contains ')
    transaction = django_filters.DateFilter(field_name='transaction_type', lookup_expr='contains')
    date_from = django_filters.DateFilter(field_name='created', lookup_expr='gte')
    date_till = django_filters.DateFilter(field_name='created', lookup_expr='lte')

    class Meta:
        model = Order
        fields = ('type', 'transaction', 'date_from', 'date_till')