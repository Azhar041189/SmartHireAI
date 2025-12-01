import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, Job, Candidate, User } from '../types';

interface StoreContextType extends AppState {
  addJob: (job: Job) => void;
  addCandidate: (candidate: Candidate) => void;
  updateCandidate: (id: string, updates: Partial<Candidate>) => void;
  deleteJob: (id: string) => void;
  deleteCandidate: (id: string) => void;
  loadDemoData: () => void;
  incrementUsage: () => void;
  resetUsage: () => void;
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  skipOnboarding: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const INITIAL_USER: User = {
  id: 'u1',
  email: 'recruiter@smarthire.ai',
  name: 'Alex Recruiter',
  role: 'admin',
};

const DEMO_JOBS: Job[] = [
  {
    id: 'j1',
    title: 'Senior Frontend Engineer',
    location: 'Remote',
    salaryRange: '$140k - $180k',
    seniority: 'Senior',
    skillsRequired: ['React', 'TypeScript', 'Tailwind', 'Node.js'],
    responsibilities: ['Build scalable UI', 'Mentor juniors', 'Architect frontend'],
    description: 'We are looking for a Senior Frontend Engineer to lead our web team. You will be responsible for architecture, code quality, and performance.',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'j2',
    title: 'Product Manager',
    location: 'New York, NY',
    salaryRange: '$130k - $160k',
    seniority: 'Mid-Level',
    skillsRequired: ['Roadmapping', 'Agile', 'User Research', 'SQL'],
    responsibilities: ['Define product strategy', 'Work with engineering', 'Analyze user data'],
    description: 'Join our product team to drive the vision of our core platform. You will work closely with engineering and design.',
    status: 'active',
    createdAt: new Date().toISOString(),
  }
];

const DEMO_CANDIDATES: Candidate[] = [
  {
    id: 'c1',
    jobId: 'j1',
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '555-0101',
    resumeText: 'Senior React Developer with 6 years experience. Expert in TypeScript and Performance optimization. Previously at Tech Corp.',
    status: 'screened',
    notes: 'Initial impression: Very strong technical background. Need to verify culture fit in the next round.',
    createdAt: new Date().toISOString(),
    aiAnalysis: {
      skillsDetected: ['React', 'TypeScript', 'Performance'],
      experienceYears: 6,
      fitScore: 92,
      recommendation: 'strong_fit',
      strengths: ['Deep React knowledge', 'Senior experience'],
      gaps: ['Node.js backend experience limited'],
      summary: 'Jane is a strong frontend specialist with significant React ecosystem experience.'
    }
  },
  {
    id: 'c2',
    jobId: 'j1',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '555-0102',
    resumeText: 'Fullstack developer mostly focused on Python/Django. Started learning React last year. Good generalist.',
    status: 'new',
    notes: '',
    createdAt: new Date().toISOString(),
  }
];

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user] = useState<User>(INITIAL_USER);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [usageCount, setUsageCount] = useState(0);
  const [onboardingStep, setOnboardingStep] = useState(0);

  // Load from local storage on mount
  useEffect(() => {
    const storedJobs = localStorage.getItem('smarthire_jobs');
    const storedCandidates = localStorage.getItem('smarthire_candidates');
    const storedUsage = localStorage.getItem('smarthire_usage');
    const onboardingComplete = localStorage.getItem('smarthire_onboarding_completed');

    if (storedJobs) setJobs(JSON.parse(storedJobs));
    if (storedCandidates) setCandidates(JSON.parse(storedCandidates));
    if (storedUsage) setUsageCount(parseInt(storedUsage, 10));
    
    // Start onboarding if not completed and no jobs exist (fresh user)
    if (!onboardingComplete && (!storedJobs || JSON.parse(storedJobs).length === 0)) {
      setOnboardingStep(1);
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('smarthire_jobs', JSON.stringify(jobs));
    localStorage.setItem('smarthire_candidates', JSON.stringify(candidates));
    localStorage.setItem('smarthire_usage', usageCount.toString());
  }, [jobs, candidates, usageCount]);

  const addJob = (job: Job) => {
    setJobs(prev => [job, ...prev]);
    if (onboardingStep === 1) {
      setOnboardingStep(2);
    }
  };

  const deleteJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
    setCandidates(prev => prev.filter(c => c.jobId !== id)); // Cascade delete
  };

  const addCandidate = (candidate: Candidate) => {
    setCandidates(prev => [candidate, ...prev]);
    if (onboardingStep === 2) {
      setOnboardingStep(3);
    }
  };

  const updateCandidate = (id: string, updates: Partial<Candidate>) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    if (onboardingStep === 4 && updates.interviewQuestions) {
      setOnboardingStep(5);
    }
  };

  const deleteCandidate = (id: string) => {
    setCandidates(prev => prev.filter(c => c.id !== id));
  };

  const loadDemoData = () => {
    setJobs([...DEMO_JOBS, ...jobs]);
    setCandidates([...DEMO_CANDIDATES, ...candidates]);
  };

  const incrementUsage = () => {
    setUsageCount(prev => prev + 1);
  };
  
  const resetUsage = () => {
    setUsageCount(0);
  }

  const skipOnboarding = () => {
    setOnboardingStep(0);
    localStorage.setItem('smarthire_onboarding_completed', 'true');
  }

  // Auto-complete onboarding at step 5
  useEffect(() => {
    if (onboardingStep === 5) {
       localStorage.setItem('smarthire_onboarding_completed', 'true');
    }
  }, [onboardingStep]);

  return (
    <StoreContext.Provider value={{ 
      user, jobs, candidates, usageCount, onboardingStep,
      addJob, deleteJob, addCandidate, updateCandidate, deleteCandidate, loadDemoData, incrementUsage, resetUsage, setOnboardingStep, skipOnboarding 
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};