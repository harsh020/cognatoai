import React from 'react';
import GradientText from "../components/GradientText";

function Header(props) {
  return (
    <div className='flex flex-row w-full h-full px-12 py-4'>
      <div className='flex flex-row justify-between w-full'>
        <img className='sm:h-[5vh] h-[4vh] cursor-pointer' src='/media/images/logo/supermodal-md.webp' alt='logo'/>
        <span className='flex flex-col h-full text-[0.8rem] font-extrabold'><GradientText text='BETA' /></span>
      </div>
    </div>
  );
}

export default Header;