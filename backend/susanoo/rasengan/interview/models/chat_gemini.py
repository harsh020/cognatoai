from typing import List, Optional, Any, Tuple, Dict, Union, Callable

import google.api_core
from langchain_community.adapters.openai import convert_message_to_dict, convert_dict_to_message
from langchain_community.chat_models.openai import _convert_delta_to_message_chunk
from langchain_core.callbacks import CallbackManagerForLLMRun, AsyncCallbackManagerForLLMRun
from langchain_core.language_models.chat_models import generate_from_stream, BaseChatModel
from langchain_core.language_models.llms import create_base_retry_decorator
from langchain_core.messages import BaseMessage, AIMessageChunk
from langchain_core.outputs import ChatResult, ChatGenerationChunk, ChatGeneration
from langchain_core.utils import get_pydantic_field_names, get_from_dict_or_env, build_extra_kwargs
from pydantic import BaseModel, Field, root_validator

def _create_retry_decorator(
    llm: Union[BaseChatModel],
    run_manager: Optional[
        Union[AsyncCallbackManagerForLLMRun, CallbackManagerForLLMRun]
    ] = None,
) -> Callable[[Any], Any]:

    errors = [
        google.api_core.exceptions.ResourceExhausted,
        google.api_core.exceptions.ServiceUnavailable,
        google.api_core.exceptions.Aborted,
        google.api_core.exceptions.DeadlineExceeded,
        google.api_core.exceptions.GoogleAPIError,
    ]
    return create_base_retry_decorator(
        error_types=errors, max_retries=llm.max_retries, run_manager=run_manager
    )


def completion_with_retry(
    llm: BaseChatModel,
    run_manager: Optional[CallbackManagerForLLMRun] = None,
    **kwargs: Any,
) -> Any:
    """Use tenacity to retry the completion call."""
    retry_decorator = _create_retry_decorator(llm, run_manager=run_manager)

    @retry_decorator
    def _completion_with_retry(**kwargs: Any) -> Any:
        return llm.client.generate_content(**kwargs)

    return _completion_with_retry(**kwargs)


def convert_response_to_dict(input: List[str], response) -> Dict[str, Any]:
    choices = []

    # Gemini uses characters as tokens
    prompt_tokens = 0
    for prompt in input:
        prompt_tokens += len(prompt)

    completion_tokens = 0
    for res in response.candidates:
        message = res.content.parts[0].text

        # For Gemini models, a token is equivalent to about 4 characters. 100 tokens are about 60-80 English words.
        # Ref: https://ai.google.dev/models/gemini
        completion_tokens += (len(message) - 3) // 4

        finish_reason = res.finish_reason
        choices.append({
            'message': {
                'role': 'assistant',
                'content': message
            },
            'finish_reason': finish_reason
        })
    return {
        'choices': choices,
        'usage': {
            'prompt_tokens': prompt_tokens,
            'completion_tokens': completion_tokens
        }
    }


