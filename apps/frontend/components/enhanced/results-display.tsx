'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
    CheckCircle2Icon,
    AlertCircleIcon,
    TrendingUpIcon,
    FileTextIcon,
    StarIcon,
    LightbulbIcon,
    TargetIcon,
    BarChart3Icon
} from 'lucide-react';

interface JobResult {
    jobTitle: string;
    jobDescription: string;
    result: {
        score?: number;
        details?: string;
        commentary?: string;
        improvements?: Array<{
            suggestion: string;
            lineNumber?: string | number;
        }>;
        improved_resume?: string;
    };
}

interface ResultsDisplayProps {
    results: JobResult[];
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
    const [selectedResult, setSelectedResult] = useState<JobResult | null>(null);
    const [showImprovedResume, setShowImprovedResume] = useState(false);

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getScoreBackground = (score: number) => {
        if (score >= 80) return 'bg-green-500/20 border-green-500/30';
        if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
        return 'bg-red-500/20 border-red-500/30';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return 'Excellent Match';
        if (score >= 60) return 'Good Match';
        return 'Needs Improvement';
    };

    return (
        <div className="space-y-6">
            {/* Summary Card */}
            <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                        <BarChart3Icon className="w-6 h-6" />
                        Analysis Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-400">{results.length}</div>
                            <div className="text-gray-300 text-sm">Jobs Analyzed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-400">
                                {Math.round(results.reduce((acc, r) => acc + (r.result.score || 0), 0) / results.length)}
                            </div>
                            <div className="text-gray-300 text-sm">Average Score</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-yellow-400">
                                {results.filter(r => (r.result.score || 0) >= 80).length}
                            </div>
                            <div className="text-gray-300 text-sm">Strong Matches</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Individual Job Results */}
            {results.map((result, index) => (
                <Card key={index} className="border-gray-700">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <CardTitle className="text-xl font-bold text-white mb-2">
                                    {result.jobTitle}
                                </CardTitle>
                                <div className="flex items-center gap-4">
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBackground(result.result.score || 0)} ${getScoreColor(result.result.score || 0)}`}>
                                        {getScoreLabel(result.result.score || 0)}
                                    </div>
                                    <div className="text-gray-400 text-sm">
                                        Score: <span className={`font-bold ${getScoreColor(result.result.score || 0)}`}>{result.result.score || 'N/A'}/100</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                                            <FileTextIcon className="w-4 h-4 mr-2" />
                                            View Details
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl font-bold text-white">
                                                Detailed Analysis: {result.jobTitle}
                                            </DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-6">
                                            {/* Job Description */}
                                            <div>
                                                <h4 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
                                                    <TargetIcon className="w-5 h-5" />
                                                    Job Description
                                                </h4>
                                                <div className="bg-gray-800 p-4 rounded-lg">
                                                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{result.jobDescription}</p>
                                                </div>
                                            </div>

                                            {/* Score and Analysis */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="bg-gray-800 p-4 rounded-lg">
                                                    <h5 className="text-lg font-semibold text-green-400 mb-3">Score Analysis</h5>
                                                    <div className="text-center mb-4">
                                                        <div className={`text-5xl font-bold ${getScoreColor(result.result.score || 0)}`}>
                                                            {result.result.score || 'N/A'}
                                                        </div>
                                                        <div className="text-gray-400">/100</div>
                                                    </div>
                                                    <div className="w-full bg-gray-700 rounded-full h-3 mb-3">
                                                        <div
                                                            className={`h-3 rounded-full ${getScoreColor(result.result.score || 0).replace('text-', 'bg-')}`}
                                                            style={{ width: `${result.result.score || 0}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-gray-300 text-sm text-center">
                                                        {getScoreLabel(result.result.score || 0)}
                                                    </p>
                                                </div>

                                                <div className="bg-gray-800 p-4 rounded-lg">
                                                    <h5 className="text-lg font-semibold text-blue-400 mb-3">Analysis Details</h5>
                                                    {result.result.details && (
                                                        <div className="mb-3">
                                                            <p className="text-gray-300 text-sm"><strong>Details:</strong> {result.result.details}</p>
                                                        </div>
                                                    )}
                                                    {result.result.commentary && (
                                                        <div>
                                                            <p className="text-gray-300 text-sm"><strong>Commentary:</strong> {result.result.commentary}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Improvement Suggestions */}
                                            {result.result.improvements && result.result.improvements.length > 0 && (
                                                <div>
                                                    <h4 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                                                        <LightbulbIcon className="w-5 h-5" />
                                                        Improvement Suggestions
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {result.result.improvements.map((improvement, idx) => (
                                                            <div key={idx} className="bg-gray-800 p-4 rounded-lg border-l-4 border-yellow-500">
                                                                <p className="text-gray-200 text-sm">{improvement.suggestion}</p>
                                                                {improvement.lineNumber && (
                                                                    <p className="text-xs text-gray-500 mt-2">Reference: {improvement.lineNumber}</p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Improved Resume */}
                                            {result.result.improved_resume && (
                                                <div>
                                                    <h4 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                                                        <TrendingUpIcon className="w-5 h-5" />
                                                        Improved Resume
                                                    </h4>
                                                    <div className="bg-gray-800 p-4 rounded-lg">
                                                        <div className="text-gray-300 text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                                                            {result.result.improved_resume}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                {result.result.improved_resume && (
                                    <Button
                                        onClick={() => {
                                            setSelectedResult(result);
                                            setShowImprovedResume(true);
                                        }}
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <TrendingUpIcon className="w-4 h-4 mr-2" />
                                        View Improved
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Job Description Preview */}
                            <div>
                                <h4 className="text-lg font-medium text-blue-400 mb-2">Job Description</h4>
                                <p className="text-gray-300 text-sm line-clamp-4 bg-gray-800 p-3 rounded">
                                    {result.jobDescription}
                                </p>
                            </div>

                            {/* Quick Stats */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400 text-sm">Match Score:</span>
                                    <span className={`font-bold ${getScoreColor(result.result.score || 0)}`}>
                                        {result.result.score || 'N/A'}/100
                                    </span>
                                </div>

                                {result.result.improvements && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400 text-sm">Suggestions:</span>
                                        <span className="text-yellow-400 font-bold">
                                            {result.result.improvements.length}
                                        </span>
                                    </div>
                                )}

                                {result.result.improved_resume && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400 text-sm">Improved Version:</span>
                                        <span className="text-green-400 font-bold flex items-center gap-1">
                                            <CheckCircle2Icon className="w-4 h-4" />
                                            Available
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Improvement Preview */}
                        {result.result.improvements && result.result.improvements.length > 0 && (
                            <div className="mt-4">
                                <h4 className="text-lg font-medium text-yellow-400 mb-2 flex items-center gap-2">
                                    <LightbulbIcon className="w-5 h-5" />
                                    Top Suggestions
                                </h4>
                                <div className="space-y-2">
                                    {result.result.improvements.slice(0, 2).map((improvement, idx) => (
                                        <div key={idx} className="bg-gray-800 p-3 rounded border-l-2 border-yellow-500">
                                            <p className="text-gray-300 text-sm">{improvement.suggestion}</p>
                                        </div>
                                    ))}
                                    {result.result.improvements.length > 2 && (
                                        <p className="text-gray-500 text-sm text-center">
                                            +{result.result.improvements.length - 2} more suggestions
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}

            {/* Improved Resume Modal */}
            {selectedResult && showImprovedResume && (
                <Dialog open={showImprovedResume} onOpenChange={setShowImprovedResume}>
                    <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-5xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                                <TrendingUpIcon className="w-6 h-6" />
                                Improved Resume for {selectedResult.jobTitle}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="bg-gray-800 p-6 rounded-lg">
                                <div className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
                                    {selectedResult.result.improved_resume}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    onClick={() => {
                                        // Copy to clipboard
                                        navigator.clipboard.writeText(selectedResult.result.improved_resume || '');
                                    }}
                                    variant="outline"
                                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                                >
                                    Copy to Clipboard
                                </Button>
                                <Button
                                    onClick={() => setShowImprovedResume(false)}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
