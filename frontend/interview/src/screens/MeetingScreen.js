import React, {useEffect, useState} from 'react';
import {INTERVIEW_STATUS, MEETINGS_STATUS} from "../constants/enums";
import JoinInterviewScreen from "./JoinInterviewScreen";
import InterviewScreen from "./InterviewScreen";
import EndInterviewScreen from "./EndInterviewScreen";
import {useDispatch, useSelector} from "react-redux";
import {useParams} from "react-router-dom";
import {UTILS} from "../commons/utils";
import {retrieve} from "../store/interview/interviewActions";
import Loading from "../components/Loading";
import NotFoundScreen from "./NotFoundScreen";
import { toast } from 'react-hot-toast';

function MeetingScreen(props) {
  const validAdmitStatus = [INTERVIEW_STATUS.SCHEDULED, INTERVIEW_STATUS.IN_PROGRESS]
  const validEndStatus = [INTERVIEW_STATUS.COMPLETED, INTERVIEW_STATUS.INCOMPLETE]

  const dispatch = useDispatch();
  const params = useParams();

  const interviewData = useSelector(state => state.retrieveInterview)
  const {loading, interview, error} = interviewData

  const interviewScreen = useSelector(state => state.interviewScreen);
  const { screen } = interviewScreen;

  useEffect(() => {
    const id = params.id;
    if(error) {
      toast.error(error.message)
    } else if(id && !interview) dispatch(retrieve(id));
  }, [interview]);


  return (
    // <>
    //   {
    //     interview ? (
    //       screen === MEETINGS_STATUS.PRE_MEETING ? (
    //         <JoinInterviewScreen />
    //       ) : screen === MEETINGS_STATUS.MEETING ? (
    //         <InterviewScreen />
    //       ) : (
    //         <EndInterviewScreen />
    //       )
    //     ) : (
    //       <Loading />
    //     )
    //   }
    // </>
    <>
      {
        interview ? (
          validAdmitStatus.includes(interview.status) ? (
            screen === MEETINGS_STATUS.PRE_MEETING ? (
              <JoinInterviewScreen />
            ) : screen === MEETINGS_STATUS.MEETING ? (
              <InterviewScreen />
              // <Test />
            ) : (
              <EndInterviewScreen />
            )
          ) : validEndStatus.includes(interview.status) ? (
            <EndInterviewScreen />
          ) : (
            <NotFoundScreen />
          )
        ) : loading ? (
          <Loading />
        ) : (
          <NotFoundScreen />
        )
      }
    </>
  );
}

export default MeetingScreen;
