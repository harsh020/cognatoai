"use client"

// import { Card, CardHeader, CardContent } from "@/components/ui/card";
// import { Calendar } from "@/components/ui/calendar";
// import { Button } from "@/components/ui/button";
// import {format} from "date-fns";
// import {useState} from "react";
// import {Popover, PopoverContent, PopoverTrigger, PopoverAnchor} from "@/components/ui/popover";
// import {cn} from "@/lib/utils";
//
//
//
// // Helper function to convert time string to minutes
// function timeToMinutes(time) {
//   const [hour, minute] = time.split(':').map(Number);
//   return hour * 60 + minute;
// }
//
// // Helper function to assign tasks to lanes to handle overlaps
// function assignLanes(items) {
//   const lanes = [];
//   const sortedItems = [...items].sort((a, b) => timeToMinutes(a.start_datetime) - timeToMinutes(b.start_datetime));
//
//   for (const item of sortedItems) {
//     let placed = false;
//     for (let laneIndex = 0; laneIndex < lanes.length; laneIndex++) {
//       const lane = lanes[laneIndex];
//       const lastItem = lane[lane.length - 1];
//       if (!lastItem || timeToMinutes(item.start_datetime) >= timeToMinutes(lastItem.end_datetime)) {
//         lane.push(item);
//         placed = true;
//         break;
//       }
//     }
//     if (!placed) {
//       lanes.push([item]);
//     }
//   }
//
//   return lanes.flatMap((lane, laneIndex) => lane.map(item => ({ item, laneIndex })));
// }
//
// // Color mapping for task styles
// const colorMap = {
//   green: { bg: 'bg-diagonal-green', border: 'border-green-500' },
//   orange: { bg: 'bg-diagonal-orange', border: 'border-orange-500' },
//   purple: { bg: 'bg-diagonal-purple', border: 'border-purple-500' },
//   gray: { bg: 'bg-diagonal-gray', border: 'border-gray-500' },
// };
//
// export default function  Schedule({ scheduleItems, currentTime }) {
//   const [date, setDate] = useState(new Date());
//   const formattedDate = format(date, "MMM dd, yyyy");
//
//   // Timeline settings
//   const timelineStart = '08:00';
//   const timelineEnd = '11:00';
//   const timelineStartMinutes = timeToMinutes(timelineStart);
//   const timelineEndMinutes = timeToMinutes(timelineEnd);
//   const timelineDurationMinutes = timelineEndMinutes - timelineStartMinutes;
//   const timelineWidth = 600; // Fixed width in pixels
//   const rowHeight = 40; // Height per lane
//   const itemHeight = 30; // Height of each task bar
//
//   // Assign lanes to handle overlapping tasks
//   const itemsWithLanes = assignLanes(scheduleItems);
//   const numLanes = itemsWithLanes.length > 0 ? Math.max(...itemsWithLanes.map(i => i.laneIndex)) + 1 : 1;
//
//   // Calculate left position based on time
//   const calculateLeft = (time) => {
//     const minutes = timeToMinutes(time);
//     return ((minutes - timelineStartMinutes) / timelineDurationMinutes) * timelineWidth;
//   };
//
//   // Calculate width based on start and end times
//   const calculateWidth = (start, end) => {
//     const startMinutes = timeToMinutes(start);
//     const endMinutes = timeToMinutes(end);
//     return ((endMinutes - startMinutes) / timelineDurationMinutes) * timelineWidth;
//   };
//
//   const times = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
//
//   return (
//     <Card className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-md">
//       <CardHeader className="flex flex-row items-center justify-between p-4">
//         <h2 className="text-xl font-bold text-gray-900">Today Schedule</h2>
//         <div className="flex items-center space-x-4">
//           {/*<span className="text-gray-500">{date} ↓</span>*/}
//           <div className="flex items-center space-x-2">
//             <Popover>
//               <PopoverTrigger asChild>
//                 <Button
//                   variant={"outline"}
//                   className={cn(
//                     "w-[200px] justify-start text-left font-normal",
//                     !date && "text-muted-foreground"
//                   )}
//                 >
//                   {formattedDate}
//                 </Button>
//               </PopoverTrigger>
//               <PopoverContent className="w-auto p-0" align="end">
//                 <Calendar
//                   mode="single"
//                   selected={date}
//                   onSelect={setDate}
//                   className="rounded-md border"
//                 />
//               </PopoverContent>
//             </Popover>
//             {/*<Button>Add Task</Button>*/}
//           </div>
//           <Button className="bg-blue-500 text-white rounded-md hover:bg-blue-600 px-4 py-2">
//             Add Task
//           </Button>
//         </div>
//       </CardHeader>
//       <CardContent className="p-4">
//         <div className="relative">
//           {/* Timeline markers */}
//           <div className="flex justify-between mb-2 w-[600px]">
//             {['08:00', '09:00', '10:00', '11:00'].map(time => (
//               <div key={time} className="text-sm text-gray-500">{time}</div>
//             ))}
//           </div>
//           {/* Schedule area */}
//           <div
//             className="relative bg-gray-50"
//             style={{ height: `${numLanes * rowHeight}px`, width: `${timelineWidth}px` }}
//           >
//             {/* Vertical dashed lines */}
//             {['08:00', '09:00', '10:00', '11:00'].map(time => (
//               <div
//                 key={time}
//                 className="absolute top-0 h-full border-l border-dashed border-gray-300"
//                 style={{ left: `${calculateLeft(time)}px` }}
//               />
//             ))}
//             {/* Task bars */}
//             {itemsWithLanes.map(({ item, laneIndex }) => (
//               <div
//                 key={item.title}
//                 className={`absolute p-2 rounded-md shadow-sm text-gray-900 text-sm ${
//                   colorMap[item.color].bg
//                 } border-l-4 ${colorMap[item.color].border}`}
//                 style={{
//                   left: `${calculateLeft(item.start_datetime)}px`,
//                   width: `${calculateWidth(item.start_datetime, item.end_datetime)}px`,
//                   top: `${laneIndex * rowHeight}px`,
//                   height: `${itemHeight}px`,
//                 }}
//               >
//                 {item.title}
//               </div>
//             ))}
//             {/* Current time indicator */}
//             <div
//               className="absolute top-0 h-full w-0.5 bg-blue-500"
//               style={{ left: `${calculateLeft(currentTime)}px` }}
//             >
//               <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
//                 {currentTime}
//               </div>
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

