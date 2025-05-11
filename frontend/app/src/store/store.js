import {applyMiddleware, combineReducers, createStore} from "redux";
import { configureStore } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';

import {
  createInterview,
  retrieveInterview,
  listInterviews,
  updateInterview,
  retrieveSummary,
  retrieveDailySummary,
  retrieveRecentUpcoming,
  retrieveScheduled,
} from '@/store/interview/reducers';
import {
  createMember,
  retrieveMember,
  listMembers
} from '@/store/member/reducers';
import {
  createOrder,
  retrieveOrder,
  listOrders,
} from '@/store/order/reducers';
import {
  createOrganization,
  retrieveOrganization,
  updateOrganization,
  listOrganizations
} from '@/store/organization/reducers';
import {
  createUser,
  retrieveUser,
  updateUser,
  changePassword
} from '@/store/user/reducers';
import {
  createCandidate,
  updateCandidate,
  retrieveCandidate,
  listCandidates,
} from '@/store/candidate/reducers';
import {
  createJob,
  updateJob,
  retrieveJob,
  listJobs,
  fetchMoreJobs,
} from '@/store/job/reducers';
import {
  createSubscription,
  retrieveSubscription,
  retrieveActiveSubscription,
  listSubscriptions,
} from '@/store/subscription/reducers';
import {
  createReview,
  retrieveReview,
  listReviews
} from "@/store/review/reducers";
import {
  retrieveFeedback
} from "@/store/feedback/reducers";
import {
  listStages
} from "@/store/stage/reducers";
import {
  retrieveActivity
} from "@/store/activity/reducers";
import {
  retrieveRecording
} from "@/store/recording/reducers";
import {
  downloadInterviewResult
} from "@/store/interview/reducers";


const reducers = combineReducers({
  createInterview,
  retrieveInterview,
  listInterviews,
  updateInterview,
  retrieveSummary,
  retrieveDailySummary,
  retrieveRecentUpcoming,
  retrieveScheduled,

  createMember,
  retrieveMember,
  listMembers,

  createOrder,
  retrieveOrder,
  listOrders,

  createOrganization,
  retrieveOrganization,
  updateOrganization,
  listOrganizations,

  createUser,
  retrieveUser,
  updateUser,
  changePassword,

  createCandidate,
  updateCandidate,
  retrieveCandidate,
  listCandidates,

  createJob,
  updateJob,
  retrieveJob,
  listJobs,
  fetchMoreJobs,

  createSubscription,
  retrieveSubscription,
  retrieveActiveSubscription,
  listSubscriptions,

  createReview,
  retrieveReview,
  listReviews,

  retrieveFeedback,

  listStages,

  retrieveActivity,
  retrieveRecording,

  downloadInterviewResult
})


export const makeStore = () =>
  configureStore({
    reducer: reducers,
    devTools: process.env.NEXT_PUBLIC_NODE_ENV !== 'production', // Enable Redux DevTools in development
  });

export const wrapper = createWrapper(makeStore);

