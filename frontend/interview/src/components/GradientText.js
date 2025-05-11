import React from 'react';

function GradientText(props) {
  return (
    <span className='flex flex-row bg-!linear-gradient-sm bg-cover bg-clip-text text-transparent my-auto'>
      {props.text}
    </span>
  );
}

export default GradientText;