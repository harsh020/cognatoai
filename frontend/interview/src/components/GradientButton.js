import React from 'react';

function GradientButton(props) {
  return (
    <div className='h-full w-full m-auto'>
      {/*<img className='absolute top-0 left-0 h-full w-full z-0 rounded-md' alt='gradient' src='/media/images/background/gradient.webp' />*/}
      <button type={props.type || 'button'}
              className={`h-full w-full text-white rounded-md px-4 py-3 text-sm font-bold m-auto ${props.disabled ? 'bg-!grey-200 cursor-not-allowed' : 'bg-!gradient-4 bg-cover'}`}
              onClick={props.onClick}
              disabled={props.disabled}
      >
        {props.text}
      </button>
    </div>
  );
}

export default GradientButton;