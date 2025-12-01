import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { generateSourcingStrategy } from '../services/geminiService';
import { Globe, Search, Copy, CheckCircle2, Loader2, Sparkles, Linkedin, Github } from 'lucide-react';
import { SourcingResult } from '../types';

export const SourcingHub: React.FC = () => {
  const { incrementUsage } = useStore();
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    skills: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<SourcingResult | null>(null);

  const handleSourcing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    
    setIsGenerating(true);
    try {
      const skillsList = formData.skills.split(',').map(s => s.trim());
      const res = await generateSourcingStrategy(formData.title, skillsList, formData.location);
      setResult(res);
      incrementUsage();
    } catch (error) {
      console.error(error);
      alert("Failed to generate sourcing strategy. Please check API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          Talent Sourcing Hub
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Use Agent 4 to build sourcing strategies and generate boolean search strings instantly.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 animate-slide-up hover:shadow-md transition-shadow">
        <form onSubmit={handleSourcing} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5 md:col-span-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Job Title</label>
            <input 
              required
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:border-blue-300 dark:hover:border-slate-600"
              placeholder="e.g. DevOps Engineer"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              title="Enter the role you are sourcing for"
            />
          </div>
          <div className="space-y-1.5 md:col-span-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Location</label>
            <input 
              required
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:border-blue-300 dark:hover:border-slate-600"
              placeholder="e.g. London / Remote"
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
              title="Target location for candidates"
            />
          </div>
          <div className="space-y-1.5 md:col-span-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Required Skills</label>
            <input 
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:border-blue-300 dark:hover:border-slate-600"
              placeholder="e.g. AWS, Docker"
              value={formData.skills}
              onChange={e => setFormData({...formData, skills: e.target.value})}
              title="Key skills to include in search strings"
            />
          </div>
          <button 
            type="submit" 
            disabled={isGenerating}
            className="h-[38px] bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-70 shadow-lg shadow-blue-500/20 active:scale-95 hover:-translate-y-0.5"
            title="Generate sourcing strategy with AI"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Search className="w-4 h-4"/>}
            Run Sourcing
          </button>
        </form>
      </div>

      {result && (
        <div className="space-y-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
          {/* Top Row: Platforms & Profile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Ideal Candidate Profile
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                "{result.ideal_candidate_profile}"
              </p>
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">Recommended Platforms</h4>
                <div className="flex flex-wrap gap-2">
                  {result.platforms.map(p => (
                    <span key={p} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-full border border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform cursor-default" title="Sourcing Platform">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Boolean Search Strings
              </h3>
              <div className="space-y-4">
                {result.boolean_search_strings.linkedin && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1"><Linkedin className="w-3 h-3"/> LinkedIn</span>
                      <button onClick={() => copyToClipboard(result.boolean_search_strings.linkedin!)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs font-medium flex items-center gap-1 active:scale-95 transition-transform" title="Copy to clipboard">
                        <Copy className="w-3 h-3"/> Copy
                      </button>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 break-words hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                      {result.boolean_search_strings.linkedin}
                    </div>
                  </div>
                )}
                 {result.boolean_search_strings.github && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1"><Github className="w-3 h-3"/> GitHub</span>
                      <button onClick={() => copyToClipboard(result.boolean_search_strings.github!)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs font-medium flex items-center gap-1 active:scale-95 transition-transform" title="Copy to clipboard">
                        <Copy className="w-3 h-3"/> Copy
                      </button>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 break-words hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                      {result.boolean_search_strings.github}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Outreach Templates */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 hover:shadow-lg transition-shadow duration-300">
             <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-green-600 dark:text-green-400" /> Outreach Templates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {result.outreach_templates.map((template, idx) => (
                   <div key={idx} className="relative group hover:-translate-y-1 transition-transform duration-300">
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => copyToClipboard(template)} className="p-1.5 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 transition-all" title="Copy template">
                           <Copy className="w-3 h-3"/>
                         </button>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed h-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                        {template}
                      </div>
                   </div>
                ))}
              </div>
          </div>
        </div>
      )}
    </div>
  );
};