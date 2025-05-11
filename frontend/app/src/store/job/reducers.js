// reducers.js
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

export const createJob = (state = {}, action) => {
  switch (action.type) {
    case JOB_CREATE_REQUEST:
      return { loading: true };

    case JOB_CREATE_SUCCESS:
      return {
        loading: false,
        job: action.payload
      };

    case JOB_CREATE_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case JOB_CREATE_RESET:
      return {};

    default:
      return state;
  }
};

export const retrieveJob = (state = {}, action) => {
  switch (action.type) {
    case JOB_RETRIEVE_REQUEST:
      return { loading: true };

    case JOB_RETRIEVE_SUCCESS:
      return {
        loading: false,
        job: action.payload
      };

    case JOB_RETRIEVE_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case JOB_RETRIEVE_RESET:
      return {};

    default:
      return state;
  }
};

export const updateJob = (state = {}, action) => {
  switch (action.type) {
    case JOB_UPDATE_REQUEST:
      return { loading: true };

    case JOB_UPDATE_SUCCESS:
      return {
        loading: false,
        job: action.payload
      };

    case JOB_UPDATE_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case JOB_UPDATE_RESET:
      return {};

    default:
      return state;
  }
};

export const listJobs = (state = {}, action) => {
  switch (action.type) {
    case JOB_LIST_REQUEST:
      return { loading: true };

    case JOB_LIST_SUCCESS:
      return {
        loading: false,
        jobs: action.payload
      };

    case JOB_LIST_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case JOB_LIST_RESET:
      return {};

    default:
      return state;
  }
};

export const fetchMoreJobs = (state = { }, action) => {
  switch (action.type) {
    case JOB_FETCH_MORE_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case JOB_FETCH_MORE_SUCCESS:
      return {
        ...state,
        loading: false,
        jobs: {
          results: [...(state?.jobs?.results || []), ...action.payload.results],
          page: (state?.page || 0) + 1,
          pages: action.payload.pages,
          hasMore: !!action.payload.next,
        },
      };

    case JOB_FETCH_MORE_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case JOB_FETCH_MORE_RESET:
      return {};

    default:
      return state;
  }
};

