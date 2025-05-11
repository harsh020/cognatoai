import {
  SOCIAL_AUTH_REDIRECT_REQUEST,
  SOCIAL_AUTH_REDIRECT_SUCCESS,
  SOCIAL_AUTH_REDIRECT_FAIL,
  SOCIAL_AUTH_REDIRECT_RESET,

  SOCIAL_AUTH_CALLBACK_REQUEST,
  SOCIAL_AUTH_CALLBACK_SUCCESS,
  SOCIAL_AUTH_CALLBACK_FAIL,
} from "./constants";
import {SOCIAL_APIS} from "@/apis/social-apis";
import Cookies from "js-cookie"



export const redirect = (data) => async (dispatch) => {
  try {
    dispatch({
      type: SOCIAL_AUTH_REDIRECT_REQUEST,
    })

    let response = await SOCIAL_APIS.redirect(data)
    response = response.data

    if(response && response.error) {
      throw response
    }

    dispatch({
      type: SOCIAL_AUTH_REDIRECT_SUCCESS,
      payload: response
    })
  }
  catch (error) {
    console.error(error.response.data);
    dispatch({
      type: SOCIAL_AUTH_REDIRECT_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    })
  }
}

export const callback = (data) => async (dispatch) => {
  try {
    dispatch({
      type: SOCIAL_AUTH_CALLBACK_REQUEST,
    });

    let response = await SOCIAL_APIS.callback(data);
    response = response.data

    if(response && response.error) {
      throw response;
    }

    Cookies.set('access_token', response.access_token, { domain: process.env.NEXT_PUBLIC_DOMAIN });
    dispatch({
      type: SOCIAL_AUTH_CALLBACK_SUCCESS,
      payload: response,
    });
  }
  catch (error) {
    console.log(error);
    dispatch({
      type: SOCIAL_AUTH_CALLBACK_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    })
  }
}
