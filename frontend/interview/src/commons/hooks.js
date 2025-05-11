import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { MediaRecorder, register } from "extendable-media-recorder";
import { connect } from "extendable-media-recorder-wav-encoder";

import {
  INTERVIEW_STATUS,
  RECORDER_STATUS,
  SPEECH_STATUS,
} from "../constants/enums";
import {
  audio as getAudio,
  stopVideo,
  updateAudioStream, updateScreenStream,
  updateVideoStream,
  video as getVideo,
  screen as getScreen, stopScreen, audio as fetchAudioStream, video,
} from "../store/av/avActions";
import toast from "react-hot-toast";
import {CONFIG, settings} from "./config";

try {
  await register(await connect());
} catch (e) {}

export function useWatch(till = null) {
  const [counter, setCounter] = useState(0);
  const [finished, setFinished] = useState(false);

  const calculateTime = () => {
    return {
      hours: Math.floor((counter / (60 * 60)) % 24),
      minutes: Math.floor((counter / 60) % 60),
      seconds: Math.floor(counter % 60),
    };
  };

  const [timer, setTimer] = useState(calculateTime());

  useEffect(() => {
    const t = setTimeout(() => {
      setCounter(counter + 1);
    }, 1000);

    if (finished) clearTimeout(t);
    return () => clearTimeout(t);
  });

  useEffect(() => {
    setTimer(calculateTime());
    if (till && counter >= till) setFinished(true);
  }, [counter]);

  return {
    timer,
    finished,
  };
}

export function useTimer(time) {
  const [callback, setCallback] = useState(null);
  const [timedelta, setTimedelta] = useState(time);
  const [finished, setFinished] = useState(timedelta <= 0);

  const calculateTimeLeft = () => {
    return {
      hours: Math.floor((timedelta / (60 * 60)) % 24),
      minutes: Math.floor((timedelta / 60) % 60),
      seconds: Math.floor(timedelta % 60),
    };
  };
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedelta(Math.max(0, timedelta - 1));
      // setTimeLeft(calculateTimeLeft())
    }, 1000);

    if (finished) clearTimeout(timer); // to stop timeout when timer finishes
    return () => clearTimeout(timer);
  });

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    setFinished(timedelta <= 0);
  }, [timedelta]);

  useEffect(() => {
    if (finished && callback) {
      callback();
    }
  }, [finished]);

  return {
    timeLeft,
    finished,
    setTimer: (time, cb = null) => {
      setTimedelta(time);
      setCallback(cb);
    },
  };
}

export function useAudioRecorder(
  configs = {
    chunkSize: null,
    chunkHandler: null,
  },
) {
  const { chunkSize, chunkHandler } = configs;

  const mimeType = "audio/wav";
  const audioBitsPerSecond = 16000;
  const dispatch = useDispatch();

  const mediaRecorder = useRef(null);
  // const [permissions, setPermissions] = useState((configs.permissions && configs.permissions.audio) || false);
  const [stream, setStream] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audio, setAudio] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [level, setLevel] = useState(0.0);
  const [recorderStatus, setRecorderStatus] = useState(
    RECORDER_STATUS.INITIALIZING,
  );

  const retrieveAudio = useSelector((state) => state.retrieveAudio);
  const { loading, audio: retrievedAudio } = retrieveAudio;

  const [permissions, setPermissions] = useState(
    retrievedAudio && retrievedAudio.permission,
  );

  // console.log(retrievedAudio)

  const getMicrophonePermissions = async () => {
    if ("MediaRecorder" in window) {
      try {
        dispatch(getAudio());

        // const streamData = await navigator.mediaDevices.getUserMedia({
        //   audio: true,
        //   video: false
        // });

        // setPermissions(true);
        // setStream(streamData);
        // Instead stop the stream to stop recording
        // stream.getAudioTracks().map(track => track.stop())
      } catch (err) {
        console.error(err.message);
      }
    } else {
      alert("The MediaRecorder API is not supported in your browser.");
    }
  };

  const updateLevel = () => {
    const context = new AudioContext();
    const source = context.createMediaStreamSource(stream);
    const analyzer = context.createAnalyser();
    source.connect(analyzer);

    // The array we will put sound wave data in
    const array = new Uint8Array(analyzer.fftSize);

    function getPeakLevel() {
      analyzer.getByteTimeDomainData(array);
      return (
        array.reduce(
          (max, current) => Math.max(max, Math.abs(current - 127)),
          0,
        ) / 128
      );
    }

    function tick() {
      const peak = getPeakLevel();
      setLevel(peak);
      requestAnimationFrame(tick);
    }
    tick();
  };

  const startRecording = async () => {
    if (recorderStatus !== RECORDER_STATUS.INACTIVE) {
      console.error("Cannot start recording, when already on!");
      return;
    } else if (recorderStatus === RECORDER_STATUS.INITIALIZING) {
      console.error("Cannot start recording, when initializing!");
      return;
    }

    setRecorderStatus(RECORDER_STATUS.RECORDING);

    // let streamData = null;
    // if(!stream) {
    //   streamData = createAudioStream();
    // }

    // const streamData = await navigator.mediaDevices.getUserMedia({
    //   audio: true,
    //   video: false
    // });
    // setStream(streamData);
    updateLevel(); // for indicator

    const media = new MediaRecorder(stream, {
      mimeType: mimeType,
      // audioBitsPerSecond: audioBitsPerSecond
    });
    console.log(media)
    console.log()
    mediaRecorder.current = media;
    if (chunkSize) mediaRecorder.current.start(chunkSize);
    else mediaRecorder.current.start();

    let localAudioChunks = [];
    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event === "undefined") return;
      else if (event.data.size === 0) return;

      localAudioChunks.push(event.data);
      if (chunkSize && chunkHandler) chunkHandler(event.data, localAudioChunks);
    };

    setAudioChunks(localAudioChunks);
  };

  const stopRecording = () => {
    if (recorderStatus !== RECORDER_STATUS.RECORDING) {
      console.error("Cannot stop recording, when already off!");
      return;
    }

    setRecorderStatus(RECORDER_STATUS.INACTIVE);

    mediaRecorder.current.stop();
    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: mimeType });

      const audioUrl = URL.createObjectURL(audioBlob);
      setAudio(audioBlob);
      setAudioUrl(audioUrl);
      setAudioChunks([]);
    };
    // stream.getAudioTracks().map(track => track.stop())
    // setStream(null);
  };

  useEffect(() => {
    // console.log('checkin in effect -- ', retrievedAudio);
    if (!retrievedAudio || !retrievedAudio.permission || !loading)
      getMicrophonePermissions();
    else if (retrievedAudio && retrievedAudio.stream) {
      setStream(retrievedAudio.stream);
    } else if (
      retrievedAudio &&
      retrievedAudio.audio &&
      retrievedAudio.audio.status === INTERVIEW_STATUS.TERMINATED
    ) {
      stopRecording();
    }
  }, [retrievedAudio]);

  useEffect(() => {
    if (stream) {
      // console.log(stream);
      setRecorderStatus(RECORDER_STATUS.INACTIVE);
    }
  }, [stream]);

  // console.log('audio stream -> ', stream)

  return {
    permissions,
    recorderStatus,
    audio,
    audioUrl,
    level,
    startRecording,
    stopRecording,
  };
}

