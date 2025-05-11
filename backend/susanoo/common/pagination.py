from rest_framework import pagination
from rest_framework.response import Response


class PageNumberPaginationWithPageCount(pagination.PageNumberPagination):
    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'pages': self.page.paginator.num_pages,
            'size': self.page.paginator.per_page,
            'page': self.page.number,
            'results': data,
        })