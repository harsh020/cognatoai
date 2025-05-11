import React, {useEffect, useRef, useState} from 'react';
import GradientButton from "../components/GradientButton";
import {DATA} from "../data/data";
import {languageOptions} from "../constants/languageOptions";
import {Editor, loader, useMonaco} from "@monaco-editor/react";
import {monacoTheme} from "../constants/monacoTheme";
import {
  useAudioSynthesizer,
  useScreenRecorder,
  useSpeechSynthesizer,
  useTabActivity,
  useTimer,
  useWatch
} from "../commons/hooks";
import {UTILS} from "../commons/utils";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate, useParams} from "react-router-dom";
import {continueConversation, continueConversationE2E, interviewScreenUpdate, retrieve} from "../store/interview/interviewActions";
import Loading from "../components/Loading";
import Loader from "../components/Loader";
import AudioRecorder from "../components/AudioRecorder";
import AudioTranscriber from "../components/AudioTranscriber";
import {
  INTERVIEW_STATUS,
  MEETINGS_STATUS,
  MESSAGE_TYPE,
  RECORDER_STATUS,
  SPEECH_STATUS,
  STAGE_TYPE,
  USER_TYPE
} from "../constants/enums";
import {Sider} from "../layout/interview/Sider";
import Content from "../layout/Content";
import Header from "../layout/interview/Header";
import Layout from "../layout/Layout";
import ConfirmModal from "../components/ConfirmModal";
import {stopAudio, stopScreen, stopVideo} from "../store/av/avActions";
import {LIVE_TRANSCRIBE_RESET} from "../store/linguistic/linguisticConstants";
import {INTERVIEW_CONTINUE_RESET} from "../store/interview/interviewConstants";
import { SPEAK_SUCCESS } from '../store/linguistic/linguisticConstants';
import {CONFIG, settings} from "../commons/config";
import {speak} from "../store/linguistic/linguisticActions";
import { bulkCreate } from '../store/activity/activityActions';
import { tab } from '@testing-library/user-event/dist/tab';
import {INTERVIEW_APIS} from "../apis/interviewApis";
import {UPLOAD_APIS} from "../apis/uploadApis";


function Code(props) {
  const { loading, language, code } = props;
  const defaultLanguage = {
    id: 71,
    name: "Python (3.8.1)",
    label: "Python (3.8.1)",
    value: "python",
  }
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage) ;

  useEffect(() => {
    loader.init().then(monaco => monaco.editor.defineTheme('monaco-theme', {...monacoTheme}))
  }, [loader]);

  return (
    <div className='flex flex-col h-full w-full'>
      <div className='flex flex-row h-full w-full font-Inter text-[0.8rem] text-!grey-200 gap-y-8 p-4 border-b-[2px] border-!grey-800 justify-between'>
        <div className='flex flex-col my-auto'>
          <select
            value={selectedLanguage.name}
            className="flex flex-col bg-!grey-400/30 hover:bg-!grey-400/50 text-!grey-200 rounded-md py-2 px-2 outline-none"
            onChange={(e) => {
              setSelectedLanguage(languageOptions.find(lang => lang.name === e.target.value))
            }}
          >
            {
              languageOptions.map(option => (
                <option key={option.id} value={option.name} className='bg-!grey-400/30 hover:bg-!grey-400/50 text-!grey-200'>
                  {option.label}
                </option>
              ))
            }
          </select>
        </div>

        <div className='flex flex-col my-auto'>
          <button
            className="h-full w-full text-white rounded-md px-4 py-2 font-semibold m-auto bg-!gradient-4 bg-cover"
            onClick={props.onSubmitHandler}
            disabled={props.disabled}
          >
            {
              loading ? (
                <Loader />
              ) : (
                'Submit'
              )
            }
          </button>
        </div>
      </div>

      <div className='flex flex-row h-full w-full'>
        <Editor
          className='bg-!black'
          height='67vh'
          width='100%'
          language={selectedLanguage.value}
          theme='monaco-theme'
          defaultValue={code}
          onChange={(value, event) => {
            props.onChangeHandler(value || '')
          }}
        />
      </div>
    </div>
  )
}

