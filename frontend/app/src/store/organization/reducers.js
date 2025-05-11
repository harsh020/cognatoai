// reducers.js
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

export const createOrganization = (state = {}, action) => {
  switch (action.type) {
    case ORGANIZATION_CREATE_REQUEST:
      return { loading: true };

    case ORGANIZATION_CREATE_SUCCESS:
      return {
        loading: false,
        organization: action.payload
      };

    case ORGANIZATION_CREATE_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case ORGANIZATION_CREATE_RESET:
      return {};

    default:
      return state;
  }
};

export const updateOrganization = (state = {}, action) => {
  switch (action.type) {
    case ORGANIZATION_UPDATE_REQUEST:
      return { loading: true };

    case ORGANIZATION_UPDATE_SUCCESS:
      return {
        loading: false,
        organization: action.payload
      };

    case ORGANIZATION_UPDATE_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case ORGANIZATION_UPDATE_RESET:
      return {};

    default:
      return state;
  }
};

export const retrieveOrganization = (state = {}, action) => {
  switch (action.type) {
    case ORGANIZATION_RETRIEVE_REQUEST:
      return { loading: true };

    case ORGANIZATION_RETRIEVE_SUCCESS:
      return {
        loading: false,
        organization: action.payload
      };

    case ORGANIZATION_RETRIEVE_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case ORGANIZATION_RETRIEVE_RESET:
      return {};

    default:
      return state;
  }
};

export const listOrganizations = (state = {}, action) => {
  switch (action.type) {
    case ORGANIZATION_LIST_REQUEST:
      return { loading: true };

    case ORGANIZATION_LIST_SUCCESS:
      return {
        loading: false,
        organizations: action.payload
      };

    case ORGANIZATION_LIST_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case ORGANIZATION_LIST_RESET:
      return {};

    default:
      return state;
  }
};