import {useEffect, useMemo, useState} from 'react';
import { format } from 'date-fns';
import {Card, CardHeader, CardContent, CardTitle} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  checkDateAndGetTime,
  cn,
  convertDateStringToLocalTZWithFormat,
  getRandomInteger,
  toTitleCase
} from '@/lib/utils';
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {CalendarIcon, Compass, Contact, Info, User} from "lucide-react";
import {useDispatch, useSelector} from "react-redux";
import {toast} from "sonner";
import {retrieveScheduled} from "@/store/interview/actions";
import NoData from "@/components/no-data";
import Loader from "@/components/loader";

// Convert time string 'HH:MM' to minutes
function timeToMinutes(time) {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

// Convert minutes to time string 'HH:MM'
function minutesToTime(minutes) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

// Assign tasks to lanes to handle overlaps
function assignLanes(items) {
  const lanes = [];
  const sortedItems = [...items].sort((a, b) => timeToMinutes(a.end) - timeToMinutes(b.end));

  for (const item of sortedItems) {
    let placed = false;
    for (let laneIndex = 0; laneIndex < lanes.length; laneIndex++) {
      const lane = lanes[laneIndex];
      const lastItem = lane[lane.length - 1];
      if (!lastItem || timeToMinutes(item.start) >= timeToMinutes(lastItem.end)) {
        lane.push(item);
        placed = true;
        break;
      }
    }
    if (!placed) {
      lanes.push([item]);
    }
  }

  return lanes.flatMap((lane, laneIndex) => lane.map(item => ({ item, laneIndex })));
}

// Color mapping for task styles
const colorMap = {
  green: { bg: 'bg-green-400/20', border: 'border-green-500' },
  orange: { bg: 'bg-orange-400/20', border: 'border-orange-500' },
  purple: { bg: 'bg-purple-400/20', border: 'border-purple-500' },
  gray: { bg: 'bg-gray-400/20', border: 'border-gray-500' },
  indigo: { bg: 'bg-indigo-400/20', border: 'border-indigo-500' },
  blue: { bg: 'bg-blue-400/20', border: 'border-blue-500' },
  sky: { bg: 'bg-sky-400/20', border: 'border-sky-500' },
};

function ScheduleHoverCard({ index, item, className, style }) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {/*<div*/}
        {/*  key={index}*/}
        {/*  className={cn(*/}
        {/*    `absolute p-2 rounded-md my-auto shadow-sm text-foreground text-sm  border-l-4 truncate`,*/}
        {/*    className*/}
        {/*  )}*/}
        {/*  style={style}*/}
        {/*>*/}
        {/*  {item.interviewer} {'<>'} {item.candidate}*/}
        {/*</div>*/}
        <span>{item.interviewer} {'<>'} {item?.candidate?.name}</span>
      </HoverCardTrigger>
      <HoverCardContent className="w-full">
        <div className="flex justify-between space-x-4">
          <Avatar>
            <AvatarImage src="/app/illustrations/agent-1-sm.webp" />
            <AvatarFallback>KA</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Ken Adams {"<>"} {item.candidate?.name}</h4>

            <div className="flex items-center pt-2">
              <User className="mr-2 h-4 w-4 opacity-70" />{" "}
              <span className="text-xs text-muted-foreground">
                <b>Candidate:</b>{' '}
                {item.candidate?.email}
              </span>
            </div>

            <div className="flex items-center">
              <Compass className="mr-2 h-4 w-4 opacity-70" />{" "}
              <span className="text-xs text-muted-foreground">
                <b>Job:</b>{' '}
                {toTitleCase(item?.job?.role)} ({item?.job?.job_id})
              </span>
            </div>

            <div className="flex items-center">
              <Contact className="mr-2 h-4 w-4 opacity-70" />{" "}
              <span className="text-xs text-muted-foreground">
                <b>Status:</b>{' '}
                {toTitleCase(item?.status)}
              </span>
            </div>

            <div className="flex items-center pt-2">
              <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
              <span className="text-xs text-muted-foreground">
                {format(new Date(item.start_datetime), 'MMM dd, yyyy')} - {format(new Date(item.end_datetime), 'MMM dd, yyyy')}
              </span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

export default function Schedule({  }) {
  const dispatch = useDispatch();

  const [scheduledItems, setScheduledItems] = useState([]);
  const [date, setDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(format(Date.now(), 'HH:mm'));
  const formattedDate = format(date, 'MMM dd, yyyy');

  const { error, loading, scheduled } = useSelector(state => state.retrieveScheduled);

  useEffect(() => {
    if (scheduled?.results) {
      const deepCloned = scheduled.results.map(item => ({ ...item }));
      setScheduledItems(deepCloned);
    }
  }, [scheduled]);


  useEffect(() => {
    if(error) {
      toast.error(error.message);
    } else if(!loading && !scheduled) {
      dispatch(retrieveScheduled({ date: date.toISOString() }));
    }
  }, [error]);


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(format(Date.now(), 'HH:mm'));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Calculate timeline start and end times
  let [timelineStartMinutes, timelineEndMinutes] = useMemo(() => {
    if(scheduledItems.length) {
      const startTimes = scheduledItems.map(item => {
        item.start = checkDateAndGetTime(item.start_datetime, date);
        return timeToMinutes(item.start, date)
      }); // check date before today
      let endTimes = scheduledItems.map(item => {
        item.end = checkDateAndGetTime(item.end_datetime, date);
        return timeToMinutes(item.end)
      });

      const minStartMinutes = Math.min(...startTimes);
      let maxEndMinutes = Math.max(...endTimes);

      if(maxEndMinutes - minStartMinutes < 360) {
        maxEndMinutes = minStartMinutes + 360;
      }

      return [Math.floor(minStartMinutes / 60) * 60, Math.ceil(maxEndMinutes / 60) * 60];
    }
    return [8*60, 11*60];
  }, [scheduledItems]);

  if(timelineEndMinutes-timelineStartMinutes<6*60) {
    timelineEndMinutes = timelineStartMinutes + 6*60;
  }

  const timelineDurationMinutes = timelineEndMinutes - timelineStartMinutes;

  // Generate array of hour markers
  const hours = useMemo(() => {
    const hrs = [];
    for (let m = timelineStartMinutes; m <= timelineEndMinutes; m += 60) {
      hrs.push(minutesToTime(m));
    }
    return hrs;
  }, [timelineStartMinutes, timelineEndMinutes]);

  // Define timeline dimensions
  const pixelsPerHour = 100; // Pixels per hour, adjustable
  const pixelsPerMinute = pixelsPerHour / 60;
  const timelineWidth = timelineDurationMinutes * pixelsPerMinute;
  const rowHeight = 40;      // Height per lane
  const itemHeight = 30;     // Height of each task bar

  // Assign lanes to handle overlapping tasks
  const itemsWithLanes = useMemo(() => {
    if(scheduledItems) {
      return assignLanes([...scheduledItems]);
    }
    return [];
  }, [scheduledItems]);

  const numLanes = itemsWithLanes?.length > 0 ? Math.max(...itemsWithLanes.map(i => i.laneIndex)) + 1 : 1;

  // Calculate left position and width
  const calculateLeft = (time) => (timeToMinutes(time) - timelineStartMinutes) * pixelsPerMinute;
  const calculateWidth = (start, end) => {
    return (timeToMinutes(end) - timeToMinutes(start)) * pixelsPerMinute;
  }

  return (
    <Card className="w-full max-w-xl h-full bg-card rounded-xl text-foreground">

      <div className='flex md:flex-row flex-col justify-between pr-4'>
        <CardHeader className="flex flex-row w-full my-auto items-center justify-between">
          <CardTitle>Today's Schedule</CardTitle>
        </CardHeader>

        <div className="flex items-center space-x-4 md:pl-0 md:pt-0 pl-4 pt-2">
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-[200px] justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon /> {formattedDate}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(value) => {
                    if(value == null) return;
                    setDate(value);
                    dispatch(retrieveScheduled({ date: value.toISOString() }));
                  }}
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      <CardContent className={cn("p-4 h-full w-full")}>
        <div className="relative h-full w-full">
          {/* Scrollable timeline */}
          {
            loading ? (
              <Loader />
            ) : scheduledItems ? (
              <div className={cn("overflow-x-auto overflow-y-auto h-full w-full", )}>
                <div className='h-full w-full' style={{ width: `${timelineWidth}px` }}>
                  {/* Timeline markers */}
                  <div className="flex justify-between mb-2" style={{ width: `${timelineWidth}px` }}>
                    {hours.map(time => (
                      <div key={time} className="text-sm text-foreground/60">{time}</div>
                    ))}
                  </div>
                  {/* Schedule area */}
                  <div
                    className="flex flex-col relative bg-muted/50 h-full"
                    // style={{ height: `${numLanes * rowHeight}px` }}
                  >
                    {/* Vertical dashed lines */}
                    {hours.map(time => (
                      <div
                        key={time}
                        className="absolute top-0 h-full border-l border-dashed border-gray-300"
                        style={{ left: `${calculateLeft(time)}px` }}
                      />
                    ))}
                    {/* Task bars */}
                    {itemsWithLanes.map(({ item, laneIndex }) => {
                      const color = Object.keys(colorMap)[laneIndex%(Object.keys(colorMap).length)];

                      return <div
                        key={laneIndex}
                        className={cn(
                          `absolute p-2 rounded-md my-auto shadow-sm text-foreground text-sm  border-l-4 truncate`,
                          colorMap[color].bg, colorMap[color].border
                        )}
                        style={{
                          left: `${calculateLeft(item.start)}px`,
                          width: `${calculateWidth(item.start, item.end)}px`,
                          top: `${laneIndex * rowHeight}px`,
                          height: `${itemHeight}px`,
                        }}
                      >
                        <ScheduleHoverCard item={item} />
                      </div>

                      // return <ScheduleHoverCard
                      //   key={laneIndex}
                      //   index={laneIndex}
                      //   item={item}
                      //   className={`${colorMap[color].bg} ${colorMap[color].border}`}
                      //   style={{
                      //     left: `${calculateLeft(item.start)}px`,
                      //     width: `${calculateWidth(item.start, item.end)}px`,
                      //     top: `${laneIndex * rowHeight}px`,
                      //     height: `${itemHeight}px`,
                      //   }}
                      // />
                    })}
                    {/* Current time indicator */}
                    {date.getDate() === new Date().getDate() && timeToMinutes(currentTime) >= timelineStartMinutes &&
                      timeToMinutes(currentTime) <= timelineEndMinutes && (
                        <div
                          className="absolute top-0 h-full w-0.5 bg-blue-500"
                          style={{ left: `${calculateLeft(currentTime)}px` }}
                        >
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            {currentTime}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ) : (
              <NoData text='Unable to fetch your interview statistics.' />
            )
          }
        </div>
      </CardContent>
    </Card>
  );
}