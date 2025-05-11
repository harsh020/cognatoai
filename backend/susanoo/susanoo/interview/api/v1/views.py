import json
import os
import uuid

from django.conf import settings
from django.utils import timezone
from django.core.files.storage import FileSystemStorage
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, status, parsers, permissions, filters
from rest_framework.response import Response

from common.responses import error_response
from izanagi.billing.enums import SubscriptionStatus, PlanType
from izanagi.billing.models import Subscription
from rasengan.graph.models import Graph
from rasengan.interview.engine import InterviewEngine
from rasengan.interview.interview import InterviewExecutor, PitchExecutor
from rasengan.text_to_speech.openvoice import OpenVoice
from susanoo.company.models import Company
from susanoo.entity.api.v1.serializers import CandidateSerializer
from susanoo.entity.models import Interviewer, Candidate
from susanoo.feedback.models import InterviewFeedback
from susanoo.interview.api.v1.serializers import MessageSerializer, \
    InterviewSerializer, ConversationSerializer, InterviewCreateSerializer, InterviewListSerializer
from susanoo.interview.enums import InterviewStatus
from susanoo.interview.filters import InterviewFilterSet
from susanoo.interview.models import Interview, InterviewV2
from susanoo.message.enums import MessageType
from susanoo.message.models import Message, MessageV2
from susanoo.stage.api.v1.serializers import StageSerializer, InterviewStageSerializer
from susanoo.usage.models import Usage
import common.permissions as perms


class InterviewCreateViewV1(generics.GenericAPIView):
    swagger_fake_view = True
    serializer_class = InterviewCreateSerializer
    # permission_classes = [permissions.IsAuthenticated, perms.IsMember, perms.HasRolePermissions]  ## TODO: add role permissions
    permission_classes = [permissions.IsAuthenticated, perms.IsMember]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, partial=True)
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
        # Get the subscription check the plan
        subscription = Subscription.objects.get(organization=request.organization, status=SubscriptionStatus.ACTIVE)

        default_job = {
            "id": "13136",
            "role": "Software Engineer",
            "description": "Responsibilities include managing project priorities, deadlines, and deliverables; designing, developing, testing, deploying, maintaining, and enhancing software solutions. The role requires versatility, leadership qualities, and enthusiasm to tackle new problems across the full stack."
        }

        if validated_data.get('metadata', None) is None:
            validated_data['metadata'] = {}

        # if plan is Paid set status to Schedule else Pending
        if subscription.plan.type == PlanType.PAID:
            validated_data['status'] = InterviewStatus.SCHEDULED
            if validated_data.get('company', None) is not None:
                # company = Company.objects.create(validated_data.pop('company'))
                validated_data['metadata']['company'] = validated_data.pop('company')
            if validated_data.get('job', None) is not None:
                # job = Company.objects.create(validated_data.pop('job'))
                validated_data['metadata']['job'] = validated_data.pop('job')
        else:
            validated_data['status'] = InterviewStatus.PENDING
            validated_data['start_datetime'] = None
            validated_data['end_datetime'] = None

        if validated_data.get('job', None) is None:
            validated_data['metadata']['job'] = default_job

        if len(validated_data.get('metadata', {})) == 0:
            validated_data.pop('metadata')

        # get the default interviewer and set it
        if validated_data.get('interviewer', None) is None:
            validated_data['interviewer'] = Interviewer.objects.all().order_by('created').first()

        # Set default graph to latest
        # TODO: add a type variable in graph to filter by type [Job, Pitch]
        validated_data['graph'] = Graph.objects.all().order_by('-created').first()

        validated_data['created_by'] = request.user
        interview = Interview.objects.create(**validated_data)
        return Response(
            InterviewSerializer(interview).data,
            status=status.HTTP_201_CREATED
        )


