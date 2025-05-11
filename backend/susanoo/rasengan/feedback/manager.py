import abc
from typing import List, Dict

from django.conf import settings
from django.db.models import Q

from langchain_core.messages import SystemMessage, convert_to_messages
from langchain_core.output_parsers import SimpleJsonOutputParser
from langchain_core.prompt_values import ChatPromptValue

from common.utils import parse_generation
from rasengan.llm.llms import LLMFactory
from rasengan.prompt.prompts import FEEDBACK_TEMPLATE_V3, PITCH_FEEDBACK_TEMPLATE
from rasengan.commons.dataclasses import GenerationResponse
from rasengan.commons.utils import load_pdf_as_str, get_conversation_history, get_conversation_history_for_stage
from susanoo.feedback.api.v2.serializers import InterviewFeedbackSerializer
from susanoo.interview.api.v2.serializers import InterviewSerializer
from susanoo.interview.models import InterviewV2
from susanoo.message.enums import MessageType, SentinelType
from susanoo.provider.models import Provider, LLM
from susanoo.stage.enums import StageType, Module
from susanoo.usage.enums import UsageType
from susanoo.usage.models import UsageV2


class FeedbackManager(abc.ABC):
    def __init__(self, **kwargs):
        self.interview = None
        self.json_parser = SimpleJsonOutputParser()

    def _setup(self, provider: str, model: str):
        try:
            provider = Provider.objects.get(provider_id=provider)
            self.llm = LLM.objects.get(provider=provider, model=model)
            self.model = LLMFactory.create_cerebras()
        except Provider.DoesNotExist:
            provider = Provider.objects.get(provider_id='groq')
            self.llm = LLM.objects.get(provider=provider, model='llama3-70b-8192')
        self.model = LLMFactory.create(llm=self.llm)

    @abc.abstractmethod
    def generate(self, provider: str, model: str, interview: InterviewV2):
        raise NotImplementedError

    @abc.abstractmethod
    def retrieve(self, interview: InterviewV2):
        raise NotImplementedError


