// billingActions.js
import {
  ORDER_CREATE_REQUEST,
  ORDER_CREATE_SUCCESS,
  ORDER_CREATE_FAIL,
  ORDER_CREATE_RESET,

  ORDER_UPDATE_REQUEST,
  ORDER_UPDATE_SUCCESS,
  ORDER_UPDATE_FAIL,
  ORDER_UPDATE_RESET,

  ORDER_RETRIEVE_REQUEST,
  ORDER_RETRIEVE_SUCCESS,
  ORDER_RETRIEVE_FAIL,
  ORDER_RETRIEVE_RESET,

  ORDER_LIST_REQUEST,
  ORDER_LIST_SUCCESS,
  ORDER_LIST_FAIL,
  ORDER_LIST_RESET,
} from './constants';
import { ORDER_APIS } from '@/apis/orderApis';
import {getOrganization, getToken} from "@/lib/utils";


export const createOrder = (data) => async (dispatch, getState) => {
  try {
    dispatch({
      type: ORDER_CREATE_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      }
    };

    let response = await ORDER_APIS.create(data, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: ORDER_CREATE_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    dispatch({
      type: ORDER_CREATE_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};

export const updateOrder = (id, data) => async (dispatch, getState) => {
  try {
    dispatch({
      type: ORDER_UPDATE_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      }
    };

    let response = await ORDER_APIS.update(id, data, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: ORDER_UPDATE_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    dispatch({
      type: ORDER_UPDATE_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};

export const retrieveOrder = (id) => async (dispatch, getState) => {
  try {
    dispatch({
      type: ORDER_RETRIEVE_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      }
    };

    let response = await ORDER_APIS.retrieve(id, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: ORDER_RETRIEVE_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    dispatch({
      type: ORDER_RETRIEVE_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};

export const listOrders = (params) => async (dispatch, getState) => {
  try {
    dispatch({
      type: ORDER_LIST_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      },
      params: params
    };

    let response = await ORDER_APIS.list(params, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: ORDER_LIST_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    dispatch({
      type: ORDER_LIST_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};
