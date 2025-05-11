import time
from json import JSONDecodeError
from typing import Dict, Optional, Union
import logging

from django.conf import settings
from django.core.files import File
from django.utils import timezone
from django.utils.module_loading import import_string
from langchain_community.callbacks import get_openai_callback
from langchain_core.messages import SystemMessage
from langchain_core.output_parsers import SimpleJsonOutputParser
from langchain_core.prompts import ChatPromptTemplate

from common import utils
from common.utils import parse_generation
from rasengan.graph.enums import NodeType
from rasengan.graph.models import EdgeV2, ConditionalEdgeV2, NodeV2, ForceEdge
from rasengan.commons.dataclasses import GenerationResponse
from rasengan.interview.extractors import DSAContextExtractor, PitchContextExtractor
from rasengan.llm.callbacks import XFileCallbackHandler
from rasengan.llm.llms import LLMFactory
from rasengan.llm.parsers import RegexJsonOutputParser
from rasengan.commons.utils import remove_tokens, get_llm_config_dict
from susanoo.interview.enums import InterviewType, InterviewStatus
from susanoo.message.enums import MessageType, SentinelType
from susanoo.message.models import MessageV2, Sentinel, Thought
from susanoo.stage.enums import Module
from susanoo.stage.models import StageV2
from susanoo.usage.enums import UsageType
from susanoo.usage.models import UsageV2
from rasengan.interview.extractors import TechContextExtractor

EXECUTABLE_NODE_TYPES = [
    NodeType.WORKER,
    NodeType.SUPERVISOR
]

logger = logging.getLogger(__file__)


