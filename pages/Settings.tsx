import React from 'react';
import { useStore } from '../context/StoreContext';
import { useTheme } from '../context/ThemeContext';
import { User, Bell, Moon, Sun, Shield, Database, LogOut, CheckCircle } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, resetUsage, loadDemoData } = useStore();
  const { theme, toggleTheme, notifications, markAllRead } = useTheme();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account and application preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Nav (Visual Only) */}
        <div className="space-y-2">
          <button className="w-full text-left px-4 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/30 dark:text-blue-400" title="General Settings">General</button>
          <button className="w-full text-left px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800" title="Team Management (Coming Soon)">Team</button>
          <button className="w-full text-left px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800" title="Billing & Plans (Coming Soon)">Billing</button>
        </div>

        {/* Main Settings Area */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Profile Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-slate-400" /> Profile
            </h2>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full mt-1 inline-block capitalize">{user.role}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Display Name</label>
                <input type="text" value={user.name} readOnly className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input type="email" value={user.email} readOnly className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 text-sm" />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-slate-400" /> Preferences
            </h2>
            
            <div className="space-y-4">
              <div 
                className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" 
                onClick={toggleTheme}
                title="Toggle between light and dark mode"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-100 text-amber-600'}`}>
                    {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Appearance</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'} is active</p>
                  </div>
                </div>
                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                   <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
              </div>

              <div 
                className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                title="Toggle app notifications"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Notifications</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Receive alerts for AI task completion</p>
                  </div>
                </div>
                 <div className="w-10 h-6 rounded-full p-1 bg-blue-600">
                   <div className="w-4 h-4 bg-white rounded-full shadow-sm transform translate-x-4"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-900/50 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
              <Database className="w-5 h-5" /> Data & Reset
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                 <div>
                    <p className="font-medium text-slate-900 dark:text-white">Reset Usage Limits</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Reset your monthly free tier counter (Debug only).</p>
                 </div>
                 <button 
                  onClick={resetUsage} 
                  className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg"
                  title="Reset usage counter to 0"
                >
                  Reset
                </button>
              </div>
               <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                 <div>
                    <p className="font-medium text-slate-900 dark:text-white">Load Demo Data</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Populate the app with sample jobs and candidates.</p>
                 </div>
                 <button 
                  onClick={loadDemoData} 
                  className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg"
                  title="Add example jobs and candidates"
                 >
                  Load Data
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              className="flex items-center gap-2 text-slate-500 hover:text-red-600 text-sm font-medium transition-colors"
              title="Log out of your account"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};