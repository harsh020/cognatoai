"use client"

import Image from "next/image";
import Link from "next/link";
import Schedule from "@/components/schedule";
import StatBlock from "@/components/statblock";
import {DATA} from "@/lib/data";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import {Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis} from "recharts";
import {useEffect, useMemo, useState} from "react";
import DateRangePicker from "@/components/daterange-picker";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {Calendar, CalendarCheck2, CalendarSync, CalendarX2, Compass, ExternalLink, X} from "lucide-react";
import {format} from "date-fns";
import {cn, getRoleBadgeClasses, getScoreBadgeClasses, toTitleCase} from "@/lib/utils";
import Table from "@/components/table";
import {Badge} from "@/components/ui/badge";
import Tooltip from "@/components/tooltip";
import RadialProgress from "@/components/radial-progress";
import {useDispatch, useSelector} from "react-redux";
import {toast} from "sonner";
import {
  retrieveDailySummary,
  retrieveRecentUpcoming,
  retrieveScheduled,
  retrieveSummary
} from "@/store/interview/actions";
import NoData from "@/components/no-data";
import Loader from "@/components/loader";

const statsColors = [
  'bg-conic-110 from-purple-900 to-purple-500',
  'bg-conic-110 from-teal-900 to-teal-500',
  'bg-conic-110 from-sky-900 to-sky-500',
  'bg-conic-110 from-indigo-900 to-indigo-500',
]

const newStatsColors = [
  'bg-gradient-to-br from-purple-900 to-purple-500',
  'bg-gradient-to-br from-teal-900 to-teal-500',
  'bg-gradient-to-br from-sky-900 to-sky-500',
  'bg-gradient-to-br from-indigo-900 to-indigo-500'
]

function StatsBlocks() {
  const dispatch = useDispatch();
  const { error, loading, summary } = useSelector(state => state.retrieveSummary);

  useEffect(() => {
    if(error) {
      toast.error(error.message);
    } else if(!loading && !summary) {
      dispatch(retrieveSummary());
    }
  }, [error]);

  const stats = useMemo(() => {
    if(summary?.data) {
      const interviewStats = {};
        summary.data.forEach(s => {
          interviewStats[s.status] = s.total;
      })
      return interviewStats;
    }
  }, [summary]);

  const total = useMemo(() => {
    return summary?.data.reduce((sum, item) => sum + item.total, 0)
  }, [summary]);


  return (
    <div className='flex flex-row h-full w-full'>
      {
        loading ? (
          <Loader />
        ) : summary && stats ? (
          <div className="flex flex-row w-full gap-4 md:flex-nowrap flex-wrap">
            {/* Total Employees Block */}
            <StatBlock
              label="Total Interviews"
              value={new Intl.NumberFormat("en-US").format(total)}
              className='bg-gradient-to-br from-blue-900 to-blue-500'
            />
            {/* Total Payroll Block */}

            {/* See how currency is formatted using Intl */}
            {/*<StatBlock*/}
            {/*  label="Interviews Pending"*/}
            {/*  value={new Intl.NumberFormat("en-US", {*/}
            {/*    style: "currency",*/}
            {/*    currency: "USD",*/}
            {/*  }).format(interviewsPending)}*/}
            {/*  fromColor="teal-900"*/}
            {/*  toColor="teal-500"*/}
            {/*/>*/}

            {
              Object.keys(stats).map((stat, index) => (
                <StatBlock
                  key={index}
                  label={`Interviews ${toTitleCase(stat)}`}
                  value={new Intl.NumberFormat("en-US").format(stats[stat])}
                  className={newStatsColors[Math.floor(index%statsColors.length)]}
                />
              ))
            }
          </div>
        ) : (
          <NoData text='Unable to fetch your interview statistics.' />
        )
      }
    </div>
  );
}

