import abc
from functools import lru_cache
from typing import Dict

from django.conf import settings
from django.db.models import Q

from rasengan.commons.utils import load_pdf_as_str
from rasengan.graph.enums import NodeType
from rasengan.graph.models import NodeV2
from rasengan.prompt.prompts import DSA_QUESTIONS_HISTORY_V2, DSA_CORRECT_CODE, DSA_INCORRECT_CODE, \
    DSA_QUESTION_EXAMPLE, THOUGHT_TEMPLATE
from susanoo.interview.models import InterviewV2
from susanoo.message.enums import MessageType
from susanoo.message.models import MessageV2, Thought, Sentinel
from susanoo.stage.enums import StageType, Module
from susanoo.stage.models import StageV2

## TODO: In all the retrievers that retrieve file from blob store cache them into redis!!

class ContextExtractor(abc.ABC):
    def __init__(self, interview: InterviewV2, **kwargs):
        self.interview = interview

    def retrieve_context(self, node: NodeV2, stage: StageV2) -> Dict:
        extra_variables = {}
        if node.type == NodeType.SUPERVISOR:
            stage_instances = StageV2.objects.filter(type=stage.type, stage_id__gte=stage.stage_id).order_by(
                'stage_id').all()
            stages = '\n'.join([
                f'{stage.stage_id}. {stage.description}'
                for stage in stage_instances
            ])
            extra_variables['stages'] = stages
            extra_variables['stage_start'] = stage_instances.first().stage_id
            extra_variables['stage_end'] = stage_instances.last().stage_id
            extra_variables['next_stages'] = ', '.join([stage.stage_id for stage in stage_instances])
        return extra_variables


class DSAContextExtractor(ContextExtractor):
    @lru_cache
    def read_resume(self, file):
        return load_pdf_as_str(file)

    def retrieve_context(self, node: NodeV2, stage: StageV2) -> Dict:
        extra_variables = {
            'dsa_questions': '',
            'dsa_example': '',
            'incorrect_code': '',
            'code': '',
            'candidate_name': self.interview.candidate.get_full_name(),
            'company_name': self.interview.metadata.get('company', {'name': None}).get('name'),
            'company_business': self.interview.metadata.get('company', {'business': None}).get('business'),
            'company_values': self.interview.metadata.get('company', {'value': None}).get('value'),
            'job_role': self.interview.metadata.get('job', {'role': None}).get('role'),
            'job_description': self.interview.metadata.get('job', {'description': None}).get('description'),
            **super().retrieve_context(node, stage)
        }
        if stage.type == StageType.SWE and stage.code == 'RESUME_DISCUSSION':
            if settings.SETTINGS_MODULE.find('local') > 0:
                resume = self.read_resume(
                    self.interview.resume.path if self.interview.resume else self.interview.candidate.resume.path)
            else:
                resume = self.read_resume(
                    self.interview.resume.url if self.interview.resume else self.interview.candidate.resume.url)

            extra_variables['resume'] = resume
        elif stage.type == StageType.DSA and stage.code == 'DSA_QUESTION':
            messages = MessageV2.objects.filter(
                interview=self.interview,
                node=node,
                type=MessageType.AI
            ).order_by('created')
            dsa_questions = '\n'.join([f'{idx + 1}. {message.content}' for idx, message in enumerate(messages)])
            extra_variables['dsa_questions'] = DSA_QUESTIONS_HISTORY_V2.format(dsa_questions=dsa_questions)
            extra_variables['dsa_example'] = DSA_QUESTION_EXAMPLE
        elif stage.type == StageType.DSA and stage.code == 'DSA_CODE':
            extra_variables['incorrect_code'] = DSA_CORRECT_CODE
            last_code_status = MessageV2.objects.filter(interview=self.interview, stage__type=StageType.DSA,
                                                        stage__code='CHECK_CODE',
                                                        type=MessageType.AI, stage__stage_id='4').order_by('-created').first()
            reason = last_code_status.metadata.get('reason')
            if last_code_status is not None and last_code_status.content == 'false':
                extra_variables['incorrect_code'] = DSA_INCORRECT_CODE.format(reason=reason)
        elif node.stage.type == StageType.DSA and stage.code == 'CHECK_CODE':
            print("##$#$#$#$#$#$# GETTING CODE #$#$#$#$#$#$#$")
            code = MessageV2.objects.filter(interview=self.interview, stage__type=StageType.DSA,
                                            stage__code='ASK_FOR_CODE',
                                            stage__stage_id='3', type=MessageType.USER).order_by('-created').first()
            if code:
                extra_variables['code'] = code.content

        last_sentinel = Sentinel.objects.filter(
            interview=self.interview
        ).order_by('-created').first()

        thought = ''
        if last_sentinel:
            last_thought = Thought.objects.filter(
                interview=self.interview
            ).order_by('-created').first()

            if last_thought:
                thought = THOUGHT_TEMPLATE.format(thought=last_thought.content)
        extra_variables['thought'] = thought
        return extra_variables


