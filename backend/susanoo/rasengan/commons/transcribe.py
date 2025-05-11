import time
import whisper


def transcribe(audio):
    start = time.time()
    model = whisper.load_model('small.en')
    response = model.transcribe(audio)
    end = time.time()
    print(response, end-start)
    return response



# transcribe('/Users/harsh/Downloads/test-2.wav')