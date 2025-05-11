// actions.js
import {
  ORGANIZATION_CREATE_REQUEST,
  ORGANIZATION_CREATE_SUCCESS,
  ORGANIZATION_CREATE_FAIL,
  ORGANIZATION_CREATE_RESET,

  ORGANIZATION_UPDATE_REQUEST,
  ORGANIZATION_UPDATE_SUCCESS,
  ORGANIZATION_UPDATE_FAIL,
  ORGANIZATION_UPDATE_RESET,

  ORGANIZATION_RETRIEVE_REQUEST,
  ORGANIZATION_RETRIEVE_SUCCESS,
  ORGANIZATION_RETRIEVE_FAIL,
  ORGANIZATION_RETRIEVE_RESET,

  ORGANIZATION_LIST_REQUEST,
  ORGANIZATION_LIST_SUCCESS,
  ORGANIZATION_LIST_FAIL,
  ORGANIZATION_LIST_RESET,
} from './constants';
import { ORGANIZATION_APIS } from '@/apis/organizationApis';
import {getOrganization, getToken} from "@/lib/utils";

export const createOrganization = (data) => async (dispatch, getState) => {
  try {
    dispatch({
      type: ORGANIZATION_CREATE_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      }
    };

    let response = await ORGANIZATION_APIS.create(data, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: ORGANIZATION_CREATE_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    dispatch({
      type: ORGANIZATION_CREATE_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};

export const updateOrganization = (id, data) => async (dispatch, getState) => {
  try {
    dispatch({
      type: ORGANIZATION_UPDATE_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      }
    };

    let response = await ORGANIZATION_APIS.update(id, data, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: ORGANIZATION_UPDATE_SUCCESS,
      payload: response
    });

    dispatch({
      type: ORGANIZATION_RETRIEVE_SUCCESS,
      payload: response
    })
  }
  catch (error) {
    dispatch({
      type: ORGANIZATION_UPDATE_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};

export const retrieveOrganization = (id) => async (dispatch, getState) => {
  try {
    dispatch({
      type: ORGANIZATION_RETRIEVE_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      }
    };

    let response = await ORGANIZATION_APIS.retrieve(id, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: ORGANIZATION_RETRIEVE_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    dispatch({
      type: ORGANIZATION_RETRIEVE_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};

export const listOrganizations = (params) => async (dispatch, getState) => {
  try {
    dispatch({
      type: ORGANIZATION_LIST_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      },
      params: params
    };

    let response = await ORGANIZATION_APIS.list(params, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: ORGANIZATION_LIST_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    dispatch({
      type: ORGANIZATION_LIST_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};
