import {
  USER_REGISTER_REQUEST,
  USER_REGISTER_SUCCESS,
  USER_REGISTER_FAIL,
  USER_REGISTER_RESET,

  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAIL,

  USER_RETRIEVE_REQUEST,
  USER_RETRIEVE_SUCCESS,
  USER_RETRIEVE_FAIL,
  USER_RETRIEVE_RESET,

  OTP_SEND_REQUEST,
  OTP_SEND_SUCCESS,
  OTP_SEND_FAIL,
  OTP_SEND_RESET,

  USER_EMAIL_VERIFICATION_REQUEST,
  USER_EMAIL_VERIFICATION_SUCCESS,
  USER_EMAIL_VERIFICATION_FAIL,
  USER_EMAIL_VERIFICATION_RESET, USER_LOGIN_RESET, USER_LOGOUT_SUCCESS, USER_LOGOUT_REQUEST,
} from "./constants";
import {USER_APIS} from "@/apis/user-apis";
import Cookies from "js-cookie"



export const register = (data) => async (dispatch) => {
  try {
    dispatch({
      type: USER_REGISTER_REQUEST,
    })

    let response = await USER_APIS.register(data)
    response = response.data

    if(response && response.error) {
      throw response
    }

    dispatch({
      type: USER_REGISTER_SUCCESS,
      payload: response
    })
  }
  catch (error) {
    console.error(error.response.data);
    dispatch({
      type: USER_REGISTER_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    })
  }
}

export const authenticate = (data) => async (dispatch) => {
  try {
    dispatch({
      type: USER_LOGIN_REQUEST,
    });

    let response = await USER_APIS.authenticate(data);
    response = response.data

    if(response && response.error) {
      throw response;
    }

    Cookies.set('access_token', response.access_token, { domain: process.env.NEXT_PUBLIC_DOMAIN });
    dispatch({
      type: USER_LOGIN_SUCCESS,
      payload: response,
    });
  }
  catch (error) {
    console.log(error);
    dispatch({
      type: USER_LOGIN_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    })
  }
}


export const retrieve = (id) => async (dispatch) => {
  try {
    dispatch({
      type: USER_RETRIEVE_REQUEST
    });

    let response = await USER_APIS.retrieve();
    response = response.data

    if(response && response.error) {
      throw response;
    }

    dispatch({
      type: USER_RETRIEVE_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    console.error(error.response.data);
    dispatch({
      type: USER_REGISTER_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    })
  }
}

export const sendOtp = (data) => async (dispatch) => {
  try {
    dispatch({
      type: USER_EMAIL_VERIFICATION_REQUEST
    })

    let response = await USER_APIS.sendOtp(data)
    response = response.data

    if(response && response.error) {
      await logout();
      throw response
    }

    Cookies.set('access_token', response.access_token, { domain: process.env.NEXT_PUBLIC_DOMAIN });

    dispatch({
      type: USER_EMAIL_VERIFICATION_SUCCESS,
      payload: response
    })
  }
  catch (error) {
    console.error(error.response.data);
    dispatch({
      type: USER_REGISTER_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    })
  }
}

export const verifyEmail = (data) => async (dispatch) => {
  try {
    dispatch({
      type: USER_EMAIL_VERIFICATION_REQUEST
    })

    let response = await USER_APIS.verifyOtp(data)
    response = response.data

    if(response && response.error) {
      await logout();
      throw response
    }

    Cookies.set('access_token', response.access_token, { domain: process.env.NEXT_PUBLIC_DOMAIN });

    dispatch({
      type: USER_EMAIL_VERIFICATION_SUCCESS,
      payload: response
    })
  }
  catch (error) {
    console.error(error.response.data);
    dispatch({
      type: USER_REGISTER_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    })
  }
}

export const logout = () => async (dispatch, getState) => {
  dispatch({
    type: USER_LOGOUT_REQUEST
  });

  Cookies.remove('access_token');

  dispatch({
    type: USER_RETRIEVE_RESET
  });

  dispatch({
    type: USER_REGISTER_RESET
  });

  dispatch({
    type: USER_LOGIN_RESET
  });

  dispatch({
    type: USER_LOGOUT_SUCCESS,
    payload: true
  })
}
