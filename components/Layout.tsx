import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Users, Zap, Globe, Search, Bell, Moon, Sun, Settings as SettingsIcon, LogOut, Menu, X, Check, Trash2, XCircle } from 'lucide-react';
import { OnboardingWizard } from './OnboardingWizard';
import { useTheme } from '../context/ThemeContext';
import { useStore } from '../context/StoreContext';
import { Job, Candidate } from '../types';

export const Layout: React.FC = () => {
  const { theme, toggleTheme, notifications, unreadCount, markAllRead, toasts, removeToast } = useTheme();
  const { user, jobs, candidates } = useStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{jobs: Job[], candidates: Candidate[]} | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const lowerQ = searchQuery.toLowerCase();
      const foundJobs = jobs.filter(j => j.title.toLowerCase().includes(lowerQ) || j.location.toLowerCase().includes(lowerQ));
      const foundCandidates = candidates.filter(c => c.name.toLowerCase().includes(lowerQ) || c.email.toLowerCase().includes(lowerQ));
      setSearchResults({ jobs: foundJobs, candidates: foundCandidates });
    } else {
      setSearchResults(null);
    }
  }, [searchQuery, jobs, candidates]);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchResults(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm ${
      isActive 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 translate-x-1' 
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:translate-x-1 hover:shadow-sm'
    }`;

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      markAllRead();
    }
  };

  const handleSearchResultClick = (path: string) => {
    navigate(path);
    setSearchQuery('');
    setSearchResults(null);
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Toast Container */}
      <div className="fixed top-20 right-6 z-[60] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-slide-up transform transition-all ${
              toast.type === 'success' ? 'bg-white dark:bg-slate-900 border-green-200 dark:border-green-900/50 text-slate-800 dark:text-slate-200' : 
              toast.type === 'error' ? 'bg-white dark:bg-slate-900 border-red-200 dark:border-red-900/50 text-slate-800 dark:text-slate-200' :
              'bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-900/50 text-slate-800 dark:text-slate-200'
            }`}
          >
             <div className={`p-1.5 rounded-full ${
                toast.type === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                toast.type === 'error' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
             }`}>
                {toast.type === 'success' ? <Check className="w-4 h-4" /> : toast.type === 'error' ? <XCircle className="w-4 h-4"/> : <Bell className="w-4 h-4"/>}
             </div>
             <p className="text-sm font-medium">{toast.message}</p>
             <button onClick={() => removeToast(toast.id)} className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
               <X className="w-4 h-4" />
             </button>
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div 
            className="flex items-center gap-2 text-blue-600 font-bold text-xl tracking-tight cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => navigate('/')}
            title="Go to Home"
          >
            <div className="p-1.5 bg-blue-600 rounded-lg text-white shadow-md shadow-blue-500/20">
               <Zap className="w-5 h-5 fill-current" />
            </div>
            <span>SmartHire AI</span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)} 
            className="md:hidden text-slate-400 hover:text-slate-600 transition-colors"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex flex-col h-[calc(100%-80px)] justify-between">
          <nav className="p-4 space-y-2">
            <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Main</div>
            <NavLink to="/" className={navClass} title="View your dashboard overview">
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/create-job" className={navClass} title="Create a new job posting with AI">
              <PlusCircle className="w-5 h-5" />
              <span>Create Job</span>
            </NavLink>
            <NavLink to="/add-candidate" className={navClass} title="Upload and screen new candidates">
              <Users className="w-5 h-5" />
              <span>Add Candidate</span>
            </NavLink>
             <NavLink to="/sourcing" className={navClass} title="Find talent using AI sourcing strategies">
              <Globe className="w-5 h-5" />
              <span>Sourcing Hub</span>
            </NavLink>
            
            <div className="mt-8 px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">System</div>
            <NavLink to="/settings" className={navClass} title="Manage app settings and preferences">
              <SettingsIcon className="w-5 h-5" />
              <span>Settings</span>
            </NavLink>
          </nav>

          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <div 
              className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-4 text-white shadow-lg shadow-blue-500/20 transform transition-transform hover:scale-[1.02] active:scale-[0.98] duration-300 cursor-default"
              title="Current plan usage details"
            >
              <h4 className="text-xs font-bold uppercase mb-2 opacity-90">Free Plan</h4>
              <div className="w-full bg-black/20 rounded-full h-1.5 mb-2 overflow-hidden">
                <div className="bg-white h-1.5 rounded-full" style={{ width: '30%' }}></div>
              </div>
              <p className="text-xs opacity-90">30 AI Credits / month</p>
              <button 
                className="mt-3 w-full py-1.5 bg-white/20 hover:bg-white/30 rounded text-xs font-medium transition-colors"
                title="Upgrade to Premium for more credits"
              >
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-30 sticky top-0 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)} 
              className="md:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              title="Open Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative hidden sm:block w-96 group" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Global Search (Jobs, Candidates...)" 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-200 placeholder-slate-400 transition-all shadow-sm focus:shadow-md hover:bg-slate-100 dark:hover:bg-slate-700/50"
                title="Search across all jobs and candidates"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              
              {/* Search Results Dropdown */}
              {searchResults && (searchResults.jobs.length > 0 || searchResults.candidates.length > 0) && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in z-50">
                  {searchResults.jobs.length > 0 && (
                     <div className="p-2">
                       <h4 className="text-xs font-bold text-slate-400 uppercase px-2 mb-1">Jobs</h4>
                       {searchResults.jobs.map(job => (
                         <button 
                            key={job.id} 
                            onClick={() => handleSearchResultClick(`/jobs/${job.id}`)}
                            className="w-full text-left p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-center gap-3 transition-colors group"
                         >
                            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md">
                              <BriefcaseIcon className="w-4 h-4" />
                            </div>
                            <div>
                               <p className="text-sm font-medium text-slate-900 dark:text-white">{job.title}</p>
                               <p className="text-xs text-slate-500 dark:text-slate-400">{job.location}</p>
                            </div>
                         </button>
                       ))}
                     </div>
                  )}
                  {searchResults.candidates.length > 0 && (
                     <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                       <h4 className="text-xs font-bold text-slate-400 uppercase px-2 mb-1 pt-1">Candidates</h4>
                       {searchResults.candidates.map(cand => (
                         <button 
                            key={cand.id} 
                            onClick={() => handleSearchResultClick(`/candidates/${cand.id}`)}
                            className="w-full text-left p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-center gap-3 transition-colors"
                         >
                            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                               {cand.name.charAt(0)}
                            </div>
                            <div>
                               <p className="text-sm font-medium text-slate-900 dark:text-white">{cand.name}</p>
                               <p className="text-xs text-slate-500 dark:text-slate-400">{cand.email}</p>
                            </div>
                         </button>
                       ))}
                     </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-full transition-all duration-200 hover:rotate-12 active:scale-90"
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="relative">
              <button 
                onClick={toggleNotifications}
                className={`p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-full transition-all duration-200 active:scale-90 relative ${showNotifications ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400' : ''}`}
                title="View Notifications"
              >
                <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-pulse' : ''}`} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-bounce"></span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)}></div>
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-20 overflow-hidden animate-fade-in origin-top-right transition-all transform">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                      <span className="font-semibold text-sm dark:text-white">Notifications</span>
                      <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors" title="Mark all notifications as read">Mark all read</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-sm">No new notifications</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className={`p-3 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                            <div className="flex gap-3">
                              <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                              <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{n.title}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                                <p className="text-[10px] text-slate-400 mt-1.5">{new Date(n.timestamp).toLocaleTimeString()}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

            <div 
              className="flex items-center gap-3 pl-1 cursor-pointer hover:opacity-80 transition-all active:scale-95" 
              onClick={() => navigate('/settings')}
              title="Go to Profile Settings"
            >
               <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm shadow-md ring-2 ring-white dark:ring-slate-900 transform transition-transform group-hover:scale-105">
                 {user.name.charAt(0)}
               </div>
               <div className="hidden md:block">
                 <p className="text-sm font-medium text-slate-900 dark:text-white leading-none">{user.name}</p>
                 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-none capitalize">{user.role}</p>
               </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950 scroll-smooth">
          <div className="max-w-6xl mx-auto">
              <Outlet />
          </div>
        </main>
      </div>
      
      {/* Onboarding Wizard Overlay */}
      <OnboardingWizard />
    </div>
  );
};

// Helper for search icon in dropdown
function BriefcaseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
  );
}