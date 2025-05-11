'use client';

import React, {useEffect, useMemo, useState} from 'react';
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  AtSign,
  CalendarCheck2,
  CalendarIcon, CalendarSync,
  Clock,
  Compass, EllipsisVertical,
  ExternalLink,
  Funnel,
  Inbox, Pencil,
  Phone, Plus,
  Timer, X
} from "lucide-react";
import DateRangePicker from "@/components/daterange-picker";
import {DATA} from "@/lib/data";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {
  cn,
  getScoreBadgeClasses,
  getStatusBadgeClasses,
  getStatusGradientClasses,
  isParamsEqual,
  toTitleCase
} from "@/lib/utils";
import {format} from "date-fns";
import {ChartContainer} from "@/components/ui/chart";
import {PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart} from "recharts";
import {redirect, useParams, useRouter, useSearchParams} from "next/navigation";
import NoData from "@/components/no-data";
import {Separator} from "@/components/ui/separator";
import Tooltip from "@/components/tooltip";
import ConfirmDialog from "@/components/confirm-dialog";
import PaginationBar from "@/components/pagination-bar";
import {
  DropdownMenu,
  DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import ScheduleInterviewSheet from "@/components/scheduling/schedule-interview-sheet";
import {useDispatch, useSelector} from "react-redux";
import {toast} from "sonner";
import {listInterviews, updateInterview} from "@/store/interview/actions";
import Loader from "@/components/loader";
import {useQueryRouter} from "@/hooks/use-query-router";
import {FEEDBACK_RETRIEVE_RESET} from "@/store/feedback/constants";
import {useScheduleInterview} from "@/contexts/schedule-interview-context";
import {INTERVIEW_RETRIEVE_SUCCESS, INTERVIEW_UPDATE_RESET} from "@/store/interview/constants";
import RadialProgress from "@/components/radial-progress";


// StatusBadge component to display interview status with styled badges
const StatusBadge = ({ className, status }) => {

  return (
    <span className={cn(
      'px-2 py-1 text-xs rounded-full',
      getStatusBadgeClasses(status),
      className,
    )}>
      {toTitleCase(status)}
    </span>
  );
};

// FilterModal component for applying filters
function FilterModal({ isOpen, onOpenChange, onApply, }) {
  const router = useRouter();
  const queryRouter = useQueryRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);

  const [scheduledAfter, setScheduledAfter] = useState(
    params.get('scheduled_from') && new Date(params.get('scheduled_from'))
  );
  const [scheduledBefore, setScheduledBefore] = useState(
    params.get('scheduled_till') && new Date(params.get('scheduled_till'))
  );
  const [selectedStatuses, setSelectedStatuses] = useState(params.getAll('status') || []);

  const statusOptions = ['Completed', 'In Progress', 'Scheduled', 'Expired', 'Incomplete', 'Error'];

  const handleFilterChange = () => {
    const queryParams = {}
    if(scheduledAfter) queryParams['scheduled_from'] = scheduledAfter.toISOString();
    if(scheduledBefore) queryParams['scheduled_till'] = scheduledBefore.toISOString();
    if(selectedStatuses.length > 0) queryParams['status'] = selectedStatuses.map(s => s.toLowerCase()).join(',')

    // router.push(`/interviews?${params.toString()}`, { scroll: false });
    queryRouter('/interviews', {
      preserveQuery: false,
      additionalQuery: queryParams,
    })
  };

  const handleApply = () => {
    onApply({
      scheduledAfter: scheduledAfter ? new Date(scheduledAfter) : undefined,
      scheduledBefore: scheduledBefore ? new Date(scheduledBefore) : undefined,
      statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
    });
    handleFilterChange()
    onOpenChange();
  };

  const handleStatusChange = (status, checked) => {
    if (checked) {
      setSelectedStatuses([...selectedStatuses, status]);
    } else {
      setSelectedStatuses(selectedStatuses.filter((s) => s !== status));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Interviews</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className='flex flex-col gap-2'>
            <Label>Scheduled Between</Label>
            <div className='flex flex-row my-auto gap-2'>
              <DateRangePicker
                startDate={scheduledAfter}
                endDate={scheduledBefore}
                onChange={(from, till) => {
                  setScheduledAfter(from);
                  setScheduledBefore(till);
                }}
                // className="w-fit"
              />
              <Button
                variant='destructive'
                onClick={() => {
                  setScheduledAfter(null);
                  setScheduledBefore(null);
                }}
              >
                Clear
              </Button>
            </div>
          </div>
          {/*<div>*/}
          {/*  <Label>Scheduled After</Label>*/}
          {/*  <Calendar*/}
          {/*    mode="single"*/}
          {/*    selected={scheduledAfter}*/}
          {/*    onSelect={setScheduledAfter}*/}
          {/*    className="mt-2"*/}
          {/*  />*/}
          {/*</div>*/}
          {/*<div>*/}
          {/*  <Label>Scheduled Before</Label>*/}
          {/*  <Calendar*/}
          {/*    mode="single"*/}
          {/*    selected={scheduledBefore}*/}
          {/*    onSelect={setScheduledBefore}*/}
          {/*    className="mt-2"*/}
          {/*  />*/}
          {/*</div>*/}
          <div>
            <Label>Status</Label>
            <div className="mt-2 space-y-2">
              {statusOptions.map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={status}
                    checked={selectedStatuses.includes(status)}
                    onChange={(e) => handleStatusChange(status, e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor={status}>{status}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleApply}>Apply Filters</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

function RescheduleModal({ isOpen, onOpenChange, interview }) {
  const dispatch = useDispatch();

  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);

  const { error, loading, interview: updatedInterview } = useSelector(state => state.updateInterview);

  useEffect(() => {
    if(error) {
      toast.error(error.message);
      onOpenChange(false);
    } else if(updatedInterview && isOpen) {
      toast.success('Successfully rescheduled interview!');
      onOpenChange(false);
      dispatch({
        type: INTERVIEW_UPDATE_RESET,
      })
    }
  }, [error, updatedInterview]);


  const handleSubmit = () => {
    if(!start) {
      toast.error('Please select valid start date.');
      return;
    }
    if(!end) {
      toast.error('Please select valid end date.');
      return;
    }
    dispatch(updateInterview(interview.id, {
      start_datetime: start,
      end_datetime: end,
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule {interview.candidate?.first_name}&apos;s interview</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-4">
          <div className='flex flex-col gap-2'>
            <Label>Reschedule</Label>
            <div className='flex flex-row my-auto gap-2'>
              <DateRangePicker
                startDate={interview?.start_datetime}
                endDate={interview?.end_datetime}
                onChange={(from, till) => {
                  setStart(from.toISOString());
                  setEnd(till.toISOString());
                }}
                // className="w-fit"
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-start pt-2">
            Note: Click on the start date in picker to reset the range.
            {/* Add more specific TZ handling UI if required */}
          </p>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={loading || !start || !end}>
            {
              loading ? (
                <Loader />
              ) : (
                'Submit'
              )
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InterviewMenu({ interview }) {
  const validInterviewModifiableStates = ['pending', 'scheduled']

  const dispatch = useDispatch();

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  const { error, loading, interview: updatedInterview } = useSelector(state => state.updateInterview)

  useEffect(() => {
    if(error) {
      toast.error("Something went wrong. Please try again later to cancel the interview.");
    } else if(updatedInterview && isConfirmModalOpen) {
      toast.success("Interview successfully cancelled!");
      setIsConfirmModalOpen(false);
      dispatch({
        type: INTERVIEW_UPDATE_RESET
      });
    }
  }, [error, updatedInterview]);


  const handleCancel = () => {
    dispatch(updateInterview(interview.id, {
      status: 'cancelled',
    }));
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <span className='p-2 rounded-md hover:bg-muted cursor-pointer'>
              <EllipsisVertical className='h-4 w-4' />
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="">
          <DropdownMenuLabel>Interview Menu</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setIsDetailModalOpen(true)}>
              <ExternalLink />
              <span>View Details</span>
              {/*<DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>*/}
            </DropdownMenuItem>

            <DropdownMenuItem disabled={!validInterviewModifiableStates.includes(interview.status)} onClick={() => setIsRescheduleModalOpen(true)}>
              <CalendarSync />
              <span>Reschedule</span>
              {/*<DropdownMenuShortcut>⌘B</DropdownMenuShortcut>*/}
            </DropdownMenuItem>

            <DropdownMenuItem disabled={!validInterviewModifiableStates.includes(interview.status)} className='text-destructive hover:text-destructive focus:text-destructive' onClick={() => setIsConfirmModalOpen(true)}>
              <X className='text-destructive' />
              <span className='text-desctrctive hover:text-destructive'>Cancel Interview</span>
              {/*<DropdownMenuShortcut>⌘B</DropdownMenuShortcut>*/}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>


      <InterviewDetailModal
        isOpen={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        interview={interview}
      />

      <ConfirmDialog
        loading={loading}
        variant='cancel'
        handleAction={handleCancel}
        isOpen={isConfirmModalOpen}
        onOpenChange={setIsConfirmModalOpen}
        title='Confirm interview cancellation'
        description={`Are you sure you want to cancel ${interview.first_name}'s interview? It is an irreversible action.`}
      />

      <RescheduleModal
        isOpen={isRescheduleModalOpen}
        onOpenChange={setIsRescheduleModalOpen}
        interview={interview}
      />
    </>
  )
}

function RadialProgressV0({ value, className }) {
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
}

function InterviewDetailModal({ interview, isOpen, onOpenChange, trigger=false }) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {
        trigger && (
          <DialogTrigger asChild>
            <div className={cn(
              'flex flex-row h-fit w-fit p-1 m-auto rounded-full',
              'bg-blue-600/20 hover:bg-blue-600/30'
            )}
              // onClick={(e) => {
              //   e.stopPropagation();
              // }}
            >
              <Tooltip content="Details">
                <ExternalLink className={cn(
                  'h-3 w-3',
                )} />
              </Tooltip>
            </div>
          </DialogTrigger>
        )
      }
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{interview.candidate.first_name} {interview.candidate.last_name}&apos;s Interview</DialogTitle>
        </DialogHeader>

        <div className='flex flex-col w-full h-full justify-between space-between gap-2'>
          <div className='flex flex-row w-full'>
            <div className="flex-1 flex-col w-full">
              <div
                className="flex items-center space-x-4 text-foreground"
              >
                <div className='flex flex-col m-auto h-full w-full gap-2'>
                  <div className='flex flex-row gap-2 mb-1'>
                    <StatusBadge
                      className='w-fit text-sm'
                      status={toTitleCase(interview.status)}
                    />
                  </div>

                  <table className="w-full text-sm">
                    <tbody>
                    <tr>
                      <td><AtSign className="h-4 w-4" /></td>
                      <td className="font-medium px-4">Email:</td>
                      <td className="text-left">{interview.candidate.email}</td>
                    </tr>
                    <tr>
                      <td><Phone className="h-4 w-4" /></td>
                      <td className="font-medium px-4">Phone:</td>
                      <td className="text-left">{interview.candidate.phone}</td>
                    </tr>
                    <tr>
                      <td><CalendarIcon className="h-4 w-4" /></td>
                      <td className="font-medium px-4">Scheduled From:</td>
                      <td className="text-left">
                        {interview.start_datetime ? format(new Date(interview.start_datetime), 'MMM dd, yyyy hh:mm:ss a') : 'N.A'}
                      </td>
                    </tr>
                    <tr>
                      <td><CalendarIcon className="h-4 w-4" /></td>
                      <td className="font-medium px-4">Scheduled Till:</td>
                      <td className="text-left">
                        {interview.end_datetime ? format(new Date(interview.end_datetime), 'MMM dd, yyyy hh:mm:ss a') : 'N.A'}
                      </td>
                    </tr>
                    <tr>
                      <td><CalendarCheck2 className="h-4 w-4" /></td>
                      <td className="font-medium px-4">Completed:</td>
                      <td className="text-left">
                        {interview.status !== 'completed'
                          ? 'N.A'
                          : interview.ended_datetime
                            ? format(new Date(interview.ended_datetime), 'MMM dd, yyyy hh:mm:ss a')
                            : 'N.A'}
                      </td>
                    </tr>
                    <tr>
                      <td><Timer className="h-4 w-4" /></td>
                      <td className="font-medium px-4">Duration:</td>
                      <td className="text-left">
                        {interview.status !== 'completed'
                          ? 'N.A'
                          : interview.started_datetime && interview.ended_datetime
                            ? `${Math.round((new Date(interview.ended_datetime).getTime() - new Date(interview.started_datetime).getTime()) / 60000)} min`
                            : 'N.A'}
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/*<div className='flex flex-row w-full'>*/}
          {/*  <LinearProgress value={interview.score} />*/}
          {/*</div>*/}
        </div>

      </DialogContent>
    </Dialog>
  )
}


function InterviewList() {
  const { id } = useParams();
  const router = useRouter();
  const  queryRouter = useQueryRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const searchString = searchParams.toString();   // to prevent reload as when we do router.push('/interview/${id}') a new object of searchParams is created.
  const params = new URLSearchParams(searchParams);

  const [filters, setFilters] = useState({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const { interviews, error, loading } = useSelector(state => state.listInterviews);

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    } else if (!interviews && !loading) {
      const queryParams = {}
      searchParams.forEach((value, key) => {
        queryParams[key] = value;
      });

      dispatch(listInterviews(queryParams));
    }
  }, [error, interviews, loading, dispatch]);

  useEffect(() => {
    const queryParams = {}
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    if ((Object.keys(queryParams).length) && !loading) {
      dispatch(listInterviews(queryParams));
    }
  }, [searchString]);


  const handleInterviewClick = (interview) => {
    // Placeholder for showing details (can be expanded later)
    if(interview.id === id) return;

    queryRouter(`/interviews/${interview.id}`, {
      preserveQuery: true
    });
  };

  return (
    <div className="flex flex-col h-full w-full">
      {
        loading ? (
          <Loader />
        ) : interviews ? (
          <Card className="w-full h-full flex flex-col p-0 gap-0 border-0 shadow-none rounded-br-none">
            <CardHeader className="flex flex-row items-center justify-between py-3 bg-muted">
              <CardTitle className=''>Scheduled Interviews</CardTitle>


              <div className='flex flex-row gap-2'>
                <Tooltip content='Create'>
                  <div className='border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 rounded-full p-2 h-auto w-auto cursor-pointer' onClick={() => setIsScheduleOpen(true)}>
                    <span><Plus className='h-4 w-4' /></span>
                  </div>
                </Tooltip>

                <Tooltip content='Filters'>
                  <div className='border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 rounded-full p-2 h-auto w-auto cursor-pointer' onClick={() => setIsFilterOpen(true)}>
                    <span><Funnel className='h-4 w-4' /></span>
                  </div>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0 scrollbar-thin">
              {
                interviews?.count ? (
                  <ul className="divide-y divide-border">
                    {interviews.results.map((interview) => (
                      <li
                        key={interview.id}
                        className={cn(
                          "flex flex-row space-x-4 p-4 hover:bg-muted/40 hover:cursor-pointer z-10",
                          id && id === interview.id ? 'bg-muted/40' : ''
                        )}
                        onClick={() => {
                          handleInterviewClick(interview)
                        }}
                      >
                        <div className="flex-1 flex-col justify-between">
                          <div
                            key={interview.id}
                            className="flex items-center space-x-4"
                          >

                            <div>
                              <p className="text-sm font-bold text-foreground">
                                {interview.candidate.first_name} {interview.candidate.last_name}
                              </p>
                              <div className="flex flex-row text-xs text-foreground/60 gap-1">
                                {interview.job?.role || 'Software Engineer'}{' '}({interview.job?.job_id})
                              </div>

                              <div className="flex flex-row text-xs text-foreground/60">
                                <div className='flex flex-row gap-1 my-auto'>
                                  <span className='flex flex-col my-auto'><CalendarIcon className='h-3 w-3' /></span>
                                  <span className='flex flex-col'>{format(new Date(interview.created), 'MMM dd, yyyy')}</span>
                                </div>
                              </div>

                              <StatusBadge
                                className='mt-2 w-fit'
                                status={interview.status}
                              />
                            </div>
                          </div>
                        </div>

                        <div className='flex flex-col'>
                          <RadialProgress value={interview.score || 0} />
                        </div>

                        <div className='flex flex-col h-full gap-0 justify-between items-center align-center z-20 my-auto'
                             onClick={(e) => {
                               e.stopPropagation();
                             }}
                        >
                          <InterviewMenu interview={interview} />
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <NoData text='No interviews scheduled.' />
                )
              }
            </CardContent>

            <CardFooter className='border-t-1 py-2'>
              <PaginationBar currentPage={interviews.page} pages={interviews.pages} next={interviews.next} previous={interviews.previous} overflow={4} />
            </CardFooter>
          </Card>
        ) : (
          <NoData text='Something went wrong. Unable to fetch data.' />
        )
      }

      <FilterModal
        isOpen={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        currentFilters={filters}
        onApply={setFilters}
      />

      <ScheduleInterviewSheet isOpen={isScheduleOpen} onOpenChange={setIsScheduleOpen} />
    </div>
  );
}

export default function InterviewLayout({ children }) {
  const { id } = useParams();

  return (
      <div className='grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-5.05rem)] overflow-hidden'>
        <div className={cn(
            'w-full h-full overflow-y-auto border-r-1 scrollbar-thin',
            id ? 'md:col-span-1 md:block hidden' : 'md:col-span-1'
        )}>
          <InterviewList />
        </div>

        <div className={cn(
            'w-full col-span-2 overflow-y-auto p-4 scrollbar-thin',
            // 'bg-sidebar',
            id ? 'md:col-span-2' : 'md:col-span-2 md:block hidden'
        )}>
          {children}
        </div>
      </div>
  )
}