class InterviewCreateView(generics.CreateAPIView, generics.ListAPIView):
    swagger_fake_view = True
    ## ----- Create ----- ##
    # permission_classes = [permissions.IsAuthenticated, perms.IsMember, perms.HasRolePermissions]  ## TODO: add role permissions
    permission_classes = [permissions.IsAuthenticated, perms.IsMember]
    parser_classes = [parsers.MultiPartParser, parsers.FileUploadParser, parsers.FormParser, parsers.JSONParser]

    ## ----- List ----- ##
    serializer_class = InterviewListSerializer
    queryset = Interview.objects.all()
    # Filter settings
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ('candidate__email', 'status', 'created')
    filterset_class = InterviewFilterSet
    # Search settings
    search_fields = ('candidate__email', 'candidate__first_name', 'candidate__last_name')
    # Order settings
    ordering_fields = ('created',)
    ordering = ('-created',)

    interview_cost = 8

    def get_queryset(self):
        return self.request.organization.organization_interviews

    def post(self, request, *args, **kwargs):
        # Check if user has sufficient credits to schedule interview
        if request.organization.credits < self.interview_cost:
            return error_response(
                errors={
                    'credits': ['insufficient']
                },
                message='You do not have sufficient credits to schedule an interview.',
                status=status.HTTP_403_FORBIDDEN
            )

        # FIXME: candidate sub json needs `added_by` fields although the serializer has `partial=True`
        resume = request.FILES.get('resume')
        data = json.loads(request.data.get('data'))
        serializer = InterviewCreateSerializer(data=data, partial=True)
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

        # Get the subscription check the plan
        subscription = Subscription.objects.get(organization=request.organization, status=SubscriptionStatus.ACTIVE)

        default_job = {
            "id": "13136",
            "role": "Software Engineer",
            "description": "Responsibilities include managing project priorities, deadlines, and deliverables; designing, developing, testing, deploying, maintaining, and enhancing software solutions. The role requires versatility, leadership qualities, and enthusiasm to tackle new problems across the full stack."
        }

        # Add/update candidate details
        candidate = validated_data.pop('candidate')
        try:
            Candidate.objects.get(added_by=request.organization, email=candidate.get('email'))
            Candidate.objects.filter(added_by=request.organization, email=candidate.get('email')).update(**candidate)
            candidate = Candidate.objects.get(added_by=request.organization, email=candidate.get('email'))
            if resume:
                candidate.resume = resume
                candidate.save()
        except Candidate.DoesNotExist:
            candidate = Candidate.objects.create(added_by=request.organization, resume=resume, **candidate)
        validated_data['candidate'] = candidate

        if validated_data.get('metadata', None) is None:
            validated_data['metadata'] = {}

        # if plan is Paid set status to Schedule else Pending
        if subscription.plan.type == PlanType.PAID:
            validated_data['status'] = InterviewStatus.SCHEDULED
            if validated_data.get('company', None) is not None:
                # company = Company.objects.create(validated_data.pop('company'))
                validated_data['metadata']['company'] = validated_data.pop('company')
            if validated_data.get('job', None) is not None:
                # job = Company.objects.create(validated_data.pop('job'))
                validated_data['metadata']['job'] = validated_data.pop('job')
        else:
            validated_data['status'] = InterviewStatus.PENDING
            validated_data['start_datetime'] = None
            validated_data['end_datetime'] = None

        if validated_data.get('job', None) is None:
            validated_data['metadata']['job'] = default_job

        if len(validated_data.get('metadata', {})) == 0:
            validated_data.pop('metadata')

        # get the default interviewer and set it
        if validated_data.get('interviewer', None) is None:
            validated_data['interviewer'] = Interviewer.objects.all().order_by('created').first()

        # Set default graph to latest
        # TODO: add a type variable in graph to filter by type [Job, Pitch]
        validated_data['graph'] = Graph.objects.all().order_by('-created').first()

        validated_data['created_by'] = request.user
        validated_data['organization'] = request.organization
        interview = Interview.objects.create(**validated_data)

        # Update organization credits
        request.organization.credits -= self.interview_cost
        request.organization.save()
        return Response(
            InterviewSerializer(interview).data,
            status=status.HTTP_201_CREATED
        )


