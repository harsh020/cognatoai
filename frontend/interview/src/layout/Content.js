import React from 'react';

function Content(props) {
  return (
    <div className='flex flex-col h-full w-full'>
      {props.children}
    </div>
  );
}

export default Content;