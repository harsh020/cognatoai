import {
  STAGE_LIST_REQUEST,
  STAGE_LIST_SUCCESS,
  STAGE_LIST_FAIL,
  STAGE_LIST_RESET,
} from './constants';


export const listStages = (state = {}, action) => {
  switch (action.type) {
    case STAGE_LIST_REQUEST:
      return { loading: true };

    case STAGE_LIST_SUCCESS:
      return {
        loading: false,
        stages: action.payload
      };

    case STAGE_LIST_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case STAGE_LIST_RESET:
      return {};

    default:
      return state;
  }
};
