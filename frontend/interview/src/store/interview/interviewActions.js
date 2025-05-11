import {
  INTERVIEW_RETRIEVE_REQUEST,
  INTERVIEW_RETRIEVE_SUCCESS,
  INTERVIEW_RETRIEVE_FAILED,
  INTERVIEW_RETRIEVE_RESET,

  INTERVIEW_CONTINUE_REQUEST,
  INTERVIEW_CONTINUE_SUCCESS,
  INTERVIEW_CONTINUE_FAILED,
  INTERVIEW_CONTINUE_RESET,

  INTERVIEW_UPDATE_REQUEST,
  INTERVIEW_UPDATE_SUCCESS,
  INTERVIEW_UPDATE_FAILED,
  INTERVIEW_UPDATE_RESET,

  INTERVIEW_SCREEN_UPDATE,
} from './interviewConstants'
import {INTERVIEW_APIS} from "../../apis/interviewApis";


export const retrieve = (id) => async dispatch => {
  try {
    dispatch({
      type: INTERVIEW_RETRIEVE_REQUEST
    });


    let response = await INTERVIEW_APIS.retrieve(id);
    response = response.data

    if(response && response.error) {
      throw response;
    }

    dispatch({
      type: INTERVIEW_RETRIEVE_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    console.log(error);
    dispatch({
      type: INTERVIEW_RETRIEVE_FAILED,
      payload: {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
}

export const continueConversation = (id, data) => async dispatch => {
  try {
    dispatch({
      type: INTERVIEW_CONTINUE_REQUEST
    });


    let response = await INTERVIEW_APIS.continue(id, data);
    response = response.data

    if(response && response.error) {
      throw response;
    }

    dispatch({
      type: INTERVIEW_CONTINUE_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    console.log(error);
    dispatch({
      type: INTERVIEW_CONTINUE_FAILED,
      payload: {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
}

export const continueConversationE2E = (id, data) => async dispatch => {
  try {
    dispatch({
      type: INTERVIEW_CONTINUE_REQUEST
    });


    let response = await INTERVIEW_APIS.continueE2E(id, data);
    response = response.data

    if(response && response.error) {
      throw response;
    }

    dispatch({
      type: INTERVIEW_CONTINUE_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    console.log(error);
    dispatch({
      type: INTERVIEW_CONTINUE_FAILED,
      payload: {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
}

export const endConversation = (id, data) => async dispatch => {
  try {
    dispatch({
      type: INTERVIEW_UPDATE_REQUEST
    });


    let response = await INTERVIEW_APIS.end(id, data);
    response = response.data

    if(response && response.error) {
      throw response;
    }

    dispatch({
      type: INTERVIEW_UPDATE_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    console.log(error);
    dispatch({
      type: INTERVIEW_UPDATE_FAILED,
      payload: {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
}

export const interviewScreenUpdate = (screen) => async dispatch => {
  dispatch({
    type: INTERVIEW_SCREEN_UPDATE,
    payload: screen
  });
}
