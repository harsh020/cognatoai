"use client"

import {DATA} from "@/lib/data";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
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
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {Badge} from "@/components/ui/badge";
import {cn, filterStages, getSkillFromStage, toTitleCase} from "@/lib/utils";
import {Check, ChevronsUpDown, X} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {toast} from "sonner";
import {CANDIDATE_CREATE_RESET, CANDIDATE_UPDATE_RESET} from "@/store/candidate/constants";
import {JOB_CREATE_RESET, JOB_UPDATE_RESET} from "@/store/job/constants";
import {useDispatch, useSelector} from "react-redux";
import {createJob, updateJob} from "@/store/job/actions";
import Loader from "@/components/loader";
import NoData from "@/components/no-data";
import {listStages} from "@/store/stage/actions";


export default function JobFormSheet({
    isOpen,
    onOpenChange,
    onSubmit,
    job = null,
    children,
}) {
    const dispatch = useDispatch();
    // -- Refs
    const triggerRef = useRef(null);

    const isEditMode = useMemo(() => !!job, [job]);

    const { error: stageError, loading: stageLoading, stages } = useSelector(state => state.listStages);
    const { error: createError, loading: createLoading, job: createdJob } = useSelector(state => state.createJob);
    const { error: updateError, loading: updateLoading, job: updatedJob } = useSelector(state => state.updateJob);

    // --- State Management using useState ---
    const [formData, setFormData] = useState({
        title: "",
        job_id: "",
        role: "Software Engineer",
        description: "",
        stages: [],

    });
    const [errors, setErrors] = useState({});
    const [isStagesPopoverOpen, setIsStagesPopoverOpen] = useState(false);
    const [skillSearchTerm, setStagesSearchTerm] = useState('');

    // Function to reset form state
    const resetForm = useCallback(() => {
        setFormData({
            title: job?.title || "",
            job_id: job?.job_id || "",
            role: job?.role || "Software Engineer",
            description: job?.description || "",
            stages: job?.stages || []
        });

        setErrors({}); // Clear errors on reset
    }, [job]);

    // useEffect(() => {
    //     if(stageError) {
    //         toast.error(stageError.message);
    //     } else if(!stages && !stageLoading) {
    //         dispatch(listStages());
    //     }
    // }, [stageError, stageLoading, stages]);


    useEffect(() => {
        if(createError || updateError) {
            toast.error(`Could not ${isEditMode ? 'update' : 'create'} job. Please try again.`);
        } else if(isOpen && (createdJob || updatedJob)) {
            toast.success(`${formData.job_id} has been successfully ${isEditMode ? 'updated' : 'saved'}.`);
            onOpenChange(false);
            if(isEditMode) {
                dispatch({ type: JOB_UPDATE_RESET })
            }
            else {
                dispatch({ type: JOB_CREATE_RESET })
            }
        }
    }, [createError, updateError, createdJob, updatedJob]);

    // Reset form when the sheet opens or the candidate data changes
    useEffect(() => {
        if (isOpen) {
            resetForm();
        }
    }, [isOpen, job, resetForm]);

    // Handle text input changes
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        // Optionally clear the specific error when the user starts typing
        if (errors[name]) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                [name]: undefined,
            }));
        }
    };

    const handleStagesSelect = (skill) => {
        if (!formData.stages.some(s => s === skill.id)) {
            setFormData((prevData) => ({
                ...prevData,
                stages: [...prevData.stages, skill.id],
            }));
        }
        setIsStagesPopoverOpen(false);
        setStagesSearchTerm('');
    };

    const handleStagesRemove = (skillId) => {
        setFormData((prevData) => ({
            ...prevData,
            stages: [...prevData.stages.filter(s => s !== skillId)],
        }));
    };

    // --- Manual Validation ---
    const validateForm = () => {
        const newErrors = {};

        // Validate text fields (same as before)
        if (!formData.title.trim()) newErrors.title = "Title is required.";
        else if (formData.title.length > 50) newErrors.title = "Title cannot exceed 50 characters.";

        if (!formData.job_id.trim()) newErrors.job_id = "Job ID is required.";
        else if (formData.job_id.length > 50) newErrors.job_id = "Job ID cannot exceed 50 characters.";

        if (!formData.description.trim()) newErrors.description = "Job description is required.";
        else if (formData.description.length > 500) newErrors.description = "Job description cannot exceed 500 characters.";

        if (!formData.stages.length) newErrors.stages = "At least 1 skill is required.";

        // Add other file validations if needed (e.g., type check beyond 'accept')

        return newErrors;
    };
    // --- End Manual Validation ---


    const handleSubmit = (event) => {
        event.preventDefault();

        const validationErrors = validateForm();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            toast.error("Please check the form for errors.");
            return;
        }

        if(isEditMode)   {
            const data = {
                ...formData
            }
            if(data.stages === job.stages) delete data.stages;
            dispatch(updateJob(job.id, data));
        } else {
            dispatch(createJob(formData));
        }
    };

    const filteredAvailableStages = useMemo(() => {
        if(!stages) return [];
        return stages.data.filter(skill => !formData.stages.includes(skill.id));
    }, [stages, formData.stages]);

    // --- Render ---
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            {/*<SheetTrigger>{children}</SheetTrigger>*/}
            <SheetContent className="min-w-[60vw] md:min-w-[40vw] overflow-y-auto scrollbar-thin">
                <SheetHeader>
                    <SheetTitle>{isEditMode ? 'Edit Job' : 'Create New Job'}</SheetTitle>
                    <SheetDescription>
                        {isEditMode ? 'Update the details for this job.' : 'Fill in the details for the new job.'}
                    </SheetDescription>
                </SheetHeader>

                {
                    stageLoading ? (
                      <Loader />
                    ) : stages ? (
                      <form onSubmit={handleSubmit} className="space-y-6 py-6 px-4">
                          {/* Job Title */}
                          <div className="space-y-2">
                              <Label htmlFor="title">Job Title</Label>
                              <Input id="title" name="title" placeholder="e.g. Software Engineer - Backend" value={formData.title} onChange={handleInputChange} disabled={createLoading || updateLoading} className={cn(errors.title && "border-red-500 focus-visible:ring-red-500")} />
                              {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
                          </div>

                          {/* Job ID */}
                          <div className="space-y-2">
                              <Label htmlFor="job_id">Job ID</Label>
                              <Input id="job_id" name="job_id" placeholder="e.g. SWE-9812" value={formData.job_id} onChange={handleInputChange} disabled={createLoading || updateLoading} className={cn(errors.job_id && "border-red-500 focus-visible:ring-red-500")} />
                              {errors.job_id && <p className="text-sm text-red-600 mt-1">{errors.job_id}</p>}
                          </div>

                          {/* Role Dropdown */}
                          <div className="space-y-2">
                              <Label htmlFor="role">Role</Label>
                              <Select
                                id='role'
                                name='role'
                                value={formData.role}
                                // Stagesnce there's only one option, onValueChange isn't strictly necessary
                                // but included for completeness if options were dynamic later.
                                onValueChange={handleInputChange}
                                disabled={createLoading || updateLoading}
                              >
                                  <SelectTrigger id="role" name='role' className={cn(errors.role && "border-red-500 focus-visible:ring-red-500")}>
                                      <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                                      {/* No other options */}
                                  </SelectContent>
                              </Select>
                              {errors.role && <p className="text-sm text-red-600 mt-1">{errors.role}</p>}
                          </div>

                          {/* Description */}
                          <div className="space-y-0">
                              <div className='space-y-2'>
                                  <Label htmlFor="description">Description</Label>
                                  <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={(e) => {
                                        if(e.target.value.length < 500)
                                            handleInputChange(e);
                                    }}
                                    placeholder="Enter job description..."
                                    rows={4}
                                    disabled={createLoading || updateLoading}
                                    className={cn(errors.description && "border-red-500 focus-visible:ring-red-500")}
                                  />
                              </div>
                              <span className='text-foreground/50 text-xs'>{formData.description.length}/500</span>
                              {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
                          </div>

                          {/* Stages Multi-select */}
                          <div className="space-y-2">
                              <Label>Skills</Label>
                              {/* Container for selected skill badges */}
                              <div className={cn("flex flex-wrap gap-2 mb-2 min-h-[40px] p-2 border rounded-md", errors.stages && "border-red-500 focus-visible:ring-red-500")}>
                                  {formData.stages.length > 0 ? (
                                    stages.data.filter(s => formData.stages.includes(s.id)).map((skill) => (
                                      <Badge key={skill.id} variant="secondary" className="flex items-center gap-1 rounded-full px-2 py-0.5">
                                          {toTitleCase(getSkillFromStage(skill.name))}
                                          <button
                                            type="button"
                                            onClick={() => handleStagesRemove(skill.id)}
                                            className="rounded-full hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring"
                                            aria-label={`Remove ${skill.name}`}
                                          >
                                              <X className="h-3 w-3" />
                                          </button>
                                      </Badge>
                                    ))
                                  ) : (
                                    <span className="text-sm text-muted-foreground px-2">No skills selected</span>
                                  )}
                              </div>
                              {/* Popover for selecting stages */}
                              <Popover open={isStagesPopoverOpen} onOpenChange={setIsStagesPopoverOpen}>
                                  <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={isStagesPopoverOpen}
                                        ref={triggerRef}
                                        disabled={createLoading || updateLoading}
                                        className={cn("w-full justify-between", errors.stages && "border-red-500 focus-visible:ring-red-500")}
                                      >
                                          {formData.stages.length > 0 ? `${filterStages(stages.data.filter(s => formData.stages.includes(s.id))).length} skills(s) selected` : "Select skills..."}
                                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                      </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0"
                                                  style={{ width: triggerRef.current?.offsetWidth || 'auto' }}
                                  >
                                      <Command shouldFilter={false}>
                                          <CommandInput
                                            placeholder="Search skills..."
                                            value={skillSearchTerm}
                                            onValueChange={setStagesSearchTerm}
                                          />
                                          <CommandList className='max-h-[50vh] overflow-y-auto scrollbar-thin'>
                                              <CommandEmpty>No skills found.</CommandEmpty>
                                              <CommandGroup>
                                                  {filterStages(filteredAvailableStages)
                                                    .filter(skill => skill.name.toLowerCase().includes(skillSearchTerm.toLowerCase()))
                                                    .map((skill) => (
                                                      <CommandItem
                                                        key={skill.id}
                                                        value={skill.name}
                                                        onSelect={() => handleStagesSelect(skill)}
                                                      >
                                                          <Check
                                                            className={`mr-2 h-4 w-4 ${formData.stages.some(s => s.id === skill.id) ? "opacity-100" : "opacity-0"}`}
                                                          />
                                                          {toTitleCase(getSkillFromStage(skill.name))}
                                                      </CommandItem>
                                                    ))}
                                              </CommandGroup>
                                          </CommandList>
                                      </Command>
                                  </PopoverContent>
                              </Popover>
                              {errors.stages && <p className="text-sm text-red-600 mt-1">{errors.stages}</p>}
                          </div>

                          {/* Form Footer */}
                          <SheetFooter className="pt-6 flex flex-row mt-8 pt-4 justify-end">
                              <SheetClose asChild>
                                  <Button type="button" variant="outline" disabled={createLoading || updateLoading}>Cancel</Button>
                              </SheetClose>
                              <Button type="submit" disabled={createLoading || updateLoading}>
                                  {(createLoading || updateLoading) ? (
                                    <Loader />

                                  ) : (
                                    isEditMode ? "Save Changes" : "Create Job"
                                  )}
                              </Button>
                          </SheetFooter>
                      </form>
                    ) : (
                      <NoData text='Something went wrong. Please try again later.' />
                    )
                }
            </SheetContent>
        </Sheet>
    );
}