function Message(props) {
  const { message, sender, profile_picture } = props

  return (
    <div className='flex flex-row gap-x-4'>
      <div className='flex flex-col'>
        <img className='h-[4vh] rounded-full' src={profile_picture} alt='profile_pic'/>
      </div>

      <div className='flex flex-col flex-1 w-full h-full rounded-md bg-!grey-400/30 font-normal p-2 gap-y-2'>
        <span className='flex flex-row font-bold'>{sender}</span>
        <span className='flex flex-row'>{message}</span>
      </div>
    </div>
  )
}

function Chat(props) {
  const endDivRef = useRef(null);
  const { aiLoading, userLoading, conversation, interviewer, candidate } = props;

  const liveTranscribedAudio = useSelector(state => state.liveTranscribedAudio);
  const { transcript } = liveTranscribedAudio;

  useEffect(() => {
    if(endDivRef.current) {
      endDivRef.current.scrollIntoView({behavior: 'smooth'});
    }
  });

  return (
    <div className='flex flex-col h-full w-full p-4 font-Inter text-[0.8rem] text-!grey-200 gap-y-8'>
      <div className='flex flex-row font-semibold text-[0.85rem] mx-auto'>Begin</div>

      <div className='flex flex-col h-full w-full gap-y-4 px-2'>
        {
          conversation.map((message, index) => (
            <Message key={index}
               message={message.content}
               sender={message.type === MESSAGE_TYPE.AI ? interviewer.name : candidate.name}
               profile_picture={message.type === MESSAGE_TYPE.AI ?
                 (interviewer.profile_picture || '/media/images/illustrations/agent-1-sm.webp') :
                 (candidate.profile_picture || '/media/images/illustrations/user.webp')
               }
            />
          ))
        }
        {
          aiLoading ? (
            <Message key='aiLoading'
                     message={<Loader />}
                     sender={interviewer.name}
                     profile_picture={interviewer.profile_picture || '/media/images/illustrations/agent-1-sm.webp'}
            />
          ) : userLoading ? (
            <Message key='userLoading'
                     message={<Loader />}
                     sender={candidate.name}
                     profile_picture={candidate.profile_picture || '/media/images/illustrations/user.webp'}
            />
          ) : transcript && transcript.text ? (
            <Message key='liveTranscript'
                     message={UTILS.clearTranscript(transcript.text)}
                     sender={candidate.name}
                     profile_picture={candidate.profile_picture || '/media/images/illustrations/user.webp'}
            />
          ) : (
            <></>
          )
        }
        <div className='flex w-full bg-transparent' ref={endDivRef} />
      </div>
    </div>
  )
}

