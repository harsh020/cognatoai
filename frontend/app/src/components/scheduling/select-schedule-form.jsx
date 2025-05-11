// components/scheduling/Step3_SelectSchedule.tsx
import React, { useState, useEffect } from 'react';
import { useScheduleInterview } from '@/contexts/schedule-interview-context';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Calendar as CalendarIcon, Clock, Loader2 } from "lucide-react";
import { format, setHours, setMinutes, setSeconds, parse } from 'date-fns'; // date-fns for date manipulation
import { cn } from "@/lib/utils";
import {DATA} from "@/lib/data";
import DateRangePicker from "@/components/daterange-picker";
import Loader from "@/components/loader";
import {useDispatch, useSelector} from "react-redux";
import {createInterview} from "@/store/interview/actions";
import {INTERVIEW_CREATE_RESET} from "@/store/interview/constants";

export const SelectSchedule = () => {
  const dispatch = useDispatch();
  const { selectedJob, selectedCandidates, startDate, endDate, setScheduleDates, goToPreviousStep, customQuestions, resetState } = useScheduleInterview();
  const [errors, setErrors] = useState({});

  const { error, loading, interview } = useSelector(state => state.createInterview);
  const { stages } = useSelector(state => state.listStages);

  useEffect(() => {
    if(error) {
      toast.error(error.message);
    } else if(interview) {
      // toast.success("Interview(s) scheduled successfully. The candidates will receive the links shortly!");
      resetState();
      dispatch({
        type: INTERVIEW_CREATE_RESET
      })
    }
  }, [error, interview]);

  const validateSchedule = () => {
    const newErrors = {};
    if (!startDate) {
      newErrors.start = "Start date and time are required.";
    }
    if (!endDate) {
      newErrors.end = "End date and time are required.";
    }

    if (startDate && endDate && startDate >= endDate) {
      newErrors.end = "End date and time must be after the start date and time.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = () => {
    if(!validateSchedule()) return;

    const customQuestionStage = stages.data.find(s => s.code === 'CUSTOM_QUESTIONS');
    const data = {
      job: selectedJob.id,
      candidates: selectedCandidates.map(c => c.id),
      start_datetime: startDate.toISOString(),
      end_datetime: endDate.toISOString(),
      custom_questions:  {
        stage: customQuestionStage.id,
        questions: customQuestions,
      }
    }
    dispatch(createInterview(data, {bulk: true}));
  }

  // console.log(loading, !selectedJob, !selectedCandidates.length, !startDate, !endDate, errors.start, errors.end);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Step 3: Select Schedule</h2>
      <p className="text-sm text-gray-600">Choose the date for the interview.</p>

      {/* Summary Display */}
      <div className="p-4 border rounded-md bg-muted/50 space-y-2 text-sm">
        <p><strong>Job:</strong> {
          selectedJob ? (
            <span>
              {selectedJob.title} ({selectedJob.job_id})
            </span>
          ) : (
            <span className="italic text-muted-foreground">Not Selected</span>
          )
        }</p>
        <p>
          <strong>Candidates:</strong>{" "}
          {selectedCandidates && selectedCandidates.length > 0 ? (
            selectedCandidates.map((c, i) => (
              <span key={c.email}>
                {c.first_name} {c.last_name} ({c.email})
                {i < selectedCandidates.length - 1 && ", "}
              </span>
            ))
          ) : (
            <span className="italic text-muted-foreground">Not Selected</span>
          )}
        </p>
      </div>

      <Label htmlFor="date">Start and Date</Label>
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onChange={(from, to) => {
          setScheduleDates(from, to)
      }} />

      {/* Timezone Note */}
      <p className="text-xs text-muted-foreground text-start pt-2">
        Note: Times are based on your current browser time zone. Ensure this aligns with scheduling needs.
        {/* Add more specific TZ handling UI if required */}
      </p>


      <div className="flex justify-between pt-4 pb-8">
        <Button variant="outline" onClick={goToPreviousStep} disabled={loading || !startDate || !endDate}>
          Previous: Select Candidate
        </Button>
        <Button onClick={handleSubmit} disabled={loading || !selectedJob || !selectedCandidates.length || !startDate || !endDate || !!errors.start || !!errors.end}>
          {loading ? (
            <Loader />
          ) : (
            "Schedule Interview"
          )}
        </Button>
      </div>
    </div>
  );
};
