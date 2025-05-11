import React, {useEffect, useState} from 'react';
import AudioRecorder from "./components/AudioRecorder";
import Layout from "./layout/Layout";
import VideoRecorder from "./components/VideoRecorder";
import AudioTranscriber from "./components/AudioTranscriber";
import GradientButton from "./components/GradientButton";
import TestAudioTranscriber from "./components/TestAudioTranscriber";
import ScreenRecorder from "./components/ScreenRecorder";
import ScreenShareModal from "./components/ScreenShareModal";
import {
  audio as retrieveAudio, video as retrieveVideo
} from "./store/av/avActions";
import {useDispatch, useSelector} from "react-redux";
import toast from "react-hot-toast";
import {Mic, Video as VideoIcon, Video} from "lucide-react";


function Test(props) {
  const [record, setRecord] = useState(false);

  const dispatch = useDispatch();

  const retrievedAudio = useSelector(state => state.retrieveAudio);
  const { audio, error: audioError } = retrievedAudio;

  // const retrievedVideo = useSelector(state => state.retrieveVideo);
  // const { video, error: videoError } = retrievedVideo;

  useEffect(() => {
    if(!audio) dispatch(retrieveAudio());
    // if(!video) dispatch(retrieveVideo());
  }, [audio]);


  return (
    <Layout>
      <div className='flex flex-col w-[50%] m-auto '>
        <TestAudioTranscriber />
        {/*/!*<AudioRecorder />*!/*/}

        {/*/!*<VideoRecorder />*!/*/}
        {/*/!*<VideoRecorder record={true} id={'test'} />*!/*/}
        {/*{ audio && <ScreenRecorder record={record} id={'test/screen'}/>}*/}

        {/*<button className='p-2 bg-white text-black' onClick={() => setRecord(true)}>Start</button>*/}
        {/*<button className='p-2 bg-white text-black' onClick={() => setRecord(false)}>Stop</button>*/}
        {/*<br />*/}
        {/*<audio controls src="http://localhost:8000/media/interviews/d4af1ff5-b926-4914-842f-05af9f6a2f54/audios/ai/4d7785a4-30fc-419f-b761-b3e42e1c02a7.wav" />*/}
        {/*<br />*/}
        {/*{audio && <AudioRecorder/>}*/}

        {/*<ScreenShareModal />*/}
      </div>
    </Layout>
  );
}

export default Test;