function InterviewsChart() {
  const dispatch = useDispatch();

  // Set default date range to past 7 days
  const today = new Date();
  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - 6);

  const [startDate, setStartDate] = useState(pastDate);
  const [endDate, setEndDate] = useState(today);

  const { error, loading, dailySummary } = useSelector(state => state.retrieveDailySummary);

  // Generate data based on selected date range
  const chartConfig = {
    scheduled: {
      label: "Scheduled",
      color: "var(--chart-6)",
    },
    completed: {
      label: "Completed",
      color: "var(--chart-7)",
    },
  }

  useEffect(() => {
    if(error) {
      toast.error(error.message);
    } else if(!dailySummary && !loading) {
      dispatch(retrieveDailySummary({
        'start': startDate.toISOString(),
        'end': endDate.toISOString()
      }));
    }
  }, [error, startDate, endDate]);

  const totalScheduled = useMemo(() => {
    return dailySummary?.data.reduce((sum, item) => sum + item.scheduled, 0);
  }, [dailySummary]);

  const totalCompleted = useMemo(() => {
    return dailySummary?.data.reduce((sum, item) => sum + item.completed, 0);
  }, [dailySummary]);

  return (
    <Card className='w-full'>

      <div className='flex md:flex-row flex-col justify-between pr-4'>
        <CardHeader className='w-full my-auto'>
          {/* Header with title, totals, and date range picker */}
          <div className="flex flex-row w-full justify-between items-center">
            <div>
              <CardTitle className="">Daily Interviews</CardTitle>
            </div>
          </div>
        </CardHeader>

        <DateRangePicker
          className='md:pl-0 pl-4'
          startDate={startDate}
          endDate={endDate}
          onChange={(from, till) => {
            setStartDate(val => from);
            setEndDate(val => till);
          }}
        />
      </div>

      <CardDescription>
        <div className='flex flex-row w-full h-full'>
          <div className='flex flex-col w-full border-t-[1px] border-b-[1px] border-r-[1px] p-4 my-auto h-full'>
            <h2 className='text-md font-medium text-primary'>Total Count</h2>
            <span className='md:text-md md:block hidden'>Count of total interview activity in the selected timeframe.</span>
          </div>

          <div className='flex flex-col flex-1 w-full border-t-[1px] border-b-[1px] border-r-[1px] p-4 hover:bg-muted/80 h-full'>
            <span className='text-md'>Scheduled</span>
            <h2 className='text-2xl font-medium text-primary'>
              {totalScheduled || '0'}
            </h2>
          </div>
          <div className='flex flex-col flex-1 w-full border-t-[1px] border-b-[1px] p-4 hover:bg-muted/80 h-full'>
            <span className='text-md'>Completed</span>
            <h2 className='text-2xl font-medium text-primary'>{totalCompleted || '0'}</h2>
          </div>
        </div>
      </CardDescription>

      <CardContent>
        {/* Stacked Bar Chart */}
        {
          loading ? (
            <Loader />
          ) : dailySummary ? (
            <ChartContainer config={chartConfig}>
              <BarChart accessibilityLayer data={dailySummary.data}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  // tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="completed"
                  stackId="a"
                  fill="var(--color-completed)"
                  radius={[0, 0, 4, 4]}
                />
                <Bar
                  dataKey="scheduled"
                  stackId="a"
                  fill="var(--color-scheduled)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <NoData text='Unable to fetch your interview statistics.' />
          )
        }
      </CardContent>
    </Card>
  );
}


