import React from 'react';
import { useStore } from '../context/StoreContext';
import { Briefcase, Users, FileText, ArrowRight, UserPlus, Zap, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const Dashboard: React.FC = () => {
  const { jobs, candidates, loadDemoData, usageCount } = useStore();

  const activeJobs = jobs.filter(j => j.status === 'active').length;
  const screenedCount = candidates.filter(c => c.status !== 'new').length;
  // Offers Ready: Candidates in 'offer' stage
  const offersReady = candidates.filter(c => c.status === 'offer').length;
  
  // Prepare chart data
  const chartData = jobs.slice(0, 5).map(job => ({
    name: job.title.split(' ').slice(0, 2).join(' '), // Shorten name
    candidates: candidates.filter(c => c.jobId === job.id).length
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-md">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here's what's happening in your hiring pipeline today.</p>
        </div>
        <div className="flex gap-3">
           <button 
            onClick={loadDemoData}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors hover:shadow-sm active:scale-95"
            title="Populate app with example jobs and candidates"
          >
            Load Demo Data
          </button>
          <Link 
            to="/create-job"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
            title="Create a new job posting"
          >
            <Briefcase className="w-4 h-4" />
            New Job
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group animate-slide-up cursor-pointer active:scale-[0.99]" 
          style={{ animationDelay: '0ms' }}
          title="Total number of currently active job postings"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-bl-full -mr-4 -mt-4 transition-transform duration-500 group-hover:scale-110"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl transition-transform group-hover:rotate-6">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>
            <p className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{activeJobs}</p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Active Jobs</p>
          </div>
        </div>

        <div 
          className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group animate-slide-up cursor-pointer active:scale-[0.99]" 
          style={{ animationDelay: '100ms' }}
          title="Total candidates processed by AI"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 dark:bg-purple-900/10 rounded-bl-full -mr-4 -mt-4 transition-transform duration-500 group-hover:scale-110"></div>
          <div className="relative">
             <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl transition-transform group-hover:rotate-6">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <p className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{screenedCount}</p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Candidates Screened</p>
          </div>
        </div>

        <div 
          className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group animate-slide-up cursor-pointer active:scale-[0.99]" 
          style={{ animationDelay: '200ms' }}
          title="Candidates currently in the Offer stage"
        >
           <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 dark:bg-green-900/10 rounded-bl-full -mr-4 -mt-4 transition-transform duration-500 group-hover:scale-110"></div>
           <div className="relative">
             <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl transition-transform group-hover:rotate-6">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
            <p className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{offersReady}</p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Offers Ready</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Jobs List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col animate-slide-up hover:shadow-md transition-shadow duration-300" style={{ animationDelay: '300ms' }}>
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
            <h2 className="font-semibold text-slate-900 dark:text-white">Recent Jobs</h2>
            <Link to="/create-job" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors hover:underline" title="View all jobs">View All</Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 flex-1">
            {jobs.length === 0 ? (
               <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                 <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                   <Briefcase className="w-6 h-6 text-slate-400"/>
                 </div>
                 <p>No jobs found.</p>
                 <button onClick={loadDemoData} className="text-blue-600 font-medium text-sm mt-2 hover:underline" title="Load sample data">Load demo data</button>
               </div>
            ) : (
              jobs.slice(0, 5).map(job => {
                const jobCandidates = candidates.filter(c => c.jobId === job.id);
                const newCount = jobCandidates.filter(c => c.status === 'new').length;
                
                return (
                  <div key={job.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 flex items-center justify-between group cursor-pointer hover:scale-[1.005]" title={`View details for ${job.title}`}>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold shrink-0 transition-colors group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {job.title.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{job.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                           <span>{job.location}</span>
                           <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></span>
                           <span>{job.seniority}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{jobCandidates.length}</p>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Candidates</p>
                      </div>
                      <div className="flex items-center gap-3">
                         {newCount > 0 && (
                          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs px-2.5 py-1 rounded-full font-bold shadow-sm animate-pulse" title={`${newCount} new candidates`}>
                            {newCount} New
                          </span>
                        )}
                        <Link to={`/jobs/${job.id}`} className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 rounded-full transition-all hover:scale-110 active:scale-90" title="Go to Job Details">
                          <ArrowRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Usage & Mini Chart */}
        <div className="space-y-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow duration-300">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-6">Pipeline Volume</h2>
            <div className="flex-1 min-h-[200px]" title="Candidates per job">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#94a3b8' }}
                    dy={10}
                  />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9', radius: 4}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '8px 12px', backgroundColor: '#1e293b', color: '#fff' }}
                  />
                  <Bar dataKey="candidates" radius={[4, 4, 0, 0]} barSize={40}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#818cf8'} />
                      ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
              <Link 
                to="/add-candidate" 
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm font-medium shadow-sm"
                title="Manually add a new candidate"
              >
                <UserPlus className="w-4 h-4"/> Add Candidate
              </Link>
            </div>
          </div>
          
          <div 
            className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg shadow-blue-600/20 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 cursor-default"
            title="Usage against free tier limits"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8 blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
             <div className="relative">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="font-semibold text-lg">Free Plan</h3>
                   <Zap className="w-5 h-5 text-yellow-300 fill-current animate-pulse" />
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1 opacity-90">
                      <span>AI Screenings</span>
                      <span>{usageCount} / 30</span>
                    </div>
                    <div className="w-full bg-black/20 rounded-full h-2">
                      <div className="bg-white h-2 rounded-full transition-all duration-1000 ease-out shadow-sm" style={{ width: `${Math.min((usageCount/30)*100, 100)}%` }}></div>
                    </div>
                  </div>
                   <div>
                    <div className="flex justify-between text-xs font-medium mb-1 opacity-90">
                      <span>Active Jobs</span>
                      <span>{jobs.length} / 3</span>
                    </div>
                    <div className="w-full bg-black/20 rounded-full h-2">
                      <div className="bg-white h-2 rounded-full transition-all duration-1000 ease-out shadow-sm" style={{ width: `${Math.min((jobs.length/3)*100, 100)}%` }}></div>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};