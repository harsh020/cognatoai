import {
  RECORDING_RETRIEVE_REQUEST,
  RECORDING_RETRIEVE_SUCCESS,
  RECORDING_RETRIEVE_FAIL,
  RECORDING_RETRIEVE_RESET,

} from './constants';
import { RECORDING_APIS } from '@/apis/recordingApis';
import {getOrganization, getToken} from "@/lib/utils";


export const retrieveRecording = (id) => async (dispatch, getState) => {
  try {
    dispatch({
      type: RECORDING_RETRIEVE_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      }
    };

    let response = await RECORDING_APIS.retrieve(id, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: RECORDING_RETRIEVE_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    dispatch({
      type: RECORDING_RETRIEVE_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};