export function useAudioRecorderV2(
  configs = {
    chunkSize: null,
    chunkHandler: null,
  },
) {
  const { chunkSize, chunkHandler } = configs;

  let mimeType = "audio/webm;codecs=opus"
  if(settings.liveTranscript.enabled)  mimeType = "audio/wav";

  const audioBitsPerSecond = 44100;
  const dispatch = useDispatch();

  const mediaRecorder = useRef(null);
  // const [permissions, setPermissions] = useState((configs.permissions && configs.permissions.audio) || false);
  const [stream, setStream] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audio, setAudio] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [level, setLevel] = useState(0.0);
  const [recorderStatus, setRecorderStatus] = useState(
    RECORDER_STATUS.INITIALIZING,
  );

  const [audioSources, setAudioSources] = useState([]);
  const [selectedAudioSource, setSelectedAudioSource] = useState();


  const retrieveAudio = useSelector((state) => state.retrieveAudio);
  const { loading, audio: retrievedAudio } = retrieveAudio;

  const [permissions, setPermissions] = useState(
    retrievedAudio && retrievedAudio.permission,
  );

  const getMicrophonePermissions = async () => {
    if ("MediaRecorder" in window) {
      try {
        // console.log('getting again microspohone permissions')
        dispatch(getAudio());

        // const streamData = await navigator.mediaDevices.getUserMedia({
        //   audio: true,
        //   video: false
        // });

        // setPermissions(true);
        // setStream(streamData);
        // Instead stop the stream to stop recording
        // stream.getAudioTracks().map(track => track.stop())
      } catch (err) {
        console.error(err.message);
      }
    } else {
      alert("The MediaRecorder API is not supported in your browser.");
    }
  };

  const fetchAudioDevices = async () => {
    console.log('fetching audio devices')
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      let audioInputDevices = [];

      let defaultAudioInputDevice = null;

      devices.forEach(device => {
        if(device.kind === 'audioinput') {
          if(device.deviceId === 'default') defaultAudioInputDevice = device;
          else {
            audioInputDevices.push(device);
            if(defaultAudioInputDevice?.label === 'Default - ' + device.label) {
              defaultAudioInputDevice = device;
            }
          }
        }
      })

      setAudioSources(audioInputDevices);

      const deviceId = stream?.getAudioTracks()[0]?.getSettings.deviceId;
      // console.log('checking deviceId', deviceId)
      // if(!selectedAudioSource || deviceId === 'default') {
      //   if(defaultAudioInputDevice) {
      //     // console.log("setting default as", defaultAudioInputDevice)
      //     setSelectedAudioSource(defaultAudioInputDevice.deviceId)
      //   } else setSelectedAudioSource(deviceId);
      // }
      setSelectedAudioSource(audioInputDevices[0].deviceId)
      // setSelectedAudioSource(defaultAudioInputDevice?.deviceId === 'default' ? null : defaultAudioInputDevice?.deviceId)
    } catch (err) {
      console.error("Error fetching media devices:", err);
      toast.error("Error accessing media devices.");
    }
  };

  const updateLevel = () => {
    const context = new AudioContext();
    const source = context.createMediaStreamSource(stream);
    const analyzer = context.createAnalyser();
    source.connect(analyzer);

    // The array we will put sound wave data in
    const array = new Uint8Array(analyzer.fftSize);

    function getPeakLevel() {
      analyzer.getByteTimeDomainData(array);
      return (
        array.reduce(
          (max, current) => Math.max(max, Math.abs(current - 127)),
          0,
        ) / 128
      );
    }

    function tick() {
      const peak = getPeakLevel();
      setLevel(peak);
      requestAnimationFrame(tick);
    }
    tick();
  };

  const startRecording = async () => {
    if (recorderStatus !== RECORDER_STATUS.INACTIVE) {
      console.error("Cannot start recording, when already on!");
      return;
    } else if (recorderStatus === RECORDER_STATUS.INITIALIZING) {
      console.error("Cannot start recording, when initializing!");
      return;
    }

    setRecorderStatus(RECORDER_STATUS.RECORDING);

    // let streamData = null;
    // if(!stream) {
    //   streamData = createAudioStream();
    // }

    // const streamData = await navigator.mediaDevices.getUserMedia({
    //   audio: true,
    //   video: false
    // });
    // setStream(streamData);
    updateLevel(); // for indicator

    // Reset states
    setAudio(null);
    setAudioUrl(null);
    setAudioChunks([]);

    const media = new MediaRecorder(stream, {
      mimeType: mimeType,
      // audioBitsPerSecond: audioBitsPerSecond
    });
    mediaRecorder.current = media;
    if (chunkSize) mediaRecorder.current.start(chunkSize);
    else mediaRecorder.current.start();

    let localAudioChunks = [];
    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event === "undefined") return;
      else if (event.data.size === 0) return;

      localAudioChunks.push(event.data);
      if (chunkSize && chunkHandler) chunkHandler(event.data, localAudioChunks, mimeType);
    };

    setAudioChunks(localAudioChunks);
  };

  const stopRecording = () => {
    if (recorderStatus !== RECORDER_STATUS.RECORDING) {
      console.error("Cannot stop recording, when already off!");
      return;
    }

    setRecorderStatus(RECORDER_STATUS.INACTIVE);

    mediaRecorder.current.stop();
    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: mimeType });

      const audioUrl = URL.createObjectURL(audioBlob);
      setAudio(audioBlob);
      setAudioUrl(audioUrl);
      // setAudioChunks([]);
    };
    // stream.getAudioTracks().map(track => track.stop())
    // setStream(null);
  };

  useEffect(() => {
    // console.log('in effect --- ', retrievedAudio);
    if (!loading && (!retrievedAudio || !retrievedAudio.permission))
      getMicrophonePermissions();
    else if (retrievedAudio && retrievedAudio.stream) {
      if(audioSources.length === 0 || !selectedAudioSource) {
        // do this for the first time only
        fetchAudioDevices();
      }
      setStream(retrievedAudio.stream);
    } else if (
      retrievedAudio &&
      retrievedAudio.audio &&
      retrievedAudio.audio.status === INTERVIEW_STATUS.TERMINATED
    ) {
      stopRecording();
    }

    navigator.mediaDevices.addEventListener('devicechange', fetchAudioDevices);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', fetchAudioDevices);
    };
  }, [retrievedAudio]);

  useEffect(() => {
    // console.log("setting audio source in effect", selectedAudioSource)
    if(selectedAudioSource) dispatch(getAudio({ exact: selectedAudioSource } ));
  }, [selectedAudioSource]);

  useEffect(() => {
    if (stream) {
      // console.log(stream);
      setRecorderStatus(RECORDER_STATUS.INACTIVE);
    }
  }, [stream]);

  // console.log('audio stream -> ', stream)

  return {
    permissions,
    mimeType,
    recorderStatus,
    audio,
    audioUrl,
    level,
    audioSources,
    selectedAudioSource,
    setSelectedAudioSource,
    startRecording,
    stopRecording,
    totalChunks: audioChunks.length
  };
}

