import importlib

from django.conf import settings

from oneiros.speech_to_text.strategy.base import SpeechToText
from oneiros.speech_to_text.strategy.strategy import ModalSpeechToText


def speech_to_text_factory(strategy: str, configs: dict) -> SpeechToText:
    module = 'oneiros.speech_to_text.strategy.strategy'
    module_instance = importlib.import_module(module)
    class_name = f'{strategy.title()}SpeechToText'
    try:
        strategy_class = getattr(module_instance, class_name)
        return strategy_class(**configs)
    except AttributeError:
        return ModalSpeechToText(**settings.SPEECH_TO_TEXT.get('modal'))

