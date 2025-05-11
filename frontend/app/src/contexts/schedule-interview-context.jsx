"use client"

// contexts/ScheduleInterviewContext.tsx
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import {endOfDay, startOfDay} from "date-fns";

// // Define the shape of the data we store
// interface Job {
//   id: string;
//   title: string; // Changed from 'name' to 'title' for clarity
// }
//
// interface Candidate {
//   id: string;
//   first_name: string;
//   last_name: string;
//   email: string;
// }
//
// interface ScheduleInterviewState {
//   currentStep: number;
//   selectedJob: Job | null;
//   selectedCandidate: Candidate | null;
//   startDate: Date | null;
//   endDate: Date | null;
// }
//
// interface ScheduleInterviewContextProps extends ScheduleInterviewState {
//   setJob: (job: Job | null) => void;
//   setCandidate: (candidate: Candidate | null) => void;
//   setScheduleDates: (start: Date | null, end: Date | null) => void;
//   goToNextStep: () => void;
//   goToPreviousStep: () => void;
//   goToStep: (step: number) => void;
//   resetState: () => void;
//   initializeState: (initialData: Partial<ScheduleInterviewState>) => void;
// }

const ScheduleInterviewContext = createContext(null);

const initialStartDate = startOfDay();
const initialEndDate = endOfDay();
initialEndDate.setDate(initialEndDate.getDay()+2);
const initialState = {
  currentStep: 1,
  selectedJob: null,
  selectedCandidates: [],
  startDate: null,
  endDate: null,
  customQuestions: [],
};

export const ScheduleInterviewProvider = ({ children }) => {
  const [state, setState] = useState(initialState);

  const setJob = useCallback((job) => {
    setState(prevState => ({ ...prevState, selectedJob: job }));
  }, []);

  const setCandidates = useCallback((candidates) => {
    setState(prevState => ({ ...prevState, selectedCandidates: [...candidates] }));
  }, []);

  const setScheduleDates = useCallback((start, end) => {
    setState(prevState => ({ ...prevState, startDate: start, endDate: end }));
  }, []);

  const goToNextStep = useCallback(() => {
    setState(prevState => ({ ...prevState, currentStep: Math.min(prevState.currentStep + 1, 3) }));
  }, []);

  const goToPreviousStep = useCallback(() => {
    setState(prevState => ({ ...prevState, currentStep: Math.max(prevState.currentStep - 1, 1) }));
  }, []);

  const goToStep = useCallback((step) => {
    if (step >= 1 && step <= 3) {
      setState(prevState => ({ ...prevState, currentStep: step }));
    }
  }, []);

  const setCustomQuestions = useCallback((questions) => {
    setState(prevState => ({ ...prevState, customQuestions: [...questions] }));
  }, []);

  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  // Function to initialize state based on external data (e.g., query params)
  const initializeState = useCallback((initialData) => {
    setState(prevState => ({
      ...prevState, // Keep existing state unless overridden
      ...initialData,
      // Ensure step is valid if provided
      currentStep: (initialData.currentStep && initialData.currentStep >= 1 && initialData.currentStep <= 3)
        ? initialData.currentStep
        : (initialData.selectedCandidate ? 3 : (initialData.selectedJob ? 2 : 1)), // Sensible default step based on data
    }));
  }, []);


  return (
    <ScheduleInterviewContext.Provider value={{
      ...state,
      setJob,
      setCandidates,
      setScheduleDates,
      goToNextStep,
      goToPreviousStep,
      goToStep,
      resetState,
      setCustomQuestions,
      initializeState,
    }}>
      {children}
    </ScheduleInterviewContext.Provider>
  );
};

export const useScheduleInterview = () => {
  const context = useContext(ScheduleInterviewContext);
  if (context === undefined) {
    throw new Error('useScheduleInterview must be used within a ScheduleInterviewContext');
  }
  return context;
};
