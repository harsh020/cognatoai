import importlib

from django.conf import settings

from oneiros.text_to_speech.strategy.base import TextToSpeech
from oneiros.text_to_speech.strategy.strategy import ModalTextToSpeech


def text_to_speech_factory(strategy: str, configs: dict) -> TextToSpeech:
    module = 'oneiros.text_to_speech.strategy.strategy'
    module_instance = importlib.import_module(module)
    class_name = f'{strategy.title()}TextToSpeech'
    try:
        strategy_class = getattr(module_instance, class_name)
        return strategy_class(**configs)
    except AttributeError:
        return ModalTextToSpeech(**settings.TEXT_TO_SPEECH.get('modal'))