export function useVideoRecorderV1(
  configs = {
    chunkSize: null,
    chunkHandler: null,
  },
) {
  const dispatch = useDispatch();

  const { chunkSize, chunkHandler } = configs;

  const mimeType = 'video/webm; codecs="opus,vp8"';
  // const [permissions, setPermissions] = useState((configs.permissions && (configs.permissions.audio && configs.permissions.video)) || false);
  const mediaRecorder = useRef(null);
  const liveVideoFeed = useRef(null);
  const [recorderStatus, setRecorderStatus] = useState(
    RECORDER_STATUS.INACTIVE,
  );
  const [stream, setStream] = useState(null);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [videoChunks, setVideoChunks] = useState([]);

  const retrieveAudio = useSelector((state) => state.retrieveAudio);
  const { audio: retrievedAudio } = retrieveAudio;

  const retrieveVideo = useSelector((state) => state.retrieveVideo);
  const { video: retrievedVideo } = retrieveVideo;

  const [permissions, setPermissions] = useState(
    retrievedAudio &&
      retrievedAudio.permission &&
      retrievedVideo &&
      retrievedVideo.permission,
  );

  const createStream = async () => {
    const videoConstraints = {
      audio: false,
      video: true,
    };
    const audioConstraints = { audio: true };

    const audioStream =
      (retrievedAudio && retrievedAudio.stream) ||
      (await navigator.mediaDevices.getUserMedia(audioConstraints));
    const videoStream =
      (retrievedVideo && retrievedVideo.stream) ||
      (await navigator.mediaDevices.getUserMedia(videoConstraints));

    if (!retrievedVideo || !retrievedVideo.stream) {
      dispatch(updateVideoStream(videoStream));
    }

    if (!retrievedAudio || !retrievedAudio.stream) {
      dispatch(updateAudioStream(audioStream));
    }

    const combinedStream = new MediaStream([
      ...videoStream.getVideoTracks(),
      ...audioStream.getAudioTracks(),
    ]);

    return {
      videoStream,
      audioStream,
      combinedStream,
    };
  };

  const getPermission = async () => {
    setRecordedVideo(null);
    //get video and audio permissions and then stream the result media stream to the videoSrc variable
    if ("MediaRecorder" in window) {
      try {
        // if(!retrievedAudio) await dispatch(getAudio());
        if (!retrievedVideo) await dispatch(getVideo());
        // dispatch(avPermission());

        // const { videoStream, combinedStream } = await createStream();
        // setPermissions(true);

        // setStream(combinedStream);
        // liveVideoFeed.current.srcObject = videoStream;

        // instead of above two, grant permission and stop track
        // combinedStream.getTracks().map(track => track.stop());
      } catch (err) {
        alert(err.message);
      }
    } else {
      alert("The MediaRecorder API is not supported in your browser.");
    }
  };

  const startRecording = async () => {
    if (recorderStatus !== RECORDER_STATUS.INACTIVE) {
      console.error("Cannot start recording, when already on!");
      return;
    }

    const { videoStream, audioStream, combinedStream } = await createStream();
    setStream(combinedStream);

    // if(recorderStatus === RECORDER_STATUS.INITIALIZING) {
    //   console.error('Cannot start recording, when initializing!');
    //   return;
    // }

    setRecorderStatus(RECORDER_STATUS.RECORDING);

    // liveVideoFeed.current.srcObject = videoStream;
    // const media = new MediaRecorder(combinedStream, { mimeType });

    liveVideoFeed.current.srcObject = videoStream;
    const media = new MediaRecorder(combinedStream, { mimeType });
    mediaRecorder.current = media;
    mediaRecorder.current.start(chunkSize);

    let localVideoChunks = [];
    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === "undefined") return;
      if (event.data.size === 0) return;

      if (chunkHandler) chunkHandler(event.data); // TODO: Better way to handle callbacks
      localVideoChunks.push(event.data);
    };

    setVideoChunks(localVideoChunks);
  };

  const stopRecording = () => {
    // setPermissions(false);
    setRecorderStatus(RECORDER_STATUS.INACTIVE);
    mediaRecorder.current.stop();
    // console.log(stream)
    // stream.getVideoTracks().map(track => track.stop())

    mediaRecorder.current.onstop = () => {
      const videoBlob = new Blob(videoChunks, { type: mimeType });
      const videoUrl = URL.createObjectURL(videoBlob);
      setRecordedVideo(videoUrl);
      setVideoChunks([]);
    };

    stream.getVideoTracks().map((track) => track.stop());
    dispatch(stopVideo());
    setStream(null);
  };

  useEffect(() => {
    if (!retrievedAudio || !retrievedVideo || !retrievedVideo.permission)
      getPermission();
  }, []);

  useEffect(() => {
    if (
      retrievedVideo &&
      retrievedVideo.video &&
      retrievedVideo.video.status === INTERVIEW_STATUS.TERMINATED
    ) {
      stopRecording();
    }
  }, [retrievedVideo]);

  // useEffect(() => {
  //   // if(!retrievedAudio || !retrieveVideo) getPermission();
  //   if(retrievedAudio && retrievedVideo) {
  //     const combinedStream = new MediaStream([
  //       ...retrievedAudio.stream.getAudioTracks(),
  //       ...retrievedVideo.stream.getVideoTracks(),
  //     ]);
  //     setStream(combinedStream);
  //   }
  // }, [retrievedAudio, retrievedVideo]);

  // useEffect(() => {
  //   if(stream) setRecorderStatus(RECORDER_STATUS.INACTIVE);
  // }, [stream]);

  return {
    permissions,
    recorderStatus,
    liveVideoFeed,
    recordedVideo,
    startRecording,
    stopRecording,
    // setPermissions
  };
}

