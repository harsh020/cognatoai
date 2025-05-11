import React, {useState, useRef, useEffect} from "react";
import GradientButton from "./GradientButton";
import {useScreenRecorder, useVideoRecorder} from "../commons/hooks";
import {INTERVIEW_APIS} from "../apis/interviewApis";
import {UTILS} from "../commons/utils";
import {RECORDER_STATUS} from "../constants/enums";

const mimeType = 'video/webm; codecs="opus,vp8"';
const DEFAULT_MIME_TYPE = 'video/mp4; codecs=avc1.42E01E,mp4a.40.2'

const ScreenRecorder = (props) => {
  const { live, record, id } = props;

  const [header, setHeader] = useState();

  let {
    permissions,
    recorderStatus,
    liveScreenFeed,
    recordedScreen,
    startRecording,
    stopRecording,
    type
  } = useScreenRecorder({
    chunkSize: 10000,
    chunkHandler: (chunk, allChunks=[], type=DEFAULT_MIME_TYPE) => {
      if(record) {
        // console.log(allChunks[0])
        if(allChunks.length > 0) chunk = new Blob([allChunks[0], chunk])
        const mimeType = type;
        const ext = UTILS.getFileExtensionFromMimeType(mimeType)
        // console.log('id--->', id)
        const data = new FormData();
        data.append('file', new File([chunk], `${Date.now()}.${ext}`, { type: mimeType }));
        data.append('type', 'screen')
        data.append('id', id);
        INTERVIEW_APIS.recording(data)
          .then('success', (res) => {
            // console.log(res);
          }).then('error', (error) => {
          console.error(error);
        });
      }
    }
  });

  // console.log(record)

  useEffect(() => {
    if(recorderStatus === RECORDER_STATUS.INACTIVE && record) startRecording();
    else if(recorderStatus === RECORDER_STATUS.RECORDING && !record) stopRecording();
  }, [record]);

  return (
    <video className={'flex m-auto h-full w-full object-cover rounded-md'}
       playsInline ref={liveScreenFeed}
       controls={false} autoPlay
       style={{
        transform: 'rotateY(180deg)',
        maxHeight: "100%",
        maxWidth: "100%",
        // -webkit-transform: 'rotateY(180deg)', /* Safari and Chrome */
        // -moz-transform: 'rotateY(180deg)' /* Firefox */
      }}
    />
  );
};

export default ScreenRecorder;