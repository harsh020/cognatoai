import {
  REVIEW_CREATE_REQUEST,
  REVIEW_CREATE_SUCCESS,
  REVIEW_CREATE_FAIL,
  REVIEW_CREATE_RESET,

  REVIEW_RETRIEVE_REQUEST,
  REVIEW_RETRIEVE_SUCCESS,
  REVIEW_RETRIEVE_FAIL,
  REVIEW_RETRIEVE_RESET,

  REVIEW_LIST_REQUEST,
  REVIEW_LIST_SUCCESS,
  REVIEW_LIST_FAIL,
  REVIEW_LIST_RESET,
} from './constants';
import { REVIEW_APIS } from '@/apis/reviewApis';
import {ORGANIZATION_RETRIEVE_SUCCESS} from "@/store/organization/constants";
import {getOrganization, getToken} from "@/lib/utils";

export const createReview = (data) => async (dispatch, getState) => {
  try {
    dispatch({
      type: REVIEW_CREATE_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Content-Type": "multipart/form-data",
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      }
    };

    let response = await REVIEW_APIS.create(data, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: REVIEW_CREATE_SUCCESS,
      payload: response
    });

    dispatch(listReviews({}))

    const retrieveOrganization = getState();
    if(retrieveOrganization) {
      let { organization } = retrieveOrganization;
      if(organization) {
        organization = {
          ...organization,
          credits: organization.credits - CONFIG.REVIEW_COST
        }

        dispatch({
          type: ORGANIZATION_RETRIEVE_SUCCESS,
          payload: organization,
        })
      }
    }
  }
  catch (error) {
    dispatch({
      type: REVIEW_CREATE_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};

export const retrieveReview = (id) => async (dispatch, getState) => {
  try {
    dispatch({
      type: REVIEW_RETRIEVE_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      }
    };

    let response = await REVIEW_APIS.retrieve(id, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: REVIEW_RETRIEVE_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    dispatch({
      type: REVIEW_RETRIEVE_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};

export const listReviews = (params) => async (dispatch, getState) => {
  try {
    dispatch({
      type: REVIEW_LIST_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      },
    };

    let response = await REVIEW_APIS.list(params, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: REVIEW_LIST_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    dispatch({
      type: REVIEW_LIST_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};
