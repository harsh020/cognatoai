import json
import re
from typing import Union, Any

from langchain.agents import AgentOutputParser
from langchain.output_parsers.json import parse_json_markdown, SimpleJsonOutputParser
from langchain_core.agents import AgentAction, AgentFinish
from langchain_core.exceptions import OutputParserException


class InterviewerOutputParser(AgentOutputParser):
    ai_prefix: str = 'AI'

    def parse(self, text: str) -> Union[AgentAction, AgentFinish]:
        # If no tools were used to generate output
        if f'{self.ai_prefix}:' in text:
            return AgentFinish(
                return_values={'output': text.split(f'{self.ai_prefix}:')[-1].strip()},
                log=text
            )

        # Else tools were used so parse for that
        regex = (
            r"Action\s*\d*\s*:[\s]*(.*?)[\s]*Action\s*\d*\s*Input\s*\d*\s*:[\s]*(.*)"
        )
        action_match = re.search(regex, text)
        if not action_match:
            # Handle this more sensibly
            return AgentFinish(
                {"output": "I apologize, I was unable to find the answer to your question. Is there anything else I can help with?"},
                text,
            )

        action = action_match.group(1).strip()
        action_input = action_match.group(2)
        tool_input = action_input.strip(" ").strip('"')
        return AgentAction(action, tool_input, text)

    @property
    def _type(self) -> str:
        return 'interviewer'

class InterviewerJsonOutputParser(AgentOutputParser):
    ai_prefix: str = 'AI'

    def parse(self, text: str) -> Union[AgentAction, AgentFinish]:
        # If no tools were used to generate output
        try:
            response = json.loads(text)
        except Exception:
            response = parse_json_markdown(text)

        if response.get(self.ai_prefix):
            return AgentFinish(
                return_values={'output': response[self.ai_prefix].split(f'{self.ai_prefix}:')[-1].strip()},
                log=text
            )

        # Else tools were used so parse for that
        if not response.get('Action') or not response.get('Action Input'):
            # Handle this more sensibly
            return AgentFinish(
                {"output": "I apologize, I was unable to find the answer to your question. Is there anything else I can help with?"},
                text,
            )

        action = response.get('Action').strip()
        action_input = response.get('Action Input').strip()
        tool_input = action_input.strip(" ").strip('"')
        return AgentAction(action, tool_input, text)

    @property
    def _type(self) -> str:
        return 'interviewer'


class RegexJsonOutputParser(SimpleJsonOutputParser):
    def parse(self, text: str) -> Any:
        text = text.strip()
        try:
            regex = r'"(.*)":\s*["]{0,1}(.*)["]{0,1}'
            matches = re.finditer(regex, text)
            response = {}
            for match in matches:
                value = match.group(2).strip()
                response[match.group(1).strip()] = value[:-1] if value[-1] == '"' else value
            return response
        except Exception as e:
            raise OutputParserException(f"Invalid json output: {text}") from e