class InterviewEngine:
    def __init__(self, **kwargs):
        # self.interview = interview
        self.interview = None
        self.llm_factory = LLMFactory
        self.json_parser = SimpleJsonOutputParser()
        # TODO: make factory to create context extractor
        self.context_extractor = None
        self.callbacks = []
        # self.context_extractor = DSAInterviewContextExtractor(interview)

    def save_message(self, type: MessageType, content: str, audio: Optional[File] = None, metadata: Optional[Dict] = None, node: Optional[NodeV2] = None, stage: Optional[StageV2] = None):
        message = MessageV2.objects.create(
            type=type,
            interview=self.interview,
            content=content,
            audio=audio,
            stage=self.interview.stage if not stage else stage,
            node=self.interview.node if not node else node,
            metadata=metadata
        )
        return message

    def save_sentinel(self, type, content, node=None):
        Sentinel.objects.create(
            type=type,
            interview=self.interview,
            sentinel=content,
            node=self.interview.node if not node else node
        )

    def _get_node_duration(self, node):
        last_sentinel = Sentinel.objects.filter(
            interview=self.interview,
            type=SentinelType.START
        ).order_by('-created').first()
        start = MessageV2.objects.filter(
            interview=self.interview,
            type=MessageType.AI,
            node=node,
            created__gte=last_sentinel.created
        ).order_by('created').first()

        # print(last_sentinel, start)

        duration = 0
        if start != None:
            logger.info(f"Start message: {start.content}")
            duration = (timezone.now() - start.created).total_seconds()
            # print("\n\nDURATION", duration)
        return duration

    def _get_variables(self):
        node = self.interview.node
        stage = self.interview.stage

        # If there is a message between the first and the last message of this node that belongs to another node,
        # then there is a cycle.

        # 1. Get first and last message for current node
        # 2. Get all messages between these messages
        # 3. If any message belongs to any other node then there is cycle, else not cycle
        # 4a. If no cycle then select last `memory_per_depth` messages
        # 4b*. If cycle, iterate from last message to first message optimally selecting messages
        node_first_message = None
        logger.info('getting last reset point')
        sentinels = Sentinel.objects.filter(
            interview=self.interview,
            type=SentinelType.START,
        )
        if node and node.stage:
            if node.stage.submodule:  # for cases when we have a subgraph/submodule
                sentinels = sentinels.filter(node__stage__submodule=node.stage.submodule)
            else:
                sentinels = sentinels.filter(node__stage__module=node.stage.module, node__stage__submodule=None)
        last_reset_point = sentinels.order_by('-created').first()
        logger.info(f'last reset point: {last_reset_point}')

        logger.info('getting all messages for memory')
        messages = MessageV2.objects.filter(
            interview=self.interview,
            node__in=node.memory_nodes.all(),
        ).order_by('created').all()

        logger.info('getting followup for node')
        followups = MessageV2.objects.filter(
            interview=self.interview,
            type=MessageType.AI,
            node=node
        ).all()
        if last_reset_point:
            messages = messages.filter(created__gte=last_reset_point.created).all()
            followups = followups.filter(created__gte=last_reset_point.created).all()

        logger.info(messages)
        conversation_history = '\n'.join([
            f'{self.interview.interviewer.get_full_name()}: {message.content} <END_OF_TURN>' if message.type == MessageType.AI else f'Candidate: {message.content} <END_OF_TURN>'
            for message in messages
        ])
        logger.info(f'creating history: {conversation_history}')

        logger.info('getting node duration')
        if node.type == NodeType.WORKER:
            duration = self._get_node_duration(node)
        else:
            last_message = MessageV2.objects.filter(interview=self.interview).order_by('-created').first()
            duration = self._get_node_duration(last_message.node)

        return {
            'conversation_history': conversation_history,
            'conversation_stage_id': stage.stage_id,
            'conversation_stage': stage.description,
            'stage_timeout': node.timeout if node.timeout else stage.timeout,
            'stage_duration': duration,
            'followups': followups,
            'stage_name': stage.name,
            'interviewer_name': self.interview.interviewer.get_full_name(),
            'interviewer_role': self.interview.interviewer.role,
            'conversation_purpose': stage.purpose,
            'conversation_type': 'call',
            **self.context_extractor.retrieve_context(node, stage)
        }

    def _move_node(self, output):
        node = self.interview.node
        graph = self.interview.job.graph
        force_move = False

        logger.info(f"Current Node: {node} ")

        ## 1. Make the move
        try:
            edge = graph.edges.get(start_node=node)
        except EdgeV2.DoesNotExist:
            try:
                # print(node)
                # print(str(output))
                edge = graph.conditional_edges.get(start_node=node, condition__iexact=str(output))
            except ConditionalEdgeV2.DoesNotExist:
                logging.error("##########\n[ERROR] DOES NOT EXISTS CONDITIONAL NODE\n")
                edge = None
        if edge:
            node = edge.end_node
        else:
            node = graph.end_node
            self.interview.status = InterviewStatus.ERROR
            self.interview.save()
            raise ValueError("Improperly configured interview. Cannot proceed.")
        # print(f"###################\nCurrent Node: {node}\nEdge: {edge}\n")

        ## 2. Check if force move is required
        # if node.type == NodeType.WORKER or node.type == NodeType.SUPERVISOR:
        latest_start_point = Sentinel.objects.filter(
            interview=self.interview,
            type=SentinelType.START,
            node__stage__module=node.stage.module
        ).order_by('-created').first()

        if node.type == NodeType.SENTINEL:
            followups = Sentinel.objects.filter(
                interview=self.interview,
                type=node.sentinel_type,
                node=node
            )
            logger.info(f"FOLLOWUPS = {followups}")
        else:
            followups = MessageV2.objects.filter(
                interview=self.interview,
                type=MessageType.AI,
                node=node
            )
            if latest_start_point:
                followups = followups.filter(created__gte=latest_start_point.created)
        logger.info(f"FOLLOWUPS = {followups}")
        limit_exceeded = False

        # check if the node has custom questions first then fallback to node.max_repeat
        questions = node.stage.stage_questions.filter(interview=self.interview).first()
        if questions and questions.questions and isinstance(questions.questions, list):
            # print('checking questions', questions.questions)
            max_repeat = len(questions.questions)
            limit_exceeded = (len(followups) >= max_repeat)
        ## TODO: Check this logic
        elif node.max_repeat:
            limit_exceeded = (len(followups) >= node.max_repeat)
            # if node.type == NodeType.SENTINEL:
            #     # TODO: if this is end sentinel node move to the next sentinel (i.e the start of graph) and then do tht below
            #     limit_exceeded = limit_exceeded or (len(followups) >= node.max_repeat)

        duration = self._get_node_duration(node)
        logger.info(f' Duration = {duration} ')
        duration_exceeded = False
        if node.timeout:
            duration_exceeded = (duration >= node.timeout)
        elif node.stage.timeout:
            duration_exceeded = (duration >= node.stage.timeout)

        force_move = limit_exceeded or duration_exceeded
        ###

        logger.info(f'force move: {force_move}')

        ## First move then check if we need to force move the destination node
        # try:
        #     edge = EdgeV2.objects.get(start_node=node)
        # except EdgeV2.DoesNotExist:
        #     try:
        #         edge = ConditionalEdgeV2.objects.get(start_node=node, condition__iexact=str(output))
        #     except ConditionalEdgeV2.DoesNotExist:
        #         edge = None

        logger.info(f'Edge: {edge} -- ')

        if force_move:
            logger.info('Force Moving')
            try:
                edge = graph.force_edges.get(start_node=node)
                node = edge.end_node
            except ForceEdge.DoesNotExist:
                logger.info('Force move failed, no force edge found')
                pass
        # if edge:
        #     node = edge.end_node
        # else:
        #     node = self.interview.graph.end_node

        if node.type == NodeType.WORKER:
            self.interview.stage = node.stage
        self.interview.node = node
        self.interview.save()

        logger.info(f"Next Node: {node}")

    def execute(self, node) -> GenerationResponse:
        logger.info('creating llm')
        llm = self.llm_factory.create_with_fallback(
            provider=node.llm.provider.provider_id,
            model=str(node.llm.model),
            **get_llm_config_dict(node.llm_config)
        )
        logger.info('llm created')

        logger.info('getting variables')
        variables = self._get_variables()
        logger.info('got variables')
        logger.info(variables)

        ## FIXME: We need to format here because chain.invoke is not able to add variables.
        ## TODO: Report and fix this in LangChain
        messages = [
            SystemMessage(
                content=node.prompt.prompt.format(**variables)
            )
        ]

        prompt = ChatPromptTemplate.from_messages(messages=messages)
        logger.info(f'Prompt created: {prompt.format(**variables)}')

        chain = prompt | llm

        start = time.time()
        response = chain.invoke(variables, {
            'callbacks': self.callbacks,
        })
        end = time.time()
        print(f'[LLM] Time taken: {end-start}')
        
        response = parse_generation(prompt.format(**variables), response)
        # try:
        #     if node.type == NodeType.SUPERVISOR:
        #         response.output = self.json_parser.parse(response.output).get('stage', response.output)
        #     else:
        #         response.output = self.json_parser.parse(response.output).get('response', response.output)
        # except KeyError:
        #     json = self.json_parser.parse(response.output)
        #     response.output = list[json.values()][0]
        response.output = utils.clear_output(response.output)  # clear output to be able to be parsed
        try:
            response.output = self.json_parser.parse(response.output)
        except JSONDecodeError as e:
            response.output = RegexJsonOutputParser().parse(response.output)
        return response

    def process_generated_response(self, node: NodeV2, response: GenerationResponse):
        input = response.input
        output = response.output
        reason = output.get('reason')
        output = str(output.get('response'))
        str_output = output
        usage = response.usage

        if reason:
            Thought.objects.create(
                node=node,
                stage=self.interview.stage,
                interview=self.interview,
                content=str(reason).strip(),
            )

        if node.type != NodeType.SUPERVISOR:
            output = self.ai_step(output, reason)
            str_output = output.get('output')
        logger.info(f'OUTPUT - {output}, {reason}')

        UsageV2.objects.create(
            type=UsageType.INTERVIEW,
            interview=self.interview,
            llm=node.llm,
            input=input,
            output=response.raw_output,
            prompt_tokens=usage.input_tokens,
            completion_tokens=usage.output_tokens,
            metadata={
                'type': 'interview',
                'id': str(self.interview.id)
            }
        )

        return output, str_output

    def execute_with_generation(self, node):
        response = self.execute(node)
        return self.process_generated_response(node, response)

    def execute_without_generation(self, node):
        questions = node.stage.stage_questions.filter(interview=self.interview).first()

        # 1. check how many questions are done
        last_reset = self.interview.interview_sentinels.filter(
            type=SentinelType.START,
            node__stage__module=node.stage.module
        ).order_by('-created').first()
        message_count = self.interview.interview_messages_v2.filter(
            stage=node.stage,
            created__gte=last_reset.created,
            type=MessageType.AI
        ).order_by('-created').count()

        # print("message count", message_count)

        # 2. get the next question
        try:
            question = questions.questions[message_count]
            output = str_output = None
            if node.type != NodeType.SUPERVISOR:
                output = self.ai_step(question, None)
                str_output = output.get('output')
            return output, str_output
        except IndexError:
            # move to next stage
            pass

    def step(self):
        node = self.interview.node
        llm = node.llm

        output = None
        str_output = None
        if node.type in EXECUTABLE_NODE_TYPES:
            questions = node.stage.stage_questions.filter(interview=self.interview).first()
            if questions is None and llm is None:
                raise ValueError('LLM required when node is executable but `None` found')
            if node.type == NodeType.SUPERVISOR and not self.interview.stage.supervised:
                str_output = output = self.interview.stage.stage_id
            else:
                logger.info('running llm')
                with get_openai_callback() as trace:
                    if questions and questions.questions:
                        output, str_output = self.execute_without_generation(node)
                    else:
                        output, str_output = self.execute_with_generation(node)
        elif node.type == NodeType.SENTINEL:
            self.save_sentinel(node.sentinel_type,
                               settings.TOKENS.get(utils.value_to_enum(SentinelType, node.sentinel_type)))
        else:
            # else the node is autonomous node, simply return the current stage id
            str_output = output = self.interview.stage.stage_id
        self._move_node(str_output)
        return output

    def ai_step(self, output: str, reason: Optional[str]):
        self.save_message(
            type=MessageType.AI,
            content=output,
            metadata={
                'reason': reason
            }
        )
        return {
            'output': remove_tokens(output),
            'reason': reason,
        }

    def human_step(self, input: str):
        user_message = input.strip()

        # FIXME: Since messages are associated to the node, when human step happens, we are at supervisor node
        #        so to fix this we get the last AI message and attach it to that node.
        # TODO: Find a better fix
        last_ai_message = MessageV2.objects.filter(type=MessageType.AI).order_by('-created').first()
        self.save_message(type=MessageType.USER, content=user_message, node=last_ai_message.node, stage=last_ai_message.stage)
        return {
            'input': user_message,
        }

    def run(self, interview, inputs):
        self.interview = interview
        self.callbacks = [XFileCallbackHandler(filename=f'./logs/{self.interview.id}.log', mode='a+')]

        # TODO: Move this to constructor and create a factory to get the appropriate extractor
        if interview.type == InterviewType.PITCH:
            self.context_extractor = PitchContextExtractor(interview)
        else:
            self.context_extractor = TechContextExtractor(interview)

        # print("checking type")
        input = None
        if inputs and inputs.get('content'):
            input = self.human_step(inputs.get('content'))

        output = None
        time_spent = None
        while self.interview.node.type != NodeType.IO and self.interview.node != self.interview.job.graph.end_node:
            output = self.step()
            logger.info('done iteration')
            # print('CALLING TIME')
            time_spent = self._get_node_duration(self.interview.node)
            # print('TIME', time_spent)
        if self.interview.node.type == NodeType.IO:
            self.step()

        return {
            'time_spent': time_spent,
            'input': input,
            'output': output,
        }


