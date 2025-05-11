"use client"

import {useParams, useRouter, useSearchParams} from "next/navigation";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {
    Calendar,
    CalendarIcon,
    CalendarSync,
    Compass,
    EllipsisVertical,
    Funnel,
    IdCard,
    Mail, Pencil,
    Phone,
    Plus,
    X
} from "lucide-react";
import {DATA} from "@/lib/data";
import {cn, getRoleIcon, isParamsEqual} from "@/lib/utils";
import {format} from "date-fns";
import Tooltip from "@/components/tooltip";
import ConfirmDialog from "@/components/confirm-dialog";
import PaginationBar from "@/components/pagination-bar";
import React, {useEffect, useRef, useState} from "react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import JobFormSheet from "@/components/job-form-sheet";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {useQueryParams} from "@/lib/hooks";
import NoData from "@/components/no-data";
import {useDispatch, useSelector} from "react-redux";
import {toast} from "sonner";
import {listJobs} from "@/store/job/actions";
import {listCandidates} from "@/store/candidate/actions";
import {useQueryRouter} from "@/hooks/use-query-router";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import DateRangePicker from "@/components/daterange-picker";
import Loader from "@/components/loader";
import {listStages} from "@/store/stage/actions";

function FilterModal({ isOpen, onClose, onApply, }) {
    const router = useRouter();
    const queryRouter = useQueryRouter();
    const searchParams = useSearchParams();
    const params = new URLSearchParams(searchParams);

    const [createdAfter, setCreatedAfter] = useState(
      params.get('created_from') && new Date(params.get('created_from'))
    );
    const [createdBefore, setCreatedBefore] = useState(
      params.get('created_till') && new Date(params.get('created_till'))
    );
    const [selectedStatuses, setSelectedStatuses] = useState(params.getAll('status') || []);

    const statusOptions = ['Completed', 'In Progress', 'Created', 'Expired', 'Incomplete', 'Error'];

    const handleFilterChange = () => {
        const queryParams = {}
        if(createdAfter) queryParams['created_from'] = createdAfter.toISOString();
        if(createdBefore) queryParams['created_till'] = createdBefore.toISOString();
        if(selectedStatuses.length > 0) queryParams['status'] = selectedStatuses.map(s => s.toLowerCase()).join(',')

        // router.push(`/interviews?${params.toString()}`, { scroll: false });
        queryRouter('/jobs/templates', {
            preserveQuery: false,
            additionalQuery: queryParams,
        })
    };

    const handleApply = () => {
        onApply({
            createdAfter: createdAfter ? new Date(createdAfter) : undefined,
            createdBefore: createdBefore ? new Date(createdBefore) : undefined,
            statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
        });
        handleFilterChange()
        onClose();
    };

    const handleStatusChange = (status, checked) => {
        if (checked) {
            setSelectedStatuses([...selectedStatuses, status]);
        } else {
            setSelectedStatuses(selectedStatuses.filter((s) => s !== status));
        }
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-md">
              <DialogHeader>
                  <DialogTitle>Filter Jobs</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                  <div className='flex flex-col gap-2'>
                      <Label>Created Between</Label>
                      <div className='flex flex-row my-auto gap-2'>
                          <DateRangePicker
                            startDate={createdAfter}
                            endDate={createdBefore}
                            onChange={(from, till) => {
                                setCreatedAfter(from);
                                setCreatedBefore(till);
                            }}
                            className="w-fit"
                          />
                          <Button
                            variant='destructive'
                            onClick={() => {
                                setCreatedAfter(null);
                                setCreatedBefore(null);
                            }}
                          >
                              Clear
                          </Button>
                      </div>
                  </div>
                  {/*<div>*/}
                  {/*  <Label>Created After</Label>*/}
                  {/*  <Calendar*/}
                  {/*    mode="single"*/}
                  {/*    selected={createdAfter}*/}
                  {/*    onSelect={setCreatedAfter}*/}
                  {/*    className="mt-2"*/}
                  {/*  />*/}
                  {/*</div>*/}
                  {/*<div>*/}
                  {/*  <Label>Created Before</Label>*/}
                  {/*  <Calendar*/}
                  {/*    mode="single"*/}
                  {/*    selected={createdBefore}*/}
                  {/*    onSelect={setCreatedBefore}*/}
                  {/*    className="mt-2"*/}
                  {/*  />*/}
                  {/*</div>*/}

                  {/*<div>*/}
                  {/*    <Label>Status</Label>*/}
                  {/*    <div className="mt-2 space-y-2">*/}
                  {/*        {statusOptions.map((status) => (*/}
                  {/*          <div key={status} className="flex items-center space-x-2">*/}
                  {/*              <input*/}
                  {/*                type="checkbox"*/}
                  {/*                id={status}*/}
                  {/*                checked={selectedStatuses.includes(status)}*/}
                  {/*                onChange={(e) => handleStatusChange(status, e.target.checked)}*/}
                  {/*                className="h-4 w-4"*/}
                  {/*              />*/}
                  {/*              <Label htmlFor={status}>{status}</Label>*/}
                  {/*          </div>*/}
                  {/*        ))}*/}
                  {/*    </div>*/}
                  {/*</div>*/}
              </div>
              <div className="flex justify-end">
                  <Button onClick={handleApply}>Apply Filters</Button>
              </div>
          </DialogContent>
      </Dialog>
    );
};

