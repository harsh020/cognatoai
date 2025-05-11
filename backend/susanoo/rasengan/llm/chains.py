from typing import Union, Dict
from dataclasses import dataclass

from django.conf import settings

from langchain.chains import LLMChain
from langchain_core.callbacks import Callbacks
from langchain_core.language_models import BaseChatModel, BaseLLM
from langchain_core.memory import BaseMemory
from langchain_core.prompts import BasePromptTemplate, ChatPromptTemplate, SystemMessagePromptTemplate
from pydantic import BaseModel

from rasengan.prompt.prompts import *
from rasengan.commons.utils import load_pdf_as_str
from susanoo.interview.models import Interview
from susanoo.message.enums import MessageType
from susanoo.message.models import Message
from susanoo.stage.enums import StageType
from susanoo.stage.models import Stage

# STAGE_ANALYZER_PROMPT = PromptTemplate(
#     template=STAGE_ANALYZER_TEMPLATE,
#     input_variables=[
#         'conversation_history',
#         'conversation_stage_id'
#     ]
# )
#
# INTERVIEW_AGENT_INCEPTION_PROMPT = PromptTemplate(
#     template=INTERVIEW_AGENT_INCEPTION_TEMPLATE,
#     input_variables=[
#         'interviewer_name',
#         'interviewer_role',
#         'company_name',
#         'company_business',
#         'company_values',
#         'conversation_purpose',
#         'conversation_type',
#         'conversation_history',
#     ]
# )


STAGE_ANALYZER_PROMPT = ChatPromptTemplate.from_messages(
    messages=[
        SystemMessagePromptTemplate.from_template(STAGE_ANALYZER_TEMPLATE)
    ]
)

DSA_STAGE_ANALYZER_PROMPT = ChatPromptTemplate.from_messages(
    messages=[
        SystemMessagePromptTemplate.from_template(DSA_STAGE_ANALYZER_TEMPLATE)
    ]
)

DSA_CODE_CHECK_PROMPT = ChatPromptTemplate.from_messages(
    messages=[
        SystemMessagePromptTemplate.from_template(DSA_CODE_CHECK_TEMPLATE)
    ]
)

INTERVIEW_AGENT_INCEPTION_PROMPT = ChatPromptTemplate.from_messages(
    messages=[
        SystemMessagePromptTemplate.from_template(INTERVIEW_AGENT_INCEPTION_TEMPLATE)
    ]
)

BASE_AGENT_PROMPT = ChatPromptTemplate.from_messages(
    messages=[
        SystemMessagePromptTemplate.from_template('\n'.join([
            AGENT_PREFIX_TEMPLATE,
            BASE_AGENT_TEMPLATE
        ]))
    ]
)

DSA_BASE_AGENT_PROMPT = ChatPromptTemplate.from_messages(
    messages=[
        SystemMessagePromptTemplate.from_template('\n'.join([
            AGENT_PREFIX_TEMPLATE,
            DSA_BASE_AGENT_TEMPLATE
        ]))
    ]
)

RESUME_AGENT_PROMPT = ChatPromptTemplate.from_messages(
    messages=[
        SystemMessagePromptTemplate.from_template('\n'.join([
            AGENT_PREFIX_TEMPLATE,
            RESUME_AGENT_TEMPLATE
        ]))
    ]
)

DSA_AGENT_PROMPT = ChatPromptTemplate.from_messages(
    messages=[
        SystemMessagePromptTemplate.from_template('\n'.join([
            AGENT_PREFIX_TEMPLATE,
            DSA_AGENT_TEMPLATE
        ]))
    ]
)

BASE_AGENT_GENERIC_PROMPT = ChatPromptTemplate.from_messages(
    messages=[
        SystemMessagePromptTemplate.from_template('\n'.join([
            AGENT_PREFIX_GENERIC_TEMPLATE,
            BASE_AGENT_TEMPLATE
        ]))
    ]
)

DSA_BASE_AGENT_GENERIC_PROMPT = ChatPromptTemplate.from_messages(
    messages=[
        SystemMessagePromptTemplate.from_template('\n'.join([
            AGENT_PREFIX_TEMPLATE,
            DSA_BASE_AGENT_TEMPLATE
        ]))
    ]
)

