import tempfile

import modal


def load_model():
    from whispercpp import Whisper
    Whisper('small')


app = modal.App("whisper.cpp")
# image = modal.Image.from_dockerfile("Dockerfile.whispercpp", add_python='3.11').pip_install_from_requirements('./modal-requirements.txt')
    # .run_commands("./server --model ./models/ggml-small.en.bin --convert --port 8080 -pr -pc -t 10")
image = (
    modal.Image.debian_slim(python_version='3.11')
    .apt_install(['git', 'g++', 'ffmpeg'])
    .pip_install_from_requirements('modal-requirements.txt')
    .run_function(load_model)
)


@app.function(gpu='T4', image=image)
@modal.asgi_app()
def web():
    from fastapi import FastAPI, UploadFile, File
    import os
    from whispercpp import Whisper
    import shutil
    from fastapi.middleware.cors import CORSMiddleware

    app = FastAPI()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
        allow_credentials=True,
        expose_headers=["Content-Disposition"],
    )

    transcriber = Whisper('small')
    UPLOAD_DIR = "/tmp"
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)

    @app.get('/ping')
    def ping():
        return {
            'ping': 'pong'
        }

    @app.post('/transcribe')
    async def transcriptions(file: UploadFile = File(...)):
        # filename = file.filename
        # fileobj = file.file
        # upload_name = os.path.join(UPLOAD_DIR, filename)
        # upload_file = open(upload_name, 'wb+')
        # shutil.copyfileobj(fileobj, upload_file)
        # upload_file.close()
        # result = transcriber.transcribe(upload_name)
        # text = transcriber.extract_text(result)

        with tempfile.NamedTemporaryFile(suffix='.wav') as f:
            f.write(file.file.read())
            f.seek(0)

            result = transcriber.transcribe(f.name)
            text = transcriber.extract_text(result)

        return { 'text': text }

    return app