import random

from django.utils import timezone
from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login
from rest_framework import status, permissions
from rest_framework import generics
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from common.responses import success_response, error_response
from izanagi.user.api.v1.serializers import UserAuthSerializer, UserSerializer, UserAuthResponseSerializer, \
    OTPSerializer, OTPResponseSerializer, UserPasswordUpdateSerializer, UserRegisterSerializer
from izanagi.user.models import User, OTP


class UserSignupView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                errors={
                    key: [error.code for error in errors]
                    for key, errors in serializer.errors.items()
                },
                message='Invalid data',
                status=status.HTTP_400_BAD_REQUEST
            )

        validated_data = serializer.validated_data
        try:
            User.objects.get(email__iexact=validated_data.get('email'))
            return error_response(
                errors={ 'email': ['exists'] },
                message='Email already exists',
                status=status.HTTP_400_BAD_REQUEST
            )
        except User.DoesNotExist:
            validated_data['username'] = validated_data.get('email')
            user = User.objects.create_user(**validated_data)

        user_response = UserSerializer(user).data
        del user_response['organizations']
        return Response(
            data=user_response,
            status=status.HTTP_201_CREATED
        )



class UserLoginView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserAuthSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                errors={
                    key: [error.code for error in errors]
                    for key, errors in serializer.errors.items()
                },
                message='Invalid data',
                status=status.HTTP_400_BAD_REQUEST
            )

        validated_data = serializer.validated_data
        user = authenticate(request, **validated_data)
        if user is None:
            return error_response(
                errors={'credentials': ['invalid']},
                message='Invalid email or password',
                status=status.HTTP_400_BAD_REQUEST
            )

        if not user.is_email_verified:
            otp = str(random.randint(100000, 999999))
            otp_instance = OTP.objects.filter(user=user).first()
            if otp_instance:
                otp_instance.otp = otp
                otp_instance.save()
            else:
                OTP.objects.create(otp=otp, user=user)

            return Response(
                data=UserAuthResponseSerializer({
                    'id': user.id,
                    'email': user.email,
                    'is_email_verified': user.is_email_verified,
                    'access_token': None,
                    'refresh_token': None
                }).data,
                status=status.HTTP_200_OK
            )

        refresh = RefreshToken.for_user(user)
        update_last_login(None, user)
        # return success_response(
        #     data=UserAuthResponseSerializer({
        #         'refresh_token': str(refresh),
        #         'access_token': str(refresh.access_token),
        #     }).data,
        #     message='Login Successful',
        #     status=status.HTTP_200_OK
        # )
        return Response(
            data=UserAuthResponseSerializer({
                'id': user.id,
                'email': user.email,
                'is_email_verified': user.is_email_verified,
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh)
            }).data,
            status=status.HTTP_200_OK
        )


class OTPView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = OTPSerializer
    queryset = OTP.objects.all()

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                errors={
                    key: [error.code for error in errors]
                    for key, errors in serializer.errors.items()
                },
                message='Invalid data',
                status=status.HTTP_400_BAD_REQUEST
            )

        validated_data = serializer.validated_data
        if validated_data.get('otp'):
            validated_data.pop('otp')
        otp = str(random.randint(100000, 999999))
        otp = OTP.objects.create(otp=otp, **validated_data)
        # return success_response(
        #     data=OTPResponseSerializer(otp).data,
        #     message='OTP sent successfully',
        #     status=status.HTTP_201_CREATED
        # )
        response = OTPResponseSerializer(otp).data
        response['otp'] = 'XXXX'
        return Response(
            data=response,
            status=status.HTTP_201_CREATED
        )

    def patch(self, request):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                errors={
                    key: [error.code for error in errors]
                    for key, errors in serializer.errors.items()
                },
                message='Invalid data',
                status=status.HTTP_400_BAD_REQUEST
            )

        validated_data = serializer.validated_data
        otp = None
        print(validated_data)
        try:
            otp = (
                self.get_queryset()
                .filter(user__email__iexact=validated_data.get('email'),
                        expiration__gt=timezone.now())
                .order_by('-created')
                .first()
            )
        except OTP.DoesNotExist:
            return error_response(
                errors={
                    'otp': ['expired'],
                },
                message='Invalid otp',
                status=status.HTTP_400_BAD_REQUEST
            )

        print(otp)

        if otp.otp != validated_data.get('otp'):
            print(otp.otp, validated_data.get('otp'))
            return error_response(
                errors={
                    'otp': ['incorrect'],
                },
                message='Invalid otp',
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.get(email=validated_data.get('email'))
        user.is_email_verified = True
        user.save()

        # Delete successfully used otp
        otp.delete()

        # Delete expired/failed otp
        # TODO: Use airflow jobs in the futures to do this.
        (self.get_queryset()
         .filter(expiration__lt=timezone.now()-timezone.timedelta(minutes=5))
         .order_by('-created')
         .delete())

        # return success_response(
        #     data={
        #         'email': user.email,
        #         'verified': True,
        #     },
        #     message='OTP verification successful',
        #     status=status.HTTP_200_OK
        # )
        refresh = RefreshToken.for_user(user)
        update_last_login(None, user)
        return Response(
            data=UserAuthResponseSerializer({
                'id': user.id,
                'email': user.email,
                'is_email_verified': user.is_email_verified,
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh)
            }).data,
            status=status.HTTP_200_OK
        )


class UserUpdatePasswordView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserPasswordUpdateSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                errors={
                    key: [error.code for error in errors]
                    for key, errors in serializer.errors.items()
                },
                message='Invalid data',
                status=status.HTTP_400_BAD_REQUEST
            )

        validated_data = serializer.validated_data
        if not request.user.check_password(validated_data.get('current_password')):
            return error_response(
                errors={'credentials': ['invalid']},
                message='Incorrect password',
                status=status.HTTP_400_BAD_REQUEST
            )
        request.user.set_password(raw_password=validated_data.get('new_password'))
        request.user.save()
        return success_response(message='Password changed successfully!')


class UserListView(generics.ListAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = UserSerializer
    queryset = User.objects.all()


class UserRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer
    queryset = User.objects.all()
    lookup_field = 'id'

    def get_object(self):
        return self.request.user
