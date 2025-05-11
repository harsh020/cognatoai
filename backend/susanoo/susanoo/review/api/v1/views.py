import json

from django.shortcuts import render
from rest_framework import generics, permissions, parsers, status
from rest_framework.response import Response

import common.permissions as perms
from common.responses import error_response
from susanoo.interview.models import InterviewV2
from susanoo.review.api.v1.serializers import ReviewResponseSerializer, ReviewCreateSerializer, ReviewSerializer
from susanoo.review.enums import ReviewStatus
from susanoo.review.models import Review


class ReviewCreateListView(generics.CreateAPIView, generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, perms.IsMember]
    parser_classes = [parsers.MultiPartParser, parsers.FileUploadParser, parsers.FormParser, parsers.JSONParser]
    serializer_class = ReviewResponseSerializer
    queryset = Review.objects.all()
    review_cost = 4

    def get_queryset(self):
        return self.queryset.filter(organization=self.request.organization).order_by('-created')

    def post(self, request, *args, **kwargs):
        # check if already did a review and not completed an interview
        if request.organization.credits < self.review_cost:
            return error_response(
                errors={
                    'credits': ['insufficient']
                },
                message='You do not have sufficient credits to do a review (1 review = 1/2 interview cost).',
                status=status.HTTP_403_FORBIDDEN
            )

        resume = request.FILES.get('resume')
        data = json.loads(request.data.get('data'))
        serializer = ReviewCreateSerializer(data=data, partial=True)
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
        if validated_data.get('resume'):
            validated_data.pop('resume')

        review = Review.objects.create(
            organization=request.organization,
            created_by=request.user,
            status=ReviewStatus.PENDING,
            resume=resume,
            **validated_data
        )

        return Response(
            self.get_serializer(review).data,
            status.HTTP_200_OK
        )


class ReviewRetrieveView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated, perms.IsMember]
    serializer_class = ReviewSerializer

    def get(self, request, id=None, *args, **kwargs):
        try:
            review = Review.objects.get(id=id)
        except Review.DoesNotExist:
            return error_response(
                errors={
                    'review': ['not_found']
                },
                message='Review not found',
                status=status.HTTP_404_NOT_FOUND
            )

        if review.status == ReviewStatus.IN_REVIEW:
            return error_response(
                errors={
                    'review': ['in_progress']
                },
                message='Review for the resume is still in progress',
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            self.get_serializer(review).data,
            status.HTTP_200_OK
        )