class InterviewEngineWithLinguistic(InterviewEngine):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.linguistic_adapter = import_string(settings.LINGUISTIC['BACKEND'])()

    def human_step(self, input: Union[str, File]):
        user_message = input
        audio = input
        if isinstance(input, File):
            start = time.time()
            asr_response = self.linguistic_adapter.speech_to_text(id=self.interview.id, audio_file=input)
            end = time.time()
            print(f'[ASR] Time taken: {end-start}')

            user_message = asr_response.get('text').strip()
        else:
            audio = None

        # FIXME: Since messages are associated to the node, when human step happens, we are at supervisor node
        #        so to fix this we get the last AI message and attach it to that node.
        # TODO: Find a better fix
        last_ai_message = MessageV2.objects.filter(type=MessageType.AI).order_by('-created').first()
        message = self.save_message(type=MessageType.USER, content=user_message, audio=audio, node=last_ai_message.node,
                                    stage=last_ai_message.stage)
        return {
            'input': user_message,
            'audio': message.audio.url if message.audio else None,
        }

    def ai_step(self, output: str, reason: Optional[str]):
        output = output.strip()

        start = time.time()
        audio = self.linguistic_adapter.text_to_speech(id=self.interview.id, text=output)
        end = time.time()
        print(f'[TTS] Time taken: {end - start}')

        message = self.save_message(
            type=MessageType.AI,
            content=output,
            audio=audio,
            metadata={
                'reason': reason
            }
        )
        return {
            'output': remove_tokens(output),
            'audio': message.audio.url,
            'reason': reason
        }
