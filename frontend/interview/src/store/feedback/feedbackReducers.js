import {
  FEEDBACK_CREATE_REQUEST,
  FEEDBACK_CREATE_SUCCESS,
  FEEDBACK_CREATE_FAILED,
  FEEDBACK_CREATE_RESET,
} from './feedbackConstants'


export const createFeedback = (state={}, action) => {
  switch (action.type) {
    case FEEDBACK_CREATE_REQUEST:
      return { loading: true }

    case FEEDBACK_CREATE_SUCCESS:
      return {
        loading: false,
        feedback: action.payload
      }

    case FEEDBACK_CREATE_FAILED:
      return {
        loading: false,
        error: action.payload
      }

    case FEEDBACK_CREATE_RESET:
      return {}

    default:
      return state
  }
}