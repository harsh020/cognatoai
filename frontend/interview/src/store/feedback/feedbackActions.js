import {
  FEEDBACK_CREATE_REQUEST,
  FEEDBACK_CREATE_SUCCESS,
  FEEDBACK_CREATE_FAILED,
  FEEDBACK_CREATE_RESET,
} from './feedbackConstants'
import {FEEDBACK_APIS} from "../../apis/feedbackApis";

export const create = (data) => async (dispatch) => {
  try {
    dispatch({
      type: FEEDBACK_CREATE_REQUEST
    });


    let response = await FEEDBACK_APIS.create(data);
    response = response.data

    if(response && response.error) {
      throw response;
    }

    dispatch({
      type: FEEDBACK_CREATE_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    console.log(error);
    dispatch({
      type: FEEDBACK_CREATE_FAILED,
      payload: {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
}