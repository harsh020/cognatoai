import os
import logging
from typing import (
    Any,
    Dict,
    List,
    Optional,
    Union, Tuple, Callable
)
from pathlib import Path

from langchain_core.language_models.llms import create_base_retry_decorator
from pydantic import BaseModel, Field, root_validator
from langchain_community.adapters.openai import convert_message_to_dict, convert_dict_to_message
from langchain_community.chat_models.openai import _convert_delta_to_message_chunk
from langchain_core.callbacks import CallbackManagerForLLMRun, AsyncCallbackManagerForLLMRun

from langchain_core.language_models.chat_models import BaseChatModel, generate_from_stream
from langchain_core.messages import BaseMessage, AIMessage, AIMessageChunk
from langchain_core.outputs import GenerationChunk, ChatResult, ChatGeneration, ChatGenerationChunk
from langchain_core.utils import get_pydantic_field_names, get_from_dict_or_env
from langchain_core.utils.utils import build_extra_kwargs
# from llama_cpp import LlamaGrammar

logging = logging.getLogger(__file__)


def _create_retry_decorator(
    llm: BaseChatModel,
    run_manager: Optional[
        Union[AsyncCallbackManagerForLLMRun, CallbackManagerForLLMRun]
    ] = None,
) -> Callable[[Any], Any]:
    import premai.errors

    errors = [
        premai.errors.UnexpectedStatus,
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
        return llm.client.create(**kwargs)

    return _completion_with_retry(**kwargs)


def _stream_response_to_generation_chunk(
    stream_response: Dict[str, Any],
) -> GenerationChunk:
    """Convert a stream response to a generation chunk."""
    if stream_response['choices'][0]['delta'].get('role', None):
        return GenerationChunk(
            text=f"\n{stream_response['choices'][0]['delta']['role']}:",
            generation_info=dict(
                finish_reason=stream_response["choices"][0].get("finish_reason", None),
                logprobs=stream_response["choices"][0].get("logprobs", None),
            ),
        )
    elif stream_response['choices'][0]['delta'].get('content', None):
        return GenerationChunk(
            text=stream_response['choices'][0]['delta']['content'],
            generation_info=dict(
                finish_reason=stream_response["choices"][0].get("finish_reason", None),
                logprobs=stream_response["choices"][0].get("logprobs", None),
            ),
        )
    return GenerationChunk(text="")


class ChatPremAI(BaseChatModel):

    client: Any  #: :meta private:

    project_id: int
    """Prem project id"""

    model: str
    """The name of model."""

    premai_api_key: Optional[str] = Field(default=None, alias="api_key")
    """Automatically inferred from env var `PREMAI_API_KEY` if not provided."""

    seed: int = Field(-1, alias="seed")
    """Seed. If -1, a random seed is used."""

    session_id: Union[None, str] = None
    """The ID of the session to use. It helps to track the chat history."""

    n: int = 1
    """How many chat completion choices to generate for each input message."""

    max_tokens: Optional[int] = 256
    """The maximum number of tokens to generate."""

    max_retries: int = 5
    """The maximum number of retries to make when generating."""

    temperature: Optional[float] = 0.8
    """The temperature to use for sampling."""

    top_p: Optional[float] = 0.95
    """The top-p value to use for sampling."""

    logprobs: Optional[int] = Field(None)
    """The number of logprobs to return. If None, no logprobs are returned."""

    frequency_penalty: Union[None, float] = 0.0
    """Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency."""

    presence_penalty: Union[None, float] = 1.1
    """Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far."""

    echo: Optional[bool] = False
    """Whether to echo the prompt."""

    stop: Optional[List[str]] = None
    """A list of strings to stop generation when encountered."""

    model_kwargs: Dict[str, Any] = Field(default_factory=dict)
    """Any additional parameters to pass to premai ChatCompletionInputDict."""

    streaming: bool = False
    """Whether to stream the results, token by token."""

    verbose: bool = True
    """Print verbose output to stderr."""

    convert_system_message_to_human: bool = True

    model_run_args: List[str] = [
        "project_id",
        "messages",
        "session_id",
        "model",
        "tools",
        "system_prompt",
        "temperature",
        "top_p",
        "max_tokens",
        "stream",
        "stop",
        "seed",
        "response_format",
        "max_tokens",
        "max_retries",
        "presence_penalty",
        "frequency_penalty",
        "user",
        "n",
        "echo",
        "logprobs",
        "logit_bias"
    ]  #: :meta private:
    """Arguments supported by Prem AI for chat completion"""

    @root_validator()
    def validate_environment(cls, values: Dict) -> Dict:
        """Validate that llama-cpp-python library is installed."""
        try:
            from premai import Prem
        except ImportError:
            raise ImportError(
                "Could not import premai library. "
                "Please install the premai library to "
                "use this embedding model: pip install premai"
            )

        values["premai_api_key"] = get_from_dict_or_env(
            values, "premai_api_key", "PREMAI_API_KEY"
        )

        model = values["model"]
        model_param_names = [
            "project_id",
            "session_id",
            "system_prompt",
            "temperature",
            "top_p",
            "frequency_penalty",
            "logit_bias",
            "max_tokens",
            "max_retries",
            "stream",
            "stop",
            "seed",
            "response_format",
            "max_tokens",
            "presence_penalty",
            "user",
            "n",
        ]
        model_params = {k: values.get(k, None) for k in model_param_names}
        model_params.update(values["model_kwargs"])

        try:
            values["client"] = Prem(api_key=values["premai_api_key"]).chat.completions
        except Exception as e:
            raise ValueError(
                f"Could not create prem client: {model}. "
                f"Received error {e}"
            )
        return values

    @root_validator(pre=True)
    def build_model_kwargs(cls, values: Dict[str, Any]) -> Dict[str, Any]:
        """Build extra kwargs from additional params that were passed in."""
        all_required_field_names = get_pydantic_field_names(cls)
        extra = values.get("model_kwargs", {})
        values["model_kwargs"] = build_extra_kwargs(
            extra, values, all_required_field_names
        )
        return values

    @property
    def _default_params(self) -> Dict[str, Any]:
        """Get the default parameters for calling llama_cpp."""
        params = {
            "model": self.model,
            "project_id": self.project_id,
            "session_id": self.session_id,
            "max_tokens": self.max_tokens,
            "max_retries": self.max_retries,
            "temperature": self.temperature,
            "top_p": self.top_p,
            "logprobs": self.logprobs,
            "echo": self.echo,
            "stop": self.stop,  # key here is convention among LLM classes
            "presence_penalty": self.presence_penalty,
        }

        non_none_params = {}
        for key, value in params.items():
            if value is not None:
                non_none_params[key] = value
        return non_none_params

    @property
    def _identifying_params(self) -> Dict[str, Any]:
        """Get the identifying parameters."""
        return {**{"model": self.model}, **self._default_params}

    @property
    def _llm_type(self) -> str:
        """Return type of llm."""
        return "chat-premai"

    def _get_parameters(self, stop: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Performs sanity check, preparing parameters in format needed by llama_cpp.

        Args:
            stop (Optional[List[str]]): List of stop sequences for llama_cpp.

        Returns:
            Dictionary containing the combined parameters.
        """

        # Raise error if stop sequences are in both input and default params
        # if self.stop and stop is not None:
        #     raise ValueError("`stop` found in both the input and default params.")

        params = self._default_params

        # then sets it as configured, or default to an empty list:
        params["stop"] = self.stop or stop
        return params

    def get_num_tokens(self, text: str) -> int:
        tokenized_text = self.client.tokenize(text.encode("utf-8"))
        return len(tokenized_text)

    def _create_message_dicts(
        self, messages: List[BaseMessage], stop: Optional[List[str]]
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        params = self._get_parameters()
        if stop is not None:
            if "stop" in params and len(params.get('stop')) > 0:
                raise ValueError("`stop` found in both the input and default params.")
            params["stop"] = stop[0] # Prem just supports 1 stop arg
        message_dicts = [convert_message_to_dict(m) for m in messages]
        if self.convert_system_message_to_human:
            converted_message_dicts = []
            for message in message_dicts:
                if message['role'] == 'system':
                    message['role'] = 'user'
                converted_message_dicts.append(message)
        return message_dicts, params

    def _validate_model_run_args(self, **kwargs):
        params = dict()
        invalid_params = []
        for key, value in kwargs.items():
            if key not in self.model_run_args:
                invalid_params.append(key)
            else:
                params[key] = value
        if self.verbose and len(invalid_params):
            logging.warning(f'Invalid argument(s) {invalid_params} passed. Acceptable args {self.model_run_args}. Ignoring.')
        return params

    def _create_chat_result(self, response: Union[dict, BaseModel]) -> ChatResult:
        generations = []
        if not isinstance(response, dict):
            response = response.to_dict()
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
            "model_name": response["provider_name"],
            "provider_id": response["provider_id"],
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
            params = self._validate_model_run_args(**params, **kwargs)
            # response = self.client.create(messages=messages, **params)
            response = completion_with_retry(self, run_manager=run_manager, messages=messages, **params)
            return self._create_chat_result(response)

    def _stream(
            self,
            messages: List[BaseMessage],
            stop: Optional[List[str]] = None,
            run_manager: Optional[CallbackManagerForLLMRun] = None,
            *args,
            **kwargs
    ):
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