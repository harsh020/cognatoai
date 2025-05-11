import {
  FEEDBACK_RETRIEVE_REQUEST,
  FEEDBACK_RETRIEVE_SUCCESS,
  FEEDBACK_RETRIEVE_FAIL,
  FEEDBACK_RETRIEVE_RESET,

} from './constants';



export const retrieveFeedback = (state = {}, action) => {
  switch (action.type) {
    case FEEDBACK_RETRIEVE_REQUEST:
      return { loading: true };

    case FEEDBACK_RETRIEVE_SUCCESS:
      return {
        loading: false,
        feedback: action.payload
      };

    case FEEDBACK_RETRIEVE_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case FEEDBACK_RETRIEVE_RESET:
      return {};

    default:
      return state;
  }
};
