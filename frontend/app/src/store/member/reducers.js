// reducers.js
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

export const createMember = (state = {}, action) => {
  switch (action.type) {
    case MEMBER_CREATE_REQUEST:
      return { loading: true };

    case MEMBER_CREATE_SUCCESS:
      return {
        loading: false,
        member: action.payload
      };

    case MEMBER_CREATE_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case MEMBER_CREATE_RESET:
      return {};

    default:
      return state;
  }
};

export const updateMember = (state = {}, action) => {
  switch (action.type) {
    case MEMBER_UPDATE_REQUEST:
      return { loading: true };

    case MEMBER_UPDATE_SUCCESS:
      return {
        loading: false,
        member: action.payload
      };

    case MEMBER_UPDATE_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case MEMBER_UPDATE_RESET:
      return {};

    default:
      return state;
  }
};

export const retrieveMember = (state = {}, action) => {
  switch (action.type) {
    case MEMBER_RETRIEVE_REQUEST:
      return { loading: true };

    case MEMBER_RETRIEVE_SUCCESS:
      return {
        loading: false,
        member: action.payload
      };

    case MEMBER_RETRIEVE_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case MEMBER_RETRIEVE_RESET:
      return {};

    default:
      return state;
  }
};

export const listMembers = (state = {}, action) => {
  switch (action.type) {
    case MEMBER_LIST_REQUEST:
      return { loading: true };

    case MEMBER_LIST_SUCCESS:
      return {
        loading: false,
        members: action.payload
      };

    case MEMBER_LIST_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case MEMBER_LIST_RESET:
      return {};

    default:
      return state;
  }
};
