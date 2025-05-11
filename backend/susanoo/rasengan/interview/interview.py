import abc
from typing import List, Dict, Any, Optional

from django.forms import model_to_dict
from langchain.callbacks import FileCallbackHandler
from langchain.chains.base import Chain
from langchain.chains.llm import LLMChain
from langchain_community.callbacks import get_openai_callback
from langchain_core.callbacks import Callbacks, CallbackManagerForChainRun
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.output_parsers import BaseOutputParser

from django.utils import timezone
from rasengan.graph.enums import NodeType, MemoryLevel
from rasengan.graph.models import Edge, ConditionalEdge
from rasengan.llm.chains import ChainFactory
from rasengan.llm.llms import LLMFactory
from rasengan.llm.parsers import RegexJsonOutputParser
from susanoo.interview.models import Interview
from susanoo.message.enums import MessageType
from susanoo.message.models import Message
from susanoo.provider.models import LLMConfig
from susanoo.stage.enums import StageType
from susanoo.stage.models import Stage
from susanoo.usage.enums import UsageType
from susanoo.usage.models import Usage


def get_llm_config_dict(config: LLMConfig) -> Dict[str, Any]:
    print(config)
    return model_to_dict(config, fields=['temperature', ])


def remove_tokens(generation: str) -> str:
    tokens = ['<END_OF_TURN>', '<END_OF_INTERVIEW>']
    for token in tokens:
        generation = generation.replace(token, '')
    return generation.strip()


class BaseInterviewExecutor(abc.ABC):
    def __init__(self, **kwargs):
        self.interview = None
        self.callbacks = None
        self.json_parser: BaseOutputParser = RegexJsonOutputParser()
        self.llm_factory = LLMFactory()
        self.chain_factory = ChainFactory()

    @property
    def input_keys(self) -> List[str]:
        return []

    @property
    def output_keys(self) -> List[str]:
        return []

    @abc.abstractmethod
    def _prepare_prompt_values(self):
        raise NotImplementedError()

    def _prepare_chain(self) -> LLMChain:
        node = self.interview.node
        llm = None
        if node.llm:
            # llm = self.llm_factory.create(llm=node.llm, **get_llm_config_dict(node.llm_config))
            llm = self.llm_factory.create_with_fallback(
                provider=node.llm.provider.provider_id,
                model=str(node.llm.model),
                **get_llm_config_dict(node.llm_config)
            )
        stage = self.interview.stage
        return self.chain_factory.create(
            interview=self.interview,
            type=node.type,
            stage_type=stage.type,
            stage_id=stage.stage_id,
            llm=llm,
            # prompt=node.prompt,
            prompt_values=self._prepare_prompt_values(),
            callbacks=[FileCallbackxHandler(filename=f'./logs/{self.interview.id}.log', mode='a+')],
        )

    def stage_analyzer(self, chain) -> Dict[str, str]:
        stage = self.interview.stage
        # stage_id = stage.stage_id
        # if self.interview.node.stage.type != stage.type and self.interview.node.stage.type == 'BASE':
        #     print(f'Overriding stage - {stage_id} -> ', end='')
        #     stage_id = '3' # Override to base graph dsa stage
        #     print(stage_id)

        raw_response = chain.run({})
        response = self.json_parser.parse(raw_response)

        next_stage = str(response.get('stage', '1')).strip()
        if (next_stage == stage.stage_id and
                self.get_current_stage_duration() > stage.timeout):
            print(f'##* -> Force moving from [{stage.type}]{next_stage} - to - ', end='')
            next_stage = str(int(next_stage) + 1)
            print(f'[{stage.type}]{next_stage}')

        print(f'--[{stage.type}]Stage Analyzer: Moving from ({stage.stage_id}) -> ({next_stage})')

        return {
            'input': chain.prompt,
            'raw_output': raw_response,
            'output': next_stage
        }

    def worker(self, chain) -> Dict[str, str]:
        stage = self.interview.stage
        interviewer = self.interview.interviewer

        raw_response = chain.run({})

        response = self.json_parser.parse(raw_response)
        ai_message = response.get('response')

        # if '<END_OF_TURN>' not in ai_message:
        #     ai_message += ' <END_OF_TURN>'
        ai_message = ai_message.replace('<END_OF_TURN>', '')
        ai_message = ai_message.replace('<END_OF_INTERVIEW>', '')
        ai_message = ai_message.strip()

        print(f'--[{stage.type}]Worker ({self.interview.node}) -> {ai_message}')

        self.save_message(ai_message, MessageType.AI)
        return {
            'input': chain.prompt,
            'raw_output': raw_response,
            'output': response.get('response')
        }

    def step(self, node) -> str:
        """Step to process ai node."""
        chain = self._prepare_chain()

        print(f'\n\nCurrent Node: {node} [{node.type}]')

        output = None
        if chain is not None:
            # TODO: Create custom callback to get usage, this will only work if the llms save
            #  usage as it is done in OpenAI llms
            with get_openai_callback() as trace:
                if node.type == NodeType.SUPERVISOR:
                    response = self.stage_analyzer(chain=chain)
                elif node.type == NodeType.WORKER:
                    response = self.worker(chain=chain)

                input = response.get('input')
                output = response.get('output')
                raw_output = response.get('raw_output')
                print(f'output: {response}')

                Usage.objects.create(
                    type=UsageType.INTERVIEW,
                    interview=self.interview,
                    llm=node.llm,
                    input=input,
                    output=raw_output,
                    prompt_tokens=trace.prompt_tokens,
                    completion_tokens=trace.completion_tokens,
                )

        try:
            edge = Edge.objects.get(start_node=node)
        except Edge.DoesNotExist:
            try:
                edge = ConditionalEdge.objects.get(start_node=node, condition=output)
            except ConditionalEdge.DoesNotExist:
                edge = None
        if edge:
            node = edge.end_node
        else:
            node = self.interview.job.graph.end_node

        print(f'Next Node: {node} [{node.type}] via edge - {edge}')

        if node.type != NodeType.SUPERVISOR and node.type != NodeType.IO:
            self.interview.stage = node.stage

        # print(f'Output: {output}\nStage: {self.interview.stage}\n')

        self.interview.node = node
        self.interview.save()
        return output

    def human_step(self, input: str):
        """Human step to process user input."""
        # user_message = input + ' <END_OF_TURN>'
        user_message = input.strip()
        self.save_message(user_message, MessageType.USER)
        return input


