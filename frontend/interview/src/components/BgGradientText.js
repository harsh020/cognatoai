import React from 'react';

function BgGradientText(props) {
  return (
    <div className='relative flex flex-row'>
      <span className='absolute h-full w-full z-10 bg-!gradient-2 bg-cover blur-xl'></span>
      <h1 className='relative z-20 text-white'>{props.text}</h1>
    </div>
  );
}

export default BgGradientText;