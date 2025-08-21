const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export interface DashboardStats {
    totalResumes: number;
    activeJobs: number;
    averageScore: number;
    enhancedResumes: number;
    monthlyActivity: number;
}

export interface ResumeData {
    id: string;
    name: string;
    score: number;
    status: 'active' | 'draft' | 'archived';
    fileSize: string;
    uploadDate: string;
    lastUpdated: string;
}

export interface JobData {
    id: string;
    title: string;
    company: string;
    location: string;
    status: 'active' | 'archived';
    description?: string;
    requirements?: string[];
    createdDate: string;
}

export interface EnhancedResumeData {
    id: string;
    originalResumeId: string;
    jobId: string;
    score: number;
    improvements: string[];
    createdDate: string;
    status: 'processing' | 'completed' | 'failed';
}

// Get dashboard statistics
export async function getDashboardStats(): Promise<DashboardStats> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/dashboard/stats`);
        if (!response.ok) {
            throw new Error('Failed to fetch dashboard stats');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Return mock data if API fails
        return {
            totalResumes: 3,
            activeJobs: 2,
            averageScore: 85,
            enhancedResumes: 2,
            monthlyActivity: 12
        };
    }
}

// Get all resumes
export async function getResumes(): Promise<ResumeData[]> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/resumes`);
        if (!response.ok) {
            throw new Error('Failed to fetch resumes');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching resumes:', error);
        // Return mock data if API fails
        return [
            { id: '1', name: 'Software Engineer Resume.pdf', score: 85, status: 'active', fileSize: '245 KB', uploadDate: '2024-01-10', lastUpdated: '2024-01-15' },
            { id: '2', name: 'Product Manager Resume.pdf', score: 78, status: 'draft', fileSize: '198 KB', uploadDate: '2024-01-08', lastUpdated: '2024-01-10' },
            { id: '3', name: 'Data Scientist Resume.pdf', score: 92, status: 'active', fileSize: '312 KB', uploadDate: '2024-01-05', lastUpdated: '2024-01-12' }
        ];
    }
}

// Get all job descriptions
export async function getJobs(): Promise<JobData[]> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/jobs`);
        if (!response.ok) {
            throw new Error('Failed to fetch jobs');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching jobs:', error);
        // Return mock data if API fails
        return [
            { id: '1', title: 'Senior Frontend Developer', company: 'TechCorp', location: 'San Francisco', status: 'active', description: 'Build modern web applications using React and TypeScript', requirements: ['React', 'TypeScript', '5+ years experience'], createdDate: '2024-01-12' },
            { id: '2', title: 'Full Stack Engineer', company: 'StartupXYZ', location: 'Remote', status: 'archived', description: 'Full-stack development with Node.js and React', requirements: ['Node.js', 'React', 'MongoDB'], createdDate: '2024-01-08' },
            { id: '3', title: 'DevOps Engineer', company: 'CloudTech', location: 'New York', status: 'active', description: 'Manage cloud infrastructure and CI/CD pipelines', requirements: ['AWS', 'Docker', 'Kubernetes'], createdDate: '2024-01-15' }
        ];
    }
}

// Get enhanced resumes
export async function getEnhancedResumes(): Promise<EnhancedResumeData[]> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/resumes/enhanced`);
        if (!response.ok) {
            throw new Error('Failed to fetch enhanced resumes');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching enhanced resumes:', error);
        // Return mock data if API fails
        return [
            { id: '1', originalResumeId: '1', jobId: '1', score: 92, improvements: ['Added relevant keywords', 'Improved formatting'], createdDate: '2024-01-15', status: 'completed' },
            { id: '2', originalResumeId: '2', jobId: '3', score: 87, improvements: ['Enhanced skills section', 'Optimized for DevOps role'], createdDate: '2024-01-14', status: 'completed' }
        ];
    }
}

// Upload resume file
export async function uploadResume(file: File): Promise<{ success: boolean; resumeId?: string; error?: string }> {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}/api/v1/resumes/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Upload failed');
        }

        const data = await response.json();
        return { success: true, resumeId: data.resume_id };
    } catch (error) {
        console.error('Error uploading resume:', error);
        return { success: false, error: (error as Error).message };
    }
}

// Add new job description
export async function addJob(jobData: { title: string; company: string; location: string; description?: string }): Promise<{ success: boolean; jobId?: string; error?: string }> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/jobs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jobData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add job');
        }

        const data = await response.json();
        return { success: true, jobId: data.job_id };
    } catch (error) {
        console.error('Error adding job:', error);
        return { success: false, error: (error as Error).message };
    }
}

// Enhance resume for a specific job
export async function enhanceResume(resumeId: string, jobId: string): Promise<{ success: boolean; enhancedResumeId?: string; error?: string }> {
    try {
        const response = await fetch(`${API_URL}/api/v1/resumes/improve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resume_id: resumeId, job_id: jobId }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to enhance resume');
        }

        const data = await response.json();
        return { success: true, enhancedResumeId: data.enhanced_resume_id };
    } catch (error) {
        console.error('Error enhancing resume:', error);
        return { success: false, error: (error as Error).message };
    }
}

// Delete resume
export async function deleteResume(resumeId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/resumes/${resumeId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete resume');
        }

        return { success: true };
    } catch (error) {
        console.error('Error deleting resume:', error);
        return { success: false, error: (error as Error).message };
    }
}

// Delete job
export async function deleteJob(jobId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/jobs/${jobId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete job');
        }

        return { success: true };
    } catch (error) {
        console.error('Error deleting job:', error);
        return { success: false, error: (error as Error).message };
    }
}
