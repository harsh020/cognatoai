// actions.js
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
import { INTERVIEW_APIS } from '@/apis/interviewApis';
import {ORGANIZATION_RETRIEVE_SUCCESS} from "@/store/organization/constants";
import {getOrganization, getToken} from "@/lib/utils";

export const createInterview = (data, {bulk = false}) => async (dispatch, getState) => {
  try {
    dispatch({
      type: INTERVIEW_CREATE_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Content-Type": bulk ? "application/json" : "multipart/form-data",
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      }
    };

    let response = await (bulk ? INTERVIEW_APIS.bulkCreate(data, configs) : INTERVIEW_APIS.create(data, configs));
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    try {
      dispatch({
        type: INTERVIEW_CREATE_SUCCESS,
        payload: response
      });

      const {
        listInterviews
      } = getState();

      // console.log(response)

      dispatch({
        type: INTERVIEW_LIST_SUCCESS,
        payload: {
          ...(listInterviews?.interviews || {}),
          results: [
            ...(bulk ? response.data : [response]),
            ...(listInterviews?.interviews.results || [])
          ]
        }
      })
    } catch (e) {}

    try {
      const { retrieveOrganization } = getState();
      if(retrieveOrganization) {
        let { organization } = retrieveOrganization;
        if(organization) {
          organization = {
            ...organization,
            credits: organization.credits - 1
          }

          dispatch({
            type: ORGANIZATION_RETRIEVE_SUCCESS,
            payload: organization,
          })
        }
      }
    } catch (e) {}
  }
  catch (error) {
    dispatch({
      type: INTERVIEW_CREATE_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};

export const retrieveInterview = (id) => async (dispatch, getState) => {
  try {
    dispatch({
      type: INTERVIEW_RETRIEVE_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      }
    };

    let response = await INTERVIEW_APIS.retrieve(id, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: INTERVIEW_RETRIEVE_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    dispatch({
      type: INTERVIEW_RETRIEVE_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};

export const updateInterview = (id, data) => async (dispatch, getState) => {
  try {
    dispatch({
      type: INTERVIEW_UPDATE_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      }
    };

    let response = await INTERVIEW_APIS.update(id, data, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: INTERVIEW_UPDATE_SUCCESS,
      payload: response
    });

    const {
      listInterviews,
      retrieveInterview
    } = getState();

    if(listInterviews && listInterviews.interviews) {
      let interviews = listInterviews.interviews?.results;
      interviews = interviews.map(i => {
        if(i.id === response.id) return response;
        return i;
      })

      dispatch({
        type: INTERVIEW_LIST_SUCCESS,
        payload: {
          ...listInterviews.interviews,
          results: interviews,
        }
      });
    }
    if(retrieveInterview && retrieveInterview.interview) {
      if(retrieveInterview.interview.id === response.id) {
        dispatch({
          type: INTERVIEW_RETRIEVE_SUCCESS,
          payload: response,
        })
      }
    }
  }
  catch (error) {
    dispatch({
      type: INTERVIEW_UPDATE_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};

export const listInterviews = (params) => async (dispatch, getState) => {
  try {
    dispatch({
      type: INTERVIEW_LIST_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      },
    };

    let response = await INTERVIEW_APIS.list(params, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: INTERVIEW_LIST_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    dispatch({
      type: INTERVIEW_LIST_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};


export const downloadInterviewResult = (id) => async (dispatch, getState) => {
  try {
    dispatch({
      type: INTERVIEW_RESULT_DOWNLOAD_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      },
      responseType: 'blob'
    };

    let response = await INTERVIEW_APIS.downloadResult(id, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    // Create a Blob from the response
    const url = window.URL.createObjectURL(new Blob([response]));

    // Create a temporary anchor element for the download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${id}.pdf`); // Replace with the desired file name
    document.body.appendChild(link);
    link.click();

    // Cleanup
    link.remove();
    window.URL.revokeObjectURL(url);


    dispatch({
      type: INTERVIEW_RESULT_DOWNLOAD_SUCCESS,
      success: true
    });
  }
  catch (error) {
    dispatch({
      type: INTERVIEW_RESULT_DOWNLOAD_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};

export const retrieveSummary = () => async (dispatch, getState) => {
  try {
    dispatch({
      type: INTERVIEW_SUMMARY_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      }
    };

    let response = await INTERVIEW_APIS.summary(configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: INTERVIEW_SUMMARY_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    dispatch({
      type: INTERVIEW_SUMMARY_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};

export const retrieveDailySummary = (params) => async (dispatch, getState) => {
  try {
    dispatch({
      type: INTERVIEW_DAILY_SUMMARY_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      }
    };

    let response = await INTERVIEW_APIS.dailySummary(params, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: INTERVIEW_DAILY_SUMMARY_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    dispatch({
      type: INTERVIEW_DAILY_SUMMARY_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};

export const retrieveRecentUpcoming = () => async (dispatch, getState) => {
  try {
    dispatch({
      type: INTERVIEW_RECENT_UPCOMING_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      }
    };

    let response = await INTERVIEW_APIS.recentUpcoming(configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: INTERVIEW_RECENT_UPCOMING_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    dispatch({
      type: INTERVIEW_RECENT_UPCOMING_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};

export const retrieveScheduled = (params) => async (dispatch, getState) => {
  try {
    dispatch({
      type: INTERVIEW_SCHEDULED_REQUEST
    });

    const token = getToken();

    const configs = {
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-organization": getOrganization(),
      }
    };

    let response = await INTERVIEW_APIS.scheduled(params, configs);
    response = response.data;

    if (response && response.error) {
      throw response;
    }

    dispatch({
      type: INTERVIEW_SCHEDULED_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    dispatch({
      type: INTERVIEW_SCHEDULED_FAIL,
      payload: error.response ? error.response.data : {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
};
