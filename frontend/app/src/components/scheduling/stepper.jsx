// components/scheduling/Stepper.tsx
import React from 'react';
import { cn } from "@/lib/utils"; // Assuming you have this utility


export const Stepper = ({ currentStep, steps }) => {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol role="list" className="flex items-center justify-center space-x-4 sm:space-x-8">
        {steps.map((stepName, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <li key={stepName} className="relative flex-1">
              {/* Connecting line (except for the first step) */}
              {index > 0 && (
                <div className="absolute inset-0 top-4 left-[-60%] h-0.5 w-full bg-muted" aria-hidden="true">
                  <div className={cn(
                    "h-0.5 w-full",
                    (isCompleted || isCurrent) ? "bg-blue-600" : "bg-muted"
                  )} />
                </div>
              )}

              <div className="relative flex flex-col items-center text-center">
                <span
                  className={cn(
                    "relative z-10 flex h-8 w-8 items-center justify-center rounded-full",
                    isCompleted ? "bg-blue-600" : isCurrent ? "border-2 border-blue-600 bg-muted" : "border-2 border-gray-300 bg-muted"
                  )}
                >
                    {isCompleted ? (
                      <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className={cn("h-2.5 w-2.5 rounded-full", isCurrent ? "bg-blue-600" : "bg-transparent")}></span>
                    )}
                </span>
                <span className={cn(
                  "mt-2 text-sm font-medium",
                  isCurrent ? "text-blue-600" : "text-gray-500"
                )}>
                    {stepName}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
