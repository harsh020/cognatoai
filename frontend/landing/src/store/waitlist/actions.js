import {
  WAITLIST_CREATE_REQUEST,
  WAITLIST_CREATE_SUCCESS,
  WAITLIST_CREATE_FAILED,

  WAITLIST_UPDATE_REQUEST,
  WAITLIST_UPDATE_SUCCESS,
  WAITLIST_UPDATE_FAILED,
} from './constants';
import {WAITLIST_APIS} from "@/apis/waitlist-apis";

export const create = (data) => async (dispatch) => {
  try {
    dispatch({
      type: WAITLIST_CREATE_REQUEST
    })

    let response = await WAITLIST_APIS.create(data);
    response = response.data;

    if(response && response.error) {
      throw response;
    }

    dispatch({
      type: WAITLIST_CREATE_SUCCESS,
      payload: response
    })
  }
  catch (error) {
    console.log(error);
    dispatch({
      type: WAITLIST_CREATE_FAILED,
      payload: {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
}


export const update = (id, data) => async (dispatch) => {
  try {
    dispatch({
      type: WAITLIST_UPDATE_REQUEST
    })

    let response = await WAITLIST_APIS.update(id, data);
    response = response.data;

    if(response && response.error) {
      throw response;
    }

    dispatch({
      type: WAITLIST_UPDATE_SUCCESS,
      payload: response
    })
  }
  catch (error) {
    console.log(error);
    dispatch({
      type: WAITLIST_UPDATE_FAILED,
      payload: {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
}