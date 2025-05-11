import {applyMiddleware, combineReducers, createStore} from "redux";
import { configureStore } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import {createWaitlist, updateWaitlist} from "@/store/waitlist/reducers";
import {authenticate, register, sendOtp, verifyEmail} from "@/store/user/reducers";
import {callback, redirect} from "@/store/social/reducers";


const reducers = combineReducers({
  // user reducers
  register,
  authenticate,
  verifyEmail,
  sendOtp,

  redirect,
  callback,

  createWaitlist,
  updateWaitlist
})

const initialState = {

}

export const makeStore = () =>
  configureStore({
    reducer: reducers,
    devTools: process.env.NEXT_PUBLIC_NODE_ENV !== 'production',
  });

export const wrapper = createWrapper(makeStore);
