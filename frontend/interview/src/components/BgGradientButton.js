import React from 'react';
import GradientText from "./GradientText";

function BgGradientButton(props) {
  return (
    <div className='relative h-full w-full m-auto p-1'>
      <img className='absolute top-0 left-0 h-full w-full rounded-md' alt='gradient' src='/media/images/background/gradient-2.webp' />
      <button className="relative h-full w-full text-white rounded-md px-8 py-2 text-sm font-bold m-auto bg-!off-white"
      >
        <GradientText text={props.text} />
      </button>
    </div>
  );
}

export default BgGradientButton;