import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft, MapPin, DollarSign, User, Filter, Share2, LayoutGrid, List as ListIcon, MoreHorizontal, Trash2, Download } from 'lucide-react';

export const JobDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { jobs, candidates, deleteJob } = useStore();
  const { addToast } = useTheme();
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  
  const job = jobs.find(j => j.id === id);
  
  if (!job) return <div className="p-8 text-slate-500 dark:text-slate-400">Job not found</div>;

  const jobCandidates = candidates.filter(c => c.jobId === id);

  const filteredCandidates = jobCandidates.filter(c => {
    if (statusFilter === 'all') return c.status !== 'rejected';
    if (statusFilter === 'rejected') return c.status === 'rejected';
    return c.status === statusFilter;
  });

  const handleDeleteJob = () => {
    if (window.confirm("Are you sure you want to delete this job and all its candidates? This action cannot be undone.")) {
      deleteJob(job.id);
      addToast(`Job "${job.title}" deleted`, 'success');
      navigate('/');
    }
  };

  const handleExportList = () => {
    const headers = ['Name', 'Status', 'Fit Score', 'Email', 'Phone', 'Added Date'];
    const rows = filteredCandidates.map(c => [
      `"${c.name}"`,
      `"${c.status}"`,
      `"${c.aiAnalysis?.fitScore || 0}"`,
      `"${c.email}"`,
      `"${c.phone}"`,
      `"${new Date(c.createdAt).toLocaleDateString()}"`
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `job_${job.title.replace(/\s+/g, '_')}_candidates.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Candidate list exported', 'success');
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'new': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      case 'screened': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
      case 'interviewing': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
      case 'offer': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
      default: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const tabs = [
    { id: 'all', label: 'Active Pipeline' },
    { id: 'new', label: 'New' },
    { id: 'screened', label: 'Screened' },
    { id: 'interviewing', label: 'Interviewing' },
    { id: 'offer', label: 'Offer' },
    { id: 'rejected', label: 'Rejected' },
  ];

  const columns = [
    { id: 'new', label: 'New', color: 'blue' },
    { id: 'screened', label: 'Screened', color: 'purple' },
    { id: 'interviewing', label: 'Interviewing', color: 'amber' },
    { id: 'offer', label: 'Offer', color: 'green' },
    { id: 'rejected', label: 'Rejected', color: 'red' },
  ];

  return (
    <div className="space-y-8 h-[calc(100vh-6rem)] flex flex-col animate-fade-in">
      <div className="flex-none">
         <div className="flex justify-between items-center mb-4">
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors hover:-translate-x-1 duration-200" title="Return to Dashboard">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <div className="flex gap-2">
               <button 
                onClick={handleExportList}
                className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg flex items-center gap-1.5 text-sm font-medium"
                title="Export filtered candidate list to CSV"
              >
                <Download className="w-4 h-4"/> Export CSV
              </button>
              <button 
                onClick={handleDeleteJob}
                className="text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-1.5 text-sm font-medium"
                title="Delete this job"
              >
                <Trash2 className="w-4 h-4"/> Delete Job
              </button>
            </div>
         </div>
         <div className="flex flex-col md:flex-row justify-between items-start gap-4">
           <div>
             <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{job.title}</h1>
             <div className="flex flex-wrap items-center gap-4 mt-3 text-slate-500 dark:text-slate-400 text-sm">
               <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400"/> {job.location}</span>
               <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-slate-400"/> {job.salaryRange}</span>
               <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-700">{job.seniority}</span>
             </div>
           </div>
           <div className="flex gap-3">
             <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex gap-1">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all duration-200 ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-white shadow-sm scale-105' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}
                  title="List View"
                >
                  <ListIcon className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('board')}
                  className={`p-2 rounded-md transition-all duration-200 ${viewMode === 'board' ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-white shadow-sm scale-105' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}
                  title="Kanban Board View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
             </div>
             <Link 
               to="/add-candidate" 
               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center gap-2 shadow-sm shadow-blue-500/30 transition-all hover:shadow-blue-500/50 hover:-translate-y-0.5 active:scale-95"
               title="Add a new candidate to this job"
             >
               <User className="w-4 h-4" /> Add Candidate
             </Link>
           </div>
         </div>
      </div>

      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
           {/* Main: Candidate List */}
           <div className="lg:col-span-2 space-y-4 flex flex-col h-full overflow-hidden">
             <div className="flex items-center justify-between flex-none">
                <h2 className="font-semibold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  Candidates <span className="text-slate-400 font-normal text-base">({filteredCandidates.length})</span>
                </h2>
             </div>
             
             {/* Filters */}
             <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-none">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    title={`Filter by ${tab.label}`}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 border active:scale-95
                      ${statusFilter === tab.id 
                        ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900 shadow-sm scale-105' 
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:bg-slate-700 hover:scale-105'
                      }
                    `}
                  >
                    {tab.label}
                  </button>
                ))}
             </div>

             <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-y-auto flex-1 animate-slide-up">
               {filteredCandidates.length === 0 ? (
                 <div className="p-12 text-center h-full flex flex-col items-center justify-center">
                   <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Filter className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                   </div>
                   <h3 className="text-slate-900 dark:text-white font-medium mb-1">No candidates found</h3>
                   <p className="text-slate-500 dark:text-slate-400 text-sm">
                     {statusFilter === 'all' 
                       ? 'Start by adding a candidate to this job.' 
                       : `No candidates in the "${statusFilter}" stage.`}
                   </p>
                 </div>
               ) : (
                 <div className="divide-y divide-slate-100 dark:divide-slate-800">
                   {filteredCandidates.map(candidate => (
                     <div key={candidate.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 flex items-center justify-between group hover:pl-5 cursor-default">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-300 font-medium text-sm transition-transform group-hover:scale-110">
                           {candidate.name.charAt(0)}
                         </div>
                         <div>
                           <Link to={`/candidates/${candidate.id}`} className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="View Candidate Profile">
                             {candidate.name}
                           </Link>
                           <div className="text-xs text-slate-500 dark:text-slate-400 flex gap-3 mt-1">
                              <span>Added {new Date(candidate.createdAt).toLocaleDateString()}</span>
                              {candidate.aiAnalysis && (
                                <span className={
                                  candidate.aiAnalysis.fitScore >= 80 ? 'text-green-600 dark:text-green-400 font-medium' :
                                  candidate.aiAnalysis.fitScore >= 50 ? 'text-amber-600 dark:text-amber-400 font-medium' : 
                                  'text-red-500 dark:text-red-400'
                                } title="AI Fit Score">
                                  {candidate.aiAnalysis.fitScore}% Match
                                </span>
                              )}
                           </div>
                         </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full capitalize font-medium border transition-colors ${getStatusColor(candidate.status)}`}>
                            {candidate.status}
                          </span>
                          <ArrowLeft className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 rotate-180 transition-all transform translate-x-[-10px] group-hover:translate-x-0 duration-300" />
                       </div>
                     </div>
                   ))}
                 </div>
               )}
             </div>
           </div>

           {/* Sidebar: JD */}
           <div className="space-y-4 lg:block hidden overflow-y-auto">
              <h2 className="font-semibold text-lg text-slate-900 dark:text-white">Job Details</h2>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm animate-slide-up" style={{ animationDelay: '100ms' }}>
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Description</h3>
                 <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-[15] mb-6 whitespace-pre-line">{job.description}</p>
                 
                 <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Required Skills</h3>
                   <div className="flex flex-wrap gap-2">
                     {job.skillsRequired.map((s,i) => (
                       <span key={i} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-default" title="Required Skill">{s}</span>
                     ))}
                   </div>
                 </div>
              </div>
           </div>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-6 h-full min-w-max">
            {columns.map(col => {
              const colCandidates = jobCandidates.filter(c => c.status === col.id);
              const colorMap: {[key: string]: string} = {
                blue: 'bg-blue-50/30 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-300',
                purple: 'bg-purple-50/30 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/30 text-purple-700 dark:text-purple-300',
                amber: 'bg-amber-50/30 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-300',
                green: 'bg-green-50/30 dark:bg-green-900/10 border-green-100 dark:border-green-900/30 text-green-700 dark:text-green-300',
                red: 'bg-red-50/30 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-300'
              };

              return (
                <div key={col.id} className="w-80 flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-200/60 dark:border-slate-800/60 transition-colors">
                  <div className={`p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center rounded-t-xl ${colorMap[col.color]}`}>
                    <h3 className={`font-semibold`}>{col.label}</h3>
                    <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full text-xs font-bold text-slate-400 border border-slate-200 dark:border-slate-700 shadow-sm">{colCandidates.length}</span>
                  </div>
                  <div className="p-3 space-y-3 overflow-y-auto flex-1">
                    {colCandidates.map(c => (
                      <Link to={`/candidates/${c.id}`} key={c.id} className="block bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative animate-fade-in active:scale-[0.98]" title="View Candidate">
                         <div className="flex justify-between items-start mb-2">
                           <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{c.name}</h4>
                           <MoreHorizontal className="w-4 h-4 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"/>
                         </div>
                         {c.aiAnalysis && (
                           <div className="mb-3">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-slate-500 dark:text-slate-400">Fit Score</span>
                                <span className={`font-bold ${c.aiAnalysis.fitScore >= 80 ? 'text-green-600 dark:text-green-400' : c.aiAnalysis.fitScore >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500 dark:text-red-400'}`}>
                                  {c.aiAnalysis.fitScore}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                 <div 
                                    className={`h-1.5 rounded-full transition-all duration-500 ${c.aiAnalysis.fitScore >= 80 ? 'bg-green-500' : c.aiAnalysis.fitScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} 
                                    style={{ width: `${c.aiAnalysis.fitScore}%` }}
                                 ></div>
                              </div>
                           </div>
                         )}
                         <div className="flex flex-wrap gap-1">
                            {c.aiAnalysis?.skillsDetected.slice(0, 2).map((s, i) => (
                              <span key={i} className="text-[10px] bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700">{s}</span>
                            ))}
                            {c.aiAnalysis?.skillsDetected.length > 2 && (
                              <span className="text-[10px] bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700">+{c.aiAnalysis.skillsDetected.length - 2}</span>
                            )}
                         </div>
                      </Link>
                    ))}
                    {colCandidates.length === 0 && (
                      <div className="text-center py-8 text-slate-400 dark:text-slate-600 text-sm border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-lg">
                        Empty
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  );
};