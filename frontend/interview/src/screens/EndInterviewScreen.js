import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {endConversation} from "../store/interview/interviewActions";
import Loading from "../components/Loading";
import Header from "../layout/Header";
import Content from "../layout/Content";
import Layout from "../layout/Layout";
import GradientButton from "../components/GradientButton";
import Footer from "../layout/Footer";
import {useParams} from "react-router-dom";
import {create as createFeedback} from '../store/feedback/feedbackActions';
import {UTILS} from "../commons/utils";
import {FEEDBACK_CREATE_RESET} from "../store/feedback/feedbackConstants";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import { INTERVIEW_STATUS } from '../constants/enums';


function FeedbackForm(props) {
  const dispatch = useDispatch();

  const createdFeedback = useSelector(state => state.createFeedback);
  const { loading, feedback, error } = createdFeedback;

  useEffect(() => {
    if(feedback) {
      toast.success('Feedback submitted successfully!');

      dispatch({
        type: FEEDBACK_CREATE_RESET
      })
    }
    else if(error) {
      toast.error(error.message);
    }
  }, [feedback, error]);


  const onFeedbackSubmit = (e) => {
    e.preventDefault();
    let data = UTILS.buildJsonFromForm(e.target);
    data['interview'] = props.interview.id;

    dispatch(createFeedback(data));
    e.target.reset();
  }

  return (
    <div className="max-w-xl mx-auto flex w-full flex-col px-10 py-6 bg-!grey-400/30 rounded-md text-!grey-200 text-[0.8rem]">
      <h2 className="title-font mb-1 font-bold text-[0.9rem]">Feedback</h2>
      <p className="mb-5 leading-relaxed">If you had any issues or you liked our product, please share
        with us!
      </p>

      <form className='flex flex-col gap-y-4' onSubmit={onFeedbackSubmit}>
        <div className="flex flex-col">
          <label htmlFor="email" className="text-[12px]">Email</label>
          <input type="email" id="email" name="email"
                 required className="flex flex-row h-full w-full rounded-md border-[1px] border-!grey-400 bg-!grey-400/30 my-auto p-2 outline-none text-[0.85rem]"/>
        </div>
        <div className="flex flex-col">
          <label htmlFor="message" className="text-[12px]">Message</label>
          <textarea id="message" name="message" rows={5}
                    required className="flex flex-row h-full w-full rounded-md border-[1px] border-!grey-400 bg-!grey-400/30 my-auto p-2 outline-none text-[0.85rem]"></textarea>
        </div>

        <GradientButton type='submit' text={ loading ? (
          <span className='flex flex-row w-full m-auto'>
            <Loader />
          </span>
        ) : ( 'Submit' ) } />
      </form>
      <p className="mt-3 text-xs">Feel free to connect with us on social media platforms.</p>
    </div>
  )
}

function BaseEndInterviewScreen(props) {
  const { interview } = props;
  const dispatch = useDispatch();

  const interviewData = useSelector(state => state.endInterview);
  const {loading, interview: endedInterview, error} = interviewData;

  const conversationData = useSelector(state => state.continueInterview);
  const {error: conversationError} = conversationData;
  const transcribedAudio = useSelector(state => state.transcribedAudio);
  const {error: transcribeError} = transcribedAudio;

  useEffect(() => {
    if(interview && !endedInterview) {
      let data = null;
      if(conversationError || transcribeError) {
        data = {
          status: INTERVIEW_STATUS.ERROR
        }
      }

      // console.log("ending interview with error");
      // console.log(data);
      // console.log(conversationError, transcribeError);
      dispatch(endConversation(interview.id, data));
    }
  }, [endedInterview]);

  return (
    <>
      {
        !endedInterview ? (
          <Loading />
        ) : (
          <div className='flex min-h-screen w-full mb-20 mt-8'>
            <div className='flex flex-col mx-auto font-Inter'>
              <div className='flex flex-row w-full py-4 font-Inter font-bold text-[1.5rem] text-!grey-200 mx-auto justify-center'>
                The meeting has ended
              </div>

              <div className='flex flex-row'>
                <FeedbackForm interview={interview} />
              </div>
            </div>
          </div>
        )
      }
    </>
  );
}

function EndInterviewScreen(props) {
  const interviewData = useSelector(state => state.retrieveInterview)
  const {loading, interview, error} = interviewData

  return (
    <Layout className='flex flex-col h-screen overflow-y-hidden'>
      <Header />

      <Content>
        <BaseEndInterviewScreen interview={interview} />
      </Content>

      {/*<Footer />*/}
    </Layout>
  )
}

export default EndInterviewScreen;
