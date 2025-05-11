import React from 'react';
import Loader from "./Loader";

function Loading(props) {
  return (
    <div className='h-screen w-full'>
        <div className='flex flex-col h-full w-full mx-auto my-auto'>
          <Loader className='flex flex-col mx-auto my-auto text-gray-400/50' height='50px' width='50px'  />
        </div>
    </div>
  );
}

export default Loading;