import django_filters
from susanoo.interview.models import Interview, InterviewV2


class InterviewFilterSet(django_filters.FilterSet):
    candidate = django_filters.CharFilter(field_name='candidate__email', lookup_expr='contains')
    status = django_filters.CharFilter(field_name='status', lookup_expr='contains')
    scheduled_from = django_filters.DateFilter(field_name='created', lookup_expr='gte')
    scheduled_till = django_filters.DateFilter(field_name='created', lookup_expr='lte')

    class Meta:
        model = Interview
        fields = ('candidate', 'status',  'scheduled_from', 'scheduled_till')


class InterviewFilterSetV2(django_filters.FilterSet):
    candidate = django_filters.CharFilter(field_name='candidate__email', lookup_expr='contains')
    status = django_filters.CharFilter(field_name='status', lookup_expr='contains')
    scheduled_from = django_filters.DateTimeFilter(field_name='created', lookup_expr='gte')
    scheduled_till = django_filters.DateTimeFilter(field_name='created', lookup_expr='lte')

    class Meta:
        model = InterviewV2
        fields = ('candidate', 'status',  'scheduled_from', 'scheduled_till')