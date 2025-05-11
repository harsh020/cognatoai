from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from susanoo.waitlist.api.v1.serializers import WaitlistSerializer
from susanoo.waitlist.models import Waitlist


class WaitlistView(generics.GenericAPIView):
    serializer_class = WaitlistSerializer
    permission_classes = []
    queryset = Waitlist.objects.all()
    filterset_fields = '__all__'
    ordering_fields = ('created', 'modified', 'email')

    def post(self, request):
        print("before start")
        serializer = self.get_serializer(data=request.data)
        print("before validation")
        try:
            serializer.is_valid(raise_exception=True)
        except ValidationError as error:
            print('validation error')
            message = 'Somthing went wrong. Please try again later.'
            if error.detail.get('email') is not None:
                message = 'You have already joined wailist using this email.'
            return Response({
                'error': True,
                'message': message
            }, status=error.status_code)
        print("after validation")
        validated_data = serializer.validated_data

        try:
            waitlist = Waitlist.objects.get(email=validated_data.get('email'))
            # print(waitlist.__dict__)
        except Waitlist.DoesNotExist:
            waitlist = Waitlist.objects.create(**validated_data)

        return Response(self.get_serializer(waitlist).data, status=status.HTTP_201_CREATED)

    def get(self, request):
        queryset = self.filter_queryset(self.get_queryset()).filter(is_deleted=False)

        page = self.paginate_queryset(queryset)
        if page is not None:
            return self.get_paginated_response(self.get_serializer(page, many=True).data)
        return Response(self.get_serializer(queryset, many=True).data, status=status.HTTP_200_OK)

    def patch(self, request, id=None):
        serializer = self.get_serializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        Waitlist.objects.filter(id=id).update(**validated_data)
        waitlist = Waitlist.objects.get(id=id)
        return Response(self.get_serializer(waitlist).data, status=status.HTTP_200_OK)
