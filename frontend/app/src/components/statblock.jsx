"use client"

// Reusable StatBlock component
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {cn} from "@/lib/utils";

export default function StatBlock({ label, value, fromColor, toColor, className }) {
  return (
    <Card
      className={cn(
        `flex flex-col w-full rounded-lg px-0 py-6 flex flex-col justify-between`,
        // 'bg-conic-110 from-purple-900 to-purple-500',
        // 'bg-conic/decreasing from-violet-700 via-lime-300 to-violet-700',
        // `bg-conic-110 from-${fromColor} to-${toColor}`,
        className
      )}
    >

      <CardContent className='flex flex-col gap-2'>
        <span className="text-white text-sm opacity-80">{label}</span>
        <span className="text-white text-4xl font-bold">{value}</span>
      </CardContent>
    </Card>
  );
}