class ChatGemini(BaseChatModel):
    client: Any  #: :meta private:
    model: str = Field(
        ...,
        description="""The name of the model to use.
    Supported examples:
        - gemini-pro
        - models/text-bison-001""",
    )
    """Model name to use."""
    gemini_api_key: Optional[str] = Field(default=None, alias="api_key")
    """Automatically inferred from env var `PREMAI_API_KEY` if not provided."""

    temperature: float = 0.7
    """Run inference with this temperature. Must by in the closed interval [0.0, 1.0]."""

    top_p: Optional[float] = None
    """Decode using nucleus sampling: consider the smallest set of tokens whose
       probability sum is at least top_p. Must be in the closed interval [0.0, 1.0]."""

    top_k: Optional[int] = None
    """Decode using top-k sampling: consider the set of top_k most probable tokens.
       Must be positive."""

    max_tokens: Optional[int] = None
    """Maximum number of tokens to include in a candidate. Must be greater than zero.
       If unset, will default to 64."""

    n: int = 1
    """Number of chat completions to generate for each prompt. Note that the API may
       not return the full n completions if duplicates are generated."""

    max_retries: int = 5
    """The maximum number of retries to make when generating."""

    client_options: Optional[Dict] = Field(
        None,
        description=(
            "A dictionary of client options to pass to the Google API client, "
            "such as `api_endpoint`."
        ),
    )

    transport: Optional[str] = Field(
        None,
        description="A string, one of: [`rest`, `grpc`, `grpc_asyncio`].",
    )

    stop: Optional[List[str]] = []
    """A list of strings to stop generation when encountered."""

    streaming: bool = False
    """Whether to stream the results, token by token."""

    convert_system_message_to_human: bool = True

    @property
    def _llm_type(self) -> str:
        """Return type of llm."""
        return "chat-gemini"

    @root_validator(pre=True)
    def validate_environment(cls, values: Dict) -> Dict:
        """Validate that llama-cpp-python library is installed."""
        try:
            import google.generativeai as genai
        except ImportError:
            raise ImportError(
                "Could not import google-generativeai library. "
                "Please install the google-generativeai library to "
                "use this embedding model: pip install google-generativeai"
            )

        values["gemini_api_key"] = get_from_dict_or_env(
            values, "gemini_api_key", "GEMINI_API_KEY"
        )

        model = values["model"]
        model_param_names = [
            "model"
            "temperature",
            "top_p",
            "top_k",
            "max_tokens",
            "max_retries",
            "stream",
            "stop",
            "n",
            "transport",
            "client_options"
            "convert_system_message_to_human"
        ]
        model_params = {k: values.get(k, None) for k in model_param_names}
        model_params.update(values.get("model_kwargs", {}))

        try:
            genai.configure(
                api_key=values["gemini_api_key"],
                transport=values.get("transport"),
                client_options=values.get("client_options")
            )
            values["client"] = genai.GenerativeModel(model_name=values["model"])
        except Exception as e:
            raise ValueError(
                f"Could not create gemini client: {model}. "
                f"Received error {e}"
            )
        return values

    # @root_validator(pre=True)
    # def build_model_kwargs(cls, values: Dict[str, Any]) -> Dict[str, Any]:
    #     """Build extra kwargs from additional params that were passed in."""
    #     all_required_field_names = get_pydantic_field_names(cls)
    #     extra = values.get("model_kwargs", {})
    #     values["model_kwargs"] = build_extra_kwargs(
    #         extra, values, all_required_field_names
    #     )
    #     return values

    @property
    def _default_params(self) -> Dict[str, Any]:
        """Get the default parameters for calling llama_cpp."""
        params = {
            "stop_sequences": self.stop,
            "temperature": self.temperature,
            "top_p": self.top_p,
            "top_k": self.top_k,
            "max_output_tokens": self.max_tokens,
            "candidate_count": self.n,
        }

        return params

    def _create_gemini_prompts(self, messages: List[Dict[str, str]]) -> List[str]:
        messages_str = []
        for message in messages:
            messages_str.append(f"{message['role']}: {message['content']}")
        return messages_str

    def _create_message_dicts(
            self, messages: List[BaseMessage], stop: Optional[List[str]]
    ) -> Tuple[List[str], Dict[str, Any]]:
        params = self._default_params
        if stop is not None:
            if "stop_sequences" in params and len(params.get('stop_sequences')) > 0:
                raise ValueError("`stop` found in both the input and default params.")
            params["stop_sequences"] = stop
        message_dicts = [convert_message_to_dict(m) for m in messages]
        if self.convert_system_message_to_human:
            for message in message_dicts:
                if message['role'] == 'system':
                    message['role'] = 'user'
        message_dicts = self._create_gemini_prompts(message_dicts)
        return message_dicts, params

    def _create_chat_result(self, response: Union[dict, BaseModel]) -> ChatResult:
        generations = []
        if not isinstance(response, dict):
            response = response.dict()
        for res in response["choices"]:
            message = convert_dict_to_message(res["message"])
            generation_info = dict(finish_reason=res.get("finish_reason"))
            if "logprobs" in res:
                generation_info["logprobs"] = res["logprobs"]
            gen = ChatGeneration(
                message=message,
                generation_info=generation_info,
            )
            generations.append(gen)
        token_usage = response.get("usage", {})
        llm_output = {
            "token_usage": token_usage,
            "model_name": self.model,
            "provider_id": "google",
            "system_fingerprint": response.get("system_fingerprint", ""),
        }
        return ChatResult(generations=generations, llm_output=llm_output)

    def _generate(
            self,
            messages: List[BaseMessage],
            stop: Optional[List[str]] = None,
            run_manager: Optional[CallbackManagerForLLMRun] = None,
            **kwargs: Any,
    ) -> ChatResult:
        if self.streaming:
            stream_iter = self._stream(
                messages=messages,
                stop=stop,
                run_manager=run_manager,
                stream=True,
                **kwargs,
            )
            return generate_from_stream(stream_iter)
        else:
            messages, params = self._create_message_dicts(messages, stop=stop)
            # response = _completion_with_retry(
            #     self,
            #     prompt=messages,
            #     stream=False,
            #     is_gemini=True,
            #     run_manager=run_manager,
            #     generation_config=params,
            # )
            # response = self.client.generate_content(contents=messages, stream=False, generation_config=params)
            response = completion_with_retry(self, run_manager=run_manager, contents=messages, stream=False, generation_config=params)
            response = convert_response_to_dict(messages, response)
            return self._create_chat_result(response)

    def _stream(
            self,
            messages: List[BaseMessage],
            stop: Optional[List[str]] = None,
            run_manager: Optional[CallbackManagerForLLMRun] = None,
            *args,
            **kwargs
    ):
        raise NotImplementedError("Streaming is currently not supported!")
        default_chunk_class = AIMessageChunk
        messages, params = self._create_message_dicts(messages, stop=stop)
        params = self._validate_model_run_args(**params, **kwargs)
        for chunk in self.client.create(messages=messages, **params):
            print(chunk)
            print(chunk.__dict__)
            if len(chunk.choices) == 0:
                continue
            choice = chunk.choices[0]
            chunk = _convert_delta_to_message_chunk(
                choice["delta"], default_chunk_class
            )
            finish_reason = choice.get("finish_reason")
            generation_info = (
                dict(finish_reason=finish_reason) if finish_reason is not None else None
            )
            default_chunk_class = chunk.__class__
            chunk = ChatGenerationChunk(message=chunk, generation_info=generation_info)
            yield chunk
            if run_manager:
                run_manager.on_llm_new_token(chunk.text, chunk=chunk)
