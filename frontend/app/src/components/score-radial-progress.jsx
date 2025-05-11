"use client"

import React from "react";

export default function ScoreRadialProgress({ value, className }) {
  // Clamp the score between 0 and 10
  const clampedValue = Math.min(Math.max(value, 0), 10);

  // Convert score to percentage (0-100%)
  const percentage = clampedValue * 10;

  // Determine the color based on the score
  const getColorClass = (score) => {
    if (score >= 7) {
      return 'text-green-500'; // High score: green
    } else if (score >= 4) {
      return 'text-yellow-500'; // Medium score: yellow
    } else {
      return 'text-red-500'; // Low score: red
    }
  };

  // const colorClass = useMemo(() => getColorClass(clampedValue), [clampedValue]);

  // Circle properties
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

  return (
    <div className="relative w-18 h-18 aspect-square">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {/* Background Circle */}
        <circle
          className="text-gray-200"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
        />
        {/* Progress Circle */}
        <circle
          className={value == null ? 'text-transparent' : getColorClass(value)}
          strokeWidth="6"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
          transform="rotate(-90 50 50)" // Start progress from the top
        />
      </svg>
      {/* Score Display */}
      {value && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="inline-flex items-baseline">
            <span className="text-lg font-bold text-foreground">
              {value ? clampedValue : '-'}
            </span>
            <span className="text-xs text-foreground/50">
              /10
            </span>
          </div>
        </div>
      )}
    </div>
  );
};