function BaseInterviewScreen(props) {
  const {id} = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const controlPanelRef = useRef(null);
  const chatRef = useRef(null);
  const [controlPanelHeight, setControlPanelHeight] = useState(35);
  const [chatHeight, setChatHeight] = useState(100);

  const [turn, setTurn] = useState(USER_TYPE.AI);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [code, setCode] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const [mode, setMode] = useState('chat');
  // const interviewData = DATA.interviewData;

  const interviewData = useSelector(state => state.retrieveInterview);
  const {loading, interview, error} = interviewData;

  const conversationData = useSelector(state => state.continueInterview);
  const {loading: responseLoading, response, error: responseError} = conversationData;

  const transcribedAudio = useSelector(state => state.transcribedAudio);
  const {loading: transcribeLoading, transcript, error: transcribeError} = transcribedAudio;

  const liveTranscribedAudio = useSelector(state => state.liveTranscribedAudio);
  const {loading: liveTranscribeLoading, transcript: liveTranscript, error: liveTranscribeError} = liveTranscribedAudio;

  const speakText = useSelector(state => state.speakText);
  const {loading: audioLoading, audio, error: audioError} = speakText;

  // const {timeLeft, finished, setTimer} = useTimer((response && response.stage && response.stage.time_left) || 0);
  const {timeLeft, finished, setTimer} = useTimer(0);

  const { tabSwitchTimestamps } = useTabActivity();

  // const { speak, speechStatus } = useSpeechSynthesizer({
  //   onEnd: () => {
  //     setListening(!((response && response.stage) && response.stage.type === STAGE_TYPE.DSA));
  //     setTurn(USER_TYPE.USER);
  //   }
  // });
  const { play, stop, speechStatus } = useAudioSynthesizer({
    onStart: () => {
      setSpeaking(true);

      /* INFO: When start speaking all the last response message to conversation list */
      // FIXME: This is not working, so using use effect with speechStatus === SPEECH_STATUS.SPEAKING
      // setConversation([...conversation, response.conversation.slice(-1)]);
    },
    onEnd: () => {
      setSpeaking(false);
      setListening(!((response && response.stage) && response.stage.type === STAGE_TYPE.DSA) && interview.status !== INTERVIEW_STATUS.COMPLETED);
      setTurn(USER_TYPE.USER);
    }
  });

  const timeoutCallback = () => {
    const userMessage = {
      'content': "",
      'type': MESSAGE_TYPE.USER,
    }
    setConversation([...conversation, {
      'content': <span className='italic'>No response</span>,
      'type': MESSAGE_TYPE.USER
    }]);
    dispatch(continueConversation(id, userMessage));
  }

  useEffect(() => {
    if(!response)  {
      if(settings.e2ePipeline.enabled) {
        const data = new FormData();
        data.append('file', null);
        data.append('id', interview.id);
        data.append('type', MESSAGE_TYPE.USER);
        dispatch(continueConversationE2E(id, data));
      }
      else {
        dispatch(continueConversation(id, {
          'content': null,
          'type': MESSAGE_TYPE.USER,
        }));
      }
    }
  }, []);

  useEffect(() => {
    if(responseError || transcribeError) {
      setShowErrorModal(true);
      setTimer(5);
      setTimeout(() => {
        // window.speechSynthesis.cancel();
        stop();
        dispatch(stopAudio(INTERVIEW_STATUS.TERMINATED));
        dispatch(stopVideo(INTERVIEW_STATUS.TERMINATED));

        dispatch(interviewScreenUpdate(MEETINGS_STATUS.POST_MEETING));
        setShowModal(false);
      }, 5000)
    }
  }, [responseError, transcribeError])

  useEffect(() => {
    if(response) {
      /* INFO: First speak the response and then add it to conversation. In case of multiple response add all but last, add the last one after speaking. */
      setConversation([...conversation, ...response.conversation.slice(0, -1)]);
      if(response.stage && response.stage.time_left) {
        // TODO: pass second argument `timeoutCallback` to handle stage timeouts.
        setTimer(Math.round(response.stage.time_left));
      }
      else {
        setTimer(0);
      }

      // if(response.conversation.length &&
      //    response.conversation[response.conversation.length - 1].type === MESSAGE_TYPE.AI &&
      //    response.status === INTERVIEW_STATUS.IN_PROGRESS) {
      if(response.conversation.length &&
        response.conversation[response.conversation.length - 1].type === MESSAGE_TYPE.AI) {
        // play(response.audio);
        // setSpeaking(true);
        if(response.conversation[response.conversation.length - 1].audio) {
          dispatch({
            type: SPEAK_SUCCESS,
            payload: response.conversation[response.conversation.length - 1].audio,
          });
        } else {
          dispatch(speak({
            'id': `interviews/${interview.id}`,
            'text': response.conversation.slice(-1)[0].content,
          }))
        }
      }
      else if(response.status === INTERVIEW_STATUS.COMPLETED) {
        const tabActivity = tabSwitchTimestamps.map(ts => {
          return {
            interview: interview.id,
            timestamp: ts,
            type: 'tab_switch'
          }
        })
        // console.log(tabActivity);
        /* requests are not tied to component. send the request without caring about the response
         * FIXME: Think of a better way to handle activity logs
         */
        dispatch(bulkCreate(tabActivity));
        setShowModal(true);
        setTimer(5);
        setTimeout(() => {
          // window.speechSynthesis.cancel();
          stop();
          dispatch(stopAudio(INTERVIEW_STATUS.TERMINATED));
          dispatch(stopVideo(INTERVIEW_STATUS.TERMINATED));

          dispatch(interviewScreenUpdate(MEETINGS_STATUS.POST_MEETING));
          setShowModal(false);
        }, 5000)
      }
    }
  }, [response]);

  useEffect(() => { /* INFO: This is not begin called, since we have paused full audio transcription. */
    // TODO: save transcription settings in backend
    if(settings.fullTranscript.enabled && transcript && transcript.text) {
      const userMessage = {
        'content': UTILS.clearTranscript(transcript.text),
        'type': MESSAGE_TYPE.USER
      }

      setConversation([...conversation, userMessage]);
      dispatch(continueConversation(id, userMessage));
    }
  }, [transcript]);

  useEffect(() => { /* INFO: This is begin called instead, since we have paused full audio transcription. */
    // TODO: save transcription settings in backend
    if(settings.liveTranscript.enabled && !listening && turn === USER_TYPE.AI &&
      liveTranscript && liveTranscript.text) {
      // console.log("turn for ai to speak...")
      const userMessage = {
        'content': UTILS.clearTranscript(liveTranscript.text),
        'type': MESSAGE_TYPE.USER
      }

      setConversation([...conversation, userMessage]);
      dispatch({
        type: LIVE_TRANSCRIBE_RESET
      })
      dispatch(continueConversation(id, userMessage));
    }
  }, [turn, listening]);

  // /* INFO: When start speaking all the last response message to conversation list */
  // useEffect(() => {
  //   if(speechStatus === SPEECH_STATUS.SPEAKING) {
  //     setConversation([...conversation, ...response.conversation.slice(-1)]);
  //
  //     dispatch({
  //       type: LIVE_TRANSCRIBE_RESET
  //     })
  //   }
  // }, [speechStatus]);
  /* INFO: When start speaking all the last response message to conversation list */
  useEffect(() => {
    if(audio) {
      play(audio, settings.speak.playbackRate);
      if(settings.e2ePipeline.enabled) setConversation([...conversation, ...response.conversation.slice(-2)]);
      else setConversation([...conversation, ...response.conversation.slice(-1)]);
      setSpeaking(true);
    }
  }, [audio]);

  // INFO: If interview was completed, then after speaking the last message end it.
  useEffect(() => {
    if(speechStatus === SPEECH_STATUS.INACTIVE && !speaking && response &&
      response.status === INTERVIEW_STATUS.COMPLETED) {
        const tabActivity = tabSwitchTimestamps.map(ts => {
          return {
            interview: interview.id,
            timestamp: ts,
            type: 'tab_switch'
          }
        })
        // console.log(tabActivity);
        /* requests are not tied to component. send the request without caring about the response
         * FIXME: Think of a better way to handle activity logs
         */
        dispatch(bulkCreate(tabActivity));

        setShowModal(true);
        setTimer(5);
        setTimeout(() => {
        // window.speechSynthesis.cancel();
        stop();
        dispatch(stopAudio(INTERVIEW_STATUS.TERMINATED));
        dispatch(stopVideo(INTERVIEW_STATUS.TERMINATED));
        dispatch(stopScreen(INTERVIEW_STATUS.TERMINATED));

        dispatch(interviewScreenUpdate(MEETINGS_STATUS.POST_MEETING));
        setShowModal(false);
      }, 5000)
    }
  }, [speechStatus, speaking]);


  useEffect(() => {
      if (!controlPanelRef.current) {
        return;
      }

      const resizeObserver = new ResizeObserver(() => {
        if(controlPanelRef.current.offsetHeight !== controlPanelHeight) {
          setControlPanelHeight(controlPanelRef.current.offsetHeight);
          setChatHeight(100-controlPanelRef.current.offsetHeight);
        }
      });

      resizeObserver.observe(controlPanelRef.current);
      return function cleanup() {
        resizeObserver.disconnect();
      }
    },[controlPanelRef.current]);

  const onReplyHandler = (e) => {
    e.preventDefault();
    const fdata = UTILS.buildJsonFromForm(e.target)

    const userMessage = {
      'content': fdata.content,
      'type': MESSAGE_TYPE.USER,
    }
    e.target.reset()
    setConversation([...conversation, userMessage]);

    dispatch({
      type: INTERVIEW_CONTINUE_RESET,
    });

    if(settings.e2ePipeline.enabled) {
      const data = new FormData();
      data.append('file', null);
      data.append('id', interview.id);
      data.append('type', MESSAGE_TYPE.USER);
      data.append('content', fdata.content);
      dispatch(continueConversationE2E(id, data))
    }
    else dispatch(continueConversation(id, userMessage))
    // dispatch(continueConversationE2E(id, userMessage));
  }

  const onCodeSubmitHandler = (e) => {
    e.preventDefault();

    const userCode = (
      <pre>
        <code>{code}</code>
      </pre>
    );
    const userMessage = {
      'content': code,
      'type': MESSAGE_TYPE.USER,
    }

    // FIXME: Temporarily removed this because we are using E2E pipeline
    setConversation([...conversation, {
      'content': userCode,
      'type': MESSAGE_TYPE.USER,
    }]);
    if(settings.e2ePipeline.enabled) {
      const data = new FormData();
      data.append('file', null);
      data.append('id', interview.id);
      data.append('type', MESSAGE_TYPE.USER);
      data.append('content', code);
      dispatch(continueConversationE2E(id, data))
    }
    else dispatch(continueConversation(id, userMessage))
    setMode('chat');
  }

  return (
    <div className='flex flex-col h-full w-full justify-between'>
      {
        showModal ? (
          <ConfirmModal
            message={`The interview has ended. You will be redirected in ${timeLeft.seconds} seconds.`}
            onConfirmHandler={() => {
              // Stop speech synthesis, audio stream and video stream
              window.speechSynthesis.cancel();
              dispatch(stopAudio(INTERVIEW_STATUS.TERMINATED));
              dispatch(stopVideo(INTERVIEW_STATUS.TERMINATED));
              dispatch(stopScreen(INTERVIEW_STATUS.TERMINATED));

              dispatch(interviewScreenUpdate(MEETINGS_STATUS.POST_MEETING));
              setShowModal(false);
            }}
            onCloseHandler={() => {
              // Stop speech synthesis, audio stream and video stream
              window.speechSynthesis.cancel();
              dispatch(stopAudio(INTERVIEW_STATUS.TERMINATED));
              dispatch(stopVideo(INTERVIEW_STATUS.TERMINATED));
              dispatch(stopScreen(INTERVIEW_STATUS.TERMINATED));

              dispatch(interviewScreenUpdate(MEETINGS_STATUS.POST_MEETING));
              setShowModal(false);
            }}
          />
        ) : showErrorModal && (
          <ConfirmModal
            message={
              <p className="mb-6">
                Something went wrong at our end. Redirecting to end screen in {timeLeft.seconds} seconds.
                Please reach out to us at{" "}
                <a href="mailto:support@cognatoai.com" className="text-blue-500">
                  support@cognatoai.com
                </a>
              </p>
            }
            onConfirmHandler={() => {
              // Stop speech synthesis, audio stream and video stream
              window.speechSynthesis.cancel();
              dispatch(stopAudio(INTERVIEW_STATUS.TERMINATED));
              dispatch(stopVideo(INTERVIEW_STATUS.TERMINATED));
              dispatch(stopScreen(INTERVIEW_STATUS.TERMINATED));

              dispatch(interviewScreenUpdate(MEETINGS_STATUS.POST_MEETING));
              setShowErrorModal(false);
            }}
            onCloseHandler={() => {
              // Stop speech synthesis, audio stream and video stream
              window.speechSynthesis.cancel();
              dispatch(stopAudio(INTERVIEW_STATUS.TERMINATED));
              dispatch(stopVideo(INTERVIEW_STATUS.TERMINATED));
              dispatch(stopScreen(INTERVIEW_STATUS.TERMINATED));

              dispatch(interviewScreenUpdate(MEETINGS_STATUS.POST_MEETING));
              setShowErrorModal(false);
            }}
          />
        )
      }
      {
        loading ? (
          <Loading />
        ) : interview ? (
          <div className='flex flex-col relative w-full justify-between'>
            {/*
              * TODO: Variable sized div.
              * Ref: https://stackoverflow.com/questions/73247936/how-to-dynamically-track-width-height-of-div-in-react-js
              */}
            <div className={`flex flex-row h-[76vh] flex-grow w-full overflow-y-auto pb-6`}>
              {mode === 'chat' ?
                <Chat
                  disabled={turn !== USER_TYPE.USER}
                  // aiLoading={responseLoading || (turn === USER_TYPE.AI && speechStatus !== SPEECH_STATUS.SPEAKING)}
                  // TODO: Set ai loading or user loading based on last conversation message type
                  // aiLoading={!conversation.length || (!settings.e2ePipeline.enabled && responseLoading) || audioLoading}
                  // userLoading={(!liveTranscript && !speaking) || (conversation.length && settings.e2ePipeline.enabled && responseLoading)}
                  aiLoading={!conversation.length || conversation.slice(-1)[0].type === MESSAGE_TYPE.USER}
                  userLoading={conversation.length && conversation.slice(-1)[0].type === MESSAGE_TYPE.AI}
                  conversation={conversation}
                  {...interview}
                /> :
                <Code
                  disabled={turn !== USER_TYPE.USER}
                  loading={responseLoading}
                  code={code}
                  onChangeHandler={setCode}
                  onSubmitHandler={onCodeSubmitHandler}
                  {...interview}
                />
              }
            </div>

            <div className='flex flex-row w-full bg-!black p-4 my-auto justify-between gap-x-20'>
              <form className='flex flex-row flex-1' onSubmit={onReplyHandler}>
                <div ref={controlPanelRef} className='flex flex-row w-full text-[0.9rem] text-!off-white'>
                  <textarea rows={1} type='text' name='content' className='flex flex-row h-full w-full rounded-tl-md rounded-bl-md border-[1px] border-!grey-400 bg-!grey-400/30 my-auto px-2 py-1 outline-none' placeholder='Type something...'></textarea>

                  <div className='flex flex-col'>
                    <div className='flex items-baseline w-full mx-auto'>
                      {/*<img className='absolute top-0 left-0 h-full w-full z-0 rounded-md' alt='gradient' src='/media/images/background/gradient.webp' />*/}
                      <button
                        type='submit'
                        className=" w-full text-white rounded-tr-md rounded-br-md py-2 px-3 text-sm font-bold m-auto bg-!gradient-4 bg-cover"
                        disabled={responseLoading || turn !== USER_TYPE.USER}
                      >
                        {
                          responseLoading ? (
                            <Loader />
                          ) : (
                            <img className='h-[3vh] w-auto' src='/media/images/icons/plane.webp' alt=''/>
                          )
                        }
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              <div className='flex flex-row gap-x-2 font-Inter font-semibold text-!grey-200 text-[0.8rem]'>
                <div className='flex flex-row'>
                  <AudioTranscriber
                    disabled={speechStatus === SPEECH_STATUS.SPEAKING || loading || responseLoading || turn !== USER_TYPE.USER}
                    listen={listening}
                    onStopHandler={() => {
                      setListening(false);
                      setTurn(USER_TYPE.AI);
                    }}
                    onAudioHandler={(audio, mimeType=CONFIG.DEFAULT_AUDIO_MIME_TYPE, uid=null) => {
                      if(audio && settings.e2ePipeline.enabled) {
                        // use new pipline
                        const ext = UTILS.getFileExtensionFromMimeType(mimeType)

                        const data = new FormData();
                        // data.append('file', new File([audio], `${Date.now()}.${ext}`, { type: mimeType }));
                        data.append('id', interview.id);
                        data.append('type', MESSAGE_TYPE.USER);
                        data.append('stream', settings.e2ePipeline.audio?.stream)
                        data.append('uid', uid)

                        if(settings.e2ePipeline.audio?.stream) {
                          data.append('file', null);
                        } else {
                          data.append('file', new File([audio], `${Date.now()}.${ext}`, { type: mimeType }));
                        }

                        dispatch(continueConversationE2E(interview.id, data));
                      }
                    }}
                    />
                </div>

                <div className='flex flex-row'>
                  <button className='flex flex-col bg-!grey-400/30 hover:bg-!grey-400/50 rounded-md py-2 px-4'
                          onClick={() => setMode(mode === 'code' ? 'chat' : 'code')}
                  >
                    {mode === 'chat' ? 'Code' : 'Chat'}
                  </button>
                </div>

                <div className='flex flex-row bg-!grey-400/30 rounded-md py-2 px-4'>
                  <span className='flex flex-row'>Answer within:&nbsp;</span>
                  <span className='flex flex-row font-normal font-Roboto'>{UTILS.displayTimer(timeLeft)}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <></>
        )
      }
    </div>
  );
}

