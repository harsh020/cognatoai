// reducers.js
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

export const createCandidate = (state = {}, action) => {
  switch (action.type) {
    case CANDIDATE_CREATE_REQUEST:
      return { loading: true };

    case CANDIDATE_CREATE_SUCCESS:
      return {
        loading: false,
        candidate: action.payload
      };

    case CANDIDATE_CREATE_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case CANDIDATE_CREATE_RESET:
      return {};

    default:
      return state;
  }
};

export const retrieveCandidate = (state = {}, action) => {
  switch (action.type) {
    case CANDIDATE_RETRIEVE_REQUEST:
      return { loading: true };

    case CANDIDATE_RETRIEVE_SUCCESS:
      return {
        loading: false,
        candidate: action.payload
      };

    case CANDIDATE_RETRIEVE_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case CANDIDATE_RETRIEVE_RESET:
      return {};

    default:
      return state;
  }
};

export const updateCandidate = (state = {}, action) => {
  switch (action.type) {
    case CANDIDATE_UPDATE_REQUEST:
      return { loading: true };

    case CANDIDATE_UPDATE_SUCCESS:
      return {
        loading: false,
        candidate: action.payload
      };

    case CANDIDATE_UPDATE_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case CANDIDATE_UPDATE_RESET:
      return {};

    default:
      return state;
  }
};

export const listCandidates = (state = {}, action) => {
  switch (action.type) {
    case CANDIDATE_LIST_REQUEST:
      return { loading: true };

    case CANDIDATE_LIST_SUCCESS:
      return {
        loading: false,
        candidates: action.payload
      };

    case CANDIDATE_LIST_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case CANDIDATE_LIST_RESET:
      return {};

    default:
      return state;
  }
};
