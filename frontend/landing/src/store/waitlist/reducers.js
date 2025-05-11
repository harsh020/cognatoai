import {
  WAITLIST_CREATE_REQUEST,
  WAITLIST_CREATE_SUCCESS,
  WAITLIST_CREATE_FAILED,
  WAITLIST_CREATE_RESET,

  WAITLIST_UPDATE_REQUEST,
  WAITLIST_UPDATE_SUCCESS,
  WAITLIST_UPDATE_FAILED,
  WAITLIST_UPDATE_RESET,
} from './constants';

export const createWaitlist = (state={}, action) => {
  switch (action.type) {
    case WAITLIST_CREATE_REQUEST:
      return { loading: true }

    case WAITLIST_CREATE_SUCCESS:
      return {
        loading: false,
        waitlist: action.payload
      }

    case WAITLIST_CREATE_FAILED:
      return {
        loading: false,
        error: action.payload
      }

    case WAITLIST_CREATE_RESET:
      return {}

    default:
      return state
  }
}

export const updateWaitlist = (state={}, action) => {
  switch (action.type) {
    case WAITLIST_UPDATE_REQUEST:
      return { loading: true }

    case WAITLIST_UPDATE_SUCCESS:
      return {
        loading: false,
        waitlist: action.payload
      }

    case WAITLIST_UPDATE_FAILED:
      return {
        loading: false,
        error: action.payload
      }

    case WAITLIST_UPDATE_RESET:
      return {}

    default:
      return state
  }
}