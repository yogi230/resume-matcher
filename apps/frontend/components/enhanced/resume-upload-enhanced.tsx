'use client';

import React, { useState, useCallback } from 'react';
import {
    AlertCircleIcon,
    CheckCircle2Icon,
    Loader2Icon,
    PaperclipIcon,
    UploadIcon,
    XIcon,
    PlusIcon,
    FileTextIcon,
} from 'lucide-react';
import { formatBytes, useFileUpload, FileMetadata } from '@/hooks/use-file-upload';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import ResultsDisplay from './results-display';

const acceptedFileTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const acceptString = acceptedFileTypes.join(',');
const API_RESUME_UPLOAD_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/resumes/upload`;

interface JobDescription {
    id: string;
    text: string;
    title: string;
}

export default function ResumeUploadEnhanced() {
    const maxSize = 2 * 1024 * 1024; // 2MB
    const [resumeId, setResumeId] = useState<string | null>(null);
    const [parsingProgress, setParsingProgress] = useState(0);
    const [isParsing, setIsParsing] = useState(false);
    const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
    const [isProcessingJobs, setIsProcessingJobs] = useState(false);
    const [processingProgress, setProcessingProgress] = useState(0);
    const [results, setResults] = useState<any[]>([]);

    const [uploadFeedback, setUploadFeedback] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    const [
        { files, isDragging, errors: validationOrUploadErrors, isUploadingGlobal },
        {
            handleDragEnter,
            handleDragLeave,
            handleDragOver,
            handleDrop,
            openFileDialog,
            removeFile,
            getInputProps,
            clearErrors,
        },
    ] = useFileUpload({
        maxSize,
        accept: acceptString,
        multiple: false,
        uploadUrl: API_RESUME_UPLOAD_URL,
        onUploadSuccess: (uploadedFile, response) => {
            console.log('Upload successful:', uploadedFile, response);
            const data = response as Record<string, unknown> & { resume_id?: string };
            const resumeId = typeof data.resume_id === 'string' ? data.resume_id : undefined;

            if (!resumeId) {
                console.error('Missing resume_id in upload response', response);
                setUploadFeedback({
                    type: 'error',
                    message: 'Upload succeeded but no resume ID received.',
                });
                return;
            }

            setResumeId(resumeId);
            setUploadFeedback({
                type: 'success',
                message: `${(uploadedFile.file as FileMetadata).name} uploaded successfully!`,
            });
            clearErrors();

            // Simulate parsing progress
            simulateParsingProgress();
        },
        onUploadError: (file, errorMsg) => {
            console.error('Upload error:', file, errorMsg);
            setUploadFeedback({
                type: 'error',
                message: errorMsg || 'An unknown error occurred during upload.',
            });
        },
        onFilesChange: (currentFiles) => {
            if (currentFiles.length === 0) {
                setUploadFeedback(null);
            }
        },
    });

    const simulateParsingProgress = () => {
        setIsParsing(true);
        setParsingProgress(0);

        const interval = setInterval(() => {
            setParsingProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsParsing(false);
                    return 100;
                }
                return prev + 10;
            });
        }, 200);
    };

    const addJobDescription = () => {
        const newJob: JobDescription = {
            id: Date.now().toString(),
            text: '',
            title: `Job Description ${jobDescriptions.length + 1}`,
        };
        setJobDescriptions([...jobDescriptions, newJob]);
    };

    const updateJobDescription = (id: string, text: string) => {
        setJobDescriptions(prev =>
            prev.map(job =>
                job.id === id ? { ...job, text } : job
            )
        );
    };

    const removeJobDescription = (id: string) => {
        setJobDescriptions(prev => prev.filter(job => job.id !== id));
    };

    const processAllJobs = async () => {
        if (!resumeId || jobDescriptions.length === 0) return;

        const validJobs = jobDescriptions.filter(job => job.text.trim());
        if (validJobs.length === 0) {
            setUploadFeedback({
                type: 'error',
                message: 'Please add at least one job description.',
            });
            return;
        }

        setIsProcessingJobs(true);
        setProcessingProgress(0);
        setResults([]);

        try {
            // Process each job description
            for (let i = 0; i < validJobs.length; i++) {
                const job = validJobs[i];
                setProcessingProgress((i / validJobs.length) * 100);

                // Upload job description
                const jobResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/jobs/upload`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        job_descriptions: [job.text.trim()],
                        resume_id: resumeId
                    }),
                });

                if (!jobResponse.ok) {
                    throw new Error(`Failed to upload job description ${i + 1}`);
                }

                const jobData = await jobResponse.json();
                const jobId = jobData.job_id[0];

                // Improve resume for this job
                const improveResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/resumes/improve`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        resume_id: resumeId,
                        job_id: jobId
                    }),
                });

                if (!improveResponse.ok) {
                    throw new Error(`Failed to improve resume for job ${i + 1}`);
                }

                const improveData = await improveResponse.json();

                setResults(prev => [...prev, {
                    jobTitle: job.title,
                    jobDescription: job.text,
                    result: improveData.data,
                }]);
            }

            setProcessingProgress(100);
            setUploadFeedback({
                type: 'success',
                message: `Successfully processed ${validJobs.length} job descriptions!`,
            });
        } catch (error) {
            console.error('Error processing jobs:', error);
            setUploadFeedback({
                type: 'error',
                message: `Error processing jobs: ${(error as Error).message}`,
            });
        } finally {
            setIsProcessingJobs(false);
        }
    };

    const currentFile = files[0];
    const displayErrors = uploadFeedback?.type === 'error' ? [uploadFeedback.message] : validationOrUploadErrors;

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8">
            {/* Resume Upload Section */}
            <Card className="bg-gray-900/80 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                        <FileTextIcon className="w-6 h-6" />
                        Upload Your Resume
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* File Upload Area */}
                    <div
                        role="button"
                        tabIndex={!currentFile && !isUploadingGlobal && !isParsing ? 0 : -1}
                        onClick={!currentFile && !isUploadingGlobal && !isParsing ? openFileDialog : undefined}
                        onKeyDown={(e) => {
                            if ((e.key === 'Enter' || e.key === ' ') && !currentFile && !isUploadingGlobal && !isParsing)
                                openFileDialog();
                        }}
                        onDragEnter={!isUploadingGlobal && !isParsing ? handleDragEnter : undefined}
                        onDragLeave={!isUploadingGlobal && !isParsing ? handleDragLeave : undefined}
                        onDragOver={!isUploadingGlobal && !isParsing ? handleDragOver : undefined}
                        onDrop={!isUploadingGlobal && !isParsing ? handleDrop : undefined}
                        data-dragging={isDragging || undefined}
                        className={`relative rounded-xl border-2 border-dashed transition-all duration-300 ease-in-out
							${currentFile || isUploadingGlobal || isParsing
                                ? 'cursor-not-allowed opacity-70 border-gray-700'
                                : 'cursor-pointer border-gray-600 hover:border-primary hover:bg-gray-900/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                            }
							${isDragging && !isUploadingGlobal && !isParsing
                                ? 'border-primary bg-primary/10'
                                : 'bg-gray-900/50'
                            }`}
                        aria-disabled={Boolean(currentFile) || isUploadingGlobal || isParsing}
                    >
                        <div className="flex min-h-48 w-full flex-col items-center justify-center p-6 text-center">
                            <input {...getInputProps()} />
                            {isUploadingGlobal ? (
                                <>
                                    <Loader2Icon className="mb-4 size-10 animate-spin text-primary" />
                                    <p className="text-lg font-semibold text-white">Uploading...</p>
                                    <p className="text-sm text-muted-foreground">
                                        Your file is being uploaded.
                                    </p>
                                </>
                            ) : isParsing ? (
                                <>
                                    <Loader2Icon className="mb-4 size-10 animate-spin text-primary" />
                                    <p className="text-lg font-semibold text-white">Parsing Resume...</p>
                                    <div className="w-full max-w-xs mt-4">
                                        <Progress value={parsingProgress} className="w-full" />
                                        <p className="text-sm text-muted-foreground mt-2">
                                            {parsingProgress}% Complete
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="mb-4 flex size-12 items-center justify-center rounded-full border border-gray-700 bg-gray-800 text-gray-400">
                                        <UploadIcon className="size-6" />
                                    </div>
                                    <p className="mb-1 text-lg font-semibold text-white">
                                        {currentFile ? 'File Ready' : 'Upload Your Resume'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {currentFile
                                            ? currentFile.file.name
                                            : `Drag & drop or click (PDF, DOCX up to ${formatBytes(maxSize)})`}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* File Info */}
                    {currentFile && !isUploadingGlobal && !isParsing && (
                        <div className="rounded-xl border border-gray-700 bg-background/60 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <PaperclipIcon className="size-5 shrink-0 text-muted-foreground" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-white">
                                            {currentFile.file.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatBytes(currentFile.file.size)} - Ready
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="size-8 shrink-0 text-muted-foreground hover:text-white"
                                    onClick={() => removeFile(currentFile.id)}
                                    aria-label="Remove file"
                                >
                                    <XIcon className="size-5" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Errors */}
                    {displayErrors.length > 0 && !isUploadingGlobal && !isParsing && (
                        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                            <div className="flex items-start gap-2">
                                <AlertCircleIcon className="mt-0.5 size-5 shrink-0" />
                                <div>
                                    <p className="font-semibold">Error</p>
                                    {displayErrors.map((error, index) => (
                                        <p key={index}>{error}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success Message */}
                    {uploadFeedback?.type === 'success' && !isUploadingGlobal && !isParsing && (
                        <div className="rounded-md border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-600">
                            <div className="flex items-start gap-2">
                                <CheckCircle2Icon className="mt-0.5 size-5 shrink-0" />
                                <div>
                                    <p className="font-semibold">Success</p>
                                    <p>{uploadFeedback.message}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Job Descriptions Section */}
            {resumeId && (
                <Card className="bg-gray-900/80 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                            <PlusIcon className="w-6 h-6" />
                            Add Job Descriptions
                        </CardTitle>
                        <p className="text-gray-300 text-sm">
                            Add as many job descriptions as you want. We'll analyze your resume against each one.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {jobDescriptions.map((job, index) => (
                            <div key={job.id} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-lg font-semibold text-white">{job.title}</h4>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeJobDescription(job.id)}
                                        className="text-red-400 hover:text-red-300"
                                    >
                                        <XIcon className="w-4 h-4" />
                                    </Button>
                                </div>
                                <Textarea
                                    value={job.text}
                                    onChange={(e) => updateJobDescription(job.id, e.target.value)}
                                    placeholder="Paste the job description here..."
                                    rows={8}
                                    className="bg-gray-800/30 border-gray-600 text-white placeholder:text-gray-400"
                                />
                            </div>
                        ))}

                        <Button
                            onClick={addJobDescription}
                            variant="outline"
                            className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Add Another Job Description
                        </Button>

                        {jobDescriptions.length > 0 && (
                            <Button
                                onClick={processAllJobs}
                                disabled={isProcessingJobs}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {isProcessingJobs ? (
                                    <>
                                        <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                                        Processing Jobs... {Math.round(processingProgress)}%
                                    </>
                                ) : (
                                    'Analyze Resume Against All Jobs'
                                )}
                            </Button>
                        )}

                        {isProcessingJobs && (
                            <div className="w-full">
                                <Progress value={processingProgress} className="w-full" />
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Results Section */}
            {results.length > 0 && <ResultsDisplay results={results} />}
        </div>
    );
}