export function useVideoRecorder({
    chunkSize = 10000,
    chunkHandler = null,
  }) {
  const dispatch = useDispatch();

  // const { chunkSize, chunkHandler } = configs;

  const mediaRecorder = useRef(null);
  const liveVideoFeed = useRef(null);
  const [recorderStatus, setRecorderStatus] = useState(
    RECORDER_STATUS.INACTIVE,
  );
  const [type, setType] = useState(null);
  const [stream, setStream] = useState(null);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [videoChunks, setVideoChunks] = useState([]);

  const retrieveAudio = useSelector((state) => state.retrieveAudio);
  const { audio: retrievedAudio } = retrieveAudio;

  const retrieveVideo = useSelector((state) => state.retrieveVideo);
  const { video: retrievedVideo } = retrieveVideo;

  const [permissions, setPermissions] = useState(
    retrievedAudio &&
      retrievedAudio.permission &&
      retrievedVideo &&
      retrievedVideo.permission,
  );

  const getSupportedMimeType = () => {
    const mimeTypes = [
      "video/mp4; codecs=avc1.42E01E,mp4a.40.2",
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm;codecs=h264",
      "video/mp4",
    ];

    for (let i = 0; i < mimeTypes.length; i++) {
      if (MediaRecorder.isTypeSupported(mimeTypes[i])) {
        return mimeTypes[i];
      }
    }

    return null;
  };

  const createStream = async () => {
    const videoConstraints = {
      audio: false,
      video: true,
    };
    const audioConstraints = { audio: true };

    try {
      const audioStream =
        (retrievedAudio && retrievedAudio.stream) ||
        (await navigator.mediaDevices.getUserMedia(audioConstraints));
      const videoStream =
        (retrievedVideo && retrievedVideo.stream) ||
        (await navigator.mediaDevices.getUserMedia(videoConstraints));

      if (!retrievedVideo || !retrievedVideo.stream) {
        dispatch(updateVideoStream(videoStream));
      }

      if (!retrievedAudio || !retrievedAudio.stream) {
        dispatch(updateAudioStream(audioStream));
      }

      const combinedStream = new MediaStream([
        ...videoStream.getVideoTracks(),
        ...audioStream.getAudioTracks(),
      ]);

      return {
        videoStream,
        audioStream,
        combinedStream,
      };
    } catch (err) {
      console.error("Error accessing media devices:", err);
      return {};
    }
  };

  const getPermission = async () => {
    setRecordedVideo(null);

    try {
      if (!retrievedVideo) await dispatch(getVideo());
    } catch (err) {
      console.error("Error getting video permission:", err);
    }
  };

  const startRecording = async () => {
    if (recorderStatus !== RECORDER_STATUS.INACTIVE) {
      console.error("Cannot start recording, when already on!");
      return;
    }

    const { videoStream, audioStream, combinedStream } = await createStream();
    if (!combinedStream) {
      return;
    }

    setStream(combinedStream);
    setRecorderStatus(RECORDER_STATUS.RECORDING);

    const mimeType = getSupportedMimeType();
    if (!mimeType) {
      console.error("No supported video mimeType found!");
      return;
    }
    setType(mimeType);

    liveVideoFeed.current.srcObject = videoStream;
    const media = new MediaRecorder(combinedStream, { mimeType });
    mediaRecorder.current = media;
    mediaRecorder.current.start(chunkSize);

    let localVideoChunks = [];
    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === "undefined" || event.data.size === 0) {
        return;
      }

      if (chunkHandler) chunkHandler(event.data, localVideoChunks, mimeType);
      localVideoChunks.push(event.data);
    };

    setVideoChunks(localVideoChunks);
  };

  const stopRecording = () => {
    if (recorderStatus !== RECORDER_STATUS.RECORDING) {
      return;
    }

    setRecorderStatus(RECORDER_STATUS.INACTIVE);
    // console.log(mediaRecorder);
    // mediaRecorder.current.stop();

    mediaRecorder.current.onstop = () => {
      const videoBlob = new Blob(videoChunks, {
        type: mediaRecorder.current.mimeType,
      });
      const videoUrl = URL.createObjectURL(videoBlob);
      setRecordedVideo(videoUrl);
      setVideoChunks([]);
    };

    stream.getVideoTracks().forEach((track) => track.stop());
    dispatch(stopVideo());
    setStream(null);
  };

  useEffect(() => {
    if (!retrievedAudio || !retrievedVideo || !retrievedVideo.permission) {
      getPermission();
    }
  }, []);

  useEffect(() => {
    if (
      retrievedVideo &&
      retrievedVideo.video &&
      retrievedVideo.video.status === INTERVIEW_STATUS.TERMINATED
    ) {
      stopRecording();
    }
  }, [retrievedVideo]);

  return {
    permissions,
    recorderStatus,
    liveVideoFeed,
    recordedVideo,
    startRecording,
    stopRecording,
  };
}

