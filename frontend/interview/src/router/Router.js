import React from 'react';
import {Route, Routes} from "react-router-dom";
import InterviewScreen from "../screens/InterviewScreen";
import AudioRecorder from "../components/AudioRecorder";
import JoinInterviewScreen from "../screens/JoinInterviewScreen";
import EndInterviewScreen from "../screens/EndInterviewScreen";
import MeetingScreen from "../screens/MeetingScreen";
import NotFoundScreen from "../screens/NotFoundScreen";
import Test from "../Test";
import Test2 from "../Test2";

function Router(props) {
  return (
    <Routes>
      {/*<Route path="/interviews/:id/join" element={<JoinInterviewScreen />} />*/}
      {/*<Route path="/interviews/:id/end" element={<EndInterviewScreen />} />*/}
      {/*<Route path="/interviews/:id" element={<InterviewScreen />} />*/}
      <Route path="/interviews/:id" element={<MeetingScreen />} />
      <Route path="/test" element={<Test />} />
      <Route path="/test2" element={<Test2 />} />
      <Route path='*' element={<NotFoundScreen />} />
    </Routes>
  );
}

export default Router;