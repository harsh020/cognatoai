import {
  RECORDING_RETRIEVE_REQUEST,
  RECORDING_RETRIEVE_SUCCESS,
  RECORDING_RETRIEVE_FAIL,
  RECORDING_RETRIEVE_RESET,

} from './constants';



export const retrieveRecording = (state = {}, action) => {
  switch (action.type) {
    case RECORDING_RETRIEVE_REQUEST:
      return { loading: true };

    case RECORDING_RETRIEVE_SUCCESS:
      return {
        loading: false,
        recording: action.payload
      };

    case RECORDING_RETRIEVE_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case RECORDING_RETRIEVE_RESET:
      return {};

    default:
      return state;
  }
};
