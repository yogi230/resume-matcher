'use client';

import BackgroundContainer from '@/components/common/background-container';
import ResumeUploadEnhanced from '@/components/enhanced/resume-upload-enhanced';

export default function EnhancedResumeMatcher() {
    return (
        <BackgroundContainer innerClassName="justify-start pt-16">
            <div className="w-full max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-6">
                        Enhanced Resume Matcher
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        Upload your resume, add multiple job descriptions, and get comprehensive analysis
                        with scores, suggestions, and improvements for each position.
                    </p>
                </div>

                <ResumeUploadEnhanced />
            </div>
        </BackgroundContainer>
    );
}