class InterviewView(generics.GenericAPIView):
    serializer_class = InterviewSerializer
    interview_executor = InterviewExecutor()
    tts_strategy = OpenVoice()

    def get(self, request, id=None):
        # Get current interview
        interview = Interview.objects.get(id=id)

        # if interview.status == InterviewStatus.SCHEDULED:
        #     interview.status = InterviewStatus.IN_PROGRESS
        #     interview.node = interview.graph.start_node
        #     interview.stage = interview.node.stage
        #     interview.save()

        # Create executor
        # output = self.interview_executor._call(interview=interview)
        # response = InterviewResponseSerializer(interview).data
        return Response(data=self.get_serializer(interview).data, status=status.HTTP_200_OK)

    def post(self, request, id=None):
        interview = Interview.objects.get(id=id)

        if interview.status == InterviewStatus.SCHEDULED:
            interview.status = InterviewStatus.IN_PROGRESS
            interview.node = interview.job.graph.start_node
            interview.stage = interview.node.stage
            interview.started_datetime = timezone.now()
            interview.save()

            validated_data = None
        elif interview.status == InterviewStatus.IN_PROGRESS:
            serializer = MessageSerializer(data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)

            validated_data = serializer.validated_data
        else:
            messages = Message.objects.filter(interview=interview).order_by('created')
            return Response(data={
                'conversation': MessageSerializer(messages, many=True).data,
                'stage': None,
                'status': interview.status
            }, status=status.HTTP_200_OK)

        ## TODO: Replace the above else with the one below if you want to continue the interview after rejoining.
        # else:
        #     messages = Message.objects.filter(interview=interview).order_by('created')
        #     if interview.status != InterviewStatus.COMPLETED:
        #         interview.status = InterviewStatus.IN_PROGRESS
        #         interview.save()
        #
        #     if interview.status == InterviewStatus.COMPLETED or \
        #             (messages.exists() and messages.last().type == MessageType.AI):
        #         stage_response = None
        #         if interview.status != InterviewStatus.COMPLETED:
        #             stage_response = InterviewStageSerializer(interview.stage).data
        #         return Response(data={
        #             'conversation': MessageSerializer(messages, many=True).data,
        #             'stage': stage_response,
        #             'status': interview.status
        #         }, status=status.HTTP_200_OK)
        #
        #     validated_data = None if len(messages.all()) == 0 else MessageSerializer(messages.last()).validated_data

        output = self.interview_executor._call(interview=interview, inputs=validated_data)

        ## INFO: Separate service has b
        # audio = self.tts_strategy.run(id=str(interview.id), text=output['output'])
        # print('audio -->', audio)

        if interview.node == interview.job.graph.end_node:
            interview.status = InterviewStatus.COMPLETED
            interview.stage = None
            interview.ended_datetime = timezone.now()
            interview.save()

        end_response = 'Thank you for interviewing. Feel free to leave the interview.'
        response = [{
            'content': output['output'] if interview.status != InterviewStatus.COMPLETED else end_response,
            'type': MessageType.AI
        }]
        # response = [{
        #     'content': output['output'],
        #     'type': MessageType.AI
        # }]
        stage_response = InterviewStageSerializer(interview.stage).data
        stage_response['time_left'] = 0
        if interview.stage is not None:
            ## TODO: Find a better way to handle the case when time has exceeded and time left is negative.
            print(stage_response)
            print(interview.stage.timeout)
            print(output)
            stage_response['time_left'] = max(0, interview.stage.timeout - output['time_spent'])

        print(f'stage ---> {stage_response}')

        return Response(data={
            'conversation': MessageSerializer(response, many=True).data,
            # 'audio': audio.get('url'),
            'stage': stage_response,
            'status': interview.status,
        }, status=status.HTTP_200_OK)

    def patch(self, request, id=None, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, partial=True)
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
        validated_data.pop('status')
        try:
            interview = Interview.objects.filter(id=id).update(**validated_data)
        except Interview.DoesNotExist:
            return error_response(
                errors={
                    'interview': ['not_exists']
                },
                message='Interview not found',
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(
            data=self.get_serializer(interview).data,
            status=status.HTTP_200_OK
        )

    def delete(self, request, id=None):
        interview = Interview.objects.get(id=id)
        interview.status = InterviewStatus.SCHEDULED
        interview.started_datetime = None
        interview.ended_datetime = None
        interview.node = None
        interview.stage = None
        interview.save()

        Message.objects.filter(interview=interview).delete()

        # Instead of deleting usage, assign them to dummy interview
        Usage.objects.filter(interview=interview).update(interview=uuid.UUID('f6697d7d-5dc9-418e-9df8-dee9d5a1b52f'))
        InterviewFeedback.objects.filter(interview=interview).delete()

        return Response(data=self.get_serializer(interview).data, status=status.HTTP_200_OK)


class InterviewViewV2(generics.GenericAPIView):
    serializer_class = InterviewSerializer
    interview_engine = InterviewEngine()
    tts_strategy = OpenVoice()

    def get(self, request, id=None):
        # Get current interview
        interview = InterviewV2.objects.get(id=id)

        # if interview.status == InterviewStatus.SCHEDULED:
        #     interview.status = InterviewStatus.IN_PROGRESS
        #     interview.node = interview.graph.start_node
        #     interview.stage = interview.node.stage
        #     interview.save()

        # Create executor
        # output = self.interview_executor._call(interview=interview)
        # response = InterviewResponseSerializer(interview).data
        return Response(data=self.get_serializer(interview).data, status=status.HTTP_200_OK)

    def post(self, request, id=None):
        interview = InterviewV2.objects.get(id=id)

        if interview.status == InterviewStatus.SCHEDULED:
            interview.status = InterviewStatus.IN_PROGRESS
            interview.node = intervie.job.graph.start_node
            interview.stage = interview.node.stage
            interview.started_datetime = timezone.now()
            interview.save()

            validated_data = None
        elif interview.status == InterviewStatus.IN_PROGRESS:
            serializer = MessageSerializer(data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)

            validated_data = serializer.validated_data
        else:
            messages = MessageV2.objects.filter(interview=interview).order_by('created')
            return Response(data={
                'conversation': MessageSerializer(messages, many=True).data,
                'stage': None,
                'status': interview.status
            }, status=status.HTTP_200_OK)

        output = self.interview_engine.run(interview=interview, inputs=validated_data)

        ## INFO: Separate service has b
        # audio = self.tts_strategy.run(id=str(interview.id), text=output['output'])
        # print('audio -->', audio)

        if interview.node == interview.job.graph.end_node:
            interview.status = InterviewStatus.COMPLETED
            interview.stage = None
            interview.ended_datetime = timezone.now()
            interview.save()

        # end_response = 'Thank you for interviewing. Feel free to leave the interview.'
        response = [{
            'content': output['output'],
            'type': MessageType.AI
        }]
        # response = [{
        #     'content': output['output'],
        #     'type': MessageType.AI
        # }]
        stage_response = InterviewStageSerializer(interview.stage).data
        stage_response['time_left'] = 0
        if interview.stage is not None:
            ## TODO: Find a better way to handle the case when time has exceeded and time left is negative.
            print(stage_response)
            print(interview.stage.timeout)
            print(output)
            stage_response['time_left'] = max(0, interview.stage.timeout - output['time_spent'])

        print(f'stage ---> {stage_response}')

        return Response(data={
            'conversation': MessageSerializer(response, many=True).data,
            # 'audio': audio.get('url'),
            'stage': stage_response,
            'status': interview.status,
        }, status=status.HTTP_200_OK)

    def patch(self, request, id=None, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, partial=True)
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
        validated_data.pop('status')
        try:
            interview = Interview.objects.filter(id=id).update(**validated_data)
        except Interview.DoesNotExist:
            return error_response(
                errors={
                    'interview': ['not_exists']
                },
                message='Interview not found',
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(
            data=self.get_serializer(interview).data,
            status=status.HTTP_200_OK
        )

    def delete(self, request, id=None):
        interview = Interview.objects.get(id=id)
        interview.status = InterviewStatus.SCHEDULED
        interview.started_datetime = None
        interview.ended_datetime = None
        interview.node = None
        interview.stage = None
        interview.save()

        Message.objects.filter(interview=interview).delete()

        # Instead of deleting usage, assign them to dummy interview
        Usage.objects.filter(interview=interview).update(interview=uuid.UUID('f6697d7d-5dc9-418e-9df8-dee9d5a1b52f'))
        InterviewFeedback.objects.filter(interview=interview).delete()

        return Response(data=self.get_serializer(interview).data, status=status.HTTP_200_OK)


class EndInterviewView(generics.GenericAPIView):
    serializer_class = InterviewSerializer

    def patch(self, request, id=None):
        interview = Interview.objects.get(id=id)

        if request.data and request.data.get('status'):
            interview.status = InterviewStatus._value2member_map_.get(request.data.get('status'))
        elif interview.status != InterviewStatus.COMPLETED:
            interview.status = InterviewStatus.INCOMPLETE
        interview.ended_datetime = timezone.now()
        interview.save()

        return Response(data=self.get_serializer(interview).data, status=status.HTTP_200_OK)


class VideoRecordingView(generics.GenericAPIView):
    ## TODO: Kafka streams and blob store
    parser_classes = [parsers.MultiPartParser, parsers.FileUploadParser, parsers.FormParser, parsers.JSONParser]

    def post(self, request):
        # interview = Interview.objects.get(id=id)
        chunk = request.FILES.get('file')
        id = request.data.get('id')

        # ms = time.time_ns()
        path = f'{settings.MEDIA_ROOT}/videos/{id}/'
        if not os.path.exists(path):
            os.makedirs(path)

        # path += chunk.name
        # path += f'/{ms}.wav'
        FileSystemStorage(location=path).save(chunk.name, chunk)

        return Response({
            'url': path
        }, status=status.HTTP_200_OK)


class InterviewListView(generics.ListAPIView):
    serializer_class = InterviewListSerializer
    # permission_classes = [permissions.IsAuthenticated, perms.IsMember, perms.HasRolePermissions]  ## TODO: add role permissions
    permission_classes = [permissions.IsAuthenticated, perms.IsMember]
    queryset = Interview.objects.all()
    # Filter settings
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ('candidate__email', 'created')
    filterset_class = InterviewFilterSet
    # Search settings
    search_fields = ('candidate__email', 'candidate__first_name', 'candidate__last_name')
    # Order settings
    ordering_fields = ('created',)
    ordering = ('-created',)

    def get_queryset(self):
        return self.queryset.filter(created_by__organization=self.request.organization)
