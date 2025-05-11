import re
from contextlib import contextmanager
from typing import Dict, Any

from django.forms import model_to_dict
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.messages import AIMessage, HumanMessage

from rasengan.graph.models import Node
from susanoo.message.models import MessageV2
from susanoo.provider.models import LLM, LLMConfig
from susanoo.stage.models import Stage


class Color:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


def load_pdf_as_str(path: str) -> str:
    pdf_loader = PyPDFLoader(file_path=path)
    pages = pdf_loader.load()
    strs = []
    for page in pages:
        content = page.page_content
        # if content.count(' ') == 0:
        content = content.replace('\n\n', '<br>')
        content = content.replace('\n', ' ')
        content = content.replace('<br>', '\n\n')
        strs.append(content)
    return '\n\n'.join(strs)


def fallback_parsing(response: str) -> dict:
    regex = r'"(.*)":\s*"(.*)"'
    match = re.search(regex, response)
    print
    response = {}
    response[match.group(1).strip()] = match.group(2).strip()
    return response


def get_node_llm_mapping() -> dict:
    nodes = Node.objects.all()
    mapping = {}
    for node in nodes.all():
        mapping[str(node.id)] = None if not node.llm else str(node.llm.id)
    return mapping


def set_node_llm_mapping(mapping: dict) -> None:
    nodes = Node.objects.all()
    for node in nodes.all():
        if mapping[str(node.id)] is not None:
            node.llm = LLM.objects.get(id=mapping[str(node.id)])
            node.save()


def get_stage_timeouts() -> dict:
    stages = Stage.objects.all()
    mapping = {}
    for stage in stages.all():
        mapping[f'{str(stage.id)}:{stage.type}:{stage.name}'] = stage.timeout
    return mapping


def set_stage_timeouts(timeouts: dict) -> None:
    for code, timeout in timeouts.items():
        stage_id, stage_type, stage_name = code.split(':')
        stage = Stage.objects.get(id=stage_id, type=stage_type, name=stage_name)
        stage.timeout = timeout
        stage.save()


@contextmanager
def open_for_writing(filename):
    """
    Opens a file in write mode and closes it automatically upon leaving the context.
    Yields the open file object for user interaction.

    Args:
        filename (str): The name of the file to open.

    Yields:
        file: The opened file object in write mode.
    """
    try:
        with open(filename, "w+") as file:
            yield file
    except (OSError, IOError) as e:
        print(f"Error opening file: {e}")


def remove_tokens(generation: str) -> str:
    token_regex = re.compile(r'<[A-Z_]+>')
    return token_regex.sub('', generation).strip()


def get_llm_config_dict(config: LLMConfig) -> Dict[str, Any]:
    return model_to_dict(config, fields=['temperature', ])


def get_conversation_history(interview, return_message=False):
    messages = MessageV2.objects.filter(interview=interview).order_by('created').all()

    if return_message:
        return [
            AIMessage(content=message.content) if messages.type == 'AI' else HumanMessage(content=message.content)
            for message in messages
        ]

    return '\n'.join([
        f'{interview.interviewer.get_full_name()}: {message.content} <END_OF_TURN>' if message.type == 'AI' else f'Candidate: {message.content} <END_OF_TURN>'
        for message in messages
    ])


def get_conversation_history_for_stage(interview, stage, return_message=False):
    if stage.submodule == None:
        messages = interview.interview_messages_v2.filter(stage=stage).order_by('created').all()
    else:
        messages = interview.interview_messages_v2.filter(stage__module=stage.submodule).order_by('created').all()

    if return_message:
        return [
            AIMessage(content=message.content) if messages.type == 'AI' else HumanMessage(content=message.content)
            for message in messages
        ]

    return '\n'.join([
        f'{interview.interviewer.get_full_name()}: {message.content} <END_OF_TURN>' if message.type == 'AI' else f'Candidate: {message.content} <END_OF_TURN>'
        for message in messages
    ])
