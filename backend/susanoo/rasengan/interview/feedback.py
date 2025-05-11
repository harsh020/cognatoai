import json

from langchain.chains import LLMChain
from langchain.output_parsers.json import parse_json_markdown
from langchain_community.callbacks import get_openai_callback
from langchain_core.callbacks import Callbacks
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.output_parsers import BaseOutputParser
from langchain_core.prompts import ChatPromptTemplate, SystemMessagePromptTemplate
from pydantic import BaseModel

from rasengan.llm.llms import LLMFactory
from rasengan.llm.parsers import RegexJsonOutputParser
from rasengan.prompt.prompts import FEEDBACK_TEMPLATE
from rasengan.commons.utils import load_pdf_as_str
from susanoo.interview.models import Interview
from susanoo.message.models import Message
from susanoo.provider.models import LLM
from susanoo.usage.enums import UsageType
from susanoo.usage.models import Usage

FEEDBACK_PROMPT = ChatPromptTemplate.from_messages(
    messages=[
        SystemMessagePromptTemplate.from_template(FEEDBACK_TEMPLATE)
    ]
)


class FeedbackExecutor(BaseModel):
    json_parser: BaseOutputParser = RegexJsonOutputParser()
    llm_factory: LLMFactory = LLMFactory()

    class Config:
        arbitrary_types_allowed = True

    # @root_validator()
    # def validate_kwargs(cls, values: Dict) -> Dict:
    #     return values

    def get_conversation_history(self, interview, return_message=False):
        messages = Message.objects.filter(interview=interview).order_by('created').all()

        if return_message:
            return [
                AIMessage(content=message.content) if messages.type == 'AI' else HumanMessage(content=message.content)
                for message in messages
            ]

        return '\n'.join([
            f'{interview.interviewer.get_full_name()}: {message.content} <END_OF_TURN>' if message.type == 'AI' else f'Candidate: {message.content} <END_OF_TURN>'
            for message in messages
        ])

    def _call(
            self,
            interview: Interview,
            llm: LLM,
            verbose: bool = False,
            callbacks: Callbacks = None
    ) -> dict:
        prompt = FEEDBACK_PROMPT
        chain = LLMChain(
            llm=self.llm_factory.create(llm=llm, temperature=0.0),
            prompt=prompt,
            verbose=verbose,
            callbacks=callbacks
        )
        with get_openai_callback() as trace:
            raw_response = chain.run(
                candidate_resume=load_pdf_as_str(interview.candidate.resume.path),
                job_summary=interview.job.description,
                conversation_history=self.get_conversation_history(interview)
            )

            input = prompt.format(
                candidate_resume=load_pdf_as_str(interview.candidate.resume.path),
                job_summary=interview.job.description,
                conversation_history=self.get_conversation_history(interview)
            )

            Usage.objects.create(
                type=UsageType.FEEDBACK,
                interview=interview,
                llm=llm,
                input=input,
                output=raw_response,
                prompt_tokens=trace.prompt_tokens,
                completion_tokens=trace.completion_tokens,
            )

        try:
            response = json.loads(raw_response)
        except json.decoder.JSONDecodeError:
            response = parse_json_markdown(raw_response)
        except Exception:
            response = self.json_parser.parse(raw_response)
        return response
