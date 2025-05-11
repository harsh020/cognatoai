import {applyMiddleware, combineReducers, createStore} from "redux";
import {composeWithDevTools} from "@redux-devtools/extension";
import {
  retrieveInterview,
  continueInterview, endInterview, interviewScreen
} from "./interview/interviewReducers";
import { createBulkActivity } from "./activity/activityReducers";
import {thunk} from "redux-thunk";
import {liveTranscribe, speak, transcribe, transcribeWarmup} from "./linguistic/linguisticReducers";
import {audioPermission, videoPermission, av, retrieveAudio, retrieveVideo, retrieveScreen} from "./av/avReducers";
import {MEETINGS_STATUS} from "../constants/enums";
import {createFeedback} from "./feedback/feedbackReducers";
import SocketClient from "../commons/SocketClient";
import socketMiddleware from "./middleware/socketMiddleware";


const reducers = combineReducers({
  retrieveInterview,
  continueInterview,
  endInterview,
  interviewScreen,

  createBulkActivity,
  createFeedback,

  transcribedAudio: transcribe,
  liveTranscribedAudio: liveTranscribe,
  speakText: speak,
  transcribeWarmup,

  retrieveAudio,
  retrieveVideo,
  retrieveScreen,
  avPermissions: av,
})

const socket = new SocketClient();

const initialState = {
  interviewScreen: {
    screen: MEETINGS_STATUS.PRE_MEETING
  },
}

const middlewares = [socketMiddleware(socket), thunk]

// TODO: Install @reduxjs/toolkit and use `configureStore` instead of createStore
const store = createStore(reducers, initialState,
  composeWithDevTools(applyMiddleware(...middlewares)))

export default store;