export function useVideoRecorderV2({
    chunkSize = 10000,
    chunkHandler = null,
  }) {
  const dispatch = useDispatch();

  // const { chunkSize, chunkHandler } = configs;

  const mediaRecorder = useRef(null);
  const liveVideoFeed = useRef(null);
  const [recorderStatus, setRecorderStatus] = useState(
    RECORDER_STATUS.INACTIVE,
  );
  const [type, setType] = useState(null);
  const [stream, setStream] = useState(null);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [videoChunks, setVideoChunks] = useState([]);

  const [videoSources, setVideoSources] = useState([]);
  const [selectedVideoSource, setSelectedVideoSource] = useState();

  const retrieveAudio = useSelector((state) => state.retrieveAudio);
  const { audio: retrievedAudio } = retrieveAudio;

  const retrieveVideo = useSelector((state) => state.retrieveVideo);
  const { video: retrievedVideo, loading } = retrieveVideo;

  // console.log('audio tracks in video', stream?.getAudioTracks())

  const [permissions, setPermissions] = useState(
    retrievedAudio &&
      retrievedAudio.permission &&
      retrievedVideo &&
      retrievedVideo.permission,
  );

  const getSupportedMimeType = () => {
    const mimeTypes = [
      "video/mp4; codecs=avc1.42E01E,mp4a.40.2",
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm;codecs=h264",
      "video/mp4",
    ];

    for (let i = 0; i < mimeTypes.length; i++) {
      if (MediaRecorder.isTypeSupported(mimeTypes[i])) {
        return mimeTypes[i];
      }
    }

    return null;
  };

  const createStream = async () => {
    const videoConstraints = {
      audio: false,
      video: true,
    };
    const audioConstraints = { audio: true };

    try {
      const audioStream =
        (retrievedAudio && retrievedAudio.stream) ||
        (await navigator.mediaDevices.getUserMedia(audioConstraints));
      const videoStream =
        (retrievedVideo && retrievedVideo.stream) ||
        (await navigator.mediaDevices.getUserMedia(videoConstraints));

      if (!retrievedVideo || !retrievedVideo.stream) {
        dispatch(updateVideoStream(videoStream));
      }

      if (!retrievedAudio || !retrievedAudio.stream) {
        dispatch(updateAudioStream(audioStream));
      }

      const combinedStream = new MediaStream([
        ...videoStream.getVideoTracks(),
        ...audioStream.getAudioTracks(),
      ]);

      return {
        videoStream,
        audioStream,
        combinedStream,
      };
    } catch (err) {
      console.error("Error accessing media devices:", err);
      return {};
    }
  };

  const getPermission = async () => {
    setRecordedVideo(null);

    try {
      if (!retrievedVideo) await dispatch(getVideo());
    } catch (err) {
      console.error("Error getting video permission:", err);
    }
  };

  const fetchVideoDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      let videoInputDevices = [];

      let defaultVideoInputDevice = null;

      devices.forEach(device => {
        if(device.kind === 'videoinput') {
          if(device.deviceId === 'default') defaultVideoInputDevice = device;
          else {
            videoInputDevices.push(device);
            if(defaultVideoInputDevice?.label === 'Default - ' + device.label) {
              defaultVideoInputDevice = device;
            }
          }
        }
      })

      setVideoSources(videoInputDevices);

      const deviceId = stream?.getVideoTracks()[0]?.getSettings.deviceId;
      // console.log('checking video deviceId', deviceId)
      // console.log('checking selectedSource', selectedVideoSource, defaultVideoInputDevice)
      // if(!selectedVideoSource || deviceId === 'default') {
      //   if(defaultVideoInputDevice) {
      //     console.log("setting default as", defaultVideoInputDevice)
      //     setSelectedVideoSource(defaultVideoInputDevice.deviceId)
      //   } else setSelectedVideoSource(deviceId);
      // }
      if(videoInputDevices.length > 0) setSelectedVideoSource(videoInputDevices[0].deviceId)
      // setSelectedAudioSource(defaultAudioInputDevice?.deviceId === 'default' ? null : defaultAudioInputDevice?.deviceId)
    } catch (err) {
      console.error("Error fetching media devices:", err);
      toast.error("Error accessing media devices.");
    }
  };

  const startRecording = async () => {
    if (recorderStatus !== RECORDER_STATUS.INACTIVE) {
      console.error("Cannot start recording, when already on!");
      return;
    }

    const { videoStream, audioStream, combinedStream } = await createStream();
    if (!combinedStream) {
      return;
    }

    setStream(combinedStream);
    setRecorderStatus(RECORDER_STATUS.RECORDING);

    const mimeType = getSupportedMimeType();
    if (!mimeType) {
      console.error("No supported video mimeType found!");
      return;
    }
    setType(mimeType);

    liveVideoFeed.current.srcObject = videoStream;
    const media = new MediaRecorder(combinedStream, { mimeType });
    mediaRecorder.current = media;
    mediaRecorder.current.start(chunkSize);

    let localVideoChunks = [];
    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === "undefined" || event.data.size === 0) {
        return;
      }

      if (chunkHandler) chunkHandler(event.data, localVideoChunks, mimeType);
      localVideoChunks.push(event.data);
    };

    setVideoChunks(localVideoChunks);
  };

  const stopRecording = () => {
    if (recorderStatus !== RECORDER_STATUS.RECORDING) {
      return;
    }

    setRecorderStatus(RECORDER_STATUS.INACTIVE);
    // console.log(mediaRecorder);
    // mediaRecorder.current.stop();

    mediaRecorder.current.onstop = () => {
      const videoBlob = new Blob(videoChunks, {
        type: mediaRecorder.current.mimeType,
      });
      const videoUrl = URL.createObjectURL(videoBlob);
      setRecordedVideo(videoUrl);
      setVideoChunks([]);
    };

    stream.getVideoTracks().forEach((track) => track.stop());
    dispatch(stopVideo());
    setStream(null);
  };

  useEffect(() => {
    if (!loading && (!retrievedAudio || !retrievedVideo || !retrievedVideo.permission)) {
      getPermission();
    }
  }, []);

  useEffect(() => {
    if (
      retrievedVideo &&
      retrievedVideo.stream &&
      retrievedVideo.stream.status === INTERVIEW_STATUS.TERMINATED
    ) {
      stopRecording();
    } else if (retrievedVideo && retrievedVideo.stream) {
      if(videoSources.length === 0 || !selectedVideoSource) {
        // do this for the first time only
        fetchVideoDevices();
      }
    }

    navigator.mediaDevices.addEventListener('devicechange', fetchVideoDevices);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', fetchVideoDevices);
    };
  }, [retrievedVideo]);

  useEffect(() => {
    if(stream && retrievedAudio?.stream && stream.getAudioTracks()[0] !== retrievedAudio.stream.getAudioTracks()[0]) {
       createStream().then(res => setStream(res.combinedStream))
    }
  }, [retrievedAudio]);


  useEffect(() => {
    // console.log("setting audio source in effect", selectedAudioSource)
    if(selectedVideoSource) dispatch(getVideo({ deviceId: { exact: selectedVideoSource } }));
  }, [selectedVideoSource]);

  return {
    permissions,
    recorderStatus,
    liveVideoFeed,
    recordedVideo,
    videoSources,
    selectedVideoSource,
    setSelectedVideoSource,
    startRecording,
    stopRecording,
  };
}

