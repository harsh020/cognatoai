import {
  TRANSCRIBE_FAILED,
  TRANSCRIBE_REQUEST,
  TRANSCRIBE_SUCCESS,
  TRANSCRIBE_RESET,

  TRANSCRIBE_WARMUP_FAILED,
  TRANSCRIBE_WARMUP_REQUEST,
  TRANSCRIBE_WARMUP_SUCCESS,
  TRANSCRIBE_WARMUP_RESET,

  LIVE_TRANSCRIBE_FAILED,
  LIVE_TRANSCRIBE_REQUEST,
  LIVE_TRANSCRIBE_SUCCESS,
  LIVE_TRANSCRIBE_RESET,

  SPEAK_FAILED,
  SPEAK_REQUEST,
  SPEAK_SUCCESS,
  SPEAK_RESET,
} from "./linguisticConstants";
import {LINGUISTIC_APIS} from "../../apis/linguisticApis";
import {UTILS} from "../../commons/utils";


export const transcribe = (data) => async dispatch => {
  try {
    dispatch({
      type: TRANSCRIBE_REQUEST
    });

    let response = await LINGUISTIC_APIS.transcribe(data);
    response = response.data

    if(response && response.error) {
      throw response;
    }

    dispatch({
      type: TRANSCRIBE_SUCCESS,
      payload: response
    });

    dispatch({
      type: LIVE_TRANSCRIBE_RESET
    });
  }
  catch (error) {
    console.log(error);
    dispatch({
      type: TRANSCRIBE_FAILED,
      payload: {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
}


export const transcribeWarmup = () => async dispatch => {
  try {
    dispatch({
      type: TRANSCRIBE_WARMUP_REQUEST
    });

    let response = await LINGUISTIC_APIS.transcribeWarmup();
    response = response.data

    if(response && response.error) {
      throw response;
    }

    dispatch({
      type: TRANSCRIBE_WARMUP_SUCCESS,
      payload: response
    });
  }
  catch (error) {
    console.log(error);
    dispatch({
      type: TRANSCRIBE_WARMUP_FAILED,
      payload: {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
}

export const liveTranscribe = (data) => async (dispatch, getState) => {
  try {
    dispatch({
      type: LIVE_TRANSCRIBE_REQUEST
    });

    let response = await LINGUISTIC_APIS.transcribe(data);
    response = response.data

    if(response && response.error) {
      throw response;
    }

    const {
      liveTranscribedAudio
    } = getState();

    let { transcript } = liveTranscribedAudio || { transcript: null };
    if(response) {
      if(response.text.trim() === "" || response.text.trim().length === 0) {
        response = {
          ...response,
          text: '[BLANK_AUDIO]'
        }
      }
    }

    // console.log("in action --> ", response)

    dispatch({
      type: LIVE_TRANSCRIBE_SUCCESS,
      payload: {
        'text': transcript && transcript.text ? transcript.text + response.text : response.text,
      }
    });
  }
  catch (error) {
    console.log(error);
    dispatch({
      type: LIVE_TRANSCRIBE_FAILED,
      payload: {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
}


export const speak = (data) => async dispatch => {
  try {
    dispatch({
      type: SPEAK_REQUEST
    });

    let response = await LINGUISTIC_APIS.speak(data, {
      responseType: 'blob'
    });
    response = response.data

    if(response && response.error) {
      throw response;
    }

    // console.log(URL.createObjectURL(response))
    dispatch({
      type: SPEAK_SUCCESS,
      payload: URL.createObjectURL(response),
    });
  }
  catch (error) {
    console.log(error);
    dispatch({
      type: SPEAK_FAILED,
      payload: {
        error: true,
        message: error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      }
    });
  }
}