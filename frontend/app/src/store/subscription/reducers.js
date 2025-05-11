// reducers.js
import {
  SUBSCRIPTION_CREATE_REQUEST,
  SUBSCRIPTION_CREATE_SUCCESS,
  SUBSCRIPTION_CREATE_FAIL,
  SUBSCRIPTION_CREATE_RESET,

  SUBSCRIPTION_RETRIEVE_REQUEST,
  SUBSCRIPTION_RETRIEVE_SUCCESS,
  SUBSCRIPTION_RETRIEVE_FAIL,
  SUBSCRIPTION_RETRIEVE_RESET,

  SUBSCRIPTION_ACTIVE_REQUEST,
  SUBSCRIPTION_ACTIVE_SUCCESS,
  SUBSCRIPTION_ACTIVE_FAIL,
  SUBSCRIPTION_ACTIVE_RESET,

  SUBSCRIPTION_LIST_REQUEST,
  SUBSCRIPTION_LIST_SUCCESS,
  SUBSCRIPTION_LIST_FAIL,
  SUBSCRIPTION_LIST_RESET,
} from './constants';

export const createSubscription = (state = {}, action) => {
  switch (action.type) {
    case SUBSCRIPTION_CREATE_REQUEST:
      return { loading: true };

    case SUBSCRIPTION_CREATE_SUCCESS:
      return { loading: false, subscription: action.payload };

    case SUBSCRIPTION_CREATE_FAIL:
      return { loading: false, error: action.payload };

    case SUBSCRIPTION_CREATE_RESET:
      return {};

    default:
      return state;
  }
};

export const retrieveSubscription = (state = {}, action) => {
  switch (action.type) {
    case SUBSCRIPTION_RETRIEVE_REQUEST:
      return { loading: true };

    case SUBSCRIPTION_RETRIEVE_SUCCESS:
      return { loading: false, subscription: action.payload };

    case SUBSCRIPTION_RETRIEVE_FAIL:
      return { loading: false, error: action.payload };

    case SUBSCRIPTION_RETRIEVE_RESET:
      return {};

    default:
      return state;
  }
};

export const retrieveActiveSubscription = (state = {}, action) => {
  switch (action.type) {
    case SUBSCRIPTION_ACTIVE_REQUEST:
      return { loading: true };

    case SUBSCRIPTION_ACTIVE_SUCCESS:
      return { loading: false, subscription: action.payload };

    case SUBSCRIPTION_ACTIVE_FAIL:
      return { loading: false, error: action.payload };

    case SUBSCRIPTION_ACTIVE_RESET:
      return {};

    default:
      return state;
  }
};

export const listSubscriptions = (state = {}, action) => {
  switch (action.type) {
    case SUBSCRIPTION_LIST_REQUEST:
      return { loading: true };

    case SUBSCRIPTION_LIST_SUCCESS:
      return { loading: false, subscriptions: action.payload };

    case SUBSCRIPTION_LIST_FAIL:
      return { loading: false, error: action.payload };

    case SUBSCRIPTION_LIST_RESET:
      return {};

    default:
      return state;
  }
};