class _InterviewExecutor(BaseInterviewExecutor):
    def _prepare_prompt_values(self):
        return {}

    def get_current_stage_duration(self):
        if self.interview.stage.stage_id == '3':
            first_message = Message.objects.filter(interview=self.interview, stage__type='DSA').order_by(
                'created').first()
        else:
            first_message = \
                Message.objects.filter(interview=self.interview, stage=self.interview.stage).order_by('created').first()

        if not first_message:
            return 0
        return (timezone.now() - first_message.created).total_seconds()

    def get_dsa_questions(self):
        questions = Message.objects.filter(interview=self.interview, stage__type='DSA', stage__stage_id='1')
        return '\n'.join([question.content for question in questions.all()])

    def get_stage_timeout(self, stage):
        if stage.type == 'DSA':
            if stage.stage_id == '1':
                return stage.timeout
            return Stage.objects.get(stage_id='3', type='BASE').timeout
        return stage.timeout

    def get_code(self):
        codes = Message.objects.filter(interview=self.interview, stage__type='DSA', stage__stage_id='3').order_by(
            '-created').all()
        if len(codes):
            return codes[0].content
        return None

    def save_message(self, content, type):
        return Message.objects.create(type=type, content=content, stage=self.interview.stage, interview=self.interview)

    def get_stages(self, stage_type):
        stages = Stage.objects.filter(type=self.interview.node.stage.type).order_by('stage_id').all()
        return '\n'.join([
            f'{stage.stage_id}. {stage.description}'
            for stage in stages
        ])

    def get_conversation_history(self, level, return_message=False):
        if level == 'STAGE':
            messages = Message.objects.filter(interview=self.interview, stage=self.interview.stage).order_by(
                'created').all()
        elif level == 'ISOLATED':
            messages = Message.objects.filter(interview=self.interview, stage__type=self.interview.stage.type)
            last_stage = Stage.objects.filter(type=self.interview.stage.type).order_by('-stage_id').first()
            last_messages = messages.filter(stage=last_stage).order_by('-created')
            if last_messages.count() >= 1:
                last_first_message = last_messages.first()
                messages = messages.filter(created__gt=last_first_message.created)
            messages = messages.all()
        else:
            messages = Message.objects.filter(interview=self.interview).order_by('created').all()
        if return_message:
            return [
                AIMessage(content=message.content) if messages.type == 'AI' else HumanMessage(content=message.content)
                for message in messages
            ]

        return '\n'.join([
            f'{self.interview.interviewer.get_full_name()}: {message.content} <END_OF_TURN>' if message.type == 'AI' else f'Candidate: {message.content} <END_OF_TURN>'
            for message in messages
        ])

    def stage_analyzer(self, chain) -> Dict[str, str]:
        stage = self.interview.stage
        # stage_id = stage.stage_id
        # if self.interview.node.stage.type != stage.type and self.interview.node.stage.type == 'BASE':
        #     print(f'Overriding stage - {stage_id} -> ', end='')
        #     stage_id = '3' # Override to base graph dsa stage
        #     print(stage_id)

        raw_response = chain.run(
            conversation_stage_id=stage.stage_id,
            conversation_history=self.get_conversation_history('STAGE' if stage.type == 'BASE' else 'ISOLATED'),
            stage_timeout=self.get_stage_timeout(stage),
            stage_duration=self.get_current_stage_duration()
        )
        response = self.json_parser.parse(raw_response)

        next_stage = str(response.get('stage', '1')).strip()
        if (next_stage == stage.stage_id and
                self.get_current_stage_duration() > stage.timeout):
            next_stage = str(int(next_stage) + 1)

        prompt = chain.prompt.format(
            conversation_stage_id=stage.stage_id,
            conversation_history=self.get_conversation_history('STAGE' if stage.type == 'BASE' else 'ISOLATED'),
            stage_timeout=self.get_stage_timeout(stage),
            stage_duration=self.get_current_stage_duration()
        )

        return {
            'input': prompt,
            'raw_output': raw_response,
            'output': next_stage
        }

    def worker(self, chain) -> Dict[str, str]:
        stage = self.interview.stage
        interviewer = self.interview.interviewer

        print(
            f"In worker -> stage -> {stage} -> node -> {self.interview.node.stage} -> {self.interview.node.memory_level}")

        raw_response = chain.run(
            conversation_stage=stage.description,
            conversation_history=self.get_conversation_history(
                self.interview.node.memory_level if stage.type == 'BASE' else 'ISOLATED'),
            stage_name=stage.name,
            interviewer_name=interviewer.get_full_name(),
            interviewer_role=interviewer.role,
            company_name=self.interview.metadata.get('company', {'name': None}).get('name'),
            company_business=self.interview.metadata.get('company', {'business': None}).get('business'),
            company_values=self.interview.metadata.get('company', {'value': None}).get('value'),
            conversation_purpose=stage.purpose,
            conversation_type='call',
            job_role=self.interview.metadata.get('job', {'role': None}).get('role'),
            job_description=self.interview.metadata.get('job', {'description': None}).get('description'),
        )

        response = self.json_parser.parse(raw_response)
        ai_message = response.get('response')

        # if '<END_OF_TURN>' not in ai_message:
        #     ai_message += ' <END_OF_TURN>'
        ai_message = ai_message.replace('<END_OF_TURN>', '')
        ai_message = ai_message.replace('<END_OF_INTERVIEW>', '')
        ai_message = ai_message.strip()

        prompt = chain.prompt.format(
            conversation_stage=stage.description,
            conversation_history=self.get_conversation_history(
                self.interview.node.memory_level if stage.type == 'BASE' else 'ISOLATED'),
            stage_name=stage.name,
            interviewer_name=interviewer.get_full_name(),
            interviewer_role=interviewer.role,
            company_name=self.interview.metadata.get('company', {'name': None}).get('name'),
            company_business=self.interview.metadata.get('company', {'business': None}).get('business'),
            company_values=self.interview.metadata.get('company', {'value': None}).get('value'),
            conversation_purpose=stage.purpose,
            conversation_type='call',
            job_role=self.interview.metadata.get('job', {'role': None}).get('role'),
            job_description=self.interview.metadata.get('job', {'description': None}).get('description'),
        )

        self.save_message(ai_message, MessageType.AI)
        return {
            'input': prompt,
            'raw_output': raw_response,
            'output': response.get('response')
        }

    def _call(
            self,
            interview,
            inputs: Dict[str, Any] = None,
            run_manager: Optional[CallbackManagerForChainRun] = None
    ) -> Dict[str, Any]:
        self.interview = interview
        time_spent = self.get_current_stage_duration()

        if inputs and inputs.get('content'):
            user_message = inputs.get('content')
            self.human_step(user_message)

        output = None
        while self.interview.node.type != NodeType.IO and self.interview.node != self.interview.job.graph.end_node:
            output = self.step(self.interview.node)
            time_spent = self.get_current_stage_duration()
        if self.interview.node.type == NodeType.IO:
            self.step(self.interview.node)

        return {
            'output': remove_tokens(output),
            'time_spent': time_spent
        }

    def call(self, interview, inputs: Dict[str, Any] = None, run_manager: Optional[CallbackManagerForChainRun] = None):
        return self._call(interview, inputs, run_manager)


