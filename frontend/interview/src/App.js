import React, { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import "./App.css";
import Modal from "./components/Modal";
import Layout from "./layout/Layout";
import Router from "./router/Router";

function App() {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  // const {id} = useParams();
  // const dispatch = useDispatch();
  //
  // const interviewData = useSelector(state => state.retrieveInterview)
  // const {loading, interview, error} = interviewData
  //
  // useEffect(() => {
  //   const path = window.location.pathname;
  //   const id = UTILS.extractUUID(path);
  //   console.log(id)
  //
  //   if(id && !interview) dispatch(retrieve(id));
  // }, [interview]);
  //
  useEffect(() => {
    const isChrome = navigator.userAgent.toLowerCase().includes("chrome");
    // console.log(navigator.userAgent.toLowerCase().includes("chrome"));
    if (!isChrome) {
      setShowDisclaimer(true);
    }
  }, []);

  return (
    <Layout>
      <Toaster />

      {showDisclaimer && (
        <Modal
          onCloseHandler={() => setShowDisclaimer(false)}
          onConfirmHandler={() => setShowDisclaimer(false)}
          confirmText={"Ok, I'll switch!"}
          cancelText={"Damn! Just go away"}
          message={
            <p className="mb-6">
              To have a better experience, we recommend using Google Chrome.
              Its highly likely that you might face issue here. In that case, please reach out to us at{" "}
              <a href="mailto:support@cognatoai.com" className="text-blue-500">
                support@cognatoai.com
              </a>
            </p>
          }
        />
      )}

      <Router />
    </Layout>
  );
}

export default App;
