import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { generateJobDescription } from '../services/geminiService';
import { Sparkles, Loader2, CheckCircle } from 'lucide-react';

export const CreateJob: React.FC = () => {
  const navigate = useNavigate();
  const { addJob, incrementUsage } = useStore();
  
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    salaryRange: '',
    seniority: 'Mid-Level',
    skills: '',
    responsibilities: '',
    description: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateJD = async () => {
    if (!formData.title || !formData.skills) {
      setError('Please provide a Job Title and Skills to generate a description.');
      return;
    }
    
    setIsGenerating(true);
    setError('');
    
    try {
      const skillsList = formData.skills.split(',').map(s => s.trim());
      const respList = formData.responsibilities.split(',').map(s => s.trim());
      
      const result = await generateJobDescription(
        formData.title,
        skillsList,
        respList,
        formData.salaryRange,
        formData.seniority
      );
      
      setFormData(prev => ({ ...prev, description: result.description }));
      incrementUsage();
    } catch (err) {
      setError('Failed to generate description. Please check your API key.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    addJob({
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title,
      location: formData.location,
      salaryRange: formData.salaryRange,
      seniority: formData.seniority,
      skillsRequired: formData.skills.split(',').map(s => s.trim()),
      responsibilities: formData.responsibilities.split('\n').map(s => s.trim()),
      description: formData.description,
      status: 'active',
      createdAt: new Date().toISOString()
    });

    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Job</h1>
        <p className="text-slate-500 dark:text-slate-400">Define the role and let AI help you write the perfect description.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 animate-slide-up hover:shadow-md transition-shadow duration-300">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Job Title</label>
              <input
                required
                type="text"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white dark:bg-slate-950 text-slate-900 dark:text-white hover:border-blue-300 dark:hover:border-slate-600"
                placeholder="e.g. Senior Product Designer"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                title="Enter the official title for the position"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Location</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white dark:bg-slate-950 text-slate-900 dark:text-white hover:border-blue-300 dark:hover:border-slate-600"
                placeholder="e.g. Remote / New York"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                title="Specify office location or Remote status"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Salary Range</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white dark:bg-slate-950 text-slate-900 dark:text-white hover:border-blue-300 dark:hover:border-slate-600"
                placeholder="e.g. $120k - $150k"
                value={formData.salaryRange}
                onChange={e => setFormData({...formData, salaryRange: e.target.value})}
                title="Enter expected salary range (e.g. $120k - $150k)"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Seniority</label>
              <select
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white dark:bg-slate-950 text-slate-900 dark:text-white hover:border-blue-300 dark:hover:border-slate-600"
                value={formData.seniority}
                onChange={e => setFormData({...formData, seniority: e.target.value})}
                title="Select the seniority level for the role"
              >
                <option>Intern</option>
                <option>Junior</option>
                <option>Mid-Level</option>
                <option>Senior</option>
                <option>Lead</option>
                <option>Director</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Required Skills (Comma separated)</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white dark:bg-slate-950 text-slate-900 dark:text-white hover:border-blue-300 dark:hover:border-slate-600"
              placeholder="e.g. React, TypeScript, Figma, User Research"
              value={formData.skills}
              onChange={e => setFormData({...formData, skills: e.target.value})}
              title="List key skills separated by commas"
            />
          </div>

           <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Key Responsibilities (Comma separated short points)</label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 h-24 resize-none bg-white dark:bg-slate-950 text-slate-900 dark:text-white hover:border-blue-300 dark:hover:border-slate-600"
              placeholder="e.g. Lead design system, Conduct user interviews..."
              value={formData.responsibilities}
              onChange={e => setFormData({...formData, responsibilities: e.target.value})}
              title="List main responsibilities for the AI to include in the JD"
            />
          </div>

          <div className="space-y-2 relative">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Job Description</label>
              <button
                type="button"
                onClick={handleGenerateJD}
                disabled={isGenerating}
                className="text-sm flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                title="Consumes 1 credit to generate a full JD based on inputs"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4" />}
                {isGenerating ? 'Generating...' : 'Auto-Generate with AI'}
              </button>
            </div>
            
            {error && <p className="text-xs text-red-500 animate-pulse">{error}</p>}
            
            <textarea
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 h-64 font-mono text-sm leading-relaxed bg-white dark:bg-slate-950 text-slate-900 dark:text-white hover:border-blue-300 dark:hover:border-slate-600"
              placeholder="Click 'Auto-Generate' to let AI write this for you based on the inputs above..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              title="Full job description text"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors active:scale-95"
              title="Discard changes and go back"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 active:scale-95 hover:-translate-y-0.5"
              title="Save and publish this job"
            >
              <CheckCircle className="w-4 h-4" />
              Publish Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};