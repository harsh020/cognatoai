"use client"

import React from 'react';
import {cn} from "@/lib/utils";

function BackgroundDots({ className, maskClassName }) {
  return (
    <>
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:20px_20px]",
          "[background-image:radial-gradient(#000000_1px,transparent_1px)]",
          "dark:[background-image:radial-gradient(#ffffff_1px,transparent_1px)]",
          className
        )}
      />
      {/* Radial gradient for the container to give a faded look */}
      <div className={cn(
        "pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black)]",
        maskClassName
      )}></div>
    </>
  );
}

export default BackgroundDots;