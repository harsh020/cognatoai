import React, {useEffect} from "react";

import {
  ScreenShare
} from 'lucide-react'
import {useDispatch, useSelector} from "react-redux";
import toast from "react-hot-toast";

import {
  screen as retrieveScreen
} from "../store/av/avActions";

function ScreenShareModal(props) {
  const dispatch = useDispatch();

  const { screen, error } = useSelector(state => state.retrieveScreen);

  useEffect(() => {
    if(error) {
      toast.error("Something went wrong. Please try sharing again.")
    }
  }, [screen, error]);


  return (
    <div
      id="popup-modal"
      tabIndex="-1"
      className={`fixed top-0 left-0 right-0 z-50 p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-full bg-!grey-800/50 text-!grey-200 text-[0.8rem]`}
    >
      <div className="relative flex flex-1 w-full max-w-xl h-full m-auto px-4">
        <div className="relative w-full rounded-lg shadow bg-!black border-[1px] border-!grey-400 m-auto">
          <div className='border-b-[1px] border-!grey-400 p-4 text-xl font-bold'>
            Share Screen
          </div>

          <div className="p-10 text-center m-auto">
            <div className='w-full pb-6'>
              <ScreenShare className='h-12 w-12 m-auto' />
            </div>
            <h3 className="mb-5 text-[1rem] font-semibold">
              {props.message || "To proceed, please share your current tab along with its audio."}
            </h3>

            <div className="flex flex-row w-full gap-x-4 justify-center m-auto">
              <button
                data-modal-hide="popup-modal"
                type="button"
                className="bg-!blue-600 hover:bg-!blue-600/90 text-white rounded-md font-medium px-5 py-2.5 outline-none cursor-pointer"
                onClick={() => dispatch(retrieveScreen())}
              >
                {props.confirmText || "Share Screen"}
              </button>

              {
                error && (
                  <p className='text-sm text-red-600 py-2'>Something went wrong. Please try sharing again!</p>
                )
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScreenShareModal;
