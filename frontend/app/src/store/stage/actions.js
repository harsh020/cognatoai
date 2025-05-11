import {
  STAGE_LIST_REQUEST,
  STAGE_LIST_SUCCESS,
  STAGE_LIST_FAIL,
  STAGE_LIST_RESET,
} from './constants';
import { STAGE_APIS } from '@/apis/stageApis';
import {getOrganization, getToken} from "@/lib/utils";

export const listStages = (params) => async (dispatch, getState) => {
  try {
    dispatch({
      type: STAGE_LIST_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      },
    };

    let response = await STAGE_APIS.list(params, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: STAGE_LIST_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    dispatch({
      type: STAGE_LIST_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};
