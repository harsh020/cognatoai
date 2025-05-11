import React, {useEffect} from 'react';
import {DATA} from "../../data/data";
import {useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {retrieve} from "../../store/interview/interviewActions";
import GradientText from "../../components/GradientText";

function Header(props) {
  const jobDetails = DATA.jobDetails;

  return (
    <div className='flex flex-row h-full w-full p-6 font-Inter font-bold text-[1.5rem] text-!grey-200 border-b-[2px] border-!grey-800 justify-between my-auto'>
      {
        props.interview.type === 'pitch' ? (
          <span className='flex flex-col'>Discussion with {props.candidate?.metadata?.startup.name}</span>
        ) : (
          props.interview.interviewer.name + ' <> ' + props.interview.candidate.name
        )
      }
      <span className='flex flex-col h-full text-[0.8rem] font-extrabold'><GradientText text='BETA' /></span>
    </div>
  );
}

export default Header;
