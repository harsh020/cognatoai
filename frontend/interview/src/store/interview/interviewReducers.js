import {
  INTERVIEW_RETRIEVE_REQUEST,
  INTERVIEW_RETRIEVE_SUCCESS,
  INTERVIEW_RETRIEVE_FAILED,
  INTERVIEW_RETRIEVE_RESET,

  INTERVIEW_CONTINUE_REQUEST,
  INTERVIEW_CONTINUE_SUCCESS,
  INTERVIEW_CONTINUE_FAILED,
  INTERVIEW_CONTINUE_RESET,

  INTERVIEW_UPDATE_REQUEST,
  INTERVIEW_UPDATE_SUCCESS,
  INTERVIEW_UPDATE_FAILED,
  INTERVIEW_UPDATE_RESET, INTERVIEW_SCREEN_UPDATE,
} from './interviewConstants'
import {MEETINGS_STATUS} from "../../constants/enums";

export const retrieveInterview = (state={}, action) => {
  switch (action.type) {
    case INTERVIEW_RETRIEVE_REQUEST:
      return { loading: true }

    case INTERVIEW_RETRIEVE_SUCCESS:
      return {
        loading: false,
        interview: action.payload
      }

    case INTERVIEW_RETRIEVE_FAILED:
      return {
        loading: false,
        error: action.payload
      }

    case INTERVIEW_RETRIEVE_RESET:
      return {}

    default:
      return state
  }
}

export const continueInterview = (state={}, action) => {
  switch (action.type) {
    case INTERVIEW_CONTINUE_REQUEST:
      return { loading: true }

    case INTERVIEW_CONTINUE_SUCCESS:
      return {
        loading: false,
        response: action.payload
      }

    case INTERVIEW_CONTINUE_FAILED:
      return {
        loading: false,
        error: action.payload
      }

    case INTERVIEW_CONTINUE_RESET:
      return {}

    default:
      return state
  }
}

export const endInterview = (state={}, action) => {
  switch (action.type) {
    case INTERVIEW_UPDATE_REQUEST:
      return { loading: true }

    case INTERVIEW_UPDATE_SUCCESS:
      return {
        loading: false,
        interview: action.payload
      }

    case INTERVIEW_UPDATE_FAILED:
      return {
        loading: false,
        error: action.payload
      }

    case INTERVIEW_UPDATE_RESET:
      return {}

    default:
      return state
  }
}

export const interviewScreen = (state={}, action) => {
  switch (action.type) {
    case INTERVIEW_SCREEN_UPDATE:
      return {
        screen: action.payload,
      }

    default:
      return {
        ...state
      }
  }
}