class SWEFeedbackManager(FeedbackManager):
    PROMPT = FEEDBACK_TEMPLATE_V3

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def generate(self, provider: str, model: str, interview: InterviewV2) -> Dict[str, GenerationResponse]:
        self._setup(provider, model)
        self.interview = interview

        # if settings.SETTINGS_MODULE.find('local') > 0:
        #     resume = load_pdf_as_str(
        #         self.interview.resume.path if self.interview.resume else self.interview.candidate.resume.path)
        # else:
        #     resume = load_pdf_as_str(
        #         self.interview.resume.url if self.interview.resume else self.interview.candidate.resume.url)

        feedbacks = {}
        ignore_stages = ['INTRODUCTION', 'QUESTION_INTERVIEWER', 'END']
        for stage in self.interview.job.stages.filter(~Q(code__in=ignore_stages)).all():
            variables = {
                'stage': stage.description,
                'conversation_history': get_conversation_history_for_stage(interview, stage),
            }

            messages = [
                SystemMessage(content=self.PROMPT.format(**variables))
            ]
            prompt = ChatPromptValue(messages=convert_to_messages(messages))
            response = self.model.invoke(prompt)
            response = parse_generation(prompt.to_string(), response)

            UsageV2.objects.create(
                type=UsageType.FEEDBACK,
                interview=self.interview,
                llm=self.llm,
                input=response.input,
                output=response.output,
                prompt_tokens=response.usage.input_tokens,
                completion_tokens=response.usage.output_tokens,
                metadata={
                    'type': 'interview_feedback',
                    'id': str(self.interview.id)
                }
            )

            response.output = self.json_parser.parse(response.output)
            feedbacks[stage.code] = response
        return feedbacks

    def retrieve(self, interview: InterviewV2):
        # DSA details
        messages = interview.interview_messages_v2.filter(stage__type=StageType.DSA).order_by('created')
        ai_messages = messages.filter(type=MessageType.AI)
        user_messages = messages.filter(type=MessageType.USER)

        sentinels = interview.interview_sentinels.filter(node__stage__type=StageType.DSA).order_by('created')
        start_sentinels = sentinels.filter(type=SentinelType.START)
        end_sentinels = sentinels.filter(type=SentinelType.END)

        response = {}
        feedbacks = {}

        coding_details = []
        coding_questions = min(len(start_sentinels), len(end_sentinels))
        if len(start_sentinels.all()) > 0 and len(end_sentinels.all()) > 0:
            feedback = None
            feedback_instance = interview.interview_feedbacksV3.filter(stage__code='DSA').first()
            if feedback_instance:
                feedback = {
                    'detail': feedback_instance.detail,
                    'score': feedback_instance.score,
                    'level': feedback_instance.level
                }

            counting_sentinels = list(start_sentinels.all())
            counting_sentinels.append(end_sentinels.last())
            for i in range(len(counting_sentinels)-1):
                ai_coding = ai_messages.filter(created__range=(counting_sentinels[i].created, counting_sentinels[i+1].created))
                user_coding = user_messages.filter(created__range=(counting_sentinels[i].created, counting_sentinels[i+1].created))
                coding_details.append({
                    'question': (question := ai_coding.filter(stage__code='DSA_QUESTION').first()) and question.content,
                    'approach': (
                        question := user_coding.filter(stage__code='HINTS_&_EFFICIENCY').last()
                        if user_coding.filter(stage__code='HINTS_&_EFFICIENCY').last()
                        else user_coding.filter(stage__code='DSA_QUESTION').last()
                    ) and question.content,
                    'code': (code := user_coding.filter(stage__code='ASK_FOR_CODE').last()) and code.content,
                    'hints': ai_coding.filter(stage__code='HINT_&_EFFICIENCY').count(),
                    'retries': user_coding.filter(stage__code='ASK_FOR_CODE').count(),
                    'correct': (last_code_check := ai_coding.filter(
                        stage__code='CHECK_CODE').last()) and last_code_check.content.lower() == 'true'
                })
            if len(coding_details):
                response['coding'] = {
                    'discussion': coding_details,
                    'feedback': feedback
                }

        # print(coding_details)
        # resume_discussion = []
        # messages = interview.interview_messages_v2.filter(stage__code='RESUME_DISCUSSION').order_by('created')
        # ai_messages = messages.filter(type=MessageType.AI)
        # user_messages = messages.filter(type=MessageType.USER)
        # resume_questions = min(len(ai_messages), len(user_messages))
        # for i in range(resume_questions):
        #     resume_discussion.append({
        #         'question': ai_messages[i].content,
        #         'answer': user_messages[i].content
        #     })

        skip_stages = [
            'END'
        ]
        for stage in interview.job.stages.filter(~Q(code__in=skip_stages) & Q(module=Module.BASE)).order_by('stage_id'):
            messages = interview.interview_messages_v2.filter(stage__code=stage.code).order_by('created')
            if messages.count() == 0:
                continue
            ai_messages = messages.filter(type=MessageType.AI)
            user_messages = messages.filter(type=MessageType.USER)
            resume_questions = min(len(ai_messages), len(user_messages))

            discussion = []
            for i in range(resume_questions):
                audio_url = user_messages[i].audio.url if user_messages[i].audio else None
                if audio_url and settings.SETTINGS_MODULE.find('local') >= 0:
                    audio_url = f'http://localhost:8000{audio_url}'
                discussion.append({
                    'question': ai_messages[i].content,
                    'answer': user_messages[i].content,
                    'audio': audio_url
                })

            feedback = None
            feedback_instance = interview.interview_feedbacksV3.filter(stage__code=stage.code).first()
            if feedback_instance:
                feedback = {
                    'detail': feedback_instance.detail,
                    'score': feedback_instance.score,
                    'level': feedback_instance.level
                }
            response[stage.code.lower()] = {
                'discussion': discussion,
                'feedback': feedback
            }

        return response


class PitchFeedbackManager(FeedbackManager):
    PROMPT = PITCH_FEEDBACK_TEMPLATE

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def generate(self, provider: str, model: str, interview: InterviewV2) -> GenerationResponse:
        self._setup(provider, model)
        self.interview = interview

        if settings.SETTINGS_MODULE.find('local') > 0:
            summary = load_pdf_as_str(
                self.interview.resume.path if self.interview.resume else self.interview.candidate.resume.path)
        else:
            summary = load_pdf_as_str(
                self.interview.resume.url if self.interview.resume else self.interview.candidate.resume.url)

        variables = {
            'startup_summary': summary,
            'conversation_history': get_conversation_history(self.interview)
        }

        messages = [
            SystemMessage(content=self.PROMPT.format(**variables))
        ]
        prompt = ChatPromptValue(messages=convert_to_messages(messages))
        response = self.model.invoke(prompt)
        response = parse_generation(prompt.to_string(), response)

        UsageV2.objects.create(
            type=UsageType.FEEDBACK,
            interview=self.interview,
            llm=self.llm,
            input=response.input,
            output=response.output,
            prompt_tokens=response.usage.input_tokens,
            completion_tokens=response.usage.output_tokens,
            metadata={
                'type': 'pitch_feedback',
                'id': str(self.interview.id)
            }
        )

        response.output = self.json_parser.parse(response.output)
        return response

    def retrieve(self, interview: InterviewV2):
        raise NotImplementedError