RESUME_AGENT_GENERIC_PROMPT = ChatPromptTemplate.from_messages(
    messages=[
        SystemMessagePromptTemplate.from_template('\n'.join([
            AGENT_PREFIX_TEMPLATE,
            RESUME_AGENT_TEMPLATE
        ]))
    ]
)

DSA_AGENT_GENERIC_PROMPT = ChatPromptTemplate.from_messages(
    messages=[
        SystemMessagePromptTemplate.from_template('\n'.join([
            AGENT_PREFIX_TEMPLATE,
            DSA_AGENT_TEMPLATE
        ]))
    ]
)

STAGE_EVALUATOR_PROMPT = ChatPromptTemplate.from_messages(
    messages=[
        SystemMessagePromptTemplate.from_template(STAGE_EVALUATOR_TEMPLATE)
    ]
)

FEEDBACK_PROMPT = ChatPromptTemplate.from_messages(
    messages=[
        SystemMessagePromptTemplate.from_template(FEEDBACK_TEMPLATE)
    ]
)

##----- Pitch -------
PITCH_AGENT_PROMPT = ChatPromptTemplate.from_messages(
    messages=[
        SystemMessagePromptTemplate.from_template('\n'.join([
            PITCH_AGENT_PREFIX_TEMPLATE,
            PITCH_AGENT_TEMPLATE
        ]))
    ]
)

PITCH_STAGE_ANALYZER_PROMPT = ChatPromptTemplate.from_messages(
    messages=[
        SystemMessagePromptTemplate.from_template(PITCH_STAGE_ANALYZER_TEMPLATE)
    ]
)


class StageAnalyzerChain(LLMChain):
    """Chain to analyze which conversation stage should the conversation move into."""

    @classmethod
    def from_llm(
            cls,
            llm: Union[BaseChatModel, BaseLLM],
            memory: BaseMemory = None,
            stage_analyzer_prompt: BasePromptTemplate = STAGE_ANALYZER_PROMPT,
            verbose: bool = False,
            callbacks: Callbacks = None
    ) -> LLMChain:
        return cls(llm=llm, prompt=stage_analyzer_prompt, memory=memory, callbacks=callbacks, verbose=verbose)


class StageEvaluatorChain(LLMChain):
    """Chain to evaluate candidate response."""

    @classmethod
    def from_llm(
            cls,
            llm: Union[BaseChatModel, BaseLLM],
            memory: BaseMemory = None,
            stage_evaluator_prompt: BasePromptTemplate = STAGE_EVALUATOR_PROMPT,
            verbose: bool = False,
            callbacks: Callbacks = None
    ) -> LLMChain:
        return cls(llm=llm, prompt=stage_evaluator_prompt, memory=memory, callbacks=callbacks, verbose=verbose)


class BaseAgentChain(LLMChain):
    @classmethod
    def from_llm(cls,
                 llm: Union[BaseChatModel, BaseLLM],
                 memory: BaseMemory = None,
                 base_agent_prompt: BasePromptTemplate = BASE_AGENT_PROMPT,
                 verbose: bool = False,
                 callbacks: Callbacks = None
                 ) -> LLMChain:
        return cls(llm=llm, prompt=base_agent_prompt, memory=memory, callbacks=callbacks, verbose=verbose)


class ResumeAgentChain(LLMChain):
    @classmethod
    def from_llm(cls,
                 llm: Union[BaseChatModel, BaseLLM],
                 memory: BaseMemory = None,
                 resume_agent_prompt: BasePromptTemplate = RESUME_AGENT_PROMPT,
                 verbose: bool = False,
                 callbacks: Callbacks = None
                 ) -> LLMChain:
        return cls(llm=llm, prompt=resume_agent_prompt, memory=memory, callbacks=callbacks, verbose=verbose)


