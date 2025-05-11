from uuid import UUID
from typing import Dict, List, Any, Optional

from langchain_core.callbacks import FileCallbackHandler
from langchain_core.outputs import LLMResult
from langchain_core.utils import print_text


class XFileCallbackHandler(FileCallbackHandler):
    def on_llm_start(
        self,
        serialized: Dict[str, Any],
        prompts: List[str],
        *,
        run_id: UUID,
        parent_run_id: Optional[UUID] = None,
        tags: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> Any:
        formatted_prompts = "\n".join(prompts)
        print_text(
            f"\n\n\033[1m> Entering new LLM run...\033[0m\nPrompt after formatting:\n\033[32;1m\033[1;3m{formatted_prompts}\n\033[0m",
            end="\n",
            file=self.file,
        )

    def on_llm_end(
        self,
        response: LLMResult,
        *,
        run_id: UUID,
        parent_run_id: Optional[UUID] = None,
        **kwargs: Any,
    ) -> Any:
        formatted_output = ''.join(''.join(''.join(gen.text) for gen in generation) for generation in response.generations)
        print_text(
            f"\n\n\033[1m> Finishing LLM run...\033[0m\nLLM Result:\n\033[32;1m\033[1;3m{formatted_output}\nUsage:\n\033[32;1m\033[1;3m{response.llm_output}\n\033[0m",
            end="\n",
            file=self.file,
        )
