import os
import json
import uuid
import time
import logging
from collections import defaultdict
from datetime import timedelta
from typing import List

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.db.models.functions import TruncDate
from django.utils import timezone
from django.template.loader import render_to_string
from django.utils.dateparse import parse_datetime
from django.utils.module_loading import import_string
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, status, parsers, permissions, filters
from rest_framework.response import Response
from django.http.response import HttpResponse
from django.db.models import Count

from rasengan.feedback.engine import FeedbackEngine
from common.responses import error_response, list_response
from common.utils import create_interview_graph
from izanagi.billing.enums import SubscriptionStatus, PlanType
from izanagi.billing.models import Subscription
from rasengan.graph.enums import GraphType
from rasengan.graph.models import Graph, GraphV2
from rasengan.interview.engine import InterviewEngine, InterviewEngineWithLinguistic
from rasengan.text_to_speech.openvoice import OpenVoice
from susanoo.activity.api.v1.views import process_interview_activities
from susanoo.entity.models import Interviewer, Candidate
from susanoo.feedback.models import InterviewFeedback, InterviewFeedbackV2
from susanoo.interview.api.v2.serializers import MessageSerializer, MessageSerializerV2, \
    InterviewSerializer, ConversationSerializer, InterviewCreateSerializer, InterviewListSerializer, \
    MessageStreamSerializer, InterviewBulkCrateSerializer, InterviewSummarySerializer, InterviewDailySummarySerializer
from susanoo.interview.enums import InterviewStatus, InterviewType
from susanoo.interview.filters import InterviewFilterSet, InterviewFilterSetV2
from susanoo.interview.models import InterviewV2
from susanoo.interview.signals import interview_completed
from susanoo.message.enums import MessageType
from susanoo.message.models import MessageV2, Thought, Sentinel
from susanoo.question.api.v1.serializers import QuestionCreateSerializer
from susanoo.question.models import Question
from susanoo.stage.api.v1.serializers import StageSerializer, InterviewStageSerializer
from susanoo.stage.models import StageV2
from susanoo.usage.models import UsageV2
import common.permissions as perms
from common import utils

from weasyprint import HTML


class InterviewCreateView(generics.CreateAPIView, generics.ListAPIView):
    swagger_fake_view = True
    ## ----- Create ----- ##
    # permission_classes = [permissions.IsAuthenticated, perms.IsMember, perms.HasRolePermissions]  ## TODO: add role permissions
    permission_classes = [permissions.IsAuthenticated, perms.IsMember]
    parser_classes = [parsers.MultiPartParser, parsers.FileUploadParser, parsers.FormParser, parsers.JSONParser]

    ## ----- List ----- ##
    serializer_class = InterviewListSerializer
    queryset = InterviewV2.objects.all()
    # Filter settings
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ('candidate__email', 'status', 'created')
    filterset_class = InterviewFilterSetV2
    # Search settings
    search_fields = ('candidate__email', 'candidate__first_name', 'candidate__last_name')
    # Order settings
    ordering_fields = ('created',)
    ordering = ('-created',)

    interview_cost = 1

    def get_queryset(self):
        return self.request.organization.organization_interviews_v2

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

        custom_questions = validated_data.pop('custom_questions')
        custom_questions_data = None
        if custom_questions:
            custom_questions_serializer = QuestionCreateSerializer(data=custom_questions, partial=True)
            if not custom_questions_serializer.is_valid():
                return error_response(
                    errors={
                        key: [error for error in errors]
                        for key, errors in custom_questions_serializer.errors.items()
                    },
                    message='Invalid data',
                    status=status.HTTP_400_BAD_REQUEST
                )
            custom_questions_data = custom_questions_serializer.validated_data
            if custom_questions_data.get('stage', None) is None or len(custom_questions_data.get('questions', [])) == 0:
                custom_questions_data = None

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
            # validated_data['start_datetime'] = validated_data.get('start_datetime', timezone.now())
            # validated_data['end_datetime'] = validated_data.get('end_datetime', timezone.now() + timedelta(days=1))

        if validated_data.get('job', None) is None:
            validated_data['metadata']['job'] = default_job

        if len(validated_data.get('metadata', {})) == 0:
            validated_data.pop('metadata')

        # get the default interviewer and set it
        if validated_data.get('interviewer', None) is None:
            validated_data['interviewer'] = Interviewer.objects.all().order_by('created').first()

        # Set default graph to latest
        # TODO: add a type variable in graph to filter by type [Job, Pitch]
        # validated_data['graph'] = GraphV2.objects.filter(type=GraphType.DSA).order_by('-created').first()

        validated_data['created_by'] = request.user
        validated_data['organization'] = request.organization
        validated_data['type'] = InterviewType.JOB

        stages = validated_data.pop('stages')

        graph = create_interview_graph(stages)
        # print(graph)
        # graph.created_by = request.user
        # graph.organization = request.organization
        graph.type = GraphType.SWE
        graph.save()

        # Set default Interview configurations
        configs = {
            'camera': validated_data.get('config', {}).get('camera', True),
            'screen': validated_data.get('config', {}).get('screen', True),
        }
        validated_data['config'] = configs

        validated_data['graph'] = graph
        interview = InterviewV2.objects.create(**validated_data)
        required_stages = StageV2.objects.filter(required=True)

        if custom_questions_data:
            stage = custom_questions_data.pop('stage')
            custom_questions = Question.objects.create(
                **custom_questions_data,
                interview=interview,
                stage=StageV2.objects.get(id=stage)
            )
        interview.stages.set(stages | required_stages)
        interview.save()

        # Update organization credits
        request.organization.credits -= self.interview_cost
        request.organization.save()
        return Response(
            InterviewSerializer(interview).data,
            status=status.HTTP_201_CREATED
        )


