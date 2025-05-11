import React, {useEffect, useState} from 'react';

import { DATA } from '../../data/data';
import {UTILS} from "../../commons/utils";
import {useAudioRecorder, useAudioRecorderV2, useTimer, useVideoRecorder, useWatch} from "../../commons/hooks";
import moment from "moment";
import VideoRecorder from "../../components/VideoRecorder";
import {INTERVIEW_STATUS, MEETINGS_STATUS, RECORDER_STATUS} from "../../constants/enums";
import {INTERVIEW_APIS} from "../../apis/interviewApis";
import {useNavigate, useParams} from "react-router-dom";
import ConfirmModal from "../../components/ConfirmModal";
import {interviewScreenUpdate} from "../../store/interview/interviewActions";
import {useDispatch} from "react-redux";
import {stopAudio, stopVideo} from "../../store/av/avActions";
import {settings} from "../../commons/config";

function DetailContainer(props) {
  const { title, details } = props;

  return (
    <div className='flex flex-col h-full w-full bg-!grey-400/30 rounded-md p-2 gap-y-2'>
      <div className='flex flex-row w-full text-[1rem] font-extrabold justify-center mt-2 mb-1'>
        {title}
      </div>

      <div className='flex flex-col w-full px-2 gap-y-2 my-2'>
      {
        Object.entries(details).map(([key, value]) => (
          <div key={key} className='flex flex-row'>
            <span className='text-[0.8rem] font-semibold'>
              {UTILS.toTitleCase(key)}:&nbsp;
            </span>

            <span className='text-[0.8rem] font-normal'>
              {value}
            </span>
          </div>
        ))
      }
      </div>
    </div>
  )
}

function ParticipantContainer(props) {
  const { interview: id, participant, videoOn } = props
  // let {
  //   permissions,
  //   recorderStatus,
  //   liveVideoFeed,
  //   recordedVideo,
  //   startRecording,
  //   stopRecording,
  // } = useVideoRecorder({
  //   chunkSize: 10000,
  //   chunkHandler: (chunk, allChunks=[], type='video/mp4; codecs=avc1.42E01E,mp4a.40.2') => {
  //     if(videoOn) {
  //       // console.log(allChunks[0])
  //       // if(allChunks.length > 0) chunk = new Blob([allChunks[0], chunk])
  //       const mimeType = type;
  //       const ext = UTILS.getFileExtensionFromMimeType(mimeType)
  //       // console.log('id--->', id)
  //       const data = new FormData();
  //       data.append('file', new File([chunk], `${Date.now()}.${ext}`, { type: mimeType }));
  //       data.append('id', id);
  //       INTERVIEW_APIS.recording(data)
  //         .then('success', (res) => {
  //           // console.log(res);
  //         }).then('error', (error) => {
  //         console.error(error);
  //       });
  //     }
  //   }
  // });


  // useEffect(() => {
  //     if(recorderStatus === RECORDER_STATUS.INACTIVE && videoOn) startRecording();
  //     else if(recorderStatus === RECORDER_STATUS.RECORDING && !videoOn) stopRecording();
  // }, [videoOn]);



  return (
    <div className='flex flex-col h-full w-full m-auto bg-!grey-400/30 rounded-md px-2 py-6 gap-y-6'>
      <div className='flex flex-row m-auto w-full justify-center'>
        {
          videoOn ? (
            <div className='flex h-full w-full object-cover bg-black'>
              {/*<video className='rounded-md' ref={liveVideoFeed} controls={false} autoPlay style={{*/}
              {/*  transform: 'rotateY(180deg)',*/}
              {/*  // -webkit-transform: 'rotateY(180deg)', */}
              {/*  // -moz-transform: 'rotateY(180deg)' */}
              {/*}} />*/}
              {/*<video className='flex m-auto h-full w-full object-cover rounded-md' playsInline ref={liveVideoFeed} controls={false} autoPlay style={{*/}
              {/*  transform: 'rotateY(180deg)',*/}
              {/*  maxHeight: "100%",*/}
              {/*  maxWidth: "100%",*/}
              {/*  // -webkit-transform: 'rotateY(180deg)', // Safari and Chrome*/}
              {/*  // -moz-transform: 'rotateY(180deg)' // Firefox*/}
              {/*}} />*/}
              <VideoRecorder videoOn={videoOn} record={false} id={id} />
            </div>
          ) : (
            <img className='h-[12vh] rounded-full' src={participant.profile_picture} alt='profile-pic' />
          )
        }
      </div>

      {
        !videoOn && (
          <div className='flex flex-row m-auto'>
            <span className='flex flex-col m-auto text-[0.8rem] font-semibold align-baseline'>
              {participant.name}
            </span>
          </div>
        )
      }
    </div>
  )
}

