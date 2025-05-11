import re
import subprocess
import sys
import tempfile
from typing import Dict

from pydantic import BaseModel, model_validator, ConfigDict
from pydantic.v1 import root_validator

from rasengan.speech_recognition.speech_recognition import SpeechRecognition


class WhisperCpp(SpeechRecognition):
    model_config = ConfigDict(protected_namespaces=())
    whisper_cpp_path: str
    model_path: str
    end_token: str = '[BLANK_AUDIO]'
    verbose: bool = False
    stream: bool = False
    logs: bool = False

    # whisper.cpp stream params
    threads: int = 8
    length: int = 5000
    step: int = 5000
    keep: int = 200
    capture: int = -1
    max_tokens: int = 32
    audio_ctx: int = 0
    vad_thold: float = 0.60
    freq_thold: float = 100.00
    speed_up: bool = False
    translate: bool = False
    no_fallback: bool = False
    print_special: bool = False
    keep_context: bool = False
    language: str = 'en'
    file: str = None
    tinydiarize: bool = False
    save_audio: bool = False
    no_gpu: bool = False

    @root_validator
    def validate_params(self, values) -> Dict:
        whisper_kwargs = [
            'threads', 'step', 'length', 'keep', 'capture', 'max_tokens', 'audio_ctx',
            'vad_thold', 'freq_thold', 'speed_up', 'translate', 'no_fallback', 'print_special',
            'keep_context', 'language', 'model', 'file', 'tinydiarize', 'save_audio', 'no_gpu'
        ]

        for arg in values.keys():
            if arg not in whisper_kwargs:
                raise ValueError(f'Invalid argument for streaming {arg}')
        return values

    @property
    def whisper_kwargs(self) -> Dict:
        return {
            'threads': str(self.threads),
            'step': str(self.step),
            'length': str(self.length),
            'keep': str(self.keep),
            'capture': str(self.capture),
            'max-tokens': str(self.max_tokens),
            'audio-ctx': str(self.audio_ctx),
            'vad-thold': str(self.vad_thold),
            'freq-thold': str(self.freq_thold),
            'speed-up': self.speed_up,
            'translate': self.translate,
            'no-fallback': self.no_fallback,
            'print-special': self.print_special,
            'keep-context': self.keep_context,
            'language': self.language,
            'model': self.model_path,
            'file': self.file,
            'tinydiarize': self.tinydiarize,
            'save_audio': self.save_audio,
            'no_gpu': self.no_gpu
        }

    def run(self, audio=None) -> str:
        if self.stream:
            return self._stream()
        raise NotImplementedError('Only stream is implemented')

    def _run(self, audio) -> str:
        text = []

        whisper_main = [f'{self.whisper_cpp_path}/main']

        for arg, value in self.whisper_kwargs.items():
            if type(value) is bool:
                if value:
                    whisper_main.append(f'--{arg}')
            else:
                whisper_main.append(f'--{arg}')
                if arg == 'file':
                    whisper_main.append(audio)
                else:
                    whisper_main.append(value)

        # print(f'#### Prepared stream command -- {whisper_main}')

        process = subprocess.Popen(whisper_main, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
        for line in iter(process.stdout.readline, ""):
            line = line.decode('utf-8')
            text.append(line)

            if self.verbose:
                sys.stdout.write(line)

            if self.end_token in line:
                break

        return ' '.join(text)

    def _stream(self) -> str:
        text = []

        with tempfile.NamedTemporaryFile(mode='a+', suffix='.txt') as f:
            whisper_stream = [f'{self.whisper_cpp_path}/stream']

            for arg, value in self.whisper_kwargs.items():
                if type(value) is bool:
                    if value:
                        whisper_stream.append(f'--{arg}')
                else:
                    whisper_stream.append(f'--{arg}')
                    if arg == 'file' and not self.file:
                        whisper_stream.append(f.name)
                    else:
                        whisper_stream.append(value)

            # print(f'#### Prepared stream command -- {whisper_stream}')

            process = subprocess.Popen(whisper_stream, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
            for line in iter(process.stdout.readline, ""):
                line = line.decode('utf-8')

                if self.verbose:
                    sys.stdout.write(line)

                if self.end_token in line:
                    break

            f.seek(0)
            for line in f:
                line = line.strip().strip('\n')
                regex = r'(\[.+\])|(\(.+\))'
                if not re.search(regex, line):
                    text.append(line)

        return ' '.join(text)
