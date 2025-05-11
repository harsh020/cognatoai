import {
  TRANSCRIBE_FAILED,
  TRANSCRIBE_REQUEST,
  TRANSCRIBE_RESET,
  TRANSCRIBE_SUCCESS,

  TRANSCRIBE_WARMUP_FAILED,
  TRANSCRIBE_WARMUP_REQUEST,
  TRANSCRIBE_WARMUP_RESET,
  TRANSCRIBE_WARMUP_SUCCESS,


  LIVE_TRANSCRIBE_FAILED,
  LIVE_TRANSCRIBE_REQUEST,
  LIVE_TRANSCRIBE_SUCCESS,
  LIVE_TRANSCRIBE_RESET,

  SPEAK_FAILED,
  SPEAK_REQUEST,
  SPEAK_RESET,
  SPEAK_SUCCESS,
} from "./linguisticConstants";


export const transcribe = (state={}, action) => {
  switch (action.type) {
    case TRANSCRIBE_REQUEST:
      return {
        loading: true,
      }

    case TRANSCRIBE_SUCCESS:
      return {
        loading: false,
        transcript: action.payload
      }

    case TRANSCRIBE_FAILED:
      return {
        loading: false,
        error: action.payload
      }

    case TRANSCRIBE_RESET:
      return {}

    default:
      return state
  }
}

export const transcribeWarmup = (state={}, action) => {
  switch (action.type) {
    case TRANSCRIBE_WARMUP_REQUEST:
      return {
        loading: true,
      }

    case TRANSCRIBE_WARMUP_SUCCESS:
      return {
        loading: false,
        warmup: action.payload
      }

    case TRANSCRIBE_WARMUP_FAILED:
      return {
        loading: false,
        error: action.payload
      }

    case TRANSCRIBE_WARMUP_RESET:
      return {}

    default:
      return state
  }
}

export const liveTranscribe = (state={}, action) => {
  switch (action.type) {
    case LIVE_TRANSCRIBE_REQUEST:
      return {
        ...state,
        loading: true
      }

    case LIVE_TRANSCRIBE_SUCCESS:
      return {
        loading: false,
        transcript: action.payload
      }

    case LIVE_TRANSCRIBE_FAILED:
      return {
        ...state,
        loading: false,
        error: action.payload
      }

    case LIVE_TRANSCRIBE_RESET:
      return {}

    default:
      return state
  }
}


export const speak = (state={}, action) => {
  switch (action.type) {
    case SPEAK_REQUEST:
      return {
        loading: true,
      }

    case SPEAK_SUCCESS:
      return {
        loading: false,
        audio: action.payload
      }

    case SPEAK_FAILED:
      return {
        loading: false,
        error: action.payload
      }

    case SPEAK_RESET:
      return {}

    default:
      return state
  }
}