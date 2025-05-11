import React, {useEffect, useState} from 'react';
import {useAudioRecorder, useAudioRecorderV2} from "../commons/hooks";
import Loader from "./Loader";
import {RECORDER_STATUS} from "../constants/enums";
import {useDispatch, useSelector} from "react-redux";
import {liveTranscribe, speak, transcribe} from "../store/linguistic/linguisticActions";
import {CONFIG, settings} from "../commons/config";
import {UTILS} from "../commons/utils";
import BgGradientText from "./BgGradientText";
import BgGradientButton from "./BgGradientButton";
import {INTERVIEW_APIS} from "../apis/interviewApis";

// const mimeType = 'audio/webm;codecs=opus';

function TestAudioTranscriber(props) {
  const dispatch = useDispatch();

  const liveTranscribeAudio = useSelector(state => state.liveTranscribedAudio)
  const { transcript } = liveTranscribeAudio;

  const retrievedAudio = useSelector(state => state.retrieveAudio);
  const { audio: audioStream, error: audioError } = retrievedAudio;

  // const [text, setText] = useState("");

  let transcriptConfig = {
    chunkSize: 2000,
    chunkHandler: (chunk, allChunks, mimeType=CONFIG.DEFAULT_AUDIO_MIME_TYPE) => {
      // if(allChunks[0] !== chunk) { // Get the headers from the first chunk, without headers the wav chunk is invalid.
      //   let first = allChunks[0];
      //   chunk = new Blob([first.slice(0, 44), chunk])
      // }

      // const audioFile = new File([chunk], 'test.wav', { type: mimeType });
      // console.log("lets go to havannah!")
      const ext = UTILS.getFileExtensionFromMimeType(mimeType)

      const data = new FormData();
      data.append('file', new File([chunk], `${Date.now()}.${ext}`, { type: mimeType }));
      data.append('id', "test-audio");
      data.append('type', 'audios')
      INTERVIEW_APIS.recording(data)
        .then('success', (res) => {
          // console.log(res);
        }).then('error', (error) => {
        console.error(error);
      });
    }
  }

  let {
    permissions,
    recorderStatus,
    mimeType,
    audio,
    startRecording,
    stopRecording
  } = useAudioRecorderV2();

  // console.log('recording permissions -> ', permissions);


  useEffect(() => {
    if(audio) {

      let mime = mimeType || CONFIG.DEFAULT_AUDIO_MIME_TYPE
      const ext = UTILS.getFileExtensionFromMimeType(mime)

      let data = new FormData();
      data.append('condition_on_previous_text', true);
      data.append('file', new File([audio], `full-${Date.now()}.${ext}`, { type: mime }));
      data.append('id', 'test-audio');
      data.append('type', 'full-audio');

      // dispatch(transcribe(data));
      INTERVIEW_APIS.recording(data)
        .then('success', (res) => {
          // console.log(res);
        }).then('error', (error) => {
        console.error(error);
      });
      console.log('Recording complete...');
    }
  }, [audio]);


  return (
    <div className='flex flex-col w-full'>
      {
        !audioStream ? (
          <button className='flex flex-row bg-!grey-400/30 hover:bg-!grey-400/50 rounded-md py-2 px-4'>
            <Loader />
          </button>
        ) : recorderStatus === RECORDER_STATUS.INACTIVE ? (
          <button className='flex flex-row bg-!grey-400/30 hover:bg-!grey-400/50 rounded-md py-2 px-4 gap-x-2'
                  disabled={props.disabled}
                  onClick={() => {
                    dispatch({
                      type: 'socket/connect'
                    })
                    startRecording();
                  }}
          >
            <span className='flex flex-col m-auto'>
              <img className='h-[1rem] m-auto' src='/media/images/icons/mic.webp' alt='' />
            </span>
            <span className='flex flex-col'>Start</span>
          </button>
        ) : (
          <button className='flex flex-row bg-!grey-400/30 hover:bg-!grey-400/50 rounded-md py-2 px-4 gap-x-2'
                  disabled={props.disabled}
                  onClick={() => {
                    dispatch({
                      type: 'socket/disconnect'
                    })
                    stopRecording();
                  }}
          >
            <span className='flex flex-col m-auto'>
              <img className='h-[1rem] m-auto border-[2px] border-!red-600 rounded-full' src='/media/images/icons/stop-2.webp' alt='' />
            </span>
            <span className='flex flex-col'>Stop</span>
          </button>
        )
      }

      <div>{transcript && transcript.text}</div>

      <div>
        <button className='flex flex-row bg-!grey-400/30 hover:bg-!grey-400/50 rounded-md py-2 px-4 gap-x-2' onClick={() => {
          dispatch(speak({
            'id': "test",
            'text': "this is test",
          }))
        }}>audio</button>
      </div>
    </div>
  );
}

export default TestAudioTranscriber;