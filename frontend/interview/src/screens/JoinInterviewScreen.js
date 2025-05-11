import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import Layout from "../layout/Layout";
import Header from "../layout/Header";
import Content from "../layout/Content";
import {
  Mic, Video as VideoIcon
} from 'lucide-react'
import {useAudioRecorder, useAudioRecorderV2, useTimer, useVideoRecorder, useVideoRecorderV2} from "../commons/hooks";
import {MEETINGS_STATUS, RECORDER_STATUS} from "../constants/enums";
import {
  audioPermission as getAudioPermission,
  avPermission as getAVPermission,
  videoPermission as getVideoPermission,
  audio as fetchAudioStream,
  video as fetchVideoStream,
} from "../store/av/avActions";
import {DATA} from "../data/data";
import GradientButton from "../components/GradientButton";
import {useNavigate} from "react-router-dom";
import Loader from "../components/Loader";
import {interviewScreenUpdate} from "../store/interview/interviewActions";
import toast from "react-hot-toast";
import {transcribeWarmup} from "../store/linguistic/linguisticActions";
import ScreenShareModal from "../components/ScreenShareModal";


function Video(props) {
  const { interview } = props;
  const dispatch = useDispatch();

  const [videoOn, setVideoOn] = useState(false);
  const [micOn, setMicOn] = useState(false);

  const retrieveAudio = useSelector(state => state.retrieveAudio);
  const { audio, error: audioError } = retrieveAudio;

  const retrieveVideo = useSelector(state => state.retrieveVideo);
  const { video, error: videoError } = retrieveVideo;

  const {
    level,
    recorderStatus: audioRecorderStatus,
    startRecording: startAudioRecording,
    stopRecording: stopAudioRecording,
    audioSources,
    selectedAudioSource,
    setSelectedAudioSource,
  } = useAudioRecorderV2();

  let {
    recorderStatus: videoRecorderStatus,
    liveVideoFeed,
    startRecording: startVideoRecording,
    stopRecording: stopVideoRecording,
    videoSources,
    selectedVideoSource,
    setSelectedVideoSource,
  } = useVideoRecorderV2(
    {
      permissions: {
        audio: true,
        video: true,
      },
    }
  );

  // useEffect(() => {
  //   dispatch(audioPermission());
  //   dispatch(videoPermission());
  // }, []);

  useEffect(() => {
    if(audio && audio.permission) {
      setMicOn(true);
    }
  }, [audio]);

  useEffect(() => {
    if(video && video.permission && video.stream) { // extra condition to prevent switching on again, since state is changed in hooks
      setVideoOn(true);
    }
  }, [video]);

  useEffect(() => {
    /* TODO: Fix?
     * audio is check before starting to prevent video stream from making a new audio stream
     * This ensures that the audio stream created by audio recorder is used by video
     */
    if(videoRecorderStatus === RECORDER_STATUS.INACTIVE && audio && videoOn) startVideoRecording();
    else if(videoRecorderStatus === RECORDER_STATUS.RECORDING && !videoOn) stopVideoRecording();
  }, [audio, videoOn, videoRecorderStatus]);

  useEffect(() => {
    if(audioRecorderStatus === RECORDER_STATUS.INACTIVE && micOn) startAudioRecording();
    else if(audioRecorderStatus === RECORDER_STATUS.RECORDING && !micOn) stopAudioRecording();
  }, [micOn, audioRecorderStatus]);

  return (
    <div className='flex flex-col gap-y-2'>
      <div className='flex flex-col h-[54vh] w-[46vw] my-auto bg-!grey-400/30 rounded-md gap-y-4'>
        <div className='flex flex-row m-auto h-full w-full justify-center'>
          {
            videoOn ? (
              <div className='flex h-full w-full bg-!black m-auto rounded-md'>
                <video className='flex aspect-video m-auto h-auto object-cover rounded-lg' playsInline ref={liveVideoFeed} controls={false} autoPlay style={{
                  transform: 'rotateY(180deg)',
                  maxHeight: "100%",
                  maxWidth: "100%",
                  // -webkit-transform: 'rotateY(180deg)', /* Safari and Chrome */
                  // -moz-transform: 'rotateY(180deg)' /* Firefox */
                }} />
              </div>
            ) : (
              <div className='flex aspect-video h-auto object-cover'>
                <img className='h-[12vh] rounded-full m-auto' src={interview.candidate.profile_picture || '/media/images/illustrations/user.webp'} alt='profile-pic' />
              </div>
            )
          }
        </div>
      </div>

      <div className='flex flex-row w-full justify-between gap-x-2'>
        <div className='flex flex-row h-full gap-x-2'>
          <button className='flex flex-col relative bg-!grey-400/30 rounded-md p-2'
                  disabled={audioError}
                  onClick={() => setMicOn(!micOn)}
          >
            {
              audioError ? (
                <img className='h-[4vh] w-full leading-none p-1 m-auto' src='/media/images/icons/mic-blocked.webp' alt='mic'/>
              ) : micOn ? (
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
                  disabled={videoError || interview.config?.camera}
                  onClick={() => {
                    if(!interview.config?.camera) setVideoOn(!videoOn)
                  }}
          >
            {
              videoError ? (
                <img className='h-[4vh] w-full leading-none p-1 m-auto' src='/media/images/icons/camera-blocked.webp' alt='mic'/>
              ) : videoOn ? (
                <img className='h-[4vh] w-full leading-none p-1 m-auto' src='/media/images/icons/camera-open.webp' alt='video'/>
              ) : (
                <img className='h-[4vh] w-full leading-none p-1 m-auto' src='/media/images/icons/camera-closed.webp' alt='video'/>
              )
            }
          </button>
        </div>

        {
          (audioError || videoError) && (
            <div className='flex flex-row flex-1 text-!red-600 text-sm font-Inter font-semibold m-auto gap-x-0'>
              <div className='flex flex-row m-auto'>
                <span className='flex flex-col m-auto'>
                  <img className='h-[6vh] w-auto leading-none p-2 m-auto' src='/media/images/icons/error.webp' alt='error'/>
                </span>

                <span className='flex flex-col m-auto'>Please enable media devices to join meeting</span>
              </div>
            </div>
          )
        }

        <div className='flex flex-row h-full gap-x-2'>
          <div className='flex flex-col w-full bg-!grey-400/30 rounded-md p-2'>
            <img className='h-[4vh] w-auto leading-none p-2 m-auto' src='/media/images/icons/recording.webp' alt='stopwatch'/>
          </div>
        </div>

      </div>

      <div className='flex flex-row w-full gap-2 mt-4'>
        <div>
          <AudioSourceSelector
            audioSources={audioSources}
            selectedAudioSource={selectedAudioSource}
            setSelectedAudioSource={setSelectedAudioSource}
          />
        </div>

        <div>
          <VideoSourceSelector
            videoSources={videoSources}
            selectedVideoSource={selectedVideoSource}
            setSelectedVideoSource={setSelectedVideoSource}
          />
        </div>
      </div>
    </div>
  )
}

function JoinInfo(props) {
  const { interview } = props;
  const guidelines = DATA.guildelines;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { timeLeft, finished, setTimer } = useTimer();

  const retrieveAudio = useSelector(state => state.retrieveAudio);
  const { audio, error: audioError } = retrieveAudio;

  const retrieveVideo = useSelector(state => state.retrieveVideo);
  const { video, error: videoError } = retrieveVideo;

  const retrieveScreen = useSelector(state => state.retrieveScreen);
  const { screen, error: screenError } = retrieveScreen;

  const { loading, error, warmup } = useSelector(state => state.transcribeWarmup);

  useEffect(() => {
    if(error) {
      toast.error(error.message);
    } else if(warmup) {
      setTimer(5, () => dispatch(interviewScreenUpdate(MEETINGS_STATUS.MEETING)));
    }
  }, [loading, error, warmup]);


  return (
    <div className='flex flex-col justify-between text-!grey-200 font-Inter h-full'>
      {
        ((audio && audio.permission) && (video && video.permission) && (interview.config?.screen && !screen)) && (
          <ScreenShareModal />
        )
      }

      <div className='flex flex-col font-normal text-[0.9rem]'>
        <span className='flex flex-row font-bold text-[1rem]'>Guidelines:</span>

        <ul className='list-disc'>
          {
            guidelines.map((guide, index) => (
              <li key={index} className=''>{guide}</li>
            ))
          }
        </ul>
      </div>

      <div className='flex flex-col mx-auto gap-y-2 w-fit'>
        <span className='flex flex-row font-semibold text-[0.8rem] mx-auto'>Meeting is being recorded</span>

        {
          ((audio && audio.permission) && (video && video.permission) && (interview.config?.screen ? (screen && screen.permission) : true) && (!loading && !error && !warmup)) ? (
            <GradientButton text='Ask to join' onClick={() => dispatch(transcribeWarmup())} />
          ) : (audioError || videoError || screenError || error) ? (
            <GradientButton disabled={true} text='Ask to join' />
          ) : (
            <GradientButton text={
              <span className={'flex w-full mx-auto justify-center'}>
                <Loader />
              </span>
              }
            />
          )
        }

        <div className='flex flex-col gap-y-1'>
          <div className='flex flex-col mx-auto text-[0.8rem]'>
            {
              loading ? (
                <div className='flex flex-col text-center'>
                  <div className='flex flex-row font-bold'>Asking to be let in...</div>
                  <div className='flex flex-row'>Please do not refresh</div>
                </div>
              ) : warmup ? (
                <div className='flex flex-col text-center'>
                  <div className='flex flex-row font-bold'>Be ready...</div>
                  <div className='flex flex-row'>Joining in {timeLeft.seconds} seconds</div>
                </div>
              ) : error ? (
                <div className='flex flex-row text-center text-!red-600'>
                  Something went wrong! Please contact admin.
                </div>
              ) : (
                <div className='flex flex-row gap-x-2 mx-auto'>
                  <div className='flex flex-col m-auto'>
                    <img className='h-[4vh] rounded-full' src={interview.interviewer.profile_picture || '/media/images/illustrations/agent-1-sm.webp'} alt='profile_pic'/>
                  </div>

                  <div className='flex flex-row flex-1 w-full h-full rounded-md font-normal p-2 gap-y-2'>
                    <span className='flex flex-row font-semibold text-[0.8rem]'>{interview.interviewer.name} is in the meeting</span>
                  </div>
                </div>
              )
            }
          </div>
        </div>
      </div>

    </div>
  )
}

function AudioSourceSelector(props) {
  const { audioSources, selectedAudioSource, setSelectedAudioSource } = props;

  // const fetchMediaDevices = async () => {
  //   try {
  //     const devices = await navigator.mediaDevices.enumerateDevices();
  //     let audioInputDevices = [];
  //
  //     let defaultAudioInputDevice = null;
  //
  //     devices.forEach(device => {
  //       if(device.kind === 'audioinput') {
  //         if(device.deviceId === 'default') defaultAudioInputDevice = device;
  //         else {
  //           audioInputDevices.push(device);
  //           if(defaultAudioInputDevice?.label === 'Default - ' + device.label) {
  //             defaultAudioInputDevice = device;
  //           }
  //         }
  //       }
  //     })
  //
  //     setAudioSources(audioInputDevices);
  //
  //     const deviceId = stream?.getAudioTracks()[0]?.getSettings.deviceId;
  //     if(!selectedAudioSource) {
  //       if(defaultAudioInputDevice) {
  //         console.log("setting default as", defaultAudioInputDevice)
  //         setSelectedAudioSource(defaultAudioInputDevice.deviceId)
  //       } else setSelectedAudioSource(deviceId);
  //     }
  //     // setSelectedAudioSource(defaultAudioInputDevice?.deviceId === 'default' ? null : defaultAudioInputDevice?.deviceId)
  //   } catch (err) {
  //     console.error("Error fetching media devices:", err);
  //     toast.error("Error accessing media devices.");
  //   }
  // };
  //
  // useEffect(() => {
  //   fetchMediaDevices();
  //   navigator.mediaDevices.addEventListener('devicechange', fetchMediaDevices);
  //
  //   // Cleanup the event listener on unmount
  //   return () => {
  //     navigator.mediaDevices.removeEventListener('devicechange', fetchMediaDevices);
  //   };
  // }, []);
  //
  // useEffect(() => {
  //   console.log("setting audio source in effect", selectedAudioSource)
  //   if(selectedAudioSource) dispatch(fetchAudioStream({ deviceId: { exact: selectedAudioSource } }));
  // }, [selectedAudioSource]);
  
  return (
    <div className='flex flex-row rounded-full px-4 bg-!grey-400/30'>
      <Mic className='h-4 w-4 my-auto text-gray-200' />

      <select
        id="audioSource"
        className="bg-transparent text-gray-200 text-sm focus:ring-0 focus:outline-none w-full py-2.5 px-2"
        value={selectedAudioSource}
        disabled={!selectedAudioSource}
        onChange={(e) => setSelectedAudioSource(e.target.value)}
      >
        {
          (!selectedAudioSource) && (
            <option value="">
              No Audio
            </option>
          )
        }
        {audioSources
          // .filter((source) => source.deviceId !== '')
          .map((source) => (
            <option key={source.deviceId} value={source.deviceId} selected={source.deviceId === selectedAudioSource}>
              {source.label || `Audio Input ${audioSources.indexOf(source) + 1}`}
            </option>
          ))}
      </select>
    </div>
  );
}

function VideoSourceSelector(props) {
  const { videoSources, selectedVideoSource, setSelectedVideoSource } = props;
  // const { permission, stream } = props;
  //
  // const dispatch = useDispatch();
  //
  // const [videoSources, setVideoSources] = useState([]);
  // const [selectedVideoSource, setSelectedVideoSource] = useState();
  //
  // const fetchMediaDevices = async () => {
  //   try {
  //     const devices = await navigator.mediaDevices.enumerateDevices();
  //     let videoInputDevices = [];
  //
  //     let defaultVideoInputDevice = null;
  //
  //     devices.forEach(device => {
  //       if(device.kind === 'videoinput') {
  //         if(device.deviceId === 'default') defaultVideoInputDevice = device;
  //         else {
  //           videoInputDevices.push(device);
  //           if(defaultVideoInputDevice?.label === 'Default - ' + device.label) {
  //             defaultVideoInputDevice = device;
  //           }
  //         }
  //       }
  //     })
  //
  //     setVideoSources(videoInputDevices);
  //
  //     const deviceId = stream?.getVideoTracks()[0]?.getSettings().deviceId;
  //     if(deviceId === 'default') {
  //       if(defaultVideoInputDevice) setSelectedVideoSource(defaultVideoInputDevice.deviceId)
  //     }
  //     // setSelectedVideoSource(defaultVideoInputDevice?.deviceId === 'default' ? null : defaultVideoInputDevice?.deviceId)
  //   } catch (err) {
  //     console.error("Error fetching media devices:", err);
  //     toast.error("Error accessing media devices.");
  //   }
  // };
  //
  // useEffect(() => {
  //   fetchMediaDevices();
  //   navigator.mediaDevices.addEventListener('devicechange', fetchMediaDevices);
  //
  //   // Cleanup the event listener on unmount
  //   return () => {
  //     navigator.mediaDevices.removeEventListener('devicechange', fetchMediaDevices);
  //   };
  // }, []);
  //
  // useEffect(() => {
  //   // const deviceId = stream?.getVideoTracks()[0]?.getSettings.deviceId;
  //   // if(!selectedVideoSource) setSelectedVideoSource(deviceId);
  //   // else
  //     dispatch(fetchVideoStream({ deviceId: { exact: selectedVideoSource } }));
  // }, [selectedVideoSource]);
  
  return (
    <div className='flex flex-row rounded-full px-4 bg-!grey-400/30'>
      <VideoIcon className='h-4 w-4 my-auto text-gray-200' />

      <select
        id="videoSource"
        className="bg-transparent text-gray-200 text-sm focus:ring-0 focus:outline-none w-full py-2.5 px-2"
        value={selectedVideoSource}
        disabled={!selectedVideoSource}
        onChange={(e) => setSelectedVideoSource(e.target.value)}
      >
        {
          !selectedVideoSource && (
            <option value="">
              No Video
            </option>
          )
        }
        {videoSources
          // .filter((source) => source.deviceId !== '')
          .map((source) => (
            <option key={source.deviceId} value={source.deviceId}>
              {source.label || `Video Input ${videoSources.indexOf(source) + 1}`}
            </option>
          ))}
      </select>
    </div>
  );
}

function AVSource(props) {
  const retrieveAudio = useSelector(state => state.retrieveAudio);
  const { audio, error: audioError, loading: audioLoading } = retrieveAudio;

  const retrieveVideo = useSelector(state => state.retrieveVideo);
  const { video, error: videoError, loading: videoLoading } = retrieveVideo;

  // console.log('main', audio?.stream?.getAudioTracks()[0], audio, audioLoading)

  return (
    <div className='flex flex-row gap-2'>
      <div>
        { audio && <AudioSourceSelector audio={audio}/> }
      </div>

      <div>
        { video && <VideoSourceSelector video={video}/> }
      </div>
    </div>
  );
}

function BaseJoinInterviewScreen(props) {
  const { interview } = props;

  return (
    <div className='flex flex-col min-h-screen w-full py-4 px-12 font-Inter'>
      <div className='flex flex-row w-full py-4 font-Inter font-bold text-[1.5rem] text-!grey-200'>
        {
          interview.type === 'pitch' ? (
            'Discussion with ' + interview.candidate.metadata?.startup?.name
          ) : (
            interview.interviewer.name + ' <> ' + interview.candidate.name
          )
        }
      </div>

      <div className='flex flex-row gap-x-16'>
        <div className='flex flex-col gap-6'>
          <Video interview={interview} />
          {/*<AVSource />*/}
        </div>
        <JoinInfo interview={interview} />
      </div>
    </div>
  );
}

function JoinInterviewScreen(props) {
  const interviewData = useSelector(state => state.retrieveInterview)
  const { interview } = interviewData

  return (
    <Layout className='flex flex-col h-screen overflow-y-hidden'>
      <Header />

      <Content>
        <BaseJoinInterviewScreen interview={interview} />
      </Content>
    </Layout>
  )
}

export default JoinInterviewScreen;
