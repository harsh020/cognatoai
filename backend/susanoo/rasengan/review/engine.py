import json

from langchain_core.output_parsers import SimpleJsonOutputParser

from common.utils import parse_generation
from rasengan.commons.utils import load_pdf_as_str
from rasengan.llm.llms import LLMFactory
from rasengan.llm.parsers import RegexJsonOutputParser
from rasengan.prompt.prompts import RESUME_REVIEW_TEMPLATE
from susanoo.provider.models import LLM, Provider
from susanoo.review.models import Review

from django.conf import settings

from langchain_core.messages import AIMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate

from susanoo.usage.enums import UsageType
from susanoo.usage.models import UsageV2


class ReviewEngine:
    def __init__(self, **kwargs):
        try:
            provider = Provider.objects.get(provider_id='cerebras')
            self.llm = LLM.objects.get(provider=provider, model='llama3.1-70b')
        except Exception:
            provider = Provider.objects.get(provider_id='groq')
            self.llm = LLM.objects.get(provider=provider, model='llama3-70b-8192')
        self.model = LLMFactory.create_cerebras()
        self.json_parser = SimpleJsonOutputParser()

    def run(self, review: Review):
        print(self.model)
        variables = {
            'role': review.role,
            'resume': load_pdf_as_str(review.resume.path) if settings.SETTINGS_MODULE.find('local') > 0 else load_pdf_as_str(review.resume.url)
        }

        messages = [
            SystemMessage(content=RESUME_REVIEW_TEMPLATE.format(**variables))
        ]

        prompt = ChatPromptTemplate.from_messages(messages=messages)
        chain = prompt | self.model
        response = chain.invoke(variables)
        response = parse_generation(prompt.format(**variables), response)

        UsageV2.objects.create(
            type=UsageType.REVIEW,
            interview=None,
            llm=self.llm,
            input=response.input,
            output=response.output,
            prompt_tokens=response.usage.input_tokens,
            completion_tokens=response.usage.output_tokens,
            metadata={
                'type': 'review',
                'id': str(review.id)
            }
        )

        response.output = self.json_parser.parse(response.output)
        return response
