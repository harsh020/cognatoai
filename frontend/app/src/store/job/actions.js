// actions.js
import {
  JOB_CREATE_REQUEST,
  JOB_CREATE_SUCCESS,
  JOB_CREATE_FAIL,
  JOB_CREATE_RESET,

  JOB_RETRIEVE_REQUEST,
  JOB_RETRIEVE_SUCCESS,
  JOB_RETRIEVE_FAIL,
  JOB_RETRIEVE_RESET,

  JOB_UPDATE_REQUEST,
  JOB_UPDATE_SUCCESS,
  JOB_UPDATE_FAIL,
  JOB_UPDATE_RESET,

  JOB_LIST_REQUEST,
  JOB_LIST_SUCCESS,
  JOB_LIST_FAIL,
  JOB_LIST_RESET,

  JOB_FETCH_MORE_REQUEST,
  JOB_FETCH_MORE_SUCCESS,
  JOB_FETCH_MORE_FAIL,
  JOB_FETCH_MORE_RESET,
} from './constants';
import { JOB_APIS } from '@/apis/jobApis';
import {getOrganization, getToken} from "@/lib/utils";

export const createJob = (data) => async (dispatch, getState) => {
  try {
    dispatch({
      type: JOB_CREATE_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      }
    };

    let response = await JOB_APIS.create(data, configs);
    response = response.data;

    print('create job response', response)

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: JOB_CREATE_SUCCESS,
      payload: response
    });

    try {
      const {
        listJobs: {jobs},
      } = getState();

      const updatedList = [
        response,
        ...jobs.results,
      ];
      dispatch({
        type: JOB_LIST_SUCCESS,
        payload: {
          ...jobs,
          results: updatedList
        }
      })
    } catch (e) {

    }
  }
  catch (error) {
    console.log(error)
    dispatch({
      type: JOB_CREATE_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};

export const updateJob = (id, data) => async (dispatch, getState) => {
  try {
    dispatch({
      type: JOB_UPDATE_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      }
    };

    let response = await JOB_APIS.update(id, data, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: JOB_UPDATE_SUCCESS,
      payload: response
    });

    try {
      const {
        listJobs: { jobs },
      } = getState();

      const updatedList = jobs.results.map(job =>
          job.id === response.id ? response : job
      );
      dispatch({
        type: JOB_LIST_SUCCESS,
        payload: {
          ...jobs,
          results: updatedList
        }
      })
    } catch (e) {

    }
  }
  catch (error) {
    dispatch({
      type: JOB_UPDATE_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};

export const retrieveJob = (id) => async (dispatch, getState) => {
  try {
    dispatch({
      type: JOB_RETRIEVE_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      }
    };

    let response = await JOB_APIS.retrieve(id, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: JOB_RETRIEVE_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    dispatch({
      type: JOB_RETRIEVE_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};

export const listJobs = (params) => async (dispatch, getState) => {
  try {
    dispatch({
      type: JOB_LIST_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      }
    };

    let response = await JOB_APIS.list(params, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: JOB_LIST_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    dispatch({
      type: JOB_LIST_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};

export const fetchMoreJobs = (params) => async (dispatch, getState) => {
  try {
    dispatch({
      type: JOB_FETCH_MORE_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      }
    };

    const {
      fetchMoreJobs
    } = getState();

    if(fetchMoreJobs.jobs && !fetchMoreJobs.jobs.hasMore) {
      return dispatch({
        type: JOB_FETCH_MORE_SUCCESS,
        payload: {
          ...fetchMoreJobs,
          results: []
        }
      })
    }

    let response = await JOB_APIS.list({
      page: (fetchMoreJobs?.jobs?.page || 0) + 1,
      ...params,
    }, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: JOB_FETCH_MORE_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    dispatch({
      type: JOB_FETCH_MORE_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};
