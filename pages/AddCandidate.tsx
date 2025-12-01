import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { screenResume } from '../services/geminiService';
import { Upload, Sparkles, Loader2, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';

export const AddCandidate: React.FC = () => {
  const navigate = useNavigate();
  const { jobs, addCandidate, incrementUsage } = useStore();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    jobId: jobs[0]?.id || '',
    resumeText: ''
  });

  const [isScreening, setIsScreening] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'text/plain') {
      const text = await file.text();
      setFormData(prev => ({ ...prev, resumeText: text }));
    } else {
      setError("For this demo, please upload .txt files or copy-paste text below.");
    }
  };

  const handleScreening = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.resumeText || !formData.jobId) {
      setError('Please fill in all fields.');
      return;
    }

    const selectedJob = jobs.find(j => j.id === formData.jobId);
    if (!selectedJob) return;

    setIsScreening(true);
    setError('');

    try {
      // 1. Screen with AI
      const analysis = await screenResume(formData.resumeText, selectedJob);
      incrementUsage();

      // 2. Save Candidate
      const newCandidateId = Math.random().toString(36).substr(2, 9);
      addCandidate({
        id: newCandidateId,
        jobId: formData.jobId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        resumeText: formData.resumeText,
        status: 'screened', 
        aiAnalysis: analysis,
        createdAt: new Date().toISOString()
      });

      navigate(`/candidates/${newCandidateId}`);
    } catch (err) {
      console.error(err);
      setError('Screening failed. Please check API key and try again.');
    } finally {
      setIsScreening(false);
    }
  };

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
           <FileText className="w-8 h-8 text-blue-500 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Jobs Available</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">You need to create a job position before you can screen candidates.</p>
        <button 
          onClick={() => navigate('/create-job')} 
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95"
          title="Go to job creation page"
        >
           Create First Job
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Add Candidate</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Upload a resume and let our AI agent analyze the fit instantly.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none p-6 sm:p-10 animate-slide-up hover:shadow-2xl transition-shadow duration-500">
        <form onSubmit={handleScreening} className="space-y-8">
          
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">1</span>
              Candidate Info
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name <span className="text-red-500">*</span></label>
                <input
                  required
                  type="text"
                  className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200 bg-white dark:bg-slate-950 text-slate-900 dark:text-white hover:border-blue-300 dark:hover:border-slate-600"
                  placeholder="e.g. Jane Doe"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  title="Candidate's full name"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Assign to Job <span className="text-red-500">*</span></label>
                <select
                  required
                  className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-all duration-200 hover:border-blue-300 dark:hover:border-slate-600"
                  value={formData.jobId}
                  onChange={e => setFormData({...formData, jobId: e.target.value})}
                  title="Select the job position for this candidate"
                >
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>{job.title}</option>
                  ))}
                </select>
              </div>

               <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200 bg-white dark:bg-slate-950 text-slate-900 dark:text-white hover:border-blue-300 dark:hover:border-slate-600"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  title="Contact email (optional)"
                />
              </div>
               <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200 bg-white dark:bg-slate-950 text-slate-900 dark:text-white hover:border-blue-300 dark:hover:border-slate-600"
                  placeholder="(555) 555-5555"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  title="Contact phone number (optional)"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">2</span>
              Resume Data
            </h3>
            
            <div 
              className="group border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 rounded-xl p-8 text-center transition-all duration-300 cursor-pointer relative hover:scale-[1.01]"
              title="Upload resume file (text format preferred for demo)"
            >
               <input 
                  type="file" 
                  id="resume-upload" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  accept=".txt"
                  onChange={handleFileChange}
                />
               <div className="flex flex-col items-center pointer-events-none">
                  <div className="p-4 bg-white dark:bg-slate-800 shadow-sm rounded-full text-blue-600 dark:text-blue-400 mb-3 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-6">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-base font-semibold text-slate-900 dark:text-white mb-1 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">Click to upload resume</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">Supports .txt (PDF parsing disabled in demo)</span>
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex justify-between">
                  <span>Or paste text directly</span>
                  {formData.resumeText.length > 0 && <span className="text-green-600 dark:text-green-400 text-xs flex items-center gap-1 animate-fade-in"><CheckCircle2 className="w-3 h-3"/> Text loaded</span>}
               </label>
               <textarea
                required
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-40 font-mono text-xs leading-relaxed transition-all duration-200 resize-y bg-white dark:bg-slate-950 text-slate-900 dark:text-white hover:border-blue-300 dark:hover:border-slate-600"
                placeholder="Paste the full resume text here..."
                value={formData.resumeText}
                onChange={e => setFormData({...formData, resumeText: e.target.value})}
                title="Paste resume text if you don't have a file"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm flex items-start gap-2 animate-fade-in">
              <div className="mt-0.5"><Sparkles className="w-4 h-4"/></div>
              {error}
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={isScreening}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 hover:shadow-blue-500/40"
              title="Consume 1 credit to analyze fit and extract skills"
            >
              {isScreening ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Candidate...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Screen Candidate with AI
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-400 mt-4">
               AI Agent will extract skills, calculate fit score, and generate interview questions.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};