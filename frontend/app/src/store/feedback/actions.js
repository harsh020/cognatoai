import {
  FEEDBACK_RETRIEVE_REQUEST,
  FEEDBACK_RETRIEVE_SUCCESS,
  FEEDBACK_RETRIEVE_FAIL,
  FEEDBACK_RETRIEVE_RESET,

} from './constants';
import { FEEDBACK_APIS } from '@/apis/feedbackApis';
import {getOrganization, getToken} from "@/lib/utils";


export const retrieveFeedback = (id) => async (dispatch, getState) => {
  try {
    dispatch({
      type: FEEDBACK_RETRIEVE_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      }
    };

    let response = await FEEDBACK_APIS.retrieve(id, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: FEEDBACK_RETRIEVE_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    dispatch({
      type: FEEDBACK_RETRIEVE_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};
