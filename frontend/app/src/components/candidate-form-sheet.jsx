"use client"

import {useCallback, useEffect, useRef, useState} from "react";
import { Loader2, FileText, UploadCloud, XCircle } from "lucide-react"; // Added UploadCloud, XCircle icons

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {useDispatch, useSelector} from "react-redux";
import Loader from "@/components/loader";
import {createCandidate, updateCandidate} from "@/store/candidate/actions";
import {CANDIDATE_CREATE_RESET, CANDIDATE_UPDATE_RESET} from "@/store/candidate/constants";
import {isValidPhoneNumber} from "libphonenumber-js";


// const defaultAcceptedFileTypes = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const defaultAcceptedFileTypes = ".pdf,application/pdf";
const defaultMaxFileSize = 5 * 1024 * 1024; // 5MB

export default function CandidateFormSheet({
    isOpen,
    onOpenChange,
    candidate,
    triggerButton,
    onFormSubmit,
    acceptedFileTypes = defaultAcceptedFileTypes,
    maxFileSize = defaultMaxFileSize,
}) {
    const dispatch = useDispatch()
    // const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null); // Ref for file input

    // Determine if it's an edit or create operation
    const isEditMode = !!candidate;

    // --- State Management using useState ---
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
    });
    // State specifically for the resume file
    const [resumeFile, setResumeFile] = useState(null);
    const [errors, setErrors] = useState({});
    // --- End State Management ---

    // Function to reset form state
    const resetForm = useCallback(() => {
        setFormData({
            first_name: candidate?.first_name || "",
            last_name: candidate?.last_name || "",
            email: candidate?.email || "",
            phone: candidate?.phone || "",
        });
        setResumeFile(null); // Clear selected file
        // Clear file input value visually
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        setErrors({}); // Clear errors on reset
    }, [candidate]);

    const { error: createError, loading: createLoading, candidate: createdCandidate } = useSelector(state => state.createCandidate);
    const { error: updateError, loading: updateLoading, candidate: updatedCandidate } = useSelector(state => state.updateCandidate);

    useEffect(() => {
        if(createError || updateError) {
            toast.error(`Could not ${isEditMode ? 'update' : 'create'} candidate. Please try again.`);
        } else if(isOpen && (createdCandidate || updatedCandidate)) {
            toast.success(`${formData.first_name} ${formData.last_name} has been successfully ${isEditMode ? 'updated' : 'saved'}.`);
            onOpenChange(false);
            if(isEditMode) {
                dispatch({ type: CANDIDATE_UPDATE_RESET })
            }
            else {
                dispatch({ type: CANDIDATE_CREATE_RESET })
            }
        }
    }, [createError, updateError, createdCandidate, updatedCandidate]);

    // Reset form when the sheet opens or the candidate data changes
    useEffect(() => {
        if (isOpen) {
            resetForm();
        }
    }, [isOpen, candidate, resetForm]);

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

    // Handle file input change
    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            // Clear previous file errors
            setErrors((prevErrors) => ({
                ...prevErrors,
                resumeFile: undefined,
            }));
            // Optional: Basic validation before setting state
            if (file.size > maxFileSize) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    resumeFile: `File is too large (max ${Math.round(maxFileSize / 1024 / 1024)}MB).`,
                }));
                setResumeFile(null); // Clear invalid file
                // Clear file input value visually
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
                return;
            }
            // Note: Browser's 'accept' attribute provides some filtering, but JS check can be added if needed
            setResumeFile(file);
        } else {
            // Handle case where user cancels file selection
            // If you want to clear the state when the selection is cancelled:
            // setResumeFile(null);
        }
    };

    // Handle removing the selected file
    const handleRemoveFile = () => {
        setResumeFile(null);
        // Clear file input value visually
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        // Clear file errors as well
        setErrors((prevErrors) => ({
            ...prevErrors,
            resumeFile: undefined,
        }));
    };


    // --- Manual Validation ---
    const validateForm = () => {
        const newErrors = {};

        // Validate text fields (same as before)
        if (!formData.first_name.trim()) newErrors.first_name = "First name is required.";
        else if (formData.first_name.length > 50) newErrors.first_name = "First name cannot exceed 50 characters.";

        if (!formData.last_name.trim()) newErrors.last_name = "Last name is required.";
        else if (formData.last_name.length > 50) newErrors.last_name = "Last name cannot exceed 50 characters.";

        if (!formData.email.trim()) newErrors.email = "Email address is required.";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Please enter a valid email address.";

        if (!formData.phone.trim()) newErrors.phone = "Phone number is required.";
        // else if (formData.phone.length < 10) newErrors.phone = "Phone number must be at least 10 digits.";
        // else if (formData.phone.length > 15) newErrors.phone = "Phone number seems too long.";
        // else if (!/^\+\d{9,15}$/.test(formData.phone)) newErrors.phone = "Enter a valid phone number in the format: '+123456789'.";
        else if(!isValidPhoneNumber(formData.phone.trim())) newErrors.phone = "Enter a valid phone number.";

        // Validate resume file
        // Example: Make resume optional for both create and edit
        // If you wanted it required for create:
        if (!isEditMode && !resumeFile) {
            newErrors.resumeFile = "A resume file is required for new candidates.";
        }

        // Check file size again just before submit (if a file is selected)
        if (resumeFile && resumeFile.size > maxFileSize) {
            newErrors.resumeFile = `File is too large (max ${Math.round(maxFileSize / 1024 / 1024)}MB).`;
        }

        // Add other file validations if needed (e.g., type check beyond 'accept')

        return newErrors;
    };
    // --- End Manual Validation ---

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationErrors = validateForm();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            toast.error("Please check the form for errors.");
            return;
        }

        try {
            // --- Create FormData ---
            const submissionData = new FormData();
            submissionData.append("first_name", formData.first_name);
            submissionData.append("last_name", formData.last_name);
            submissionData.append("email", formData.email);
            submissionData.append("phone", formData.phone);

            // Append file only if one is selected
            if (resumeFile) {
                submissionData.append("resume", resumeFile); // Key "resume" matches common backend expectations
            }
            // --- End Create FormData ---

            // Call the passed onSubmit function with FormData
            // await onFormSubmit(submissionData, candidate?.id);

            if(isEditMode) {
                dispatch(updateCandidate(candidate.id, submissionData));
            } else {
                dispatch(createCandidate(submissionData));
            }

            // toast.success(`${formData.first_name} ${formData.last_name} has been successfully ${isEditMode ? 'updated' : 'saved'}.`);

            // onOpenChange(false);

        } catch (error) {
            console.error("Submission failed:", error);
            toast.error(`Could not ${isEditMode ? 'update' : 'create'} candidate. Please try again. ${error instanceof Error ? error.message : ''}`);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            {/*<SheetTrigger asChild>*/}
            {/*    {triggerButton && (*/}
            {/*        triggerButton*/}
            {/*    )}*/}
            {/*</SheetTrigger>*/}
            <SheetContent className="min-w-[60vw] md:min-w-[40vw] overflow-y-auto scrollbar-thin">
                <SheetHeader>
                    <SheetTitle>{isEditMode ? "Edit Candidate" : "Create New Candidate"}</SheetTitle>
                    <SheetDescription>
                        {isEditMode
                            ? "Update the details for this candidate."
                            : "Fill in the details for the new candidate."}
                        {isEditMode && candidate?.name && ` Editing: ${candidate.name}`}
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-6 px-4">

                    {/* Text Fields (First Name, Last Name, Email, Phone) - Same as before */}
                    <div className="space-y-1.5">
                        <Label htmlFor="first_name">First Name</Label>
                        <Input id="first_name" name="first_name" placeholder="e.g. John" value={formData.first_name} onChange={handleInputChange} disabled={createLoading || updateLoading} className={cn(errors.first_name && "border-red-500 focus-visible:ring-red-500")} />
                        {errors.first_name && <p className="text-sm text-red-600 mt-1">{errors.first_name}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="last_name">Last Name</Label>
                        <Input id="last_name" name="last_name" placeholder="e.g. Doe" value={formData.last_name} onChange={handleInputChange} disabled={createLoading || updateLoading} className={cn(errors.last_name && "border-red-500 focus-visible:ring-red-500")} />
                        {errors.last_name && <p className="text-sm text-red-600 mt-1">{errors.last_name}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" name="email" type="email" placeholder="e.g. john.doe@example.com" value={formData.email} onChange={handleInputChange} disabled={createLoading || updateLoading} className={cn(errors.email && "border-red-500 focus-visible:ring-red-500")} />
                        {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" name="phone" type="tel" placeholder="e.g. +1 123 456 7890" value={formData.phone} onChange={handleInputChange} disabled={createLoading || updateLoading} className={cn(errors.phone && "border-red-500 focus-visible:ring-red-500")} />
                        {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
                    </div>
                    {/* --- End Text Fields --- */}


                    {/* --- Resume Upload Section --- */}
                    <div className="space-y-2">
                        <Label htmlFor="resumeFile">Resume {isEditMode ? "(Optional - Upload to Replace)" : ""}</Label>

                        {/* Display current resume link if editing */}
                        {isEditMode && candidate?.resume && !resumeFile && (
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground p-2 border border-dashed rounded-md">
                                <FileText className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">Current: <a href={candidate.resume} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{candidate.resume.split('/').pop()}</a></span>
                            </div>
                        )}

                        {/* File Input */}
                        <div className={cn(
                            "flex items-center justify-center w-full px-3 py-2 border-2 border-dashed rounded-md",
                            errors.resumeFile ? "border-red-500" : "border-muted-foreground/50",
                            createLoading || updateLoading && "opacity-50 cursor-not-allowed"
                        )}>
                            <label htmlFor="resumeFile" className={cn("flex flex-col items-center justify-center w-full h-full cursor-pointer", createLoading || updateLoading && "cursor-not-allowed")}>
                                <div className="flex flex-col items-center justify-center pt-2 pb-3 text-center">
                                    <UploadCloud className={cn("mb-2 h-6 w-6", errors.resumeFile ? "text-red-500" : "text-gray-500 dark:text-gray-400")} />
                                    <p className={cn("mb-1 text-sm", errors.resumeFile ? "text-red-600" : "text-gray-500 dark:text-gray-400")}>
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">PDF (MAX. {Math.round(maxFileSize / 1024 / 1024)}MB)</p>
                                </div>
                                <Input
                                    id="resumeFile"
                                    name="resumeFile"
                                    type="file"
                                    ref={fileInputRef} // Attach ref
                                    className="hidden" // Hide the default input visually
                                    onChange={handleFileChange}
                                    accept={acceptedFileTypes}
                                    disabled={createLoading || updateLoading}
                                />
                            </label>
                        </div>

                        {/* Display selected file name and remove button */}
                        {resumeFile && (
                            <div className="flex items-center justify-between text-sm p-2 border rounded-md bg-muted/50">
                                <div className="flex items-center space-x-2 truncate">
                                    <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                    <span className="truncate" title={resumeFile.name}>{resumeFile.name}</span>
                                    <span className="text-xs text-muted-foreground">({Math.round(resumeFile.size / 1024)} KB)</span>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-red-500 hover:text-red-700"
                                    onClick={handleRemoveFile}
                                    disabled={createLoading || updateLoading}
                                    aria-label="Remove selected file"
                                >
                                    <XCircle className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        {/* Display validation error for file */}
                        {errors.resumeFile && <p className="text-sm text-red-600 mt-1">{errors.resumeFile}</p>}
                    </div>
                    {/* --- End Resume Upload Section --- */}


                    <SheetFooter className="pt-6 flex flex-row mt-8 pt-4 justify-end">
                        <SheetClose asChild>
                            <Button type="button" variant="outline" disabled={createLoading || updateLoading}>Cancel</Button>
                        </SheetClose>
                        <Button type="submit" disabled={createLoading || updateLoading}>
                            {(createLoading || updateLoading) ? (
                                <Loader />

                            ) : (
                                isEditMode ? "Save Changes" : "Create Candidate"
                            )}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
