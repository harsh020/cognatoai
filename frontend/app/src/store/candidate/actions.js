// actions.js
import {
  CANDIDATE_CREATE_REQUEST,
  CANDIDATE_CREATE_SUCCESS,
  CANDIDATE_CREATE_FAIL,
  CANDIDATE_CREATE_RESET,

  CANDIDATE_RETRIEVE_REQUEST,
  CANDIDATE_RETRIEVE_SUCCESS,
  CANDIDATE_RETRIEVE_FAIL,
  CANDIDATE_RETRIEVE_RESET,

  CANDIDATE_UPDATE_REQUEST,
  CANDIDATE_UPDATE_SUCCESS,
  CANDIDATE_UPDATE_FAIL,
  CANDIDATE_UPDATE_RESET,

  CANDIDATE_LIST_REQUEST,
  CANDIDATE_LIST_SUCCESS,
  CANDIDATE_LIST_FAIL,
  CANDIDATE_LIST_RESET,
} from './constants';
import { CANDIDATE_APIS } from '@/apis/candidateApis';
import {getOrganization, getToken} from "@/lib/utils";

export const createCandidate = (data) => async (dispatch, getState) => {
  try {
    dispatch({
      type: CANDIDATE_CREATE_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Content-Type": "application/form-data",
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      }
    };

    let response = await CANDIDATE_APIS.create(data, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: CANDIDATE_CREATE_SUCCESS,
      payload: response
    });

    try {
      const {
        listCandidates: { candidates },
      } = getState();

      const updatedList = [
        response,
        ...candidates.results,
      ];
      dispatch({
        type: CANDIDATE_LIST_SUCCESS,
        payload: {
          ...candidates,
          results: updatedList
        }
      })
    } catch (e) {}
  }
  catch (error) {
    dispatch({
      type: CANDIDATE_CREATE_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};

export const updateCandidate = (id, data) => async (dispatch, getState) => {
  try {
    dispatch({
      type: CANDIDATE_UPDATE_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Content-Type": "application/form-data",
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      }
    };

    let response = await CANDIDATE_APIS.update(id, data, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: CANDIDATE_UPDATE_SUCCESS,
      payload: response
    });

    try {
      const {
        listCandidates: { candidates },
      } = getState();

      const updatedList = candidates.results.map(candidate =>
          candidate.id === response.id ? response : candidate
      );
      dispatch({
        type: CANDIDATE_LIST_SUCCESS,
        payload: {
          ...candidates,
          results: updatedList
        }
      })
    } catch (e) {}
  }
  catch (error) {
    dispatch({
      type: CANDIDATE_UPDATE_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};

export const retrieveCandidate = (id) => async (dispatch, getState) => {
  try {
    dispatch({
      type: CANDIDATE_RETRIEVE_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      }
    };

    let response = await CANDIDATE_APIS.retrieve(id, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: CANDIDATE_RETRIEVE_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    dispatch({
      type: CANDIDATE_RETRIEVE_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};

export const listCandidates = (params) => async (dispatch, getState) => {
  try {
    dispatch({
      type: CANDIDATE_LIST_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      }
    };

    let response = await CANDIDATE_APIS.list(params, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: CANDIDATE_LIST_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    dispatch({
      type: CANDIDATE_LIST_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};
