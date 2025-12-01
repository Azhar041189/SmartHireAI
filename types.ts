export type Role = 'admin' | 'recruiter' | 'hiring_manager';

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export interface Job {
  id: string;
  title: string;
  location: string;
  salaryRange: string;
  seniority: string;
  skillsRequired: string[];
  responsibilities: string[];
  description: string;
  status: 'active' | 'closed' | 'draft';
  createdAt: string;
}

export interface Candidate {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  resumeText: string;
  status: 'new' | 'screened' | 'interviewing' | 'offer' | 'rejected';
  notes?: string;
  aiAnalysis?: AIAnalysis;
  interviewQuestions?: InterviewQuestions;
  backgroundCheck?: BackgroundCheckResult;
  offerData?: OfferResult;
  salaryEstimation?: SalaryEstimationResult;
  createdAt: string;
}

export interface AIAnalysis {
  skillsDetected: string[];
  experienceYears: number;
  fitScore: number;
  recommendation: 'strong_fit' | 'medium_fit' | 'not_fit';
  strengths: string[];
  gaps: string[];
  summary: string;
}

export interface InterviewQuestions {
  technical: string[];
  behavioral: string[];
  culture: string[];
}

export interface BackgroundCheckResult {
  risk_assessment: 'low' | 'medium' | 'high';
  concerns: string[];
  verification_recommendations: string[];
  summary: string;
}

export interface OfferResult {
  offer_letter: string;
  email_copy: string;
  next_steps: string[];
}

export interface SalaryEstimationResult {
  estimated_range: string;
  market_factors: string[];
  justification: string;
  negotiation_advice: string;
}

export interface SourcingResult {
  platforms: string[];
  boolean_search_strings: {
    linkedin?: string;
    google?: string;
    github?: string;
    [key: string]: string | undefined;
  };
  ideal_candidate_profile: string;
  outreach_templates: string[];
}

export interface AppState {
  user: User;
  jobs: Job[];
  candidates: Candidate[];
  usageCount: number; // For free tier limit
}