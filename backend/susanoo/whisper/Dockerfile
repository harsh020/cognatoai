FROM nvidia/cuda:12.4.1-base-ubuntu22.04
#FROM ubuntu:jammy

WORKDIR /usr/local/src
RUN apt update
RUN apt install -y git ffmpeg make g++ vim wget
RUN git clone https://github.com/ggerganov/whisper.cpp.git -b master --depth 1

WORKDIR /usr/local/src/whisper.cpp
RUN bash ./models/download-ggml-model.sh small.en
# RUN make
WHISPER_CUDA=1 make -j

#CMD ["server", "--model", "./models/ggml-${model}.bin", "--convert"]
CMD ["./server", "--model", "./models/ggml-small.en.bin", "--convert", "--port", "8080", "-pr", "-pc", "-t", "10"]