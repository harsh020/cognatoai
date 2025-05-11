"use client"

import {useParams, useRouter, useSearchParams} from "next/navigation";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {CalendarIcon, CalendarSync, EllipsisVertical, Funnel, Mail, Pencil, Phone, Plus, X} from "lucide-react";
import {DATA} from "@/lib/data";
import {cn} from "@/lib/utils";
import {format} from "date-fns";
import Tooltip from "@/components/tooltip";
import ConfirmDialog from "@/components/confirm-dialog";
import PaginationBar from "@/components/pagination-bar";
import React, {useEffect, useState} from "react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import JobFormSheet from "@/components/job-form-sheet";
import CandidateFormSheet from "@/components/candidate-form-sheet";
import {useQueryRouter} from "@/hooks/use-query-router";
import {useDispatch, useSelector} from "react-redux";
import {toast} from "sonner";
import {listInterviews} from "@/store/interview/actions";
import {listCandidates} from "@/store/candidate/actions";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import DateRangePicker from "@/components/daterange-picker";
import NoData from "@/components/no-data";
import Loader from "@/components/loader";


function FilterModal({ isOpen, onClose, onApply, }) {
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
                            className="w-fit"
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


function CandidateMenu({ candidate, ...props }) {
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

    return (
        <>
            <DropdownMenu {...props}>
                <DropdownMenuTrigger asChild>
                    <span className='p-2 rounded-md hover:bg-muted cursor-pointer my-auto'>
                        <EllipsisVertical className='h-4 w-4' />
                    </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="">
                    <DropdownMenuLabel>Candidate Menu</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        {/*<DropdownMenuItem>*/}
                        {/*    <CalendarSync />*/}
                        {/*    <span>Schedule Interview</span>*/}
                        {/*    /!*<DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>*!/*/}
                        {/*</DropdownMenuItem>*/}

                        <DropdownMenuItem onClick={() => setIsEditSheetOpen(true)}>
                            <Pencil />
                            <span>Edit Candidate</span>
                            {/*<DropdownMenuShortcut>⌘B</DropdownMenuShortcut>*/}
                        </DropdownMenuItem>

                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <CandidateFormSheet isOpen={isEditSheetOpen} onOpenChange={setIsEditSheetOpen} candidate={candidate} />
        </>
    )
}

function CandidateList() {
    const { id } = useParams();
    const router = useRouter();
    const queryRouter = useQueryRouter();
    const dispatch = useDispatch();

    const searchParams = useSearchParams();
    const searchString = searchParams.toString();
    const params = new URLSearchParams(searchParams);

    const [filters, setFilters] = useState({});
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);

    const { error, loading, candidates } = useSelector(state => state.listCandidates);

    useEffect(() => {
        if (error) {
            toast.error(error.message);
        } else if (!candidates && !loading) {
            const queryParams = {}
            searchParams.forEach((value, key) => {
                queryParams[key] = value;
            });

            dispatch(listCandidates(queryParams));
        }
    }, [error, candidates, loading, dispatch]);

    useEffect(() => {
        const queryParams = {}
        searchParams.forEach((value, key) => {
            queryParams[key] = value;
        });
        if ((Object.keys(queryParams).length) && !loading) {
            dispatch(listCandidates(queryParams));
        }
    }, [searchString]);

    const handleCandidateClick = (candidate) => {
        // Placeholder for showing details (can be expanded later)
        queryRouter(`/candidates/${candidate.id}`, {
            preserveQuery: true
        });
    };

    return (
        <div className="flex flex-col h-full w-full">
            {
                loading ? (
                  <Loader />
                ) : candidates ? (
                  <Card className="w-full h-full flex flex-col p-0 gap-0 border-0 shadow-none rounded-br-none">
                      <CardHeader className="flex flex-row items-center justify-between py-3 bg-muted">
                          <CardTitle className=''>Candidates</CardTitle>

                          <div className='flex flex-row gap-2'>
                              <Tooltip content='Create'>
                                  <div className='border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 rounded-full p-2 h-auto w-auto cursor-pointer' onClick={() => setIsCreateSheetOpen(true)}>
                                      <span><Plus className='h-4 w-4' /></span>
                                  </div>
                              </Tooltip>

                              {/*<Tooltip content='Filters'>*/}
                              {/*    <Button variant="outline" className='rounded-full p-2 h-auto w-auto cursor-pointer' onClick={() => setIsFilterOpen(true)}>*/}
                              {/*        <span><Funnel className='h-2 w-2' /></span>*/}
                              {/*    </Button>*/}
                              {/*</Tooltip>*/}
                          </div>
                      </CardHeader>
                      <CardContent className="flex-1 overflow-y-auto p-0 scrollbar-thin">
                          {
                              candidates.count ? (
                                <ul className="divide-y divide-border">
                                    {candidates.results.map((candidate) => (
                                      <li
                                        key={candidate.id}
                                        className={cn(
                                          "flex flex-row space-x-4 p-4 hover:bg-muted/40 hover:cursor-pointer z-10",
                                          id && id === candidate.id ? 'bg-muted/40' : ''
                                        )}
                                        onClick={() => {
                                            handleCandidateClick(candidate)
                                        }}
                                      >
                                          <div className="flex flex-row w-full justify-between">
                                              <div
                                                key={candidate.id}
                                                className="flex items-center space-x-4"
                                              >
                                                  <Avatar className="h-10 w-10 item-start align-top">
                                                      <AvatarImage src={candidate.avatar || null} alt={candidate.first_name} />
                                                      <AvatarFallback>{candidate.first_name[0]}</AvatarFallback>
                                                  </Avatar>

                                                  <div>
                                                      <p className="text-sm font-bold text-foreground">
                                                          {candidate.first_name} {candidate.last_name}
                                                      </p>
                                                      <div className="flex flex-row text-xs text-foreground/60 gap-1">
                                                          <span><Mail className='h-3.5 w-3.5' /></span>
                                                          <span className='flex flex-col'>{candidate.email}</span>
                                                      </div>

                                                      <div className="flex flex-row text-xs text-foreground/60 gap-1">
                                                          <span><Phone className='h-3.5 w-3.5' /></span>
                                                          <span className='flex flex-col'>{candidate.phone}</span>
                                                      </div>

                                                  </div>
                                              </div>

                                              <div className='flex flex-col h-full' onClick={(e) => e.stopPropagation()}>
                                                  <CandidateMenu candidate={candidate} />
                                              </div>
                                          </div>

                                      </li>
                                    ))}
                                </ul>
                              ) : (
                                <NoData text='No candidates added.' />
                              )
                          }
                      </CardContent>

                      <CardFooter className='border-t-1 py-2'>
                          <PaginationBar currentPage={candidates.page} pages={candidates.pages} next={candidates.next} previous={candidates.previous} overflow={4} />
                      </CardFooter>
                  </Card>
                ) : (
                  <NoData text='Something went wrong. Unable to fetch data.' />
                )
            }

            <CandidateFormSheet isOpen={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen} />

            <FilterModal
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                currentFilters={filters}
                onApply={setFilters}
            />
        </div>
    );
}

export default function CandidateLayout({ children }) {
    const { id } = useParams();

    return (
        <div className='grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-5.05rem)] overflow-hidden'>
            <div className={cn(
                'w-full h-full overflow-y-auto border-r-1 scrollbar-thin',
                id ? 'md:col-span-1 md:block hidden' : 'md:col-span-1'
            )}>
                <CandidateList />
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