import os

from rest_framework.generics import GenericAPIView
from rest_framework import permissions, status, parsers
from rest_framework.response import Response

from common.responses import error_response
from susanoo.core.api.v1.serializers import CountrySerializer, StateSerializer, CitySerializer, AddressSerializer, \
    ContactUsSerializer, FileSerializer
from susanoo.core.models import Country, State, City, Address, ContactUs, File


def validate_file(file, type, *args, **kwargs):
    # TODO: Convert this function into a different strategy+factory
    if type == 'resume':
        if file.size / 1024 / 1024 > 1:
            # allow resumes upto 1MB
            raise ValueError('File size is too big. Please make sure size is < 1MB')


class CountryView(GenericAPIView):
    serializer_class = CountrySerializer
    permission_classes = [permissions.AllowAny]
    queryset = Country.objects.all()
    filterset_fields = '__all__'

    def get(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset()).filter(is_deleted=False)

        # page = self.paginate_queryset(queryset)
        # if page is not None:
        #     return self.get_paginated_response(
        #         self.get_serializer(page, context={'request': request}, many=True).data)
        return Response(self.get_serializer(queryset, context={'request': request}, many=True).data,
                        status=status.HTTP_200_OK)


class StateView(GenericAPIView):
    serializer_class = StateSerializer
    permission_classes = [permissions.AllowAny]
    queryset = State.objects.all()
    filterset_fields = '__all__'

    def get(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset()).filter(is_deleted=False)

        # page = self.paginate_queryset(queryset)
        # if page is not None:
        #     return self.get_paginated_response(
        #         self.get_serializer(page, context={'request': request}, many=True).data)
        return Response(self.get_serializer(queryset, context={'request': request}, many=True).data,
                        status=status.HTTP_200_OK)


class CityView(GenericAPIView):
    serializer_class = CitySerializer
    permission_classes = [permissions.AllowAny]
    queryset = City.objects.all()
    filterset_fields = '__all__'

    def get(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset()).filter(is_deleted=False)

        # page = self.paginate_queryset(queryset)
        # if page is not None:
        #     return self.get_paginated_response(
        #         self.get_serializer(page, context={'request': request}, many=True).data)
        return Response(self.get_serializer(queryset, context={'request': request}, many=True).data,
                        status=status.HTTP_200_OK)


class ContactUsCreateView(GenericAPIView):
    serializer_class = ContactUsSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        validated_data = serializer.validated_data

        contact = ContactUs.objects.create(**validated_data)
        return Response(self.get_serializer(contact).data, status=status.HTTP_201_CREATED)


class FileUploadView(GenericAPIView):
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FileUploadParser, parsers.FormParser, parsers.JSONParser]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                errors={
                    key: [error for error in errors]
                    for key, errors in serializer.errors.items()
                },
                message='Invalid data',
                status=status.HTTP_400_BAD_REQUEST
            )

        validated_data = serializer.validated_data

        try:
            validate_file(**validated_data)
        except ValueError as e:
            return error_response(
                errors={
                    'file': ['invalid']
                },
                message=str(e),
                status=status.HTTP_400_BAD_REQUEST
            )
        file = File.objects.create(**validated_data)
        return Response(self.get_serializer(file).data, status=status.HTTP_201_CREATED)