class DSAAgentChain(LLMChain):
    @classmethod
    def from_llm(cls,
                 llm: Union[BaseChatModel, BaseLLM],
                 memory: BaseMemory = None,
                 dsa_agent_prompt: BasePromptTemplate = DSA_AGENT_PROMPT,
                 verbose: bool = False,
                 callbacks: Callbacks = None
                 ) -> LLMChain:
        return cls(llm=llm, prompt=dsa_agent_prompt, memory=memory, callbacks=callbacks, verbose=verbose)


class DSACodeCheckChain(LLMChain):
    @classmethod
    def from_llm(cls,
                 llm: Union[BaseChatModel, BaseLLM],
                 memory: BaseMemory = None,
                 dsa_code_check_prompt: BasePromptTemplate = DSA_CODE_CHECK_PROMPT,
                 verbose: bool = False,
                 callbacks: Callbacks = None
                 ) -> LLMChain:
        return cls(llm=llm, prompt=dsa_code_check_prompt, memory=memory, callbacks=callbacks, verbose=verbose)


class FeedbackChain(LLMChain):
    """Chain to give feedback based on interview conversation."""

    @classmethod
    def from_llm(
            cls,
            llm: Union[BaseChatModel, BaseLLM],
            memory: BaseMemory = None,
            feedback_prompt: BasePromptTemplate = FEEDBACK_PROMPT,
            verbose: bool = False,
            callbacks: Callbacks = None
    ) -> LLMChain:
        return cls(llm=llm, prompt=feedback_prompt, memory=memory, callbacks=callbacks, verbose=verbose)


class InterviewConversationChain(LLMChain):
    """Chain to generate the next utterance for the conversation."""

    @classmethod
    def from_llm(
            cls,
            llm: Union[BaseChatModel, BaseLLM],
            memory: BaseMemory = None,
            interview_agent_inception_prompt: BasePromptTemplate = INTERVIEW_AGENT_INCEPTION_PROMPT,
            verbose: bool = False,
            callbacks: Callbacks = None
    ) -> LLMChain:
        return cls(llm=llm, prompt=interview_agent_inception_prompt, memory=memory, callbacks=callbacks,
                   verbose=verbose)


@dataclass
class StageChain:
    id: str
    chain: LLMChain
    memory: BaseMemory


class StageChainManager(BaseModel):
    chains: Dict[str, StageChain] = dict()

    def get_chain(self, id: str) -> LLMChain:
        return self.chains.get(id).chain

    def get_memory(self, id: str):
        return self.chains.get(id).memory

    def set_chain(self, id: str, chain: LLMChain, memory: Union[BaseMemory, None] = None) -> None:
        self.chains[id] = StageChain(id, chain, memory)


