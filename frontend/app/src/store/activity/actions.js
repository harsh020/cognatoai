import {
  ACTIVITY_RETRIEVE_REQUEST,
  ACTIVITY_RETRIEVE_SUCCESS,
  ACTIVITY_RETRIEVE_FAIL,
  ACTIVITY_RETRIEVE_RESET,

} from './constants';
import { ACTIVITY_APIS } from '@/apis/activityApis';
import {getOrganization, getToken} from "@/lib/utils";


export const retrieveActivity = (id) => async (dispatch, getState) => {
  try {
    dispatch({
      type: ACTIVITY_RETRIEVE_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      }
    };

    let response = await ACTIVITY_APIS.retrieve(id, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: ACTIVITY_RETRIEVE_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    dispatch({
      type: ACTIVITY_RETRIEVE_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};