export function useScreenRecorder({
 chunkSize = 10000,
 chunkHandler = null,
}) {
  const dispatch = useDispatch();

// const { chunkSize, chunkHandler } = configs;

  const mediaRecorder = useRef(null);
  const liveScreenFeed = useRef(null);
  const [recorderStatus, setRecorderStatus] = useState(
    RECORDER_STATUS.INACTIVE,
  );
  const [type, setType] = useState(null);
  const [stream, setStream] = useState(null);
  const [recordedScreen, setRecordedScreen] = useState(null);
  const [screenChunks, setScreenChunks] = useState([]);

  const retrieveAudio = useSelector((state) => state.retrieveAudio);
  const { audio: retrievedAudio } = retrieveAudio;

  const retrieveScreen = useSelector((state) => state.retrieveScreen);
  const { screen: retrievedScreen } = retrieveScreen;

  const [permissions, setPermissions] = useState(
    retrievedAudio &&
    retrievedAudio.permission &&
    retrievedScreen &&
    retrievedScreen.permission,
  );

  const getSupportedMimeType = () => {
    const mimeTypes = [
      "video/mp4; codecs=avc1.42E01E,mp4a.40.2",
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm;codecs=h264",
      "video/mp4",
    ];

    for (let i = 0; i < mimeTypes.length; i++) {
      if (MediaRecorder.isTypeSupported(mimeTypes[i])) {
        return mimeTypes[i];
      }
    }

    return null;
  };

  const createStream = async () => {
    const screenConstraints = {
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      },
      video: {
        displaySurface: "browser",
      },
      // selfBrowserSurface: "include",
      preferCurrentTab: true,
      // systemAudio: "include",
    };
    const audioConstraints = { audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      } };

    try {
      const audioStream =
        (retrievedAudio && retrievedAudio.stream) ||
        (await navigator.mediaDevices.getUserMedia(audioConstraints));
      const screenStream =
        (retrievedScreen && retrievedScreen.stream) ||
        (await navigator.mediaDevices.getDisplayMedia(screenConstraints));

      if (!retrievedScreen || !retrievedScreen.stream) {
        dispatch(updateScreenStream(screenStream));
      }
      if (!retrievedAudio || !retrievedAudio.stream) {
        dispatch(updateAudioStream(audioStream));
      }

      const combinedStream = new MediaStream([
        ...screenStream.getVideoTracks(),
        ...audioStream.getAudioTracks(),
      ]);

      return {
        screenStream,
        audioStream,
        combinedStream,
      };
    } catch (err) {
      console.error("Error accessing media devices:", err);
      return {};
    }
  };

  const getPermission = async () => {
    setRecordedScreen(null);

    try {
      if (!retrievedScreen) await dispatch(getScreen());
    } catch (err) {
      console.error("Error getting screen permission:", err);
    }
  };

  const startRecording = async () => {
    if (recorderStatus !== RECORDER_STATUS.INACTIVE) {
      console.error("Cannot start recording, when already on!");
      return;
    }

    const { screenStream, audioStream, combinedStream } = await createStream();
    if (!combinedStream) {
      return;
    }

    setStream(combinedStream);
    setRecorderStatus(RECORDER_STATUS.RECORDING);

    const mimeType = getSupportedMimeType();
    if (!mimeType) {
      console.error("No supported screen mimeType found!");
      return;
    }
    setType(mimeType);

    // if(liveScreenFeed.current) liveScreenFeed.current.srcObject = screenStream;
    const media = new MediaRecorder(combinedStream, { mimeType });
    mediaRecorder.current = media;
    mediaRecorder.current.start(chunkSize);

    let localScreenChunks = [];
    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === "undefined" || event.data.size === 0) {
        return;
      }

      if (chunkHandler) chunkHandler(event.data, localScreenChunks, mimeType);
      localScreenChunks.push(event.data);
    };

    setScreenChunks(localScreenChunks);
  };

  const stopRecording = () => {
    if (recorderStatus !== RECORDER_STATUS.RECORDING) {
      return;
    }

    setRecorderStatus(RECORDER_STATUS.INACTIVE);
    // console.log(mediaRecorder);
    // mediaRecorder.current.stop();

    mediaRecorder.current.onstop = () => {
      const screenBlob = new Blob(screenChunks, {
        type: mediaRecorder.current.mimeType,
      });
      const screenUrl = URL.createObjectURL(screenBlob);
      setRecordedScreen(screenUrl);
      setScreenChunks([]);
    };

    stream.getTracks().forEach((track) => track.stop());
    dispatch(stopScreen());
    setStream(null);
  };

  // useEffect(() => {
  //   if (!retrievedAudio || !retrievedScreen || !retrievedScreen.permission) {
  //     getPermission();
  //   }
  // }, []);

  useEffect(() => {
    if (
      retrievedScreen &&
      retrievedScreen.screen &&
      retrievedScreen.screen.status === INTERVIEW_STATUS.TERMINATED
    ) {
      stopRecording();
    }
  }, [retrievedScreen]);

  useEffect(() => {
    if(stream && retrievedAudio?.stream && stream.getAudioTracks()[0] !== retrievedAudio.stream.getAudioTracks()[0]) {
      createStream().then(res => setStream(res.combinedStream))
    }
  }, [retrievedAudio]);

  return {
    permissions,
    recorderStatus,
    liveScreenFeed,
    getPermission,
    recordedScreen,
    startRecording,
    stopRecording,
  };
}