class InterviewExecutor(BaseInterviewExecutor):
    def get_current_stage_duration(self):
        if self.interview.stage.stage_id == '3':
            first_message = Message.objects.filter(interview=self.interview, stage__type=StageType.DSA).order_by(
                'created').first()
        else:
            first_message = \
                Message.objects.filter(interview=self.interview, stage=self.interview.stage).order_by('created').first()

        if not first_message:
            return 0
        return (timezone.now() - first_message.created).total_seconds()

    def get_dsa_questions(self, return_list=False):
        questions = Message.objects.filter(interview=self.interview, stage__type=StageType.DSA, stage__stage_id='1', type=MessageType.AI)
        if return_list:
            return [question.content for question in questions.all()]
        return '\n'.join([question.content for question in questions.all()])

    def get_stage_timeout(self, stage):
        if stage.type == StageType.DSA:
            if stage.stage_id == '1':
                return stage.timeout
            return Stage.objects.get(stage_id='3', type=StageType.BASE).timeout
        return stage.timeout

    def get_code(self):
        codes = Message.objects.filter(interview=self.interview, stage__type=StageType.DSA, stage__stage_id='3').order_by(
            '-created').all()
        if len(codes):
            return codes[0].content
        return None

    def save_message(self, content, type):
        return Message.objects.create(type=type, content=content, stage=self.interview.stage, interview=self.interview)

    def get_stages(self, stage_type):
        stages = Stage.objects.filter(type=self.interview.node.stage.type).order_by('stage_id').all()
        return '\n'.join([
            f'{stage.stage_id}. {stage.description}'
            for stage in stages
        ])

    def stage_analyzer(self, chain) -> Dict[str, str]:
        stage = self.interview.stage

        raw_response = chain.run({})
        response = self.json_parser.parse(raw_response)

        next_stage = str(response.get('stage', '1')).strip()

        print(f'--[{stage.type}]Stage Analyzer: Moving from ({stage.stage_id}) -> ({next_stage})')
        if (next_stage == stage.stage_id and
                self.get_current_stage_duration() > stage.timeout):
            print(f'##* -> Force moving from [{stage.type}]{next_stage} - to - ', end='')
            next_stage = str(int(next_stage) + 1)
            print(f'[{stage.type}]{next_stage}')

        dsa_count = len(self.get_dsa_questions(return_list=True))
        # Don't skip DSA round
        if stage.type == StageType.BASE and next_stage == '4' and dsa_count == 0:
            next_stage = '3'
            print(f'-- FORCE PULLING ---> [{stage.type}]Stage Analyzer: Moving from ({stage.stage_id}) -> ({next_stage})')
        elif stage.type == StageType.BASE and next_stage == '3' and dsa_count >= 3:
            next_stage = str(int(next_stage) + 1)

            print(f'-- FORCE PUSHING ---> [{stage.type}]Stage Analyzer: Moving from ({stage.stage_id}) -> ({next_stage})')

        return {
            'input': chain.prompt,
            'raw_output': raw_response,
            'output': next_stage
        }

    def get_conversation_history(self, level, return_message=False):
        print(f'\n\n\n############# HISTORY #############\n\n\n')
        if level == MemoryLevel.STAGE:
            messages = Message.objects.filter(interview=self.interview, stage=self.interview.stage).order_by(
                'created').all()
        elif level == MemoryLevel.ISOLATED:
            # messages = Message.objects.filter(interview=self.interview, stage__type=self.interview.stage.type)
            # last_stage = Stage.objects.filter(type=self.interview.stage.type).order_by('-stage_id').first()
            # last_messages = messages.filter(stage=last_stage).order_by('-created')
            # if last_messages.count() >= 1:
            #     last_first_message = last_messages.first()
            #     messages = messages.filter(created__gt=last_first_message.created)
            #     if messages.count() == 0: # If the last message was from last stage we need the entire stage.
            #         last_second_message = last_messages.all()[1] #FIXME: This goes out of bound
            #         messages = messages.filter(created_gt=last_second_message.created)
            # messages = messages.order_by('created').all()

            # New logic for isolated chat history
            messages = Message.objects.filter(interview=self.interview, stage__type=self.interview.stage.type)
            if messages.count() > 0:
                stages = Stage.objects.filter(type=self.interview.stage.type).order_by('stage_id')
                first_stage = stages.first()
                last_stage = stages.last()
                first_messages = messages.filter(stage=first_stage, type=MessageType.AI).order_by('-created')
                first_message = first_messages.first()
                if first_messages.count() > 1:
                    last = first_messages.first()
                    for msg in first_messages.all()[1:]:
                        between_messages = messages.filter(created__gt=msg.created,
                                                           created__lt=last.created,
                                                           type=MessageType.AI).order_by('-created')
                        if between_messages.count() > 0:
                            if between_messages.filter(stage=last_stage).count() > 0:
                                break
                        first_message = last = msg

                    messages = messages.filter(created__gte=first_message.created).order_by('created')
                    last_message = messages.last()
                    if self.interview.stage.stage_id < last_message.stage.stage_id:
                        # we are in new cycle
                        messages = []

                print('\n\n')
                print('\n'.join([
                    f'{self.interview.interviewer.get_full_name()}: {message.content} <END_OF_TURN>' if message.type == MessageType.AI else f'Candidate: {message.content} <END_OF_TURN>'
                    for message in messages
                ]))
                print('\n')
        else:
            messages = Message.objects.filter(interview=self.interview).order_by('created').all()
        if return_message:
            return [
                AIMessage(content=message.content) if messages.type == MessageType.AI else HumanMessage(content=message.content)
                for message in messages
            ]
        print(f'\n\n\n############# HISTORY #############\n\n\n')
        return '\n'.join([
            f'{self.interview.interviewer.get_full_name()}: {message.content} <END_OF_TURN>' if message.type == MessageType.AI else f'Candidate: {message.content} <END_OF_TURN>'
            for message in messages
        ])

    def _prepare_prompt_values(self):
        node = self.interview.node
        stage = self.interview.stage
        interviewer = self.interview.interviewer
        if node.type == NodeType.SUPERVISOR:
            return {
                'conversation_stage_id': stage.stage_id,
                'conversation_history': self.get_conversation_history(MemoryLevel.STAGE if stage.type == StageType.BASE else MemoryLevel.ISOLATED),
                'stage_timeout': self.get_stage_timeout(stage),
                'stage_duration': self.get_current_stage_duration()
            }
        else:
            return {
                'conversation_stage': stage.description,
                'conversation_history': self.get_conversation_history(
                    self.interview.node.memory_level if stage.type == StageType.BASE else MemoryLevel.ISOLATED),
                'stage_name': stage.name,
                'interviewer_name': interviewer.get_full_name(),
                'interviewer_role': interviewer.role,
                'company_name': self.interview.metadata.get('company', {'name': None}).get('name'),
                'company_business': self.interview.metadata.get('company', {'business': None}).get('business'),
                'company_values': self.interview.metadata.get('company', {'value': None}).get('value'),
                'conversation_purpose': stage.purpose,
                'conversation_type': 'call',
                'job_role': self.interview.metadata.get('job', {'role': None}).get('role'),
                'job_description': self.interview.metadata.get('job', {'description': None}).get('description'),
            }

    def _call(
            self,
            interview,
            inputs: Dict[str, Any] = None,
            run_manager: Optional[CallbackManagerForChainRun] = None
    ) -> Dict[str, Any]:
        self.interview = interview
        time_spent = self.get_current_stage_duration()

        if inputs and inputs.get('content'):
            user_message = inputs.get('content')
            self.human_step(user_message)

        print('\n\n#' + '-'*20 + ' User ' + '-'*20 + '#')
        if inputs:
            print(f'User: {inputs.get("content", "NULL")}')
        else:
            print(f'User: NULL')
        print('#' + '-' * 46 + '#')

        print('\n\n#' + '-' * 22 + ' AI ' + '-' * 22 + '#')
        output = None
        while self.interview.node.type != NodeType.IO and self.interview.node != self.interview.job.graph.end_node:
            output = self.step(self.interview.node)
            time_spent = self.get_current_stage_duration()
            print('-'*10)
        if self.interview.node.type == NodeType.IO:
            print(self.interview.node)
            self.step(self.interview.node)
            print('-'*10)
        print('#' + '-' * 48 + '#')


        return {
            'output': remove_tokens(output),
            'time_spent': time_spent
        }

    def call(self, interview, inputs: Dict[str, Any] = None, run_manager: Optional[CallbackManagerForChainRun] = None):
        return self._call(interview, inputs, run_manager)


