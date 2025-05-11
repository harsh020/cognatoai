"use client";

import React, { forwardRef, useRef } from "react";

import BackgroundDots from "@/components/background-dots";




function ConnectWithUs(props) {
  return (
    <section className="relative mx-auto p-16 md:py-24 w-full">
      <BackgroundDots className='-z-30 opacity-25' maskClassName='-z-10' />

      <div className="mb-12 text-center">
        <h2 className="text-2xl tracking-tight md:text-6xl m-auto">
          <span className=' bg-clip-text text-transparent font-semibold bg-gradient-to-r from-indigo-400 via-sky-500 to-rose-400'>Connect</span>{' '}
          <span className=''>with us.</span>{' '}
          <br />
          <span className=''>It's</span>{' '}
          <span className='bg-clip-text text-transparent font-semibold bg-gradient-to-r from-indigo-400 via-sky-500 to-rose-400'>free</span>{' '}
          <span className=''>you know!</span>
        </h2>
      </div>

      <div className='mx-auto justify-center items-center'>
        <div
          className='bg-background relative w-fit mx-auto text-xl px-8 py-4 rounded-lg hover:cursor-pointer'
          onClick={() => window.open(process.env.NEXT_PUBLIC_CAL_LINK, '_blank')}>
          <div className='absolute h-full w-full top-0 left-0 bg-gradient-to-br from-indigo-400 via-sky-500 to-rose-400 rounded-lg opacity-30 hover:opacity-40 hover:shadow-lg transition-100' />
          <span className=''>Let's Go</span>
        </div>
      </div>
    </section>
  );
}

export default ConnectWithUs;