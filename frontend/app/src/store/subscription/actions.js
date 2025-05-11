// actions.js
import {
  SUBSCRIPTION_CREATE_REQUEST,
  SUBSCRIPTION_CREATE_SUCCESS,
  SUBSCRIPTION_CREATE_FAIL,
  SUBSCRIPTION_CREATE_RESET,

  SUBSCRIPTION_RETRIEVE_REQUEST,
  SUBSCRIPTION_RETRIEVE_SUCCESS,
  SUBSCRIPTION_RETRIEVE_FAIL,
  SUBSCRIPTION_RETRIEVE_RESET,

  SUBSCRIPTION_ACTIVE_REQUEST,
  SUBSCRIPTION_ACTIVE_SUCCESS,
  SUBSCRIPTION_ACTIVE_FAIL,
  SUBSCRIPTION_ACTIVE_RESET,

  SUBSCRIPTION_LIST_REQUEST,
  SUBSCRIPTION_LIST_SUCCESS,
  SUBSCRIPTION_LIST_FAIL,
  SUBSCRIPTION_LIST_RESET,
} from './constants';
import { SUBSCRIPTION_APIS } from '@/apis/subscriptionApis';
import {getOrganization, getToken} from "@/lib/utils";

export const createSubscription = (data) => async (dispatch, getState) => {
  try {
    dispatch({ type: SUBSCRIPTION_CREATE_REQUEST });

    const token = getToken();

    const configs = {
      headers: {
        "Content-Type": "multipart/form-data",
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      }
    };

    let response = await SUBSCRIPTION_APIS.create(data, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: SUBSCRIPTION_CREATE_SUCCESS,
      payload: response
    });
  } catch (error) {
    dispatch({
      type: SUBSCRIPTION_CREATE_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};

export const retrieveSubscription = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: SUBSCRIPTION_RETRIEVE_REQUEST });

    const token = getToken();

    const configs = {
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      }
    };

    let response = await SUBSCRIPTION_APIS.retrieve(id, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: SUBSCRIPTION_RETRIEVE_SUCCESS,
      payload: response
    });
  } catch (error) {
    dispatch({
      type: SUBSCRIPTION_RETRIEVE_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};

export const retrieveActiveSubscription = () => async (dispatch, getState) => {
  try {
    dispatch({ type: SUBSCRIPTION_ACTIVE_REQUEST });

    const token = getToken();

    const configs = {
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      }
    };

    let response = await SUBSCRIPTION_APIS.active(configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: SUBSCRIPTION_ACTIVE_SUCCESS,
      payload: response
    });
  } catch (error) {
    dispatch({
      type: SUBSCRIPTION_ACTIVE_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};

export const listSubscriptions = (params) => async (dispatch, getState) => {
  try {
    dispatch({ type: SUBSCRIPTION_LIST_REQUEST });

    const token = getToken();

    const configs = {
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      },
      params
    };

    let response = await SUBSCRIPTION_APIS.list(params, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: SUBSCRIPTION_LIST_SUCCESS,
      payload: response
    });
  } catch (error) {
    dispatch({
      type: SUBSCRIPTION_LIST_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};
