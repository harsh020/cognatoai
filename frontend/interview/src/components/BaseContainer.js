import React from 'react';

function BaseContainer(props) {
  return (
    <div className='h-full w-full min-h-screen min-w-screen'>
      {props.children}
    </div>
  );
}

export default BaseContainer;