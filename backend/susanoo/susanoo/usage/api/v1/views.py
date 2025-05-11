from django.conf import settings

import decimal
import requests
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from common.responses import error_response
from common.serializers import DummySwaggerSerializer
from susanoo.interview.enums import InterviewStatus
from susanoo.interview.models import Interview
from susanoo.message.enums import MessageType
from susanoo.message.models import Message
from susanoo.usage.models import Usage


def _get_linguistics_cost(start, end, tokens):
    response = requests.request(
        method='GET',
        url=f'{settings.LINGUISTICS_URL}/usage',
        params={
            'start': start,
            'end': end,
            'tokens': tokens
        }
    )
    return response.json()

class CostView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = None
    swagger_fake_view = True

    def get_serializer_class(self):
        if getattr(self, 'swagger_fake_view', False):
            return DummySwaggerSerializer  # Just for docs
        raise NotImplementedError

    def get(self, request):
        interview_id = request.GET.get('interview')

        if not interview_id:
            return error_response(
                message='Interview id is required',
                errors={
                    'interview': ['required']
                }
            )

        interview = Interview.objects.get(id=interview_id)
        if interview.status != InterviewStatus.COMPLETED:
            return error_response(
                message='You can only trace interviews that are completed.',
                errors={
                    'interview': ['incomplete']
                }
            )

        usages = Usage.objects.filter(interview__id=interview_id)

        trace_per_model = {}
        for usage in usages:
            trace = trace_per_model.get(usage.llm.model, {})
            trace['input_tokens'] = trace.get('input_tokens', 0) + usage.prompt_tokens
            trace['output_tokens'] = trace.get('output_tokens', 0) + usage.completion_tokens
            trace['input_cost'] = trace['input_tokens'] * usage.llm.input_price
            trace['output_cost'] = trace['output_tokens'] * usage.llm.output_price
            trace_per_model[usage.llm.model] = trace

        total_cost = decimal.Decimal(0.0)
        for llm, values in trace_per_model.items():
            total_cost += values['input_cost'] + values['output_cost']

        tokens = 0
        for message in Message.objects.filter(interview=interview, type=MessageType.AI).all():
            tokens += len(message.content)
        linguistics_usages = _get_linguistics_cost(interview.started_datetime, interview.ended_datetime, tokens)

        for linguistics_usage in linguistics_usages.get('usage'):
            total_cost += decimal.Decimal(linguistics_usage.get('usage'))
            trace_per_model[linguistics_usage.get('model')] = {
                'cost': linguistics_usage.get('usage')
            }

        trace_per_model['total_cost'] = total_cost
        return Response(trace_per_model, status=status.HTTP_200_OK)