class PitchExecutor(BaseInterviewExecutor):
    def get_current_stage_duration(self):
        first_message = \
            Message.objects.filter(interview=self.interview, stage=self.interview.stage).order_by('created').first()

        if not first_message:
            return 0
        return (timezone.now() - first_message.created).total_seconds()

    def get_stage_timeout(self, stage):
        return stage.timeout

    def save_message(self, content, type):
        return Message.objects.create(type=type, content=content, stage=self.interview.stage, interview=self.interview)

    def get_stages(self, stage_type):
        stages = Stage.objects.filter(type=self.interview.node.stage.type).order_by('stage_id').all()
        return '\n'.join([
            f'{stage.stage_id}. {stage.description}'
            for stage in stages
        ])

    def get_conversation_history(self, level, return_message=False):
        if level == MemoryLevel.STAGE:
            messages = Message.objects.filter(interview=self.interview, stage=self.interview.stage).order_by(
                'created').all()
        elif level == MemoryLevel.ISOLATED:
            messages = Message.objects.filter(interview=self.interview, stage__type=self.interview.stage.type)
            last_stage = Stage.objects.filter(type=self.interview.stage.type).order_by('-stage_id').first()
            last_messages = messages.filter(stage=last_stage).order_by('-created')
            if last_messages.count() >= 1:
                last_first_message = last_messages.first()
                messages = messages.filter(created__gt=last_first_message.created)
            messages = messages.all()
        else:
            messages = Message.objects.filter(interview=self.interview).order_by('created').all()
        if return_message:
            return [
                AIMessage(content=message.content) if messages.type == MessageType.AI else HumanMessage(content=message.content)
                for message in messages
            ]

        return '\n'.join([
            f'{self.interview.interviewer.get_full_name()}: {message.content} <END_OF_TURN>' if message.type == MessageType.AI else f'Candidate: {message.content} <END_OF_TURN>'
            for message in messages
        ])

    def _prepare_prompt_values(self):
        node = self.interview.node
        stage = self.interview.stage
        interviewer = self.interview.interviewer
        if node.type == 'SUPERVISOR':
            return {
                'conversation_stage_id': stage.stage_id,
                'conversation_history': self.get_conversation_history(MemoryLevel.STAGE if stage.type == StageType.BASE else MemoryLevel.ISOLATED),
                'stage_timeout': self.get_stage_timeout(stage),
                'stage_duration': self.get_current_stage_duration()
            }
        else:
            program = ''
            if self.interview.metadata.get('program'):
                program = f'It is an interview for {self.interview.metadata.get("program")} program.'

            return {
                'conversation_stage': stage.description,
                'conversation_history': self.get_conversation_history(
                    self.interview.node.memory_level if stage.type == StageType.BASE else MemoryLevel.ISOLATED),
                'stage_name': stage.name,
                'interviewer_name': interviewer.get_full_name(),
                'interviewer_role': interviewer.role,
                'company_name': self.interview.metadata.get('company', {'name': None}).get('name'),
                'company_business': self.interview.metadata.get('company', {'business': None}).get('business'),
                'company_values': self.interview.metadata.get('company', {'value': None}).get('value'),
                'conversation_purpose': stage.purpose,
                'conversation_type': 'call',
                'startup_name': self.interview.metadata.get('startup', {'name': None}).get('name'),
                'startup_sector': self.interview.metadata.get('startup', {'sector': None}).get('sector'),
                'startup_idea': self.interview.metadata.get('startup', {'description': None}).get('description'),
                'program': program
            }

    def _call(
            self,
            interview,
            inputs: Dict[str, Any] = None,
            run_manager: Optional[CallbackManagerForChainRun] = None
    ) -> Dict[str, Any]:
        self.interview = interview
        time_spent = self.get_current_stage_duration()

        if inputs and inputs.get('content'):
            user_message = inputs.get('content')
            self.human_step(user_message)

        output = None
        while self.interview.node.type != NodeType.IO and self.interview.node != self.interview.job.graph.end_node:
            output = self.step(self.interview.node)
            time_spent = self.get_current_stage_duration()
        if self.interview.node.type == NodeType.IO:
            self.step(self.interview.node)

        return {
            'output': remove_tokens(output),
            'time_spent': time_spent
        }

    def call(self, interview, inputs: Dict[str, Any] = None, run_manager: Optional[CallbackManagerForChainRun] = None):
        return self._call(interview, inputs, run_manager)
