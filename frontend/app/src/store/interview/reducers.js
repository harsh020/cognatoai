// reducers.js
import {
  INTERVIEW_CREATE_REQUEST,
  INTERVIEW_CREATE_SUCCESS,
  INTERVIEW_CREATE_FAIL,
  INTERVIEW_CREATE_RESET,

  INTERVIEW_RETRIEVE_REQUEST,
  INTERVIEW_RETRIEVE_SUCCESS,
  INTERVIEW_RETRIEVE_FAIL,
  INTERVIEW_RETRIEVE_RESET,

  INTERVIEW_UPDATE_REQUEST,
  INTERVIEW_UPDATE_SUCCESS,
  INTERVIEW_UPDATE_FAIL,
  INTERVIEW_UPDATE_RESET,

  INTERVIEW_LIST_REQUEST,
  INTERVIEW_LIST_SUCCESS,
  INTERVIEW_LIST_FAIL,
  INTERVIEW_LIST_RESET,

  INTERVIEW_RESULT_DOWNLOAD_REQUEST,
  INTERVIEW_RESULT_DOWNLOAD_SUCCESS,
  INTERVIEW_RESULT_DOWNLOAD_FAIL,
  INTERVIEW_RESULT_DOWNLOAD_RESET,

  INTERVIEW_SUMMARY_REQUEST,
  INTERVIEW_SUMMARY_SUCCESS,
  INTERVIEW_SUMMARY_FAIL,
  INTERVIEW_SUMMARY_RESET,

  INTERVIEW_DAILY_SUMMARY_REQUEST,
  INTERVIEW_DAILY_SUMMARY_SUCCESS,
  INTERVIEW_DAILY_SUMMARY_FAIL,
  INTERVIEW_DAILY_SUMMARY_RESET,

  INTERVIEW_RECENT_UPCOMING_REQUEST,
  INTERVIEW_RECENT_UPCOMING_SUCCESS,
  INTERVIEW_RECENT_UPCOMING_FAIL,
  INTERVIEW_RECENT_UPCOMING_RESET,

  INTERVIEW_SCHEDULED_REQUEST,
  INTERVIEW_SCHEDULED_SUCCESS,
  INTERVIEW_SCHEDULED_FAIL,
  INTERVIEW_SCHEDULED_RESET,
} from './constants';

export const createInterview = (state = {}, action) => {
  switch (action.type) {
    case INTERVIEW_CREATE_REQUEST:
      return { loading: true };

    case INTERVIEW_CREATE_SUCCESS:
      return {
        loading: false,
        interview: action.payload
      };

    case INTERVIEW_CREATE_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case INTERVIEW_CREATE_RESET:
      return {};

    default:
      return state;
  }
};

export const retrieveInterview = (state = {}, action) => {
  switch (action.type) {
    case INTERVIEW_RETRIEVE_REQUEST:
      return { loading: true };

    case INTERVIEW_RETRIEVE_SUCCESS:
      return {
        loading: false,
        interview: action.payload
      };

    case INTERVIEW_RETRIEVE_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case INTERVIEW_RETRIEVE_RESET:
      return {};

    default:
      return state;
  }
};

export const updateInterview = (state = {}, action) => {
  switch (action.type) {
    case INTERVIEW_UPDATE_REQUEST:
      return { loading: true };

    case INTERVIEW_UPDATE_SUCCESS:
      return {
        loading: false,
        interview: action.payload
      };

    case INTERVIEW_UPDATE_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case INTERVIEW_UPDATE_RESET:
      return {};

    default:
      return state;
  }
};

export const listInterviews = (state = {}, action) => {
  switch (action.type) {
    case INTERVIEW_LIST_REQUEST:
      return { loading: true };

    case INTERVIEW_LIST_SUCCESS:
      return {
        loading: false,
        interviews: action.payload
      };

    case INTERVIEW_LIST_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case INTERVIEW_LIST_RESET:
      return {};

    default:
      return state;
  }
};


export const downloadInterviewResult = (state = {}, action) => {
  switch (action.type) {
    case INTERVIEW_RESULT_DOWNLOAD_REQUEST:
      return { loading: true };

    case INTERVIEW_RESULT_DOWNLOAD_SUCCESS:
      return {
        loading: false,
        success: true
      };

    case INTERVIEW_RESULT_DOWNLOAD_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case INTERVIEW_RESULT_DOWNLOAD_RESET:
      return {};

    default:
      return state;
  }
};


export const retrieveSummary = (state = {}, action) => {
  switch (action.type) {
    case INTERVIEW_SUMMARY_REQUEST:
      return { loading: true };

    case INTERVIEW_SUMMARY_SUCCESS:
      return {
        loading: false,
        summary: action.payload
      };

    case INTERVIEW_SUMMARY_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case INTERVIEW_SUMMARY_RESET:
      return {};

    default:
      return state;
  }
};

export const retrieveDailySummary = (state = {}, action) => {
  switch (action.type) {
    case INTERVIEW_DAILY_SUMMARY_REQUEST:
      return { loading: true };

    case INTERVIEW_DAILY_SUMMARY_SUCCESS:
      return {
        loading: false,
        dailySummary: action.payload
      };

    case INTERVIEW_DAILY_SUMMARY_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case INTERVIEW_DAILY_SUMMARY_RESET:
      return {};

    default:
      return state;
  }
};

export const retrieveRecentUpcoming = (state = {}, action) => {
  switch (action.type) {
    case INTERVIEW_RECENT_UPCOMING_REQUEST:
      return { loading: true };

    case INTERVIEW_RECENT_UPCOMING_SUCCESS:
      return {
        loading: false,
        recentUpcoming: action.payload
      };

    case INTERVIEW_RECENT_UPCOMING_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case INTERVIEW_RECENT_UPCOMING_RESET:
      return {};

    default:
      return state;
  }
};

export const retrieveScheduled = (state = {}, action) => {
  switch (action.type) {
    case INTERVIEW_SCHEDULED_REQUEST:
      return { loading: true };

    case INTERVIEW_SCHEDULED_SUCCESS:
      return {
        loading: false,
        scheduled: action.payload
      };

    case INTERVIEW_SCHEDULED_FAIL:
      return {
        loading: false,
        error: action.payload
      };

    case INTERVIEW_SCHEDULED_RESET:
      return {};

    default:
      return state;
  }
};