"use client"

import React from 'react';
import {cn} from "@/lib/utils";
import Image from "next/image";

function Logo({ className }) {
  return (
    <div className={cn(
        "flex aspect-square h-full w-full items-center justify-center rounded-lg bg-transparent text-sidebar-primary-foreground",
        className
    )}>
      {/*<img src={`/logo/supermodal-sm.webp`}  alt='cognato ai'/>*/}
      <Image src={`/logo/supermodal-sm.webp`}  alt='cognato ai' height={200} width={200} />
    </div>
  );
}

export default Logo;