export function useSpeechSynthesizer(
  config = {
    voice: null,
    pitch: null,
    rate: null,
    volume: null,
    onStart: null,
    onEnd: null,
  },
) {
  const speechSynthesis = useRef(null);
  const [voice, setVoice] = useState(parseFloat(config.voice) || 1);
  const [_voice, set_voice] = useState(null);
  const [pitch, setPitch] = useState(parseFloat(config.pitch) || 1);
  const [rate, setRate] = useState(parseFloat(config.rate) || 1);
  const [volume, setVolume] = useState(parseFloat(config.volume) || 1);
  const [speechStatus, setSpeechStatus] = useState(SPEECH_STATUS.INACTIVE);

  useEffect(() => {
    const speech = window.speechSynthesis;

    speechSynthesis.current = speech;
    const voices = speechSynthesis.current.getVoices();
    set_voice(voices[voice]);
  }, [voice]);

  const speechStart = (event) => {
    setSpeechStatus(SPEECH_STATUS.SPEAKING);
    if (config.onStart) config.onStart();
  };

  const speechEnd = (event) => {
    setSpeechStatus(SPEECH_STATUS.INACTIVE);
    if (config.onEnd) config.onEnd();
  };

  const speak = (text) => {
    const speakHandler = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = speechStart;
      utterance.onend = speechEnd;

      utterance.voice = _voice;
      utterance.pitch = pitch;
      utterance.rate = rate;
      utterance.volume = volume;
      speechSynthesis.current.cancel();
      speechSynthesis.current.speak(utterance);
    };

    /*
     * Google Chrome has removed autoplay support for speechSynthesis, i.e, we cannot play using speechSynthesis.speak()
     * Ref: https://chromestatus.com/feature/5687444770914304
     * Ref: https://stackoverflow.com/a/63867769
     *
     * But speech can be used by clicking button, to do that.
     */
    const button = document.createElement("button");
    button.onclick = speakHandler;
    button.click();
  };

  return {
    speechStatus,
    setRate,
    setVoice,
    setPitch,
    setVolume,
    speak,
  };
}

