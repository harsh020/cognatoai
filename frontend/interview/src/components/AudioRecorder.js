import React from 'react';
import Loading from "./Loading";
import GradientButton from "./GradientButton";
import {useAudioRecorder, useAudioRecorderV2} from "../commons/hooks";
import Loader from "./Loader";
import {RECORDER_STATUS} from "../constants/enums";


function AudioRecorder(props) {
  const {
    permissions,
    recorderStatus,
    audio,
    audioUrl,
    startRecording,
    stopRecording
  } = useAudioRecorderV2();

  // console.log(recorderStatus)

  return (
    <div className='flex flex-row w-full'>
      {
        !permissions ? (
          <button className='flex flex-row bg-!grey-400/30 hover:bg-!grey-400/50 rounded-md py-2 px-4'>
            <Loader />
          </button>
        ) : recorderStatus === RECORDER_STATUS.INACTIVE ? (
          <button className='flex flex-row bg-!grey-400/30 hover:bg-!grey-400/50 rounded-md py-2 px-4 gap-x-2'
                  onClick={startRecording}
          >
            <span className='flex flex-col m-auto'>
              <img className='h-[1rem] m-auto' src='/media/images/icons/mic.webp' alt='' />
            </span>
            <span className='flex flex-col'>Start</span>
          </button>
        ) : (
          <button className='flex flex-row bg-!grey-400/30 hover:bg-!grey-400/50 rounded-md py-2 px-4 gap-x-2'
                  onClick={stopRecording}
          >
            <span className='flex flex-col m-auto'>
              <img className='h-[1rem] m-auto border-[2px] border-!red-600 rounded-full' src='/media/images/icons/stop-2.webp' alt='' />
            </span>
            <span className='flex flex-col'>Stop</span>
          </button>
        )
      }
    </div>
  );
}

export default AudioRecorder;