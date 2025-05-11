"use client"

import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useParams} from "next/navigation";
import {DATA} from "@/lib/data";
import {
Card,
CardContent,
CardDescription,
CardHeader,
CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge";
import { Pencil, CalendarSync, EllipsisVertical } from 'lucide-react';
import {format} from "date-fns";
import {filterStages, getSkillFromStage, getRolesFromStages, toTitleCase} from "@/lib/utils";
import JobFormSheet from "@/components/job-form-sheet";



const badgeColors = [
    "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800",
    "border-transparent bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800",
    "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-800",
    "border-transparent bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800",
    "border-transparent bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:hover:bg-purple-800",
    "border-transparent bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800",
    "border-transparent bg-pink-100 text-pink-800 hover:bg-pink-200 dark:bg-pink-900 dark:text-pink-300 dark:hover:bg-pink-800",
];



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
                        <DropdownMenuItem>
                            <CalendarSync />
                            <span>Schedule Interview</span>
                            {/*<DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>*/}
                        </DropdownMenuItem>

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

function JobDetails({ job, ref }) {

    const onEdit = () => {

    }

    // Function to format the date nicely
    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch (error) {
            console.error("Error formatting date:", error);
            return dateString; // Return original string if formatting fails
        }
    };

    // Handle edit button click
    const handleEditClick = () => {
        if (onEdit) {
            onEdit(job.id); // Pass the job ID to the callback
        } else {
            console.log("Edit button clicked for job:", job.id); // Fallback if no handler provided
        }
    };

    return (
        <div ref={ref} className="h-full w-full">
            <Card className="h-full w-full py-0 gap-0">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 rounded-t-lg bg-muted/50 p-4"> {/* Header styling */}
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-semibold">{job.title}</CardTitle>
                        <CardDescription>
                            Role: {job.role} | Job ID: {job.job_id} | Created: {format(new Date(job.created), 'MMM dd, yyyy hh:mm:ss a')}
                        </CardDescription>
                    </div>
                    {/* Edit Button */}
                    {/*<Button*/}
                    {/*    variant="outline"*/}
                    {/*    size="icon"*/}
                    {/*    className="rounded-full w-8 h-8 flex-shrink-0" // Make button smaller, circular, prevent shrinking*/}
                    {/*    onClick={handleEditClick}*/}
                    {/*    aria-label="Edit Job" // Accessibility label*/}
                    {/*>*/}
                    {/*    <Pencil className="h-4 w-4" /> /!* Edit Icon *!/*/}
                    {/*</Button>*/}

                    <JobMenu job={job} />


                </CardHeader>
                <CardContent className="p-4 space-y-4"> {/* Content padding and spacing */}

                    {/* Job Details Section (Added Job ID and Role here too) */}
                    <div>
                        <h3 className="text-lg font-medium mb-2">Details</h3>
                        <div className="text-sm text-muted-foreground space-y-1">
                            <p><span className="font-medium text-foreground">Job ID:</span> {job.job_id}</p>
                            <p><span className="font-medium text-foreground">Role:</span> {job.role}</p>
                        </div>
                    </div>

                    {/* Job Description Section */}
                    <div>
                        <h3 className="text-lg font-medium mb-2">Description</h3>
                        <p className="text-sm text-muted-foreground">{job.description}</p>
                    </div>

                    {/* Skills Section */}
                    <div>
                        <h3 className="text-lg font-medium mb-2">Required Skills</h3>
                        <div className="flex flex-wrap gap-2"> {/* Use flex-wrap for badges */}
                            {job.stages && job.stages.length > 0 ? (
                                filterStages(job.stages).map((skill, index) => {
                                    // Select color based on index, cycling through the badgeColors array
                                    const colorClass = badgeColors[index % badgeColors.length];
                                    return (
                                        <Badge
                                            key={skill.id}
                                            // Use 'default' variant to allow custom background/text colors via className
                                            variant="default"
                                            // Apply rounded-full and selected color classes
                                            className={`rounded-full px-3 py-1 text-xs ${colorClass}`}
                                        >
                                            {toTitleCase(getSkillFromStage(skill.name))} ({toTitleCase(skill.type)})
                                        </Badge>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-muted-foreground">No specific skills listed.</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


export default function Job(props) {
    const { id } = useParams(); // Get the ID from the URL
    const selectedJobRef = useRef(null); // Store refs

    useEffect(() => {
        if (id && selectedJobRef.current) {
            selectedJobRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [id]);

    // const job = DATA.jobs.results.find(j => j.id === id);

    return (
        <div className='flex flex-col h-fit w-full overflow-y-auto scrollbar-thin p-4 gap-4'>
            {DATA.jobs.results.map((job, index) => (
                <JobDetails key={index} ref={id === job.id ? selectedJobRef : null} job={job} />
            ))}
        </div>
    );
}
