import React, {useEffect} from 'react';
import {useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {retrieve} from "../store/interview/interviewActions";
import Loading from "../components/Loading";

function Layout(props) {
  return (
    <div className={`flex flex-row w-full bg-!black font-Inter ${props.className}`}>
      {props.children}
    </div>
  );
}

export default Layout;