"use client"

import React from 'react';
import {TooltipContent, TooltipProvider, TooltipTrigger, Tooltip as BaseTooltip} from "@/components/ui/tooltip";

function Tooltip({ content, children }) {
  return (
    <TooltipProvider>
      <BaseTooltip>
        <TooltipTrigger>
          {children}
        </TooltipTrigger>
        <TooltipContent>
          <p>{content}</p>
        </TooltipContent>
      </BaseTooltip>
    </TooltipProvider>
  );
}

export default Tooltip;