function RecentInterviews() {
  const dispatch = useDispatch();
  const interviews = DATA.completedInterviews;

  const { error, loading, recentUpcoming } = useSelector(state => state.retrieveRecentUpcoming)

  useEffect(() => {
    if(error) {
      toast.error(error.message);
    } else if(!loading && !recentUpcoming) {
      dispatch(retrieveRecentUpcoming());
    }
  }, [error]);

  return (
    <Card className='w-full h-full m-auto '>
      <CardHeader>
        <CardTitle className="text-foreground">
          Recently Completed Interviews
        </CardTitle>
      </CardHeader>
      <CardContent className='max-h-[62vh] overflow-y-auto scrollbar-thin'>
        {/* Tabs */}
        {/*<div className="flex space-x-2 mb-4">*/}
        {/*  <Button className="bg-blue-100 text-blue-700 rounded-md px-4 py-2">*/}
        {/*    Completed*/}
        {/*  </Button>*/}
        {/*  <Button className="bg-white text-gray-500 border border-gray-300 rounded-md px-4 py-2">*/}
        {/*    Upcoming*/}
        {/*  </Button>*/}
        {/*</div>*/}
        {/* Interview List */}

        <div className='h-full w-full'>
          {
            loading ? (
              <Loader />
            ) : recentUpcoming?.completed.length ? (
              <div className="space-y-4 ">
                {recentUpcoming.completed.map((interview, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-2 border-b last:border-b-0 justify-between"
                  >
                    <div className='flex flex-row my-auto gap-2'>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={interview.candidate?.avatar || null} alt={interview.candidate?.name} />
                        <AvatarFallback>{interview.candidate.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {interview.candidate.name}
                        </p>
                        <div className="flex flex-row text-xs text-foreground/60 gap-1">
                          <span className='flex flex-col'>{interview.job.role}</span>
                        </div>

                        <div className="flex flex-row text-xs text-foreground/60">
                          <div className='flex flex-row gap-1 my-auto'>
                            <span className='flex flex-col my-auto'><Calendar className='h-3 w-3' /></span>
                            <span className='flex flex-col'>{format(new Date(interview.ended_datetime), 'MMM dd, yyyy HH:mm')}</span>
                          </div>

                        </div>
                      </div>
                    </div>
                    <RadialProgress value={interview.score || 0} className='h-16 w-16' />
                  </div>
                ))}
              </div>
            ) : recentUpcoming ? (
              <NoData text='No interviews scheduled yet.' />
            ) : (
              <NoData text='Unable to fetch your interview statistics.' />
            )
          }
        </div>
      </CardContent>
    </Card>
  );
}

const interviewTableColumns = [
  {
    id: 'candidate',
    header: 'Candidate',
    cell: ({row}) => {
      return <div className='flex flex-col'>
        <span className='flex flex-row font-semibold text-sm'>{row.first_name} {row.last_name}</span>
        <span className='flex flex-row text-[12px] text-foreground/50'>{row.candidate}</span>
        <span className='flex flex-row text-[12px] text-foreground/50'>{row.phone}</span>
        {/*<span className='flex flex-row text-[12px] text-foreground/50'>{row.role}</span>*/}
      </div>
    },
    enableSorting: false,
    enableHiding: false,
  },
  // {
  //   id: 'schedule',
  //   header: 'Schedule',
  //   cell: ({row}) => {
  //     return <div className='flex flex-col text-[12px]'>
  //       <div className='flex flex-row gap-1'>
  //         <span className='flex flex-col'><CalendarCheck2 className='h-3 w-3 my-auto' /></span>
  //         <span className='flex flex-col'>{format(row.start_datetime, 'dd/MM/yyyy HH:mm')}</span>
  //       </div>
  //
  //       <div className='flex flex-row gap-1'>
  //         <span className='flex flex-col'><CalendarX2 className='h-3 w-3 my-auto' /></span>
  //         <span className='flex flex-col'>{format(row.end_datetime, 'dd/MM/yyyy HH:mm')}</span>
  //       </div>
  //     </div>
  //   },
  // },
  {
    id: 'role',
    header: 'Role',
    cell: ({row}) => {
      return <div className={cn('w-fit text-[11px] rounded-lg px-2 py-0.5 border-[1px] my-auto', getRoleBadgeClasses(row.role))}>{row.role}</div>
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({row}) => {
      return <div className='flex flex-row lg:flex-nowrap flex-wrap gap-0'>
        <span className='px-1 my-auto rounded-sm hover:bg-muted'>
          <Tooltip content="Details">
            <ExternalLink className='h-3.5 w-3.5' />
          </Tooltip>
        </span>

        <span className='px-1 my-auto rounded-sm hover:bg-muted'>
          <Tooltip content="Reschedule">
            <CalendarSync className='h-3.5 w-3.5' />
          </Tooltip>
        </span>

        <span className='px-1 my-auto rounded-sm hover:bg-destructive/20 hover:text-foreground'>
          <Tooltip content="Cancel">
            <X className='h-3.5 w-3.5 text-destructive' />
          </Tooltip>
        </span>
      </div>
    },
    enableSorting: false,
    enableHiding: false,
  },
]

function UpcomingInterviews() {
  const { error, loading, recentUpcoming } = useSelector(state => state.retrieveRecentUpcoming)

  return (
    <Card className='w-full h-full m-auto'>
      <CardHeader>
        <CardTitle className="text-foreground">
          Upcoming Interviews
        </CardTitle>
      </CardHeader>

      <CardContent className='h-[36vh] overflow-y-auto scrollbar-thin'>
        {
          recentUpcoming ? (
            <Table className='w-full' data={recentUpcoming?.upcoming} columns={interviewTableColumns} loading={loading} />
          ) : (
            <NoData text='Unable to fetch your interview statistics.' />
          )
        }
      </CardContent>
    </Card>
  );
}


export default function Dashboard() {


  return (
    <div className="flex flex-col lg:flex-nowrap flex-wrap gap-4 h-full w-full p-4">
      <div className='flex flex-row w-full'>
        <StatsBlocks />
      </div>

      <div className='flex flex-row lg:flex-nowrap flex-wrap w-full gap-4'>
        <div className='flex flex-col lg:w-[60%] w-full'>
          <InterviewsChart />
        </div>

        <div className='flex flex-col lg:w-[40%] w-full h-full'>
          <RecentInterviews />
        </div>
      </div>

      <div className='flex flex-row lg:flex-nowrap flex-wrap w-full gap-4'>
        <div className='flex lg:flex-col w-full flex-row h-full'>
          <UpcomingInterviews />
        </div>

        <div className='flex lg:flex-col w-full flex-row h-full'>
          <Schedule />
        </div>
      </div>
    </div>
  );
}
