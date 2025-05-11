import {
  ACTIVITY_RETRIEVE_REQUEST,
  ACTIVITY_RETRIEVE_SUCCESS,
  ACTIVITY_RETRIEVE_FAIL,
  ACTIVITY_RETRIEVE_RESET,

} from './constants';



export const retrieveActivity = (state = {}, action) => {
  switch (action.type) {
    case ACTIVITY_RETRIEVE_REQUEST:
      return { loading: true };

    case ACTIVITY_RETRIEVE_SUCCESS:
      return {
        loading: false,
        activity: action.payload
      };

    case ACTIVITY_RETRIEVE_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case ACTIVITY_RETRIEVE_RESET:
      return {};

    default:
      return state;
  }
};
