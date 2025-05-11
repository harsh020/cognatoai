// actions.js
import {
  MEMBER_CREATE_REQUEST,
  MEMBER_CREATE_SUCCESS,
  MEMBER_CREATE_FAIL,
  MEMBER_CREATE_RESET,

  MEMBER_UPDATE_REQUEST,
  MEMBER_UPDATE_SUCCESS,
  MEMBER_UPDATE_FAIL,
  MEMBER_UPDATE_RESET,

  MEMBER_RETRIEVE_REQUEST,
  MEMBER_RETRIEVE_SUCCESS,
  MEMBER_RETRIEVE_FAIL,
  MEMBER_RETRIEVE_RESET,

  MEMBER_LIST_REQUEST,
  MEMBER_LIST_SUCCESS,
  MEMBER_LIST_FAIL,
  MEMBER_LIST_RESET,
} from './constants';
import { MEMBER_APIS } from '@/apis/memberApis';
import { UTILS } from '@/commons/utils';
import {getOrganization, getToken} from "@/lib/utils";

export const createMember = (orgId, data) => async (dispatch, getState) => {
  try {
    dispatch({
      type: MEMBER_CREATE_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Content-Type": "multipart/form-data",
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      }
    };

    let response = await MEMBER_APIS.create(orgId, data, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: MEMBER_CREATE_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    dispatch({
      type: MEMBER_CREATE_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};

export const updateMember = (id, orgId, data) => async (dispatch, getState) => {
  try {
    dispatch({
      type: MEMBER_UPDATE_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Content-Type": "multipart/form-data",
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      }
    };

    let response = await MEMBER_APIS.update(id, orgId, data, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: MEMBER_UPDATE_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    dispatch({
      type: MEMBER_UPDATE_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};

export const retrieveMember = (id, orgId) => async (dispatch, getState) => {
  try {
    dispatch({
      type: MEMBER_RETRIEVE_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Content-Type": "multipart/form-data",
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      }
    };

    let response = await MEMBER_APIS.retrieve(id, orgId, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: MEMBER_RETRIEVE_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    dispatch({
      type: MEMBER_RETRIEVE_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};

export const listMembers = (id, orgId, params) => async (dispatch, getState) => {
  try {
    dispatch({
      type: MEMBER_LIST_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      },
    };

    let response = await MEMBER_APIS.list(id, orgId, params, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: MEMBER_LIST_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    dispatch({
      type: MEMBER_LIST_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};
