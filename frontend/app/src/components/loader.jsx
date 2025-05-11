"use client"

import React from 'react';
import {cn} from "@/lib/utils";
import {Inbox, LoaderCircle} from "lucide-react";

export default function Loader({ className }) {
  return (
    // <div className={cn(
    //   'flex flex-col h-full w-full m-auto items-center justify-center',
    //   className,
    // )}>
    //   <LoaderCircle className='animate-spin m-auto' />
    // </div>

  <div className={cn(
    'flex flex-col h-full w-full m-auto items-center justify-center',
    className,
  )}>
    <div className='flex flex-col m-auto gap-1'>
      <LoaderCircle className='animate-spin m-auto' />
    </div>
  </div>
  );
}