function LeftSider(props) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const {timeLeft, finished, setTimer} = useTimer(props.interview.duration);
  const {timer, finished} = useWatch();

  const [showModal, setShowModal] = useState(false);

  const onLeaveHandler = () => {
    setShowModal(true);
  }

  return (
    <>
      {
        showModal && (
          <ConfirmModal
            message='Are you sure you want to leave the meeting?'
            onConfirmHandler={() => {
              // Stop speech synthesis, audio stream and video stream
              window.speechSynthesis.cancel();
              dispatch(stopAudio(INTERVIEW_STATUS.TERMINATED));
              dispatch(stopVideo(INTERVIEW_STATUS.TERMINATED));

              // Update screen
              dispatch(interviewScreenUpdate(MEETINGS_STATUS.POST_MEETING));
            }}
            onCloseHandler={() => setShowModal(false)}
          />
        )

      }
      <div className='flex flex-col h-full min-h-screen w-[30%] bg-!grey-800/20'>
        <div className='flex flex-row mx-auto p-4'>
          <img className='sm:h-[6vh] h-[5vh]' src='/media/images/logo/supermodal-md.webp' alt='logo'/>
        </div>

        <div className='flex flex-col flex-1 h-full w-full font-Inter text-!grey-200 mx-auto justify-between pb-4 px-3'>
          <div className='flex flex-col w-full gap-y-4'>
            <div className='flex flex-row text-[0.8rem] font-bold mt-4 mb-2 mx-auto'>
              {moment().format('dddd, MMMM Do YYYY')}
            </div>

            <div className='flex flex-row w-full'>
              <DetailContainer title='Candidate Details' details={{
                'name': props.interview.candidate.name,
                'email': props.interview.candidate.email,
                'phone': props.interview.candidate.phone
              }} />
            </div>

            <div className='flex flex-row w-full'>
              <DetailContainer title={`${UTILS.toTitleCase(props.interview.type)} Details`} details={{
                job_id: props.interview.job?.job_id,
                title: props.interview.job?.title,
                role: props.interview.job?.role,
              }} />
            </div>
          </div>

          <div className='flex flex-col w-full gap-y-4'>
            <div className='flex w-full h-full gap-x-2'>
              <div className='flex flex-col h-full bg-!grey-400/30 rounded-md p-2'>
                <img className='w-full leading-none p-1 m-auto' src='/media/images/icons/stopwatch.webp' alt='stopwatch'/>
              </div>

              <div className='flex flex-col flex-1 bg-!grey-400/30 rounded-md p-2 gap-y-1 justify-between'>
                <span className='flex flex-row w-full font-medium text-[0.8rem] mx-auto justify-center'>Time Elapsed</span>
                {/*<span className='flex flex-row w-full text-[3rem] leading-none font-semibold mx-auto justify-center'>58:24</span>*/}
                <span className='flex flex-row w-full h-full text-[3.2rem] leading-none font-bold font-Roboto m-auto'>{UTILS.displayTimer(timer)}</span>
              </div>
            </div>

            <div className='flex flex-row w-full'>
              <button className='h-full w-full bg-!red-600 hover:bg-!red-800 text-white text-[0.9rem] font-semibold m-auto p-2 rounded-md'
                      onClick={onLeaveHandler}
              >
                Leave Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function RightSider(props) {
  // const participants = DATA.participants
  const { interview } = props;
  const {
    level,
    recorderStatus,
    startRecording,
    stopRecording,
  } = useAudioRecorderV2();

  const [participants, setParticipants] = useState([
    {
      'name': props.interview.interviewer.name,
      'profile_picture': props.interview.interviewer.profile_picture || '/media/images/illustrations/agent-1-sm.webp',
    },
    {
      'name': props.interview.candidate.name,
      'profile_picture': props.interview.candidate.profile_picture || '/media/images/illustrations/user.webp'
    }
  ]);
  const [videoOn, setVideoOn] = useState(interview.config?.camera);
  const [micOn, setMicOn] = useState(true);

  useEffect(() => {
    if(recorderStatus === RECORDER_STATUS.INACTIVE && micOn) startRecording();
    else if(recorderStatus === RECORDER_STATUS.RECORDING && !micOn) stopRecording();
  }, [micOn, recorderStatus]);

  useEffect(() => {
    setParticipants([
      {
        'name': props.interview.interviewer.name,
        'profile_picture': props.interview.interviewer.profile_picture || '/media/images/illustrations/agent-1-sm.webp',
      },
      {
        'name': props.interview.candidate.name,
        'profile_picture': props.interview.candidate.profile_picture || '/media/images/illustrations/user.webp'
      }
    ])
  }, []);


  return (
    <div className='flex flex-col h-full min-h-screen w-[25%] bg-!grey-800/20 text-!grey-200 font-Inter'>
      <div className='flex flex-row mx-auto p-8'>
        <span className='flex flex-col m-auto text-[1rem] font-extrabold align-baseline'>Participants</span>
      </div>


      <div className='flex flex-col flex-1 h-full w-full font-Inter text-!grey-200 mx-auto justify-between pb-4 px-3'>
        <div className='flex flex-col w-full gap-y-4'>
          <div className='flex flex-row w-full'>
            <ParticipantContainer participant={participants[0]} />
          </div>

          <div className='flex flex-row w-full'>
            <ParticipantContainer interview={props.interview.id} videoOn={videoOn} participant={participants[1]} />
          </div>
        </div>

        <div className='flex flex-row w-full justify-between gap-x-2'>
          <div className='flex flex-row h-full w-full gap-x-2'>
            <button className='flex flex-col relative bg-!grey-400/30 rounded-md p-2'
                    onClick={() => setMicOn(!micOn)}
            >
              {
                micOn ? (
                  <>
                    <div className={`absolute left-0 bottom-0 w-full bg-!green-600 rounded-bl-md rounded-br-md`} style={{
                      height: `${level*100}%`
                    }} />
                    <img className='h-[4vh] w-full leading-none p-1 m-auto z-20' src='/media/images/icons/mic-unmute.webp' alt='mic'/>
                  </>
                ) : (
                  <img className='h-[4vh] w-full leading-none p-1 m-auto' src='/media/images/icons/mic-mute.webp' alt='mic'/>
                )
              }
            </button>

            <button className='flex flex-col rounded-md p-2 bg-!grey-400/30'
                    disabled={interview.config?.camera}
                    onClick={() => {
                      if(!interview.config?.camera) setVideoOn(!videoOn)
                    }}
            >
              {
                videoOn ? (
                  <img className='h-[4vh] w-full leading-none p-1 m-auto' src='/media/images/icons/camera-open.webp' alt='video'/>
                ) : (
                  <img className='h-[4vh] w-full leading-none p-1 m-auto' src='/media/images/icons/camera-closed.webp' alt='video'/>
                )
              }
            </button>
          </div>

          <div className='flex flex-row h-full w-full gap-x-2'>
            <div className='flex flex-col w-full bg-!grey-400/30 rounded-md p-2'>
              <img className='h-[4vh] w-auto leading-none p-2 m-auto' src='/media/images/icons/recording.webp' alt='stopwatch'/>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export const Sider = {
  LeftSider,
  RightSider
};