class ChainFactory:
    def __int__(self):
        super().__init__()

    def create_supervisor_chain(
            self,
            interview: Interview,
            stage_type: str,
            current_stage: str,
            llm: Union[BaseChatModel, BaseLLM],
            prompt_values: Dict,
            generic: bool = False,
            memory: BaseMemory = None,
            verbose: bool = False,
            callbacks: Callbacks = None

    ) -> LLMChain:
        prompt = STAGE_ANALYZER_PROMPT
        if stage_type == 'BASE':
            prompt = STAGE_ANALYZER_PROMPT
        elif stage_type == 'DSA':
            prompt = DSA_STAGE_ANALYZER_PROMPT
        elif stage_type == 'PITCH':
            prompt = PITCH_STAGE_ANALYZER_PROMPT
        stages = Stage.objects.filter(type=stage_type, stage_id__gte=current_stage).order_by('stage_id').all()
        stages = '\n'.join([
            f'{stage.stage_id}. {stage.description}'
            for stage in stages
        ])
        prompt = prompt.partial(stages=stages, **prompt_values)
        return LLMChain(llm=llm, memory=memory, verbose=verbose, prompt=prompt, callbacks=callbacks)

    def create_worker_chain(
            self,
            interview: Interview,
            stage_type: str,
            stage_id: str,
            llm: Union[BaseChatModel, BaseLLM],
            prompt_values: Dict,
            generic: bool = False,
            memory: BaseMemory = None,
            verbose: bool = False,
            callbacks: Callbacks = None
    ) -> LLMChain | None:
        prompt = BASE_AGENT_PROMPT if not generic else BASE_AGENT_GENERIC_PROMPT
        if stage_type == 'BASE':
            if stage_id == '2':
                prompt = RESUME_AGENT_PROMPT if not generic else RESUME_AGENT_GENERIC_PROMPT
                if settings.SETTINGS_MODULE == 'config.settings.local':
                    resume = load_pdf_as_str(interview.resume if interview.resume else interview.candidate.resume.path)
                else:
                    resume = load_pdf_as_str(interview.resume.url if interview.resume else interview.candidate.resume.url)
                prompt = prompt.partial(resume=resume, candidate_name=interview.candidate.get_full_name(), **prompt_values)
            elif stage_id == '3':
                return None
            else:
                prompt = BASE_AGENT_PROMPT if not generic else BASE_AGENT_GENERIC_PROMPT
                prompt = prompt.partial(candidate_name=interview.candidate.get_full_name(), **prompt_values)
        elif stage_type == 'DSA':
            prompt = DSA_BASE_AGENT_PROMPT if not generic else DSA_BASE_AGENT_GENERIC_PROMPT
            dsa_questions = ""
            incorrect_code_prompt = ""
            if stage_id == '1':
                questions = Message.objects.filter(interview=interview, stage__type=StageType.DSA, type=MessageType.AI,
                                                   stage__stage_id='1')
                dsa_questions = '\n'.join([question.content for question in questions])
                dsa_questions = DSA_QUESTIONS_HISTORY.format(dsa_questions=dsa_questions)
                print(f'\n\n########DSA Questions: \n{dsa_questions}')
                prompt = prompt.partial(candidate_name=interview.candidate.get_full_name(), **prompt_values)
            elif stage_id == '3':
                incorrect_code_prompt = DSA_CORRECT_CODE
                last_code_status = Message.objects.filter(interview=interview, stage__type=StageType.DSA,
                                                          type=MessageType.AI, stage__stage_id='4').order_by('-created').first()
                if last_code_status is not None and last_code_status.content == 'false':
                    incorrect_code_prompt = DSA_INCORRECT_CODE
                prompt = prompt.partial(candidate_name=interview.candidate.get_full_name(), **prompt_values)
            elif stage_id == '4':
                prompt = DSA_CODE_CHECK_PROMPT
                codes = Message.objects.filter(interview=interview, stage__type=StageType.DSA,
                                               stage__stage_id='3', type=MessageType.USER).order_by('-created').all()
                code = ""
                if len(codes):
                    code = codes[0].content
                prompt = prompt.partial(code=code, **prompt_values)
            else:
                prompt = prompt.partial(candidate_name=interview.candidate.get_full_name(), **prompt_values)
            prompt = prompt.partial(dsa_questions=dsa_questions, incorrect_code=incorrect_code_prompt)
        elif stage_type == 'PITCH':
            prompt = PITCH_AGENT_PROMPT
            prompt = prompt.partial(**prompt_values)

        print(f'\n\nPROMPT: {stage_id} \n{(str(prompt.format()))}\n\n')
        return LLMChain(llm=llm, memory=memory, verbose=verbose, prompt=prompt, callbacks=callbacks)

    def create(
            self, interview: Interview,
            type: str, stage_type: str, stage_id: str, llm,
            prompt_values: Dict, verbose=False, callbacks=None, **kwargs
    ) -> LLMChain | None:
        print(f'##Generic -> {interview.metadata.get("company")} - {interview.metadata.get("company") is None}')

        if type == 'SUPERVISOR':
            return self.create_supervisor_chain(
                interview=interview,
                generic=interview.metadata.get('company') is None,
                stage_type=stage_type,
                current_stage=stage_id,
                llm=llm,
                prompt_values=prompt_values,
                memory=kwargs.get('memory'),
                verbose=verbose,
                callbacks=callbacks
            )
        elif type == 'WORKER':
            return self.create_worker_chain(
                interview=interview,
                generic=interview.metadata.get('company') is None,
                stage_type=stage_type,
                stage_id=stage_id,
                llm=llm,
                prompt_values=prompt_values,
                memory=kwargs.get('memory'),
                verbose=verbose,
                callbacks=callbacks
            )
        return None