function InterviewScreen(props) {
  const interviewData = useSelector(state => state.retrieveInterview)
  const {loading, interview, error} = interviewData

  const { screen, error: screenError } = useSelector(state => state.retrieveScreen)

  let {
    permissions,
    recorderStatus,
    liveScreenFeed,
    recordedScreen,
    startRecording,
    stopRecording,
    type
  } = useScreenRecorder({
    chunkSize: 5000,
    chunkHandler: (chunk, allChunks=[], type=CONFIG.DEFAULT_VIDEO_MIME_TYPE) => {
      if(interview.config?.screen) {
        // console.log(allChunks[0])
        // if(allChunks.length > 0) chunk = new Blob([allChunks[0], chunk])
        const mimeType = type;
        const ext = UTILS.getFileExtensionFromMimeType(mimeType)
        // console.log('id--->', id)
        const data = new FormData();
        data.append('file', new File([chunk], `${Date.now()}.${ext}`, { type: mimeType }));
        data.append('id', interview.id);
        data.append('type', 'screen')

        UPLOAD_APIS.video(data)
          .then((res) => {
            // console.log(res);
          }).catch((error) => {
          console.error(error);
        });
      }
    }
  });

  useEffect(() => {
    if(recorderStatus === RECORDER_STATUS.INACTIVE && interview.config?.screen) startRecording();
    else if(recorderStatus === RECORDER_STATUS.RECORDING && interview.config?.screen) stopRecording();
  }, []);

  return (
    <Layout className='h-screen overflow-y-hidden'>
      <Sider.LeftSider interview={interview} />
      <Content>
        <Header interview={interview} />
        <Content>
          <BaseInterviewScreen />
        </Content>
      </Content>
      <Sider.RightSider interview={interview} />
    </Layout>
  )
}

export default InterviewScreen;
