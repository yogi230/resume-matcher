'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, Target, TrendingUp, Plus, Upload, Zap, Eye, Download, Edit, X, Loader2, Trash2 } from 'lucide-react';
import {
    getResumes,
    getJobs,
    getEnhancedResumes,
    uploadResume,
    addJob,
    enhanceResume,
    deleteResume,
    deleteJob,
    type ResumeData,
    type JobData,
    type EnhancedResumeData
} from '@/lib/api/dashboard';

interface Resume extends ResumeData { }
interface Job extends JobData { }

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState('overview');
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [enhancedResumes, setEnhancedResumes] = useState<EnhancedResumeData[]>([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showJobModal, setShowJobModal] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [newJob, setNewJob] = useState({ title: '', company: '', location: '', description: '' });

    useEffect(() => {
        // Load data from API
        const loadData = async () => {
            try {
                const [resumesData, jobsData, enhancedData] = await Promise.all([
                    getResumes(),
                    getJobs(),
                    getEnhancedResumes()
                ]);
                setResumes(resumesData);
                setJobs(jobsData);
                setEnhancedResumes(enhancedData);
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            }
        };

        loadData();
    }, []);

    const handleUpload = async () => {
        if (!uploadFile) return;

        setIsUploading(true);
        try {
            const result = await uploadResume(uploadFile);
            if (result.success) {
                // Refresh resumes list
                const newResumes = await getResumes();
                setResumes(newResumes);
                setShowUploadModal(false);
                setUploadFile(null);
            } else {
                alert(`Upload failed: ${result.error}`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleAddJob = async () => {
        if (!newJob.title || !newJob.company || !newJob.location) return;

        try {
            const result = await addJob(newJob);
            if (result.success) {
                // Refresh jobs list
                const newJobs = await getJobs();
                setJobs(newJobs);
                setNewJob({ title: '', company: '', location: '', description: '' });
                setShowJobModal(false);
            } else {
                alert(`Failed to add job: ${result.error}`);
            }
        } catch (error) {
            console.error('Add job error:', error);
            alert('Failed to add job. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Resume Matcher Dashboard</h1>
                            <p className="text-gray-600 mt-1">Manage your resumes and job applications</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm" onClick={() => setShowUploadModal(true)}>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Resume
                            </Button>
                            <Button size="sm" onClick={() => setShowJobModal(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Job
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Resumes</p>
                                    <p className="text-2xl font-bold text-gray-900">{resumes.length}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {jobs.filter(job => job.status === 'active').length}
                                    </p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <Target className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Avg Score</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {resumes.length > 0 ? Math.round(resumes.reduce((acc, r) => acc + r.score, 0) / resumes.length) : 0}
                                    </p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <TrendingUp className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Enhanced</p>
                                    <p className="text-2xl font-bold text-gray-900">2</p>
                                </div>
                                <div className="p-3 bg-orange-100 rounded-full">
                                    <Zap className="w-6 h-6 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="resumes" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                            <FileText className="w-4 h-4 mr-2" />
                            Resumes
                        </TabsTrigger>
                        <TabsTrigger value="jobs" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                            <Target className="w-4 h-4 mr-2" />
                            Jobs
                        </TabsTrigger>
                        <TabsTrigger value="enhanced" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                            <Zap className="w-4 h-4 mr-2" />
                            Enhanced
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Analytics
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview">
                        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle>Welcome to Your Dashboard</CardTitle>
                                <CardDescription>Quick overview of your resume matching activities</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setShowUploadModal(true)}>
                                        <Upload className="w-6 h-6" />
                                        Upload Resume
                                    </Button>
                                    <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setShowJobModal(true)}>
                                        <Plus className="w-6 h-6" />
                                        Add Job
                                    </Button>
                                    <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setActiveTab('enhanced')}>
                                        <Zap className="w-6 h-6" />
                                        Enhance Resume
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Resumes Tab */}
                    <TabsContent value="resumes">
                        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle>Resume Management</CardTitle>
                                <CardDescription>View and manage your uploaded resumes</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {resumes.map((resume) => (
                                        <div key={resume.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <FileText className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{resume.name}</p>
                                                    <p className="text-sm text-gray-500">{resume.fileSize}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Badge variant={resume.status === 'active' ? 'default' : 'secondary'}>
                                                    {resume.status}
                                                </Badge>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-gray-900">Score: {resume.score}</p>
                                                    <Progress value={resume.score} className="w-20" />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm">
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={async () => {
                                                            if (confirm('Are you sure you want to delete this resume?')) {
                                                                const result = await deleteResume(resume.id);
                                                                if (result.success) {
                                                                    const newResumes = await getResumes();
                                                                    setResumes(newResumes);
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Jobs Tab */}
                    <TabsContent value="jobs">
                        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle>Job Descriptions</CardTitle>
                                <CardDescription>Manage your job applications</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {jobs.map((job) => (
                                        <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-green-100 rounded-lg">
                                                    <Target className="w-5 h-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{job.title}</p>
                                                    <p className="text-sm text-gray-500">{job.company} • {job.location}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                                                    {job.status}
                                                </Badge>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={async () => {
                                                            if (confirm('Are you sure you want to delete this job?')) {
                                                                const result = await deleteJob(job.id);
                                                                if (result.success) {
                                                                    const newJobs = await getJobs();
                                                                    setJobs(newJobs);
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Enhanced Tab */}
                    <TabsContent value="enhanced">
                        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle>Enhanced Resumes</CardTitle>
                                <CardDescription>AI-optimized versions of your resumes</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {enhancedResumes.length > 0 ? (
                                    <div className="space-y-4">
                                        {enhancedResumes.map((enhanced) => {
                                            const originalResume = resumes.find(r => r.id === enhanced.originalResumeId);
                                            const job = jobs.find(j => j.id === enhanced.jobId);

                                            return (
                                                <div key={enhanced.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-2 bg-purple-100 rounded-lg">
                                                            <Zap className="w-5 h-5 text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {originalResume?.name} → {job?.title}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                Enhanced on {enhanced.createdDate}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <Badge
                                                            variant={
                                                                enhanced.status === 'completed' ? 'default' :
                                                                    enhanced.status === 'processing' ? 'secondary' : 'destructive'
                                                            }
                                                        >
                                                            {enhanced.status}
                                                        </Badge>
                                                        {enhanced.status === 'completed' && (
                                                            <div className="text-right">
                                                                <p className="text-sm font-medium text-gray-900">Score: {enhanced.score}</p>
                                                                <Progress value={enhanced.score} className="w-20" />
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2">
                                                            <Button variant="ghost" size="sm">
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm">
                                                                <Download className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <Zap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                        <p className="text-lg font-medium">No enhanced resumes yet</p>
                                        <p className="text-sm">Create your first AI-enhanced resume by matching it with a job description</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Analytics Tab */}
                    <TabsContent value="analytics">
                        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle>Analytics</CardTitle>
                                <CardDescription>Performance metrics and insights</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-lg font-medium mb-4">Success Rate</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">High Score (80+)</span>
                                                <span className="text-sm font-medium text-green-600">
                                                    {resumes.filter(r => r.score >= 80).length}/{resumes.length}
                                                </span>
                                            </div>
                                            <Progress
                                                value={resumes.length > 0 ? (resumes.filter(r => r.score >= 80).length / resumes.length) * 100 : 0}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md mx-4">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Upload Resume</CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => setShowUploadModal(false)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-2">Select a PDF or DOCX file</p>
                                <Input
                                    type="file"
                                    accept=".pdf,.docx"
                                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setShowUploadModal(false)} className="flex-1">
                                    Cancel
                                </Button>
                                <Button onClick={handleUpload} disabled={isUploading} className="flex-1">
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        'Upload'
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Add Job Modal */}
            {showJobModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md mx-4">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Add Job</CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => setShowJobModal(false)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-2">Job Title</p>
                                <Input
                                    placeholder="e.g., Senior Frontend Developer"
                                    value={newJob.title}
                                    onChange={(e) => setNewJob(prev => ({ ...prev, title: e.target.value }))}
                                />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-2">Company</p>
                                <Input
                                    placeholder="e.g., TechCorp"
                                    value={newJob.company}
                                    onChange={(e) => setNewJob(prev => ({ ...prev, company: e.target.value }))}
                                />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-2">Location</p>
                                <Input
                                    placeholder="e.g., San Francisco, CA"
                                    value={newJob.location}
                                    onChange={(e) => setNewJob(prev => ({ ...prev, location: e.target.value }))}
                                />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-2">Description (Optional)</p>
                                <Input
                                    placeholder="Brief job description..."
                                    value={newJob.description}
                                    onChange={(e) => setNewJob(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setShowJobModal(false)} className="flex-1">
                                    Cancel
                                </Button>
                                <Button onClick={handleAddJob} className="flex-1">
                                    Add Job
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
