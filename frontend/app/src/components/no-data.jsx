import React from 'react';
import {cn} from "@/lib/utils";
import {Inbox} from "lucide-react";

function NoData({ text, className }) {
  return (
    <div className={cn(
      'flex flex-col h-full w-full m-auto text-foreground/60 text-lg font-normal gap-1',
      className
    )}>
      <div className='flex flex-col m-auto gap-1'>
        <Inbox className='flex flex-row m-auto h-5 w-5' />
        <span className='flex flex-row m-auto text-sm'>{text || 'No data'}</span>
      </div>
    </div>
  );
}

export default NoData;