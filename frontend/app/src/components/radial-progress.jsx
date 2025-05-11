"use client"


import {cn} from "@/lib/utils";

const _getColor = (value) => {
  if (value >= 7) {
    return 'text-green-500';
  } else if (value >= 4) {
    return 'text-yellow-500';
  } else {
    return 'text-red-500';
  }
};

export default function RadialProgress({ value, maxValue=10, className, getColor=_getColor }) {
  value = value ? ((10/maxValue)*parseFloat(value)).toFixed(1) : null;

  // Clamp the score between 0 and 10
  const clampedValue = Math.min(Math.max(value, 0), 10);

  // Convert score to percentage (0-100%)
  const percentage = clampedValue * 10;


  // const colorClass = useMemo(() => getColorClass(clampedValue), [clampedValue]);

  // Circle properties
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

  return (
    <div className={cn("relative w-18 h-18 aspect-square", className)}>
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {/* Background Circle */}
        <circle
          className="text-muted"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
        />
        {/* Progress Circle */}
        <circle
          className={value == null ? 'text-transparent' : getColor(value)}
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
              /{maxValue}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}