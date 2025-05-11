import django_filters
from django.db.models import Q

from susanoo.entity.models import Candidate


class CandidateFilterSet(django_filters.FilterSet):
    email = django_filters.CharFilter(field_name='email', lookup_expr='icontains')
    name = django_filters.CharFilter(method='filter_by_full_name')

    class Meta:
        model = Candidate
        fields = ['email', 'name']

    def filter_by_full_name(self, queryset, name, value):
        name_parts = value.strip().split()

        if len(name_parts) >= 2:
            first, last = name_parts[0], name_parts[1]
            return queryset.filter(
                Q(first_name__icontains=first, last_name__icontains=last) |
                Q(first_name__icontains=last, last_name__icontains=first)
            )
        else:
            return queryset.filter(
                Q(first_name__icontains=value) | Q(last_name__icontains=value)
            )