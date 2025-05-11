import tempfile
import subprocess

from rasengan.speech_recognition.whisper_cpp import WhisperCpp


def transcribe(audio):
    whisper = WhisperCpp(
        whisper_cpp_path='/Users/harsh/Desktop/open_source/whisper.cpp',
        model_path='/Users/harsh/Desktop/open_source/whisper.cpp/models/ggml-small.en.bin',
        verbose=True
    )

    # with tempfile.NamedTemporaryFile('a+', suffix='.webm')
    whisper.run(audio=audio)


transcribe('/Users/harsh/Downloads/190c2d97-e81c-462b-ae75-cbbbb2ab3dff.wav')