class InterviewBulkCreateView(generics.CreateAPIView, generics.UpdateAPIView):
    ## ----- Create ----- ##
    # permission_classes = [permissions.IsAuthenticated, perms.IsMember, perms.HasRolePermissions]  ## TODO: add role permissions
    permission_classes = [permissions.IsAuthenticated, perms.IsMember]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    serializer_class = InterviewBulkCrateSerializer
    lookup_field = 'id'
    interview_cost = 1

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

        if len(validated_data.get('candidates', [])) == 0:
            return error_response(
                errors={
                    'invalid': ['invalid_number']
                },
                message='Need at least 1 candidate to schedule interview..',
                status=status.HTTP_400_BAD_REQUEST
            )
        elif len(validated_data.get('candidates', [])) > request.organization.credits:
            return error_response(
                errors={
                    'credits': ['insufficient']
                },
                message='You do not have sufficient credits to schedule an interview.',
                status=status.HTTP_403_FORBIDDEN
            )
        
        custom_questions = validated_data.pop('custom_questions')
        custom_questions_data = None
        if custom_questions:
            custom_questions_serializer = QuestionCreateSerializer(data=custom_questions, partial=True)
            if not custom_questions_serializer.is_valid():
                return error_response(
                    errors={
                        key: [error for error in errors]
                        for key, errors in custom_questions_serializer.errors.items()
                    },
                    message='Invalid data',
                    status=status.HTTP_400_BAD_REQUEST
                )
            custom_questions_data = custom_questions_serializer.validated_data
            if custom_questions_data.get('stage', None) is None or len(custom_questions_data.get('questions', [])) == 0:
                custom_questions_data = None

        # Get the subscription check the plan
        subscription = Subscription.objects.get(organization=request.organization, status=SubscriptionStatus.ACTIVE)

        # Add/update candidate details
        candidates = validated_data.pop('candidates')
        candidate_instances = Candidate.objects.filter(
            added_by=request.organization,
            id__in=candidates
        )

        if validated_data.get('metadata', None) is None:
            validated_data['metadata'] = {}

        # if plan is Paid set status to Schedule else Pending
        if subscription.plan.type == PlanType.PAID:
            validated_data['status'] = InterviewStatus.SCHEDULED
            if validated_data.get('company', None) is not None:
                # company = Company.objects.create(validated_data.pop('company'))
                validated_data['metadata']['company'] = validated_data.pop('company')
        else:
            validated_data['status'] = InterviewStatus.PENDING

        if len(validated_data.get('metadata', {})) == 0:
            validated_data.pop('metadata')

        if validated_data.get('interviewer', None) is None:
            validated_data['interviewer'] = Interviewer.objects.all().order_by('created').first()

        # Set default Interview configurations
        configs = {
            'camera': validated_data.get('config', {}).get('camera', True),
            'screen': validated_data.get('config', {}).get('screen', True),
        }
        validated_data['config'] = configs

        # Set default graph to latest
        # TODO: add a type variable in graph to filter by type [Job, Pitch]
        # validated_data['graph'] = GraphV2.objects.filter(type=GraphType.DSA).order_by('-created').first()

        interviews = [
            InterviewV2(
                candidate=candidate,
                organization=request.organization,
                created_by=request.user,
                type=InterviewType.JOB,
                **validated_data
            )

            for candidate in candidate_instances
        ]
        interviews = InterviewV2.objects.bulk_create(interviews)

        if custom_questions_data:
            stage = custom_questions_data.pop('stage')
            custom_questions = [
                Question(
                    interview=interview,
                    stage=StageV2.objects.get(id=stage),
                    **custom_questions_data
                )
                for interview in interviews
            ]


        # Update organization credits
        request.organization.credits -= self.interview_cost
        request.organization.save()
        return list_response(
            entity='interviews',
            data=InterviewListSerializer(interviews, many=True).data,
            status=status.HTTP_201_CREATED
        )

