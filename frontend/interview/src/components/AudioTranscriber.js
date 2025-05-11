import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useAudioRecorder, useAudioRecorderV2} from "../commons/hooks";
import Loader from "./Loader";
import {INTERVIEW_STATUS, RECORDER_STATUS} from "../constants/enums";
import {useDispatch, useSelector} from "react-redux";
import {liveTranscribe, transcribe} from "../store/linguistic/linguisticActions";
import {CONFIG, settings} from "../commons/config";
import {UTILS} from "../commons/utils";
import {UPLOAD_APIS} from "../apis/uploadApis";

// const mimeType = 'audio/wav';

function AudioTranscriber(props) {
  const dispatch = useDispatch();
  const [socketConnected, setSocketConnected] = useState(false);
  const [startTimestamp, setStartTimestamp] = useState()
  const [uid, setUid] = useState();
  const [chunksUploaded, setChunksUploaded] = useState(0);

  const uidRef = useRef(uid);


  const liveTranscribeAudio = useSelector(state => state.liveTranscribedAudio)
  const { transcript } = liveTranscribeAudio;

  const interviewData = useSelector(state => state.retrieveInterview);
  const {loading, interview, error} = interviewData;

  let transcriptConfig = {
    chunkSize: settings.e2ePipeline.audio?.chunk || 2000,
    chunkHandler: useCallback((chunk, allChunks, mimeType=CONFIG.DEFAULT_AUDIO_MIME_TYPE) => {
      if(mimeType.indexOf('wav') >= 0 && allChunks[0] !== chunk) {
        let first = allChunks[0];
        chunk = new Blob([first.slice(0, 44), chunk])
      }

      const ext = UTILS.getFileExtensionFromMimeType(mimeType)

      const audioFile = new File([chunk], `${Date.now()}.${ext}`, { type: mimeType });

      if(settings.liveTranscript.enabled) {
        if(settings.liveTranscript.websocket) {
          UTILS.fileToBase64(audioFile).then(data => {
            // console.log(data)
            dispatch({
              type: 'socket/send',
              payload: data
            })
          })
        }
        else {
          const data = new FormData();
          data.append('id', 'interview');
          // data.append('condition_on_previous_text', false);
          // data.append('prefix', transcript ? transcript.text : "");
          // data.append('beam_size', 3);
          data.append('file', audioFile);

          dispatch(liveTranscribe(data));
        }
      }
      else if(settings.e2ePipeline.audio?.stream) {
        const data = new FormData();
        data.append('id', interview.id);
        data.append('file', audioFile);
        data.append('uid', uidRef.current);

        UPLOAD_APIS.audio(data)
          .then(res => {
            if (res.status === 200) {
              setChunksUploaded(prev => prev + 1);
            }
            console.log(`${chunksUploaded} uploaded successfully`)
          })
          .catch(err => console.error(err))
      }
    }, [chunksUploaded, uid])
  }

  let {
    permissions,
    recorderStatus,
    audio,
    mimeType,
    startRecording,
    stopRecording,
    totalChunks
  } = useAudioRecorderV2( {
    chunkSize: settings.liveTranscript.enabled || settings.e2ePipeline.audio?.stream ? transcriptConfig.chunkSize : null,
    chunkHandler: settings.liveTranscript.enabled || settings.e2ePipeline.audio?.stream ? transcriptConfig.chunkHandler : null
  });

  // console.log('recording status -> ', recorderStatus);
  useEffect(() => {
    if(settings.liveTranscript.websocket) {
      if (recorderStatus === RECORDER_STATUS.RECORDING) {
        dispatch({
          type: 'socket/connect'
        })
      } else if (recorderStatus === RECORDER_STATUS.INACTIVE) {
        console.log('disconnecting socket');
        dispatch({
          type: 'socket/disconnect'
        })
      }
    }
  }, [recorderStatus]);

  useEffect(() => {
    // TODO: save transcription settings in backend
    if(settings.fullTranscript.enabled && audio) {
      const ext = UTILS.getFileExtensionFromMimeType(mimeType)

      let data = new FormData();
      data.append('file', new File([audio], `${Date.now()}.${ext}`, { type: mimeType }));
      data.append('id', `interviews/${interview.id}`);
      data.append('response_format', 'json');

      dispatch(transcribe(data));
      setStartTimestamp(null);
    }

    if(settings.e2ePipeline.enabled && audio) {
      if(settings.e2ePipeline.audio?.stream) {
        console.log(totalChunks, chunksUploaded)
        if(totalChunks === chunksUploaded) {
          props.onAudioHandler(audio, mimeType, uid)
          setChunksUploaded(0)
        }
      } else {
        props.onAudioHandler(audio, mimeType, uid)
      }
    }
  }, [audio, totalChunks, chunksUploaded]);

  useEffect(() => {
    if(transcript && transcript.text && transcript.text.includes('[BLANK_AUDIO]')) {
      // console.log('calling stop recording from live transcript change')
      // console.log(transcript)
      stopRecording();
      props.onStopHandler();
    }
  }, [transcript]);

  useEffect(() => {
    if(props.listen && settings.listen.auto) {
      setStartTimestamp(Date.now());
      startRecording();
    }
  }, [props.listen]);

  useEffect(() => {
    uidRef.current = uid;
  }, [uid]);


  return (
    <div className='flex flex-row w-full'>
      {
        !permissions ? (
          <button className='flex flex-row bg-!grey-400/30 hover:bg-!grey-400/50 rounded-md py-2 px-4'>
            <Loader />
          </button>
        ) : recorderStatus === RECORDER_STATUS.INACTIVE ? (
          <button className='flex flex-row bg-!grey-400/30 hover:bg-!grey-400/50 rounded-md py-2 px-4 gap-x-2'
                  disabled={props.disabled}
                  onClick={() => {
                    setStartTimestamp(Date.now());
                    if(settings.e2ePipeline.audio?.stream) setUid(crypto.randomUUID().toString())

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
                    stopRecording();
                    props.onStopHandler();
                  }}
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

export default AudioTranscriber;
