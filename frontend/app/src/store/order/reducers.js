// billingReducers.js
import {
  ORDER_CREATE_REQUEST,
  ORDER_CREATE_SUCCESS,
  ORDER_CREATE_FAIL,
  ORDER_CREATE_RESET,

  ORDER_UPDATE_REQUEST,
  ORDER_UPDATE_SUCCESS,
  ORDER_UPDATE_FAIL,
  ORDER_UPDATE_RESET,

  ORDER_RETRIEVE_REQUEST,
  ORDER_RETRIEVE_SUCCESS,
  ORDER_RETRIEVE_FAIL,
  ORDER_RETRIEVE_RESET,

  ORDER_LIST_REQUEST,
  ORDER_LIST_SUCCESS,
  ORDER_LIST_FAIL,
  ORDER_LIST_RESET,
} from './constants';



export const createOrder = (state = {}, action) => {
  switch (action.type) {
    case ORDER_CREATE_REQUEST:
      return { loading: true };

    case ORDER_CREATE_SUCCESS:
      return {
        loading: false,
        order: action.payload
      };

    case ORDER_CREATE_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case ORDER_CREATE_RESET:
      return {};

    default:
      return state;
  }
};

export const updateOrder = (state = {}, action) => {
  switch (action.type) {
    case ORDER_UPDATE_REQUEST:
      return { loading: true };

    case ORDER_UPDATE_SUCCESS:
      return {
        loading: false,
        order: action.payload
      };

    case ORDER_UPDATE_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case ORDER_UPDATE_RESET:
      return {};

    default:
      return state;
  }
};

export const retrieveOrder = (state = {}, action) => {
  switch (action.type) {
    case ORDER_RETRIEVE_REQUEST:
      return { loading: true };

    case ORDER_RETRIEVE_SUCCESS:
      return {
        loading: false,
        order: action.payload
      };

    case ORDER_RETRIEVE_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case ORDER_RETRIEVE_RESET:
      return {};

    default:
      return state;
  }
};

export const listOrders = (state = {}, action) => {
  switch (action.type) {
    case ORDER_LIST_REQUEST:
      return { loading: true };

    case ORDER_LIST_SUCCESS:
      return {
        loading: false,
        orders: action.payload
      };

    case ORDER_LIST_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case ORDER_LIST_RESET:
      return {};

    default:
      return state;
  }
};
