import { ACTIVITY_APIS } from "../../apis/activityApis";
import {
  ACTIVITY_BULK_CREATE_REQUEST,
  ACTIVITY_BULK_CREATE_SUCCESS,
  ACTIVITY_BULK_CREATE_FAILED,
} from "./activityConstants";


export const bulkCreate = (data) => async dispatch => {
  try {
    dispatch({
      type: ACTIVITY_BULK_CREATE_REQUEST
    });

    let response = await ACTIVITY_APIS.bulkCreate(data);
    response = response.data

    if(response && response.error) {
      throw response;
    }

    dispatch({
      type: ACTIVITY_BULK_CREATE_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    console.log(error);
    dispatch({
      type: ACTIVITY_BULK_CREATE_FAILED,
      payload: {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
}