class PitchContextExtractor(ContextExtractor):
    @lru_cache
    def read_summary(self, file):
        return load_pdf_as_str(file)

    def retrieve_context(self, node: NodeV2, stage: StageV2):
        return {
            'candidate_name': self.interview.candidate.get_full_name(),
            'startup_name': self.interview.candidate.metadata.get('startup', {'startup': None}).get('name'),
            'startup_sector': self.interview.candidate.metadata.get('startup', {'startup': None}).get('sector'),
            'startup_summary': self.read_summary(self.interview.candidate.resume.path if settings.SETTINGS_MODULE.find('local') > 0 else self.interview.candidate.resume.url),
            **super().retrieve_context(node, stage)
        }


class TechContextExtractor(ContextExtractor):
    @lru_cache
    def read_resume(self, file):
        return load_pdf_as_str(file)

    def retrieve_context(self, node: NodeV2, stage: StageV2) -> Dict:
        extra_variables = {
            'dsa_questions': '',
            'dsa_example': '',
            'incorrect_code': '',
            'code': '',
            'module': stage.module.title(),
            'candidate_name': self.interview.candidate.get_full_name(),
            # 'company_name': self.interview.metadata.get('company', {'name': None}).get('name'),
            # 'company_business': self.interview.metadata.get('company', {'business': None}).get('business'),
            # 'company_values': self.interview.metadata.get('company', {'value': None}).get('value'),
            # 'job_role': self.interview.metadata.get('job', {'role': None}).get('role'),
            # 'job_description': self.interview.metadata.get('job', {'description': None}).get('description'),
            'company_name': None,
            'company_business': None,
            'company_values': None,
            'job_role': self.interview.job.role,
            'job_description': self.interview.job.description,
            'instructions': '',
        }

        # context for supervisor
        if node.type == NodeType.SUPERVISOR:
            # TODO: Look into a better way of doing this, maybe by storing nodes in graph
            if stage.module == Module.BASE:
                # stage_instances = StageV2.objects.filter(
                #     Q(stage__in=self.interview.stages, stage_id__gte=stage.stage_id) |
                #     Q(required=True, stage_id__gte=stage.stage_id)
                # ).order_by('stage_id').all()
                stage_instances = self.interview.job.stages.filter(stage_id__gte=stage.stage_id).order_by('stage_id').all()
            else:
                stage_instances = StageV2.objects.filter(module=stage.module, stage_id__gte=stage.stage_id).order_by(
                'stage_id').all()
            stages = '\n'.join([
                f'{stage.stage_id}. {stage.description}'
                for stage in stage_instances
            ])
            extra_variables['stages'] = stages
            extra_variables['next_stages'] = ', '.join([stage.stage_id for stage in stage_instances])

        if stage.module == Module.BASE and stage.code == 'RESUME_DISCUSSION':
            if settings.SETTINGS_MODULE.find('local') > 0:
                resume = self.read_resume(
                    self.interview.resume.path if self.interview.resume else self.interview.candidate.resume.path)
            else:
                resume = self.read_resume(
                    self.interview.resume.url if self.interview.resume else self.interview.candidate.resume.url)

            extra_variables['resume'] = resume
        elif stage.module == Module.DSA and stage.code == 'DSA_QUESTION':
            messages = MessageV2.objects.filter(
                interview=self.interview,
                node=node,
                type=MessageType.AI
            ).order_by('created')
            dsa_questions = '\n'.join([f'{idx + 1}. {message.content}' for idx, message in enumerate(messages)])
            extra_variables['dsa_questions'] = DSA_QUESTIONS_HISTORY_V2.format(dsa_questions=dsa_questions)
            extra_variables['dsa_example'] = DSA_QUESTION_EXAMPLE
        elif stage.module == Module.DSA and stage.code == 'DSA_CODE':
            extra_variables['incorrect_code'] = DSA_CORRECT_CODE
            last_code_status = MessageV2.objects.filter(interview=self.interview, stage__type=StageType.DSA,
                                                        stage__code='CHECK_CODE',
                                                        type=MessageType.AI).order_by(
                '-created').first()
            reason = last_code_status.metadata.get('reason')
            if last_code_status is not None and last_code_status.content == 'false':
                extra_variables['incorrect_code'] = DSA_INCORRECT_CODE.format(reason=reason)
        elif node.stage.module == Module.DSA and stage.code == 'CHECK_CODE':
            print("##$#$#$#$#$#$# GETTING CODE #$#$#$#$#$#$#$")
            code = MessageV2.objects.filter(interview=self.interview, stage__type=StageType.DSA,
                                            stage__code='ASK_FOR_CODE',
                                            type=MessageType.USER).order_by('-created').first()
            if code:
                extra_variables['code'] = code.content

        if stage.module != Module.DSA:
            extra_variables['instructions'] = 'Do not skip any stage. All of them are required.'

        last_sentinel = Sentinel.objects.filter(
            interview=self.interview
        ).order_by('-created').first()

        thought = ''
        if last_sentinel and stage.supervised:
            last_thought = Thought.objects.filter(
                interview=self.interview,
                created__gte=last_sentinel.created      # Added created filter by last sentinel to get thought for current module?
            ).order_by('-created').first()

            if last_thought:
                thought = THOUGHT_TEMPLATE.format(thought=last_thought.content)
        extra_variables['thought'] = thought

        if stage.metadata:
            extra_variables.update(stage.metadata.get('variables', {}))

        return extra_variables