function JobMenu({ job }) {
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <span className='p-2 rounded-md hover:bg-muted cursor-pointer'>
                        <EllipsisVertical className='h-4 w-4' />
                    </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="">
                    <DropdownMenuLabel>Job Menu</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        {/*<DropdownMenuItem>*/}
                        {/*    <CalendarSync />*/}
                        {/*    <span>Schedule Interview</span>*/}
                        {/*    /!*<DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>*!/*/}
                        {/*</DropdownMenuItem>*/}

                        <DropdownMenuItem onClick={() => setIsEditSheetOpen(true)}>
                            <Pencil />
                            <span>Edit Job</span>
                            {/*<DropdownMenuShortcut>⌘B</DropdownMenuShortcut>*/}
                        </DropdownMenuItem>

                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <JobFormSheet job={job} isOpen={isEditSheetOpen} onOpenChange={setIsEditSheetOpen} />
        </>
    )
}

function JobList() {
    // const { id } = useParams();
    const dispatch = useDispatch();
    const searchParams = useSearchParams();
    const searchString = searchParams.toString();
    const params = new URLSearchParams(searchParams);
    const updateQueryParams = useQueryParams();
    const router = useRouter();

    const [filters, setFilters] = useState({});
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [openJobCreateSheet, setOpenJobCreateSheet] = useState(false);

    // Filter the interviews based on the current filters
    const {error, loading, jobs} = useSelector(state => state.listJobs);

    useEffect(() => {
        if (error) {
            toast.error(error.message);
        } else if (!jobs && !loading) {
            dispatch(listJobs());
        }
    }, [error, jobs, loading, dispatch]);

    useEffect(() => {
        const queryParams = {}
        searchParams.forEach((value, key) => {
            queryParams[key] = value;
        });


        if ((Object.keys(queryParams).length) && !loading) {
            dispatch(listJobs(queryParams));
        }
    }, [searchString]);


    const handleJobClick = (job) => {
        // Placeholder for showing details (can be expanded later)
        // router.push(`/jobs/templates/${job.id}`);
        updateQueryParams({ id: job.id });
    };

    return (
        <div className="flex flex-col h-full w-full">
            {
                loading ? (
                  <Loader />
                ) : jobs ? (
                  <Card className="w-full h-full flex flex-col p-0 gap-0 border-0 shadow-none rounded-br-none">
                      <CardHeader className="flex flex-row items-center justify-between py-2 bg-muted">
                          <CardTitle className=''>Jobs</CardTitle>

                          <div className='flex flex-row gap-2'>
                              <Tooltip content='Create'>
                                  <div className='border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 rounded-full p-2 h-auto w-auto cursor-pointer' onClick={() => setOpenJobCreateSheet(true)}>
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
                              jobs.count ? (
                                <ul className="divide-y divide-border">
                                    {jobs.results.map((job) => (
                                      <li
                                        key={job.id}
                                        className={cn(
                                          "flex flex-row space-x-4 p-4 hover:bg-muted/40 hover:cursor-pointer z-10",
                                          params && params.get('id') === job.id ? 'bg-muted/40' : ''
                                        )}
                                        onClick={() => {
                                            handleJobClick(job)
                                        }}
                                      >
                                          <div className="flex flex-row justify-between w-full">
                                              <div
                                                key={job.id}
                                                className="flex items-center space-x-4"
                                              >
                                                  <Avatar className="h-10 w-10 item-start align-top">
                                                      <AvatarImage src={job.avatar || null} alt={job.first_name} />
                                                      <AvatarFallback>{getRoleIcon(job.role)}</AvatarFallback>
                                                  </Avatar>

                                                  <div>
                                                      <p className="text-sm font-bold text-foreground">
                                                          {job.title}
                                                      </p>
                                                      <div className="flex flex-row text-xs text-foreground/60 gap-1">
                                                          <span><IdCard className='h-3.5 w-3.5' /></span>
                                                          <span className='flex flex-col'>{job.job_id}</span>
                                                      </div>

                                                      <div className="flex flex-row text-xs text-foreground/60 gap-1">
                                                          <span><Compass className='h-3.5 w-3.5' /></span>
                                                          <span className='flex flex-col'>{job.role}</span>
                                                      </div>

                                                      <div className="flex flex-row text-xs text-foreground/60 gap-1">
                                                          <span><Calendar className='h-3.5 w-3.5' /></span>
                                                          <span className='flex flex-col'>{format(new Date(job.created), 'MMM dd, yyyy hh:mm:ss a')}</span>
                                                      </div>
                                                  </div>
                                              </div>

                                              <div className='flex flex-col h-full' onClick={(e) => e.stopPropagation()}>
                                                  <JobMenu job={job} />
                                              </div>
                                          </div>

                                      </li>
                                    ))}
                                </ul>
                              ) : (
                                <NoData text='No job template created' />
                              )
                          }
                      </CardContent>

                      <CardFooter className='border-t-1 py-2'>
                          <PaginationBar currentPage={jobs.page} pages={jobs.pages} next={jobs.next} previous={jobs.previous} overflow={4} />
                      </CardFooter>
                  </Card>
                ) : (
                  <NoData text='Something went wrong. Please try again later.' />
                )
            }


            {/* Sheets and modals */}
            <JobFormSheet
                isOpen={openJobCreateSheet}
                onOpenChange={setOpenJobCreateSheet}
            />
            <FilterModal
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                currentFilters={filters}
                onApply={setFilters}
            />
        </div>
    );
}

export default function JobLayout({ children }) {
    const searchParams = useSearchParams();
    const params = new URLSearchParams(searchParams);
    const selectedJobRef = useRef(null);
    const id = params.get('id');

    return (
        <div className='grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-5.05rem)] overflow-hidden'>
            <div className={cn(
                'w-full h-full overflow-y-auto border-r-1 scrollbar-thin',
                id ? 'md:col-span-1 md:block hidden' : 'md:col-span-1'
            )}>
                <JobList />
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