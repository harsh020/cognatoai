// reducers.js
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

export const createReview = (state = {}, action) => {
  switch (action.type) {
    case REVIEW_CREATE_REQUEST:
      return { loading: true };

    case REVIEW_CREATE_SUCCESS:
      return {
        loading: false,
        review: action.payload
      };

    case REVIEW_CREATE_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case REVIEW_CREATE_RESET:
      return {};

    default:
      return state;
  }
};

export const retrieveReview = (state = {}, action) => {
  switch (action.type) {
    case REVIEW_RETRIEVE_REQUEST:
      return { loading: true };

    case REVIEW_RETRIEVE_SUCCESS:
      return {
        loading: false,
        review: action.payload
      };

    case REVIEW_RETRIEVE_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case REVIEW_RETRIEVE_RESET:
      return {};

    default:
      return state;
  }
};

export const listReviews = (state = {}, action) => {
  switch (action.type) {
    case REVIEW_LIST_REQUEST:
      return { loading: true };

    case REVIEW_LIST_SUCCESS:
      return {
        loading: false,
        reviews: action.payload
      };

    case REVIEW_LIST_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case REVIEW_LIST_RESET:
      return {};

    default:
      return state;
  }
};
