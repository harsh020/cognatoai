// actions.js
import {
  USER_CREATE_REQUEST,
  USER_CREATE_SUCCESS,
  USER_CREATE_FAIL,
  USER_CREATE_RESET,

  USER_UPDATE_REQUEST,
  USER_UPDATE_SUCCESS,
  USER_UPDATE_FAIL,
  USER_UPDATE_RESET,

  USER_RETRIEVE_REQUEST,
  USER_RETRIEVE_SUCCESS,
  USER_RETRIEVE_FAIL,
  USER_RETRIEVE_RESET,

  USER_CHANGE_PASSWORD_REQUEST,
  USER_CHANGE_PASSWORD_SUCCESS,
  USER_CHANGE_PASSWORD_FAIL,
  USER_CHANGE_PASSWORD_RESET,
} from './constants';
import { USER_APIS } from '@/apis/userApis';
import {getToken} from "@/lib/utils";

export const createUser = (data) => async (dispatch, getState) => {
  try {
    dispatch({
      type: USER_CREATE_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    };

    let response = await USER_APIS.create(data, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: USER_CREATE_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    dispatch({
      type: USER_CREATE_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};

export const updateUser = (data) => async (dispatch, getState) => {
  try {
    dispatch({
      type: USER_UPDATE_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    };

    let response = await USER_APIS.update(data, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: USER_UPDATE_SUCCESS,
      payload: response
    });

    dispatch({
      type: USER_RETRIEVE_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    dispatch({
      type: USER_UPDATE_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};

export const retrieveUser = () => async (dispatch, getState) => {
  try {
    dispatch({
      type: USER_RETRIEVE_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    };

    let response = await USER_APIS.retrieve(configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: USER_RETRIEVE_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    dispatch({
      type: USER_RETRIEVE_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};


export const changePassword = (data) => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_CHANGE_PASSWORD_REQUEST });

    const token = getToken();

    const configs = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      }
    };

    let response = await USER_APIS.changePassword(data, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: USER_CHANGE_PASSWORD_SUCCESS,
      payload: response
    });
  } catch (error) {
    dispatch({
      type: USER_CHANGE_PASSWORD_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};