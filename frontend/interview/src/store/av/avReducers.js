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


export const retrieveAudio = (state = {}, action) => {
  switch (action.type) {
    case (AUDIO_REQUEST):
      return {
        loading: true,
      }

    case (AUDIO_SUCCESS):
      return {
        audio: action.payload,
        loading: false,
      }

    case (AUDIO_FAILED):
      return {
        error: action.payload,
        loading: false,
      }

    case (AUDIO_RESET):
      return {}

    default:
      return state
  }
}

export const retrieveVideo = (state = {}, action) => {
  switch (action.type) {
    case (VIDEO_REQUEST):
      return {
        loading: true,
      }

    case (VIDEO_SUCCESS):
      return {
        video: action.payload,
        loading: false,
      }

    case (VIDEO_FAILED):
      return {
        error: action.payload,
        loading: false,
      }

    case (VIDEO_RESET):
      return {}

    default:
      return state
  }
}

export const retrieveScreen = (state = {}, action) => {
  switch (action.type) {
    case (SCREEN_REQUEST):
      return {
        loading: true,
      }

    case (SCREEN_SUCCESS):
      return {
        screen: action.payload,
        loading: false,
      }

    case (SCREEN_FAILED):
      return {
        error: action.payload,
        loading: false,
      }

    case (SCREEN_RESET):
      return {}

    default:
      return state
  }
}

export const av = (state = {}, action) => {
  switch (action.type) {
    case (AV_PERMISSION_REQUEST):
      return {
        loading: true,
      }

    case (AV_PERMISSION_SUCCESS):
      return {
        loading: false,
        permissions: {
          audio: action.payload.audio,
          video: action.payload.video,
        }
      }

    case (AV_PERMISSION_FAILED):
      return {
        loading: false,
        permissions: {
          audio: false,
          video: false,
        }
      }

    case (AV_PERMISSION_RESET):
      return {}

    default:
      return state
  }
}