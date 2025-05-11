import React from "react";

function Modal(props) {
  return (
    <div
      id="popup-modal"
      tabIndex="-1"
      className={`fixed top-0 left-0 right-0 z-50 p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-full bg-!grey-800/50 text-!grey-200 text-[0.8rem]`}
    >
      <div className="relative flex flex-1 w-full max-w-xl h-full m-auto px-4">
        <div className="relative rounded-lg shadow bg-!black border-[1px] border-!grey-400 m-auto">
          <button
            type="button"
            className="absolute top-3 right-2.5 bg-transparent hover:bg-!gray-200 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center"
            data-modal-hide="popup-modal"
            onClick={props.onCloseHandler}
          >
            <svg
              className="w-3 h-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
            <span className="sr-only">Close modal</span>
          </button>
          <div className="p-6 text-center">
            <svg
              className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <h3 className="mb-5 text-[1rem] font-semibold">
              {props.message || "Are you sure you want to delete this product?"}
            </h3>

            <div className="flex flex-row w-full gap-x-4 justify-center">
              <button
                data-modal-hide="popup-modal"
                type="button"
                className="bg-!blue-600 hover:bg-!blue-600/90 text-white rounded-md font-medium px-5 py-2.5 outline-none cursor-pointer"
                onClick={props.onConfirmHandler}
              >
                {props.confirmText || "Yes, I'm sure"}
              </button>
              <button
                data-modal-hide="popup-modal"
                type="button"
                className="bg-!grey-400 hover:bg-!grey-600 rounded-md font-medium px-5 py-2.5 outline-none cursor-pointer"
                onClick={props.onCloseHandler}
              >
                {props.cancelText || "No, cancel"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