export function useAudioSynthesizer(
  config = {
    onStart: null,
    onEnd: null,
    onLoaded: null,
  },
) {
  const audioRef = useRef(null);
  const [speechStatus, setSpeechStatus] = useState(SPEECH_STATUS.INACTIVE);

  const audioStart = (event) => {
    setSpeechStatus(SPEECH_STATUS.ACTIVE);
    if (config.onStart) config.onStart();
  };

  const loaded = (event) => {
    setSpeechStatus(SPEECH_STATUS.SPEAKING);
    if (config.onLoaded) config.onLoaded();
  };

  const audioEnd = (event) => {
    setSpeechStatus(SPEECH_STATUS.INACTIVE);
    if (config.onEnd) config.onEnd();
  };

  const play = (url, playbackRate = 1.0) => {
    let audio = new Audio(url);
    audio.playbackRate = playbackRate;
    audio.onplay = audioStart;
    audio.onended = audioEnd;
    audio.onloadeddata = loaded;

    audioRef.current = audio;
    audio.play();
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      delete audioRef.current;
    }
  };

  return {
    speechStatus,
    play,
    stop,
  };
}


export const useTabActivity = () => {
  const [isTabActive, setIsTabActive] = useState(true);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [tabSwitchTimestamps, setTabSwitchTimestamps] = useState([]);

  // console.log(tabSwitchCount, tabSwitchTimestamps);

  const handleVisibilityChange = useCallback(() => {
    const isActive = document.visibilityState === 'visible';
    setIsTabActive(isActive);

    if (!isActive) {
      // Use functional updates to access the latest state values
      setTabSwitchCount((prevCount) => prevCount + 1);
      setTabSwitchTimestamps((prevTimestamps) => [
        ...prevTimestamps,
        new Date().toISOString(),
      ]);
      // console.log('Tab inactive');
    }
  }, []); // Dependencies are empty since we're using functional updates

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  return {
    isTabActive,
    tabSwitchCount,
    tabSwitchTimestamps,
  };
};
