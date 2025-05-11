// app/schedule-interview/page.tsx (or your chosen route)
'use client'; // Mark as a Client Component

import React, { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // Use hooks from next/navigation
import { ScheduleInterviewProvider, useScheduleInterview } from '@/contexts/schedule-interview-context';
import { Stepper } from '@/components/scheduling/stepper';
import { SelectJob } from '@/components/scheduling/select-job-form';
import { SelectCandidate } from '@/components/scheduling/select-candidate-form';
import { SelectSchedule } from '@/components/scheduling/select-schedule-form';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {FileText, UploadCloud, XCircle} from 'lucide-react';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import {useDispatch, useSelector} from "react-redux";
import Loader from "@/components/loader";
import {INTERVIEW_CREATE_RESET} from "@/store/interview/constants";

// Mock functions to fetch initial data based on ID (replace with actual API calls)
async function fetchJobById(id) {
  await new Promise(resolve => setTimeout(resolve, 300));
  const jobs = [
    { id: 'job-1', title: 'Software Engineer (Frontend)' }, { id: 'job-2', title: 'Product Manager' }, // ... more jobs
  ];
  return jobs.find(job => job.id === id) || null;
}

async function fetchCandidateById(id) {
  await new Promise(resolve => setTimeout(resolve, 300));
  const candidates = [
    { id: 'cand-1', first_name: 'CandidateFirst1', last_name: 'CandidateLast1', email: 'candidate1@example.com' }, // ... more candidates
    { id: 'cand-5', first_name: 'CandidateFirst5', last_name: 'CandidateLast5', email: 'candidate5@example.com' },
  ];
  return candidates.find(c => c.id === id) || null;
}


// Inner component that uses the context and searchParams
function ScheduleInterviewContent({ onComplete }) {
  const { currentStep, initializeState, resetState } = useScheduleInterview();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoadingInitialData, setIsLoadingInitialData] = React.useState(true);

  const { interview } = useSelector(state => state.createInterview);

  useEffect(() => {
    if(interview) {
      toast.success("Interview(s) scheduled successfully. The candidates will receive the links shortly!");
      if(onComplete) onComplete();
    }
  }, [interview]);

  useEffect(() => {
    const jobId = searchParams.get('jobId');
    const candidateId = searchParams.get('candidateId');
    const newJobId = searchParams.get('newJobId'); // From create job redirect
    const newCandidateId = searchParams.get('newCandidateId'); // From create candidate redirect
    const stepParam = searchParams.get('step');

    let isInitialized = false; // Flag to prevent multiple initializations

    const loadInitialData = async () => {
      setIsLoadingInitialData(true);
      let initialJob = null;
      let initialCandidate = null;
      let targetStep = stepParam ? parseInt(stepParam, 10) : null;

      const idToLoad = newJobId || jobId;
      const candidateIdToLoad = newCandidateId || candidateId;

      try {
        if (idToLoad) {
          initialJob = await fetchJobById(idToLoad);
        }
        if (candidateIdToLoad) {
          initialCandidate = await fetchCandidateById(candidateIdToLoad);
        }

        const initialStateUpdate = {}; // Use explicit import type
        if (initialJob) initialStateUpdate.selectedJob = initialJob;
        if (initialCandidate) initialStateUpdate.selectedCandidate = initialCandidate;
        if (targetStep && targetStep >= 1 && targetStep <= 3) {
          initialStateUpdate.currentStep = targetStep;
        } else {
          // Determine step based on loaded data if not specified
          initialStateUpdate.currentStep = initialCandidate ? 3 : (initialJob ? 2 : 1);
        }


        initializeState(initialStateUpdate);
        isInitialized = true;

        // Clean up query params after loading (optional, keeps URL clean)
        // Be careful with this if you rely on params staying for other reasons
        // const newPath = window.location.pathname; // Or specific path like '/schedule-interview'
        // router.replace(newPath, { scroll: false });


      } catch (error) {
        console.error("Failed to load initial data:", error);
        // Handle error (e.g., show toast, reset to step 1)
        resetState(); // Reset to default state on error
      } finally {
        setIsLoadingInitialData(false);
      }
    };

    // Only run initialization once on mount or if relevant params change
    if (!isInitialized) {
      loadInitialData();
    }

    // Cleanup function if needed when component unmounts
    // return () => { resetState(); }; // Optional: Reset state on unmount?

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, initializeState, resetState, router]); // Dependencies

  const steps = ["Select Job", "Select Candidate", "Select Schedule"];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return <SelectJob />;
      case 2: return <SelectCandidate />;
      case 3: return <SelectSchedule />;
      default: return <div>Invalid Step</div>;
    }
  };

  if (isLoadingInitialData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
        <span className="ml-2">Loading scheduler...</span>
      </div>
    );
  }

  return (
    <>
      <Stepper currentStep={currentStep} steps={steps} />
      <CardContent>
        {renderStepContent()}
      </CardContent>
    </>
  );
}


// Main page component using Suspense for searchParams
export default function ScheduleInterviewSheet({
  isOpen,
  onOpenChange,
}) {

  return (
    // Suspense is required for useSearchParams in Next.js App Router
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    }>
      <ScheduleInterviewProvider>

        <Sheet open={isOpen} onOpenChange={onOpenChange}>
          <SheetContent className="min-w-[60vw] md:min-w-[40vw] overflow-y-auto scrollbar-thin">
            <SheetHeader>
              <SheetTitle className='text-xl font-bold'>Schedule New Interview</SheetTitle>
              <SheetDescription>
                Schedule and interview
              </SheetDescription>
            </SheetHeader>

            <ScheduleInterviewContent onComplete={() => onOpenChange(false)} />
          </SheetContent>
        </Sheet>

      </ScheduleInterviewProvider>
    </Suspense>
  );
}