class InterviewView(generics.GenericAPIView):
    serializer_class = InterviewSerializer
    interview_engine = InterviewEngine()
    tts_strategy = OpenVoice()

    def get(self, request, id=None):
        # Get current interview
        try:
            interview = InterviewV2.objects.get(id=id)
        except InterviewV2.DoesNotExist:
            return error_response(
                errors={
                    'not_found': ['interview not found']
                },
                message='Interview not found',
                status=status.HTTP_404_NOT_FOUND
            )

        ## TODO: Check the status condition
        if interview.end_datetime and interview.end_datetime < timezone.now() and interview.status == InterviewStatus.SCHEDULED:
            interview.status = InterviewStatus.EXPIRED
            interview.save()

            return error_response(
                errors={
                    'expired': ['interview expired']
                },
                message='Interview expired. Please contact admin.',
                status=status.HTTP_400_BAD_REQUEST
            )

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
            interview.node = interview.job.graph.start_node
            interview.stage = interview.node.stage
            interview.started_datetime = timezone.now()
            interview.save()

            validated_data = None
        elif interview.status == InterviewStatus.IN_PROGRESS:
            serializer = MessageSerializer(data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)

            validated_data = serializer.validated_data
        elif interview.end_datetime < timezone.now():
            interview.status = InterviewStatus.EXPIRED
            interview.save()

            return error_response(
                errors={
                    'expired': ['interview expired']
                },
                message='Interview expired. Please contact admin.',
                status=status.HTTP_400_BAD_REQUEST
            )
        else:
            messages = MessageV2.objects.filter(interview=interview).order_by('created')
            return Response(data={
                'conversation': MessageSerializer(messages, many=True).data,
                'stage': None,
                'status': interview.status
            }, status=status.HTTP_200_OK)

        result = self.interview_engine.run(interview=interview, inputs=validated_data)
        output = result['output']

        # print(output)
        # print("##########################")
        # print(output)

        ## INFO: Separate service has b
        # audio = self.tts_strategy.run(id=str(interview.id), text=output['output'])
        # print('audio -->', audio)

        if interview.node == interview.job.graph.end_node:
            interview.status = InterviewStatus.COMPLETED
            interview.stage = None
            interview.ended_datetime = timezone.now()
            interview.save()

            # Trigger completed signal
            interview_completed.send(sender=InterviewV2, instance=interview, created=False)

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
            # print(stage_response)
            # print(interview.stage.timeout)
            # print(output)
            stage_response['time_left'] = max(0, interview.stage.timeout - result['time_spent'])

        # print(f'stage ---> {stage_response}')

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

        interview = InterviewV2.objects.get(id=id)
        if interview.status not in (InterviewStatus.PENDING, InterviewStatus.SCHEDULED):
            return error_response(
                errors={
                    'invalid_data': 'invalid_status'
                },
                message='Cannot modify interview at this point.',
                status=status.HTTP_400_BAD_REQUEST
            )


        validated_data = serializer.validated_data
        try:
            InterviewV2.objects.filter(id=id).update(**validated_data)
            interview = InterviewV2.objects.get(id=id)
        except InterviewV2.DoesNotExist:
            return error_response(
                errors={
                    'interview': ['not_exists']
                },
                message='Interview not found',
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(
            data=InterviewListSerializer(interview).data,
            status=status.HTTP_200_OK
        )

    def delete(self, request, id=None):
        interview = InterviewV2.objects.get(id=id)
        interview.status = InterviewStatus.SCHEDULED
        interview.started_datetime = None
        interview.ended_datetime = None
        interview.node = None
        interview.stage = None
        interview.save()

        MessageV2.objects.filter(interview=interview).delete()
        Thought.objects.filter(interview=interview).delete()
        Sentinel.objects.filter(interview=interview).delete()

        # Instead of deleting usage, assign them to dummy interview
        UsageV2.objects.filter(interview=interview).update(interview=uuid.UUID('7a3cf5b1-765f-4788-aedb-dd546ffe5db4'))
        InterviewFeedbackV2.objects.filter(interview=interview).delete()

        return Response(data=self.get_serializer(interview).data, status=status.HTTP_200_OK)


class InterviewViewE2E(generics.GenericAPIView):
    serializer_class = InterviewSerializer
    interview_engine = InterviewEngineWithLinguistic()
    parser_classes = [parsers.MultiPartParser, parsers.FileUploadParser, parsers.FormParser, parsers.JSONParser]

    def post(self, request, id=None):
        start = time.time()
        print(f"[API] Request received for interview {id}")
        print(request.data)
        print(f"[TEMP] Request receiving took: {time.time()-start}")

        s = time.time()
        print(f"[TEMP] Fetching interview")
        interview = InterviewV2.objects.get(id=id)
        e = time.time()
        print(f"[TEMP] Fetching interview. Time taken: {e-s}")
        # print(request.data)

        if interview.status == InterviewStatus.SCHEDULED:
            interview.status = InterviewStatus.IN_PROGRESS
            interview.node = interview.job.graph.start_node
            interview.stage = interview.node.stage
            interview.started_datetime = timezone.now()
            interview.save()

            validated_data = None
        elif interview.status == InterviewStatus.IN_PROGRESS:
            s = time.time()
            print(f"[TEMP] Parsing request data")
            serializer = MessageStreamSerializer(data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)

            validated_data = serializer.validated_data

            e = time.time()
            print(f"[TEMP] Parsed request data. Time taken: {e-s}")
        elif interview.end_datetime < timezone.now():
            interview.status = InterviewStatus.EXPIRED
            interview.save()

            return error_response(
                errors={
                    'expired': ['interview expired']
                },
                message='Interview expired. Please contact admin.',
                status=status.HTTP_400_BAD_REQUEST
            )
        else:
            messages = MessageV2.objects.filter(interview=interview).order_by('created')
            return Response(data={
                'conversation': MessageSerializer(messages, many=True).data,
                'stage': None,
                'status': interview.status
            }, status=status.HTTP_200_OK)

        file = None
        stream = False
        uid = None
        encoding = 'webm'
        chunk_path = None
        if validated_data:
            stream = validated_data.get('stream', False)
            uid = validated_data.get('uid', None)
            encoding = validated_data.get('encoding', 'webm')
            chunk_path = utils.get_chunk_path(id, 'audio', uid)
        if request.FILES.get('file', None):
            file = request.FILES.get('file')
            print(f'[API] Request file size: {request.FILES.get("file").size}')
        elif stream:
            s = time.time()
            print(f'[API] Reconstructing audio file from stored stream')

            if not uid:
                return error_response(
                    errors={
                        'invalid': ['cannot process audio without uid']
                    },
                    message='Need audio uid when processing chunk',
                    status=status.HTTP_400_BAD_REQUEST
                )
            file = utils.get_audio_from_storage_chunks(id, uid, encoding)

            e = time.time()
            print(f'[API] Audio reconstruction done. Time taken: {e-s}')

        if file:
            validated_data['content'] = file

        s = time.time()
        print(f"[TEMP] Interview engine running")
        result = self.interview_engine.run(interview=interview, inputs=validated_data)
        e = time.time()
        print(f"[TEMP] Interview engine done. Time taken: {e-s}")

        user = result['input']
        generated = result['output']

        if interview.node == interview.job.graph.end_node:
            interview.status = InterviewStatus.COMPLETED
            interview.stage = None
            interview.ended_datetime = timezone.now()
            interview.save()

            # Trigger completed signal
            interview_completed.send(sender=InterviewV2, instance=interview, created=False)

        # end_response = 'Thank you for interviewing. Feel free to leave the interview.'
        if settings.SETTINGS_MODULE.find('local') >= 0:
            if user:
                user['audio'] = f'http://localhost:8000/{user["audio"]}'
            generated['audio'] = f'http://localhost:8000/{generated["audio"]}'

        response = []
        if user and file:  # Only send user transcript back if there was an audio
            response.append({
                'content': user['input'],
                'audio': user['audio'],
                'type': MessageType.USER
            })
        response.append({
            'content': generated['output'],
            'audio': generated['audio'],
            'type': MessageType.AI
        })

        stage_response = InterviewStageSerializer(interview.stage).data
        stage_response['time_left'] = 0
        if interview.stage is not None:
            ## TODO: Find a better way to handle the case when time has exceeded and time left is negative.
            # print(stage_response)
            # print(interview.stage.timeout)
            stage_response['time_left'] = max(0, interview.stage.timeout - result['time_spent'])

        # print(f'stage ---> {stage_response}')

        # TODO: add audio to response
        end = time.time()
        print(f"[API] Request completed for interview {id}.\n Time taken: {end-start}")

        # Async delete the chunk dir
        if stream:
            utils.adelete_storage_directory(chunk_path)

        return Response(data={
            'conversation': MessageSerializerV2(response, many=True).data,
            'stage': stage_response,
            'status': interview.status,
        }, status=status.HTTP_200_OK)


class InterviewReplayView(generics.GenericAPIView):
    serializer_class = None

    def get(self, request, id=None, *args, **kwargs):
        interview = InterviewV2.objects.get(id=id)

        messages = MessageV2.objects.filter(interview=interview).order_by('created').all()
        thoughts = Thought.objects.filter(interview=interview).order_by('created').all()
        sentinels = Sentinel.objects.filter(interview=interview).order_by('created').all()

        result = []
        message_idx = 0
        thought_idx = 0
        sentinel_idx = 0
        while message_idx < len(messages) or thought_idx < len(thoughts) or sentinel_idx < len(sentinels):
            if thought_idx < len(thoughts) and (message_idx == len(messages) or thoughts[thought_idx].created < messages[message_idx].created) and (sentinel_idx == len(sentinels) or thoughts[thought_idx].created < sentinels[sentinel_idx].created):
                result.append({
                    'entity': 'thought',
                    'content': thoughts[thought_idx].content,
                    'created': thoughts[thought_idx].created
                })
                thought_idx += 1
            elif message_idx < len(messages) and (thought_idx == len(thoughts) or messages[message_idx].created < thoughts[thought_idx].created) and (sentinel_idx == len(sentinels) or messages[message_idx].created < sentinels[sentinel_idx].created):
                result.append({
                    'entity': 'message',
                    'type': messages[message_idx].type,
                    'content': messages[message_idx].content,
                    'created': messages[message_idx].created
                })
                message_idx += 1
            else:
                result.append({
                    'entity': 'sentinel',
                    'type': sentinels[sentinel_idx].type,
                    'crated': sentinels[sentinel_idx].created,
                    'stage': sentinels[sentinel_idx].node.stage.code
                })
                sentinel_idx += 1
        return list_response(entity='replay', data=result)


class EndInterviewView(generics.GenericAPIView):
    serializer_class = InterviewSerializer

    def patch(self, request, id=None):
        interview = InterviewV2.objects.get(id=id)

        if request.data and request.data.get('status'):
            interview.status = InterviewStatus._value2member_map_.get(request.data.get('status'))
            if interview.status == InterviewStatus.COMPLETED:
                interview_completed.send(InterviewV2, interview, False)
        elif interview.status != InterviewStatus.COMPLETED:
            interview.status = InterviewStatus.INCOMPLETE
        interview.ended_datetime = timezone.now()
        interview.save()

        return Response(data=self.get_serializer(interview).data, status=status.HTTP_200_OK)


class InterviewListView(generics.ListAPIView):
    serializer_class = InterviewListSerializer
    # permission_classes = [permissions.IsAuthenticated, perms.IsMember, perms.HasRolePermissions]  ## TODO: add role permissions
    permission_classes = [permissions.IsAuthenticated, perms.IsMember]
    queryset = InterviewV2.objects.all()
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


class VideoRecordingView(generics.GenericAPIView):
    ## TODO: Kafka streams and blob store
    parser_classes = [parsers.MultiPartParser, parsers.FileUploadParser, parsers.FormParser, parsers.JSONParser]

    def post(self, request):
        # interview = Interview.objects.get(id=id)
        chunk = request.FILES.get('file')
        id = request.data.get('id')
        type = request.data.get('type', 'video')

        # ms = time.time_ns()
        path = settings.INTERVIEW_RECORDING.get(type.upper(), {}).get('CHUNK_PATH')
        if not path:
            path = f'interviews/{id}/{type}s/chunks/'
        else:
            path = path.format(interview=str(id))
        if not os.path.exists(path):
            os.makedirs(path)

        # path += chunk.name
        # path += f'/{ms}.wav'
        default_storage.save(path + chunk.name, chunk)

        return Response({
            'url': path
        }, status=status.HTTP_200_OK)


class InterviewResultView(generics.GenericAPIView):
    # permission_classes = [permissions.IsAuthenticated, perms.IsMember, perms.HasRolePermissions]  ## TODO: add role permissions
    permission_classes = [permissions.IsAuthenticated, perms.IsMember]

    def get(self, request, id=None, *args, **kwargs):
        try:
            interview = InterviewV2.objects.get(id=id)
        except InterviewV2.DoesNotExist:
            return error_response(
                errors={
                    'interview': ['not_exists']
                },
                message='Interview not found',
                status=status.HTTP_404_NOT_FOUND
            )

        feedback_engine = FeedbackEngine()
        try:
            feedback = feedback_engine.retrieve(interview)
        except Exception as e:
            # FIXME: use specific Exception
            logging.error(f"Error getting feedback: {e}")
            return error_response(
                errors={
                    'feedback': ['not_generated']
                },
                message='Interview feedback not found',
                status=status.HTTP_404_NOT_FOUND
            )

        interview_data = utils.interview_to_dict(interview)
        candidate_data = utils.candidate_to_dict(interview.candidate)
        activities = process_interview_activities(interview)

        html_string = render_to_string('interview/interview-result.html', {
            'interview': interview_data,
            'candidate': candidate_data,
            'activities': activities,
            'feedback': feedback,
        })

        # 3. Generate the PDF
        pdf_file = HTML(string=html_string).write_pdf()

        # 4. Create the HTTP response
        response = HttpResponse(pdf_file, content_type='application/pdf')
        response['Content-Disposition'] = 'inline; filename="report.pdf"'

        return response


class InterviewSummaryView(generics.GenericAPIView):
    # permission_classes = [permissions.IsAuthenticated, perms.IsMember, perms.HasRolePermissions]  ## TODO: add role permissions
    permission_classes = [permissions.IsAuthenticated, perms.IsMember]
    serializer_class = InterviewSummarySerializer
    queryset = InterviewV2.objects.all()

    def get_queryset(self):
        return self.queryset.filter(organization=self.request.organization)

    def get(self, request, *args, **kwargs):
        valid_status = [
            InterviewStatus.COMPLETED,
            InterviewStatus.SCHEDULED,
            InterviewStatus.PENDING,
            InterviewStatus.EXPIRED,
        ]

        # Get counts from the database
        status_counts_qs = (
            self.get_queryset()
            .filter(status__in=valid_status)
            .values('status')
            .annotate(total=Count('id'))
        )

        # Convert to a dictionary: {status: total}
        db_counts = {entry['status']: entry['total'] for entry in status_counts_qs}

        # Fill in missing statuses with 0
        full_counts = [
            {'status': status, 'total': db_counts.get(status, 0)}
            for status in valid_status
        ]

        return list_response(entity='status', data=full_counts)

class InterviewDailySummaryView(generics.GenericAPIView):
    # permission_classes = [permissions.IsAuthenticated, perms.IsMember, perms.HasRolePermissions]  ## TODO: add role permissions
    permission_classes = [permissions.IsAuthenticated, perms.IsMember]
    queryset = InterviewV2.objects.all()

    def get_queryset(self):
        return self.queryset.filter(organization=self.request.organization)

    def get(self, request, *args, **kwargs):
        start = request.query_params.get('start')
        end = request.query_params.get('end')

        if not start or not end:
            return error_response(
                errors={'missing': 'params_missing'},
                message="Missing 'start' or 'end' query parameter.",
                status=400
            )

        try:
            start_dt = parse_datetime(start)
            end_dt = parse_datetime(end)
            if not start_dt or not end_dt:
                raise ValueError()
        except Exception:
            return error_response(
                errors={'invalid': 'invalid_date'},
                message="Invalid datetime format. Expected ISO 8601 string.",
                status=400
            )

        base_qs = self.get_queryset()

        # Scheduled
        scheduled_qs = (
            base_qs
            .filter(created__date__gte=start_dt.date(), created__date__lte=end_dt.date())
            .annotate(date=TruncDate('created'))
            .values('date')
            .annotate(scheduled=Count('id'))
        )

        # Completed
        completed_qs = (
            base_qs
            .filter(status=InterviewStatus.COMPLETED,
                    ended_datetime__date__gte=start_dt.date(),
                    ended_datetime__date__lte=end_dt.date())
            .annotate(date=TruncDate('ended_datetime'))
            .values('date')
            .annotate(completed=Count('id'))
        )

        merged = defaultdict(lambda: {'scheduled': 0, 'completed': 0})

        for row in scheduled_qs:
            merged[row['date']]['scheduled'] = row['scheduled']

        for row in completed_qs:
            merged[row['date']]['completed'] = row['completed']

        # Build result for each date in the range, even if it's missing in merged
        date_cursor = start_dt.date()
        result = []
        while date_cursor <= end_dt.date():
            counts = merged[date_cursor]
            result.append({
                'date': date_cursor.strftime('%Y-%m-%d'),
                'scheduled': counts['scheduled'],
                'completed': counts['completed']
            })
            date_cursor += timedelta(days=1)

        return list_response(entity='summary', data=result)


class InterviewRecentUpcomingView(generics.GenericAPIView):
    # permission_classes = [permissions.IsAuthenticated, perms.IsMember, perms.HasRolePermissions]  ## TODO: add role permissions
    permission_classes = [permissions.IsAuthenticated, perms.IsMember]
    queryset = InterviewV2.objects.all()
    serializer_class = InterviewListSerializer

    def get_queryset(self):
        return self.queryset.filter(organization=self.request.organization)

    def get(self, request, *args, **kwargs):
        limit = self.request.query_params.get('limit', 10)
        completed_interviews = (
            self.get_queryset()
            .filter(status=InterviewStatus.COMPLETED)
            .order_by('-ended_datetime')[:limit]
        )

        upcoming_interviews = (
            self.get_queryset()
            .filter(status__in=(InterviewStatus.SCHEDULED, InterviewStatus.PENDING), created__gte=timezone.now())
            .order_by('created')[:limit]
        )

        return Response(
            {
                'completed': self.get_serializer(completed_interviews, many=True).data,
                'upcoming': self.get_serializer(upcoming_interviews, many=True).data
            },
            status=status.HTTP_200_OK
        )


class InterviewsScheduledOnView(generics.ListAPIView):
    # permission_classes = [permissions.IsAuthenticated, perms.IsMember, perms.HasRolePermissions]  ## TODO: add role permissions
    permission_classes = [permissions.IsAuthenticated, perms.IsMember]
    queryset = InterviewV2.objects.all()
    serializer_class = InterviewListSerializer

    def get_queryset(self):
        date_str = self.request.query_params.get('date')
        if not date_str:
            return InterviewV2.objects.none()

        try:
            # Parse the UTC datetime sent from frontend (already in ISO format)
            iso_datetime = parse_datetime(date_str)
            if not iso_datetime:
                return InterviewV2.objects.none()
        except Exception:
            return InterviewV2.objects.none()

        # Select interviews where the provided datetime is between start and end
        return self.queryset.filter(
            organization=self.request.organization,
            start_datetime__lte=iso_datetime,
            end_datetime__gte=iso_datetime,
            status__in=(InterviewStatus.PENDING, InterviewStatus.SCHEDULED)
        ).order_by('end_datetime')