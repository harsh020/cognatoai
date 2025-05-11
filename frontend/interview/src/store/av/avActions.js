import {
  AUDIO_REQUEST,
  AUDIO_SUCCESS,
  AUDIO_FAILED,
  AUDIO_RESET,

  VIDEO_REQUEST,
  VIDEO_SUCCESS,
  VIDEO_FAILED,
  VIDEO_RESET,

  SCREEN_REQUEST,
  SCREEN_SUCCESS,
  SCREEN_FAILED,
  SCREEN_RESET,

  AV_PERMISSION_REQUEST,
  AV_PERMISSION_SUCCESS,
  AV_PERMISSION_FAILED,
  AV_PERMISSION_RESET,
} from './avConstants'
import {INTERVIEW_STATUS} from "../../constants/enums";

export const audio = (deviceId) =>  async (dispatch, getState) => {
  try {
    dispatch({
      type: AUDIO_REQUEST,
    })

    // Stop old stream. In case we start a new stream when old stream already existed
    const {
      retrieveAudio
    } = getState();

    const { audio: retrievedAudio } = retrieveAudio;

    if (retrievedAudio?.stream) {
      retrievedAudio.stream.getTracks().forEach((track) => track.stop());
    }

    // console.log("got device id", deviceId)
    const constraint = {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false
    }
    if(deviceId) constraint['deviceId'] = deviceId;

    const streamData = await navigator.mediaDevices.getUserMedia({
      audio: constraint,
      video: false
    });

    // console.log("got stream", streamData.getAudioTracks())

    dispatch({
      type: AUDIO_SUCCESS,
      payload: {
        permission: true,
        stream: streamData,
      },
    })

    // streamData.getTracks().map(track => track.stop());
  }
  catch (e) {
    dispatch({
      type: AUDIO_FAILED,
      payload: {
        permission: false,
      },
    })
  }
}

export const updateAudioStream = (stream) => async (dispatch) => {
  try {
    dispatch({
      type: AUDIO_REQUEST,
    })

    dispatch({
      type: AUDIO_SUCCESS,
      payload: {
        permission: true,
        stream: stream,
      },
    })
  }
  catch (e) {
    dispatch({
      type: AUDIO_FAILED,
      payload: false,
    })
  }
}

export const stopAudio = (status) => async (dispatch, getState) => {
  const {
    retrieveAudio
  } = getState();

  const { audio: retrievedAudio } = retrieveAudio;

  if (retrievedAudio.stream) {
    retrievedAudio.stream.getTracks().forEach((track) => track.stop());

    dispatch({
      type: AUDIO_SUCCESS,
      payload: {
        permission: true,
        stream: null,
        status: status,
      }
    })
  }
}


export const video = (deviceId) =>  async (dispatch, getState) => {
  try {
    dispatch({
      type: VIDEO_REQUEST,
    })

    // Stop old stream. In case we start a new stream when old stream already existed
    const {
      retrieveVideo
    } = getState();

    const { video: retrievedVideo } = retrieveVideo;

    if (retrievedVideo?.stream) {
      retrievedVideo.stream.getTracks().forEach((track) => track.stop());
    }

    const streamData = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: deviceId || true
    });

    dispatch({
      type: VIDEO_SUCCESS,
      payload: {
        permission: true,
        stream: streamData,
      },
    })

    // streamData.getTracks().map(track => track.stop());
  }
  catch (e) {
    dispatch({
      type: VIDEO_FAILED,
      payload: {
        permission: false
      },
    })
  }
}

export const updateVideoStream = (stream) => async (dispatch) => {
  try {
    dispatch({
      type: VIDEO_REQUEST,
    })

    dispatch({
      type: VIDEO_SUCCESS,
      payload: {
        permission: true,
        stream: stream,
      },
    })
  }
  catch (e) {
    dispatch({
      type: VIDEO_FAILED,
      payload: {
        permission: false
      },
    })
  }
}

export const stopVideo = (status) => async (dispatch, getState) => {
  const {
    retrieveVideo
  } = getState();

  // console.log("Stopping video...")

  const { video: retrievedVideo } = retrieveVideo;

  if(retrievedVideo?.stream) {
    retrievedVideo.stream.getTracks().map(track => track.stop());

    dispatch({
      type: VIDEO_SUCCESS,
      payload: {
        permission: true,
        stream: null,
        status: status,
      }
    })
  }
}


export const screen = () =>  async (dispatch, getState) => {
  try {
    dispatch({
      type: SCREEN_REQUEST,
    })

    const {
      retrieveScreen
    } = getState();

    const { screen: retrievedScreen } = retrieveScreen;

    if(retrievedScreen?.stream) {
      retrievedScreen?.stream.getTracks().map(track => track.stop());
    }

    const streamData = await navigator.mediaDevices.getDisplayMedia({
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
    });

    dispatch({
      type: SCREEN_SUCCESS,
      payload: {
        permission: true,
        stream: streamData,
      },
    })

    // streamData.getTracks().map(track => track.stop());
  }
  catch (e) {
    dispatch({
      type: SCREEN_FAILED,
      payload: {
        permission: false
      },
    })
  }
}

export const updateScreenStream = (stream) => async (dispatch) => {
  try {
    dispatch({
      type: SCREEN_REQUEST,
    })

    dispatch({
      type: SCREEN_SUCCESS,
      payload: {
        permission: true,
        stream: stream,
      },
    })
  }
  catch (e) {
    dispatch({
      type: SCREEN_FAILED,
      payload: {
        permission: false
      },
    })
  }
}

export const stopScreen = (status) => async (dispatch, getState) => {
  const {
    retrieveScreen
  } = getState();

  // console.log("Stopping screen...")

  const { screen: retrievedScreen } = retrieveScreen;

  if(retrievedScreen?.stream) {
    retrievedScreen?.stream.getTracks().map(track => track.stop());

    dispatch({
      type: SCREEN_SUCCESS,
      payload: {
        permission: true,
        stream: null,
        status: status,
      }
    })
  }
}

export const avPermission = (config={}) =>  async (dispatch) => {
  try {
    dispatch({
      type: AV_PERMISSION_REQUEST,
    })

    const streamData = await navigator.mediaDevices.getUserMedia({
      audio: config.audio || true,
      video: config.video || true,
    });

    dispatch({
      type: AV_PERMISSION_SUCCESS,
      payload: {
        audio: config.audio || true,
        video: config.video || true,
      }
    })

    streamData.getTracks().map(track => track.stop());
  }
  catch (e) {
    dispatch({
      type: AV_PERMISSION_FAILED,
      payload: {
        audio: false,
        video: false,
      }
    })
  }
}