import React, { useState, useRef } from 'react';
import { Video, StopCircle } from 'lucide-react';

const ScreenRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [videoURL, setVideoURL] = useState('');
  const mediaRecorder = useRef(null);
  const recordedChunks = useRef([]);

  const startRecording = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "browser"
        },
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        },
        preferCurrentTab: true,
      });

      // Get system audio
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });

      // Combine both streams
      const combinedStream = new MediaStream([
        ...screenStream.getVideoTracks(),
        ...audioStream.getAudioTracks()
      ]);

      mediaRecorder.current = new MediaRecorder(combinedStream);
      recordedChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(recordedChunks.current, {
          type: 'video/webm'
        });
        const url = URL.createObjectURL(blob);
        setVideoURL(url);
      };

      mediaRecorder.current.start();
      setRecording(true);

      // Stop recording when screen share is ended
      screenStream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };
    } catch (err) {
      console.error("Error starting recording:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && recording) {
      mediaRecorder.current.stop();
      setRecording(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-4">
          <button
            onClick={startRecording}
            disabled={recording}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              recording
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <Video size={20} />
            Start Recording
          </button>
          <button
            onClick={stopRecording}
            disabled={!recording}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              !recording
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            <StopCircle size={20} />
            Stop Recording
          </button>
        </div>

        {recording && (
          <div className="text-red-500 flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            Recording in progress...
          </div>
        )}

        {videoURL && !recording && (
          <div className="w-full mt-4">
            <h3 className="text-lg font-semibold mb-2">Recording Preview:</h3>
            <video
              src={videoURL}
              controls
              className="w-full rounded-lg border"
            />
            <a
              href={videoURL}
              download="screen-recording.webm"
              className="mt-2 inline-block px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Download Recording
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

function Test2(props) {
  return (
    <div>
      <ScreenRecorder record={true} id={'test/screen'} />

      <br />
      <audio controls src="http://localhost:8000/media/interviews/d4af1ff5-b926-4914-842f-05af9f6a2f54/audios/ai/4d7785a4-30fc-419f-b761-b3e42e1c02a7.wav" />
    </div>
  );
}

export default Test2;