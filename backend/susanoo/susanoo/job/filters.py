import django_filters
from susanoo.job.models import Job


class JobFilterSet(django_filters.FilterSet):
    job_id = django_filters.CharFilter(field_name='job_id', lookup_expr='contains')
    role = django_filters.CharFilter(field_name='role', lookup_expr='contains')
    created_from = django_filters.DateTimeFilter(field_name='created', lookup_expr='gte')
    created_till = django_filters.DateTimeFilter(field_name='created', lookup_expr='lte')
