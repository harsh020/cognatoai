from enum import Enum
from django.conf import settings
from langchain_core.language_models import BaseChatModel

from langchain_groq import ChatGroq
from langchain_cerebras import ChatCerebras
from langchain_community.chat_models import ChatPremAI
from langchain_google_genai import ChatGoogleGenerativeAI

from rasengan.interview.models.chat_gemini import ChatGemini
# from rasengan.interview.models.chat_gemini import ChatGemini
# from rasengan.interview.models.chat_premai import ChatPremAI
from susanoo.provider.models import LLM


class LLMFactory:
    fallback_registry = {
        'google_ai:gemini-1.0-pro': 'groq:llama-3.1-70b-versatile',
        'google_ai:gemini-1.5-pro': 'groq:llama-3.1-70b-versatile',
        'google_ai:gemini-1.0-flash': 'groq:llama-3.1-70b-versatile',
        'groq:llama-3.1-70b-versatile': 'open_ai:gpt-4o-mini',
        'groq:llama3-70b-8192': 'open_ai:gpt-4o-mini',
    }

    def __int__(self, **kwargs):
        if kwargs.get('fallback_registry'):
            self.fallback_registry = kwargs.get('fallback_registry')
        super().__int__()

    @staticmethod
    def create_google_ai(model: str = 'gemini-pro', temperature: float = 0.1, **kwargs) -> ChatGemini:
        return ChatGemini(
            model=model,
            gemini_api_key=settings.GOOGLE_AI_API_KEY,
            convert_system_message_to_human=True,
            temperature=temperature,
            **kwargs
        )
        # return ChatGoogleGenerativeAI(
        #     model=model,
        #     api_key=settings.GOOGLE_AI_API_KEY,
        #     convert_system_message_to_human=True,
        #     temperature=temperature,
        #     **kwargs
        # )

    @staticmethod
    def create_open_ai(model: str = 'gpt-4o-mini', temperature: float = 0.1, **kwargs) -> ChatPremAI:
        # return OpenAI(
        #     model=model,
        #     openai_api_key=settings.OPEN_AI_API_KEY,
        #     temperature=temperature,
        #     **kwargs
        # )
        return ChatPremAI(
            model=model,
            project_id=402,  # TODO: Make project id dynamic?
            api_key=settings.PREMAI_API_KEY,
            temperature=temperature,
            max_tokens=4096,
            **kwargs
        )

    @staticmethod
    def create_mistral_ai(model: str = 'mistral-medium', temperature: float = 0.1, **kwargs) -> ChatPremAI:
        return ChatPremAI(
            model=model,
            project_id=402,  # TODO: Make project id dynamic?
            api_key=settings.PREMAI_API_KEY,
            temperature=temperature,
            max_tokens=4096,
            **kwargs
        )

    @staticmethod
    def create_prem_ai(model: str = 'mistral-medium', temperature: float = 0.1, **kwargs) -> ChatPremAI:
        return ChatPremAI(
            model=model,
            project_id=402,  # TODO: Make project id dynamic?
            api_key=settings.PREMAI_API_KEY,
            temperature=temperature,
            max_tokens=4096,
            **kwargs
        )

    @staticmethod
    def create_groq(model: str = 'llama3-70b-8192', temperature: float = 0.1, **kwargs) -> ChatGroq:
        return ChatGroq(
            model=model,
            api_key=settings.GROQ_API_KEY,
            temperature=temperature,
            max_tokens=4096,
            **kwargs
        )

    @staticmethod
    def create_cerebras(model: str = 'llama3.1-70b', temperature: float = 0.6, **kwargs) -> ChatCerebras:
        return ChatCerebras(
            model=model,
            api_key=settings.CEREBRAS_API_KEY,
            temperature=temperature,
            max_tokens=4096,
            **kwargs
        )

    @staticmethod
    def create(llm: LLM, **kwargs) -> BaseChatModel:
        # TODO: Add other model configs
        if llm.provider.provider_id == 'google_ai':
            return LLMFactory.create_google_ai(model=str(llm.model), temperature=kwargs.get('temperature', 0.1))
        elif llm.provider.provider_id == 'open_ai':
            return LLMFactory.create_open_ai(model=str(llm.model), temperature=kwargs.get('temperature', 0.1))
        elif llm.provider.provider_id == 'mistral_ai':
            return LLMFactory.create_mistral_ai(model=str(llm.model), temperature=kwargs.get('temperature', 0.1))
        elif llm.provider.provider_id == 'groq':
            return LLMFactory.create_groq(model=str(llm.model), temperature=kwargs.get('temperature', 0.1))
        elif llm.provider.provider_id == 'cerebras':
            return LLMFactory.create_cerebras(model=str(llm.model), temperature=kwargs.get('temperature', 0.1))
        else:
            return LLMFactory.create_prem_ai(model=str(llm.model), temperature=kwargs.get('temperature', 0.1))
        # raise ValueError('Invalid llm provider provided')

    @staticmethod
    def create_with_fallback(provider: str, model: str, **kwargs) -> BaseChatModel:
        # TODO: Add other model configs
        if provider == 'google_ai':
            model_instance = LLMFactory.create_google_ai(model=model, temperature=kwargs.get('temperature', 0.1))
        elif provider == 'open_ai':
            model_instance = LLMFactory.create_open_ai(model=model, temperature=kwargs.get('temperature', 0.1))
        elif provider == 'mistral_ai':
            model_instance = LLMFactory.create_mistral_ai(model=model, temperature=kwargs.get('temperature', 0.1))
        elif provider == 'groq':
            model_instance = LLMFactory.create_groq(model=model, temperature=kwargs.get('temperature', 0.1))
        else:
            model_instance = LLMFactory.create_prem_ai(model=model, temperature=kwargs.get('temperature', 0.1))
        # raise ValueError('Invalid llm provider provided')

        if LLMFactory.fallback_registry.get(f'{provider}:{model}'):
            fallback_provider, fallback_model = LLMFactory.fallback_registry.get(f'{provider}:{model}').strip().split(
                ':')
            fallback_model = LLMFactory.create_with_fallback(fallback_provider, fallback_model)
            model_instance.with_fallbacks([fallback_model])
        return model_instance
