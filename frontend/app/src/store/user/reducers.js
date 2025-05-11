// reducers.js
import {
  USER_CREATE_REQUEST,
  USER_CREATE_SUCCESS,
  USER_CREATE_FAIL,
  USER_CREATE_RESET,

  USER_UPDATE_REQUEST,
  USER_UPDATE_SUCCESS,
  USER_UPDATE_FAIL,
  USER_UPDATE_RESET,

  USER_RETRIEVE_REQUEST,
  USER_RETRIEVE_SUCCESS,
  USER_RETRIEVE_FAIL,
  USER_RETRIEVE_RESET,

  USER_CHANGE_PASSWORD_REQUEST,
  USER_CHANGE_PASSWORD_SUCCESS,
  USER_CHANGE_PASSWORD_FAIL,
  USER_CHANGE_PASSWORD_RESET,
} from './constants';

export const createUser = (state = {}, action) => {
  switch (action.type) {
    case USER_CREATE_REQUEST:
      return { loading: true };

    case USER_CREATE_SUCCESS:
      return {
        loading: false,
        user: action.payload
      };

    case USER_CREATE_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case USER_CREATE_RESET:
      return {};

    default:
      return state;
  }
};

export const updateUser = (state = {}, action) => {
  switch (action.type) {
    case USER_UPDATE_REQUEST:
      return { loading: true };

    case USER_UPDATE_SUCCESS:
      return {
        loading: false,
        user: action.payload
      };

    case USER_UPDATE_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case USER_UPDATE_RESET:
      return {};

    default:
      return state;
  }
};

export const retrieveUser = (state = {}, action) => {
  switch (action.type) {
    case USER_RETRIEVE_REQUEST:
      return { loading: true };

    case USER_RETRIEVE_SUCCESS:
      return {
        loading: false,
        user: action.payload
      };

    case USER_RETRIEVE_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case USER_RETRIEVE_RESET:
      return {};

    default:
      return state;
  }
};

export const changePassword = (state = {}, action) => {
  switch (action.type) {
    case USER_CHANGE_PASSWORD_REQUEST:
      return {loading: true};

    case USER_CHANGE_PASSWORD_SUCCESS:
      return {loading: false, success: true};

    case USER_CHANGE_PASSWORD_FAIL:
      return {loading: false, error: action.payload};

    case USER_CHANGE_PASSWORD_RESET:
      return {};

    default:
      return state;
  }
}