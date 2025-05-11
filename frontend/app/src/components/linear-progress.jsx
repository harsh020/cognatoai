"use client"

import {cn} from "@/lib/utils";


const _getColorClass = (value) => {
  if (value >= 80) {
    return 'bg-green-500';
  } else if (value >= 60) {
    return 'bg-orange-500';
  } else if (value >= 40) {
    return 'bg-yellow-500';
  } else {
    return 'bg-red-500';
  }
};

export default function LinearProgress({ value = 0, maxValue=100, className, getColors=_getColorClass }) {

  value = (100/maxValue)*value; // normalize values


  return (
    <div className='flex flex-row gap-2 w-full'>
      <div className={cn(
        'w-full bg-gray-200 rounded-full h-2 my-auto',
        className,
      )}>
        <div
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            getColors(value)
          )}
          style={{ width: `${Math.min(Math.max(value), 100)}%` }}
        ></div>
      </div>

    </div>
  );
}