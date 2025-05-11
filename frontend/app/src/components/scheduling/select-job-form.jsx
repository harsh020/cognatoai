// components/scheduling/Step1_SelectJob.tsx
import React, {useState, useEffect, useRef, useCallback} from 'react';
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router
import { useScheduleInterview } from '@/contexts/schedule-interview-context';
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, PlusCircle, Plus, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import {DATA} from "@/lib/data";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import {Textarea} from "@/components/ui/textarea";
import {useDispatch, useSelector} from "react-redux";
import {toast} from "sonner";
import {fetchMoreJobs} from "@/store/job/actions";
import Loader from "@/components/loader";
import {JOB_FETCH_MORE_RESET} from "@/store/job/constants";
import {useDebounce} from "@/hooks/use-debounce";
import {listStages} from "@/store/stage/actions";
import JobFormSheet from "@/components/job-form-sheet";

// Mock API function (replace with actual API call)
async function fetchJobs(searchTerm) {
  // console.log(`Fetching jobs with term: ${searchTerm}`);

  return DATA.jobs.results;
}

export const SelectJob = () => {
  const listRef = useRef(null);
  const router = useRouter();
  const dispatch = useDispatch();

  const triggerRef = useRef(null); // Ref for Popover width
  const { selectedJob, setJob, goToNextStep, customQuestions, setCustomQuestions } = useScheduleInterview();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(null);
  const [isCreateNewJobOpen, setIsCreateNewJobOpen] = useState(false);

  // --- State for Custom Questions ---
  const [showCustomQuestions, setShowCustomQuestions] = useState(!!customQuestions.length);
  const [currentQuestion, setCurrentQuestion] = useState('');

  const { error, loading, jobs } = useSelector(state => state.fetchMoreJobs);
  const { error: stageError, loading: stageLoading, stages } = useSelector(state => state.listStages);

  useEffect(() => {
    if(error) {
      toast.error("Something went wrong. You won't be able to add custom questions.");
    } else if(!stageLoading && !stages) {
      dispatch(listStages());
    }
  }, [stageError, stageLoading, stages]);


  useEffect(() => {
    if(error) {
      toast.error(error.message);
    } else if(!loading && !jobs) {
      dispatch(fetchMoreJobs());
    }
  }, [error, loading, jobs]);

  // useEffect(() => {
  //   const value = searchTerm.trim();
  //   if(value) {
  //     dispatch({
  //       type: JOB_FETCH_MORE_RESET
  //     });
  //
  //     dispatch(fetchMoreJobs({
  //       job_id: value
  //     }));
  //   }
  // }, [searchTerm]);

  const handleSearch = (searchValue) => {
    const trimmed = searchValue.trim();

    // Don't fire if search is empty AND jobs already loaded (first load)
    if (!trimmed && jobs?.results?.length) return;

    dispatch({ type: JOB_FETCH_MORE_RESET });

    dispatch(fetchMoreJobs(
      trimmed ? { job_id: trimmed } : undefined
    ));
  }

  useDebounce({
    callback: handleSearch,
    value: searchTerm
  })

  // --- Infinite Scroll Logic ---
  const handleScroll = useCallback(() => {
    const listElement = listRef.current;
    if (listElement) {
      const { scrollTop, scrollHeight, clientHeight } = listElement;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100; // Threshold: 100px

      // Check if not already loading, has more pages, and near the bottom
      if (!loading && jobs?.hasMore && isNearBottom) {
        dispatch(fetchMoreJobs({ job_id: searchTerm }));
      }
    }
  }, [loading, jobs, searchTerm, dispatch]);

  // Attach scroll listener using the ref
  useEffect(() => {
    const listElement = listRef.current;
    if (listElement) {
      listElement.addEventListener('scroll', handleScroll);
      return () => listElement.removeEventListener('scroll', handleScroll); // Cleanup
    }
  }, [handleScroll]); // Re-attach if handleScroll dependencies change
  

  // --- Handlers ---
  const handleSelectJob = (job) => { // Use specific job type
    setJob(job);
    setOpen(false); // Close the popover on selection
  };

  const handleCreateNewJob = () => {
    const redirectUrl = '/schedule-interview'; // Or window.location.pathname
    // router.push(`/create-job?redirect=${encodeURIComponent(redirectUrl)}`);
    setIsCreateNewJobOpen(true);
  };

  // Handle Custom Question Switch Toggle
  const handleSwitchChange = (checked) => {
    setShowCustomQuestions(checked);
    if (!checked) {
      setCustomQuestions([]);
      setCurrentQuestion('');
    }
  };

  // Handle Adding a Custom Question
  const handleAddQuestion = () => {
    const trimmedQuestion = currentQuestion.trim();
    if (trimmedQuestion) {
      setCustomQuestions([...customQuestions, trimmedQuestion]);
      setCurrentQuestion('');
    }
  };

  // Handle Deleting a Custom Question
  const handleDeleteQuestion = (indexToDelete) => {
    const questionToRemove = customQuestions[indexToDelete];
    setCustomQuestions(customQuestions.filter((_, index) => index !== indexToDelete));
    // If context manages the list:
    // removeCustomQuestion?.(questionToRemove); // Or by index if context supports it
    // console.log("Custom question deleted:", questionToRemove);
  };

  // --- Render ---

  return (
    <div className="space-y-6">
      <JobFormSheet isOpen={isCreateNewJobOpen} onOpenChange={setIsCreateNewJobOpen} />

      {/* Step Title and Description */}
      <h2 className="text-xl font-semibold text-foreground/80">Step 1: Select Job</h2>
      <p className="text-sm text-foreground/60">Choose the job position for which you want to schedule an interview.</p>

      {/* Job Selection and Create Button */}
      <div className="grid sm:grid-cols-3 w-full items-end gap-4">
        <div className="relative sm:col-span-2 w-full">
          <Label htmlFor="job-select" className="block text-sm font-medium text-foreground/80 mb-1">
            Job Template
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
                id="job-select"
                ref={triggerRef}
              >
                <span className='truncate text-ellipsis'>
                  {selectedJob ? `[${selectedJob.job_id}] ${selectedJob.title}` : "Select job..."}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="p-0"
              style={{ width: triggerRef.current?.offsetWidth || "auto" }}
              // Prevent popover from closing when interacting with content inside (like search input)
              // onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <Command shouldFilter={false} > {/* Filtering via API */}
                <CommandInput
                  placeholder="Search by job ID..."
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                  aria-label="Search jobs"
                />
                <CommandList ref={listRef} className='max-h-[40vh] overflow-y-auto scrollbar-thin'>
                  <CommandEmpty>No jobs found.</CommandEmpty>
                  <CommandGroup>
                    {jobs?.results?.map((job, index) => (
                      <CommandItem
                        key={`${job.job_id}:${index}`}
                        value={job.id} // Use title or unique value for Command filtering if enabled
                        onSelect={() => handleSelectJob(job)}
                        // className="cursor-pointer hover:bg-transparent bg-black"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedJob?.id === job.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        [{job.job_id}] {job.title}
                      </CommandItem>
                    ))}
                    {loading && (
                      <Loader />
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <Button variant="outline" onClick={handleCreateNewJob} className="shrink-0">
          <PlusCircle className="mr-1 h-4 w-4" /> Create New Job
        </Button>
      </div>

      {/* --- Custom Questions Section --- */}
      <div className='flex flex-col h-full w-full'>
        {
          stageLoading ? (
            <Loader />
          ) : stages ? (
            <div className="space-y-4 pt-4 border-t mt-6">
              {/* Switch to toggle custom questions */}
              <div className="flex items-center space-x-3">
                <Switch
                  id="custom-questions-switch"
                  checked={showCustomQuestions}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="custom-questions-switch" className="text-foreground/80 cursor-pointer">
                  Add Custom Interview Questions
                </Label>
              </div>

              {/* Conditional UI for adding/viewing questions */}
              {showCustomQuestions && (
                <div className="pl-2 space-y-4 animate-in fade-in duration-300"> {/* Added animation */}
                  {/* Input and Add Button */}
                  <div className="flex items-start gap-2">
                    <Textarea
                      placeholder="Type your custom question here..."
                      value={currentQuestion}
                      onChange={(e) => setCurrentQuestion(e.target.value)}
                      rows={2}
                      className="flex-grow"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleAddQuestion}
                      disabled={!currentQuestion.trim()}
                      aria-label="Add custom question"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* List of Added Questions */}
                  {customQuestions.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-sm font-medium text-foreground/70">Added Questions:</h4>
                      {customQuestions.map((question, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-2 p-2 border rounded-md bg-muted/30"
                        >
                          <p className="text-sm text-foreground flex-grow">{index + 1}. {question}</p>
                          {/* Show delete button only if more than one question exists */}
                          {customQuestions.length >= 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteQuestion(index)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7"
                              aria-label={`Delete question ${index + 1}`}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <></>
          )
        }
      </div>
      {/* --- End Custom Questions Section --- */}


      {/* Next Step Button */}
      <div className="flex justify-end pt-4 pb-8">
        <Button onClick={goToNextStep} disabled={!selectedJob || (showCustomQuestions && !customQuestions.length)}>
          Next: Select Candidate
        </Button>
      </div>
    </div>
  );
};
