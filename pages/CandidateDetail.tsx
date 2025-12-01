import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useTheme } from '../context/ThemeContext';
import { generateInterviewQuestions, estimateSalary, checkBackgroundRisk, generateOffer } from '../services/geminiService';
import { User, Mail, Phone, Briefcase, AlertCircle, CheckCircle2, XCircle, ChevronLeft, FileText, Download, Copy, Loader2, Sparkles, MessageSquare, Check, Settings2, ShieldCheck, DollarSign, FileSignature, Trash2 } from 'lucide-react';

const STATUS_STEPS = [
  { id: 'new', label: 'New' },
  { id: 'screened', label: 'Screened' },
  { id: 'interviewing', label: 'Interviewing' },
  { id: 'offer', label: 'Offer' },
] as const;

const INTERVIEW_TONES = [
  'Professional & Balanced',
  'Strict & Technical',
  'Friendly & Casual',
  'Leadership Focused',
  'Behavioral Heavy'
];

export const CandidateDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { candidates, jobs, updateCandidate, deleteCandidate, incrementUsage } = useStore();
  const { addNotification, addToast } = useTheme();
  
  const candidate = candidates.find(c => c.id === id);
  const job = jobs.find(j => j.id === candidate?.jobId);
  
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isEstimatingSalary, setIsEstimatingSalary] = useState(false);
  const [isCheckingBackground, setIsCheckingBackground] = useState(false);
  const [isGeneratingOffer, setIsGeneratingOffer] = useState(false);
  
  const [notes, setNotes] = useState('');
  const [selectedTone, setSelectedTone] = useState(INTERVIEW_TONES[0]);

  // Offer Form
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerForm, setOfferForm] = useState({ salary: '', startDate: '', benefits: 'Standard benefits package' });

  useEffect(() => {
    if (candidate) {
      setNotes(candidate.notes || '');
    }
  }, [candidate?.id, candidate?.notes]);

  const handleNotesBlur = () => {
    if (candidate && notes !== candidate.notes) {
      updateCandidate(candidate.id, { notes });
    }
  };

  if (!candidate || !job) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Candidate not found</div>;
  }

  const analysis = candidate.aiAnalysis;

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this candidate?")) {
      deleteCandidate(candidate.id);
      addToast(`Deleted candidate ${candidate.name}`, 'success');
      navigate(-1);
    }
  };

  // Agent 3: Interview Questions
  const handleGenerateQuestions = async () => {
    if (!analysis) return;
    setIsGeneratingQuestions(true);
    try {
      const questions = await generateInterviewQuestions(job, analysis, selectedTone);
      updateCandidate(candidate.id, { interviewQuestions: questions });
      incrementUsage();
      addNotification('Questions Generated', `Interview guide created for ${candidate.name}`, 'success');
      addToast('Interview questions generated!', 'success');
    } catch (e) {
      console.error(e);
      addToast('Failed to generate questions', 'error');
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleExportQuestionsPDF = () => {
    if (!candidate.interviewQuestions) return;
    
    const content = `
      <html>
      <head>
        <title>Interview Guide - ${candidate.name}</title>
        <style>
          body { font-family: sans-serif; padding: 40px; line-height: 1.6; color: #333; }
          h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
          h2 { margin-top: 30px; color: #444; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
          ul { padding-left: 20px; }
          li { margin-bottom: 10px; }
          .meta { color: #666; font-size: 14px; margin-bottom: 30px; background: #f9f9f9; padding: 15px; border-radius: 8px; }
        </style>
      </head>
      <body>
        <h1>Interview Guide: ${candidate.name}</h1>
        <div class="meta">
          <strong>Job:</strong> ${job.title}<br>
          <strong>Date:</strong> ${new Date().toLocaleDateString()}<br>
          <strong>Tone:</strong> ${selectedTone}
        </div>

        <h2>Technical Questions</h2>
        <ul>
          ${candidate.interviewQuestions.technical.map(q => `<li>${q}</li>`).join('')}
        </ul>

        <h2>Behavioral Questions</h2>
        <ul>
          ${candidate.interviewQuestions.behavioral.map(q => `<li>${q}</li>`).join('')}
        </ul>

        <h2>Culture Fit Questions</h2>
        <ul>
          ${candidate.interviewQuestions.culture.map(q => `<li>${q}</li>`).join('')}
        </ul>

        <script>window.print();</script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '', 'height=800,width=800');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      addToast('Opening print dialog...', 'info');
    } else {
        addToast('Popup blocked. Please allow popups.', 'error');
    }
  };

  const handleCopyQuestions = () => {
    if (!candidate.interviewQuestions) return;
    const text = [
        "TECHNICAL:", ...candidate.interviewQuestions.technical,
        "\nBEHAVIORAL:", ...candidate.interviewQuestions.behavioral,
        "\nCULTURE:", ...candidate.interviewQuestions.culture
    ].join('\n- ');
    navigator.clipboard.writeText(text);
    addToast('Questions copied to clipboard', 'success');
  };

  // Agent 7: Salary Estimation
  const handleEstimateSalary = async () => {
    setIsEstimatingSalary(true);
    try {
      const result = await estimateSalary(job.title, job.location, job.seniority, job.skillsRequired);
      updateCandidate(candidate.id, { salaryEstimation: result });
      incrementUsage();
      addNotification('Salary Estimated', 'Market range analysis completed', 'success');
      addToast('Salary range estimated!', 'success');
    } catch (e) {
      addToast('Failed to estimate salary', 'error');
    } finally {
      setIsEstimatingSalary(false);
    }
  };

  // Agent 6: Background Check
  const handleBackgroundCheck = async () => {
    setIsCheckingBackground(true);
    try {
      const result = await checkBackgroundRisk(candidate.name, candidate.resumeText, job.title);
      updateCandidate(candidate.id, { backgroundCheck: result });
      incrementUsage();
      addNotification('Risk Check Complete', 'Preliminary screening finished', 'info');
      addToast('Background check analysis complete', 'info');
    } catch (e) {
      addToast('Failed to run background check', 'error');
    } finally {
      setIsCheckingBackground(false);
    }
  };

  // Agent 5: Offer Generation
  const handleGenerateOffer = async () => {
    setIsGeneratingOffer(true);
    try {
      const result = await generateOffer(candidate.name, job.title, offerForm.salary, offerForm.startDate, offerForm.benefits);
      updateCandidate(candidate.id, { offerData: result, status: 'offer' });
      incrementUsage();
      setShowOfferModal(false);
      addNotification('Offer Ready', 'Offer letter generated successfully', 'success');
      addToast('Offer letter generated!', 'success');
    } catch (e) {
      addToast('Failed to generate offer', 'error');
    } finally {
      setIsGeneratingOffer(false);
    }
  };

  const handleExportCSV = () => {
    if (!candidate || !job || !analysis) return;

    const headers = [
      'Name', 'Email', 'Phone', 'Job', 'Status', 
      'Fit Score', 'Recommendation', 'Summary', 'Skills'
    ];
    
    const row = [
      `"${candidate.name}"`,
      `"${candidate.email}"`,
      `"${candidate.phone}"`,
      `"${job.title}"`,
      `"${candidate.status}"`,
      `"${analysis.fitScore}"`,
      `"${analysis.recommendation}"`,
      `"${analysis.summary.replace(/"/g, '""')}"`,
      `"${analysis.skillsDetected.join(', ')}"`
    ];

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), row.join(',')].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `candidate_${candidate.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('CSV export started', 'info');
  };

  const getFitBadge = (score: number) => {
    if (score >= 80) return <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-semibold flex items-center gap-1" title="High match based on skills and experience"><CheckCircle2 className="w-4 h-4"/> Strong Fit ({score}%)</span>;
    if (score >= 50) return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-sm font-semibold flex items-center gap-1" title="Moderate match, some gaps found"><AlertCircle className="w-4 h-4"/> Medium Fit ({score}%)</span>;
    return <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-sm font-semibold flex items-center gap-1" title="Low match, significant gaps found"><XCircle className="w-4 h-4"/> Low Fit ({score}%)</span>;
  };

  const isRejected = candidate.status === 'rejected';

  return (
    <div className="space-y-6 relative animate-fade-in">
      <div className="flex justify-between items-center">
        <button 
          onClick={() => navigate(-1)} 
          className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 text-sm font-medium transition-colors hover:-translate-x-1 duration-200"
          title="Return to previous list"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Candidates
        </button>
        <div className="flex gap-2">
           <button 
            onClick={handleDelete}
            className="text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400 flex items-center gap-1 text-sm font-medium transition-colors hover:bg-red-50 dark:hover:bg-red-900/10 px-2 py-1 rounded"
            title="Delete this candidate permanently"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
          <button 
            onClick={handleExportCSV}
            className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 flex items-center gap-1 text-sm font-medium transition-colors hover:-translate-y-0.5 active:scale-95"
            title="Download candidate data as CSV"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Header Profile */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 backdrop-blur-md animate-slide-up hover:shadow-md transition-shadow duration-300">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 shadow-sm transition-transform hover:scale-105">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{candidate.name}</h1>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-500 dark:text-slate-400 text-sm mt-2">
                <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-slate-400"/> {job.title}</span>
                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-400"/> {candidate.email}</span>
                <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-slate-400"/> {candidate.phone}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3 w-full xl:w-auto">
             <div className="flex items-center gap-3 w-full xl:w-auto justify-between xl:justify-end">
                {analysis && getFitBadge(analysis.fitScore)}
                <span className="text-xs text-slate-400">Added {new Date(candidate.createdAt).toLocaleDateString()}</span>
             </div>

             {/* Status Stepper */}
             {isRejected ? (
                <div className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 px-4 py-2 rounded-lg border border-red-100 dark:border-red-900/30 w-full xl:w-auto animate-fade-in">
                   <div className="flex items-center gap-2 mr-4">
                      <XCircle className="w-5 h-5" />
                      <span className="font-semibold">Candidate Rejected</span>
                   </div>
                   <button 
                     onClick={() => updateCandidate(candidate.id, { status: 'new' })}
                     className="text-xs bg-white dark:bg-slate-800 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 px-3 py-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors font-medium active:scale-95"
                     title="Reactivate candidate"
                   >
                     Restore
                   </button>
                </div>
             ) : (
               <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-lg w-full xl:w-auto overflow-x-auto">
                 {STATUS_STEPS.map((step, index) => {
                    const isActive = step.id === candidate.status;
                    const isPast = STATUS_STEPS.findIndex(s => s.id === candidate.status) > index;
                    
                    return (
                      <button
                        key={step.id}
                        onClick={() => updateCandidate(candidate.id, { status: step.id as any })}
                        title={`Move to ${step.label}`}
                        className={`
                          relative px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-300 whitespace-nowrap flex-1 xl:flex-none text-center active:scale-95
                          ${isActive ? 'bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-sm z-10 ring-1 ring-black/5 dark:ring-white/10 scale-105' : 'hover:scale-105'}
                          ${isPast ? 'text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400' : ''}
                          ${!isActive && !isPast ? 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300' : ''}
                        `}
                      >
                        {step.label}
                      </button>
                    )
                 })}
                 <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                 <button
                    onClick={() => updateCandidate(candidate.id, { status: 'rejected' })}
                    className="px-2 py-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors active:scale-95"
                    title="Reject Candidate"
                 >
                   <XCircle className="w-4 h-4" />
                 </button>
               </div>
             )}
          </div>
        </div>
      </div>
      
      {/* Agent Toolbar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <button 
          onClick={handleEstimateSalary}
          disabled={isEstimatingSalary}
          className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md transition-all flex items-center justify-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 active:scale-95 disabled:opacity-50 disabled:active:scale-100 hover:-translate-y-0.5"
          title="Use AI to estimate market salary range based on role and skills"
        >
          {isEstimatingSalary ? <Loader2 className="w-4 h-4 animate-spin"/> : <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400"/>}
          Estimate Salary
        </button>
        <button 
           onClick={handleBackgroundCheck}
           disabled={isCheckingBackground}
           className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md transition-all flex items-center justify-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 active:scale-95 disabled:opacity-50 disabled:active:scale-100 hover:-translate-y-0.5"
           title="Analyze resume for potential red flags and verification needs (HR-safe)"
        >
          {isCheckingBackground ? <Loader2 className="w-4 h-4 animate-spin"/> : <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400"/>}
          Background Check
        </button>
        <button 
          onClick={() => setShowOfferModal(true)}
          className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md transition-all flex items-center justify-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 active:scale-95 hover:-translate-y-0.5"
          title="Draft a professional offer letter"
        >
          <FileSignature className="w-4 h-4 text-amber-600 dark:text-amber-400"/>
          Generate Offer
        </button>
         <button 
          onClick={handleGenerateQuestions}
          className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md transition-all flex items-center justify-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 active:scale-95 hover:-translate-y-0.5"
          title="Create tailored interview questions based on candidate profile"
        >
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400"/>
          Generate Questions
        </button>
      </div>

      {/* Salary & Background Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
         {candidate.salaryEstimation && (
           <div className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/10 dark:to-slate-900 rounded-xl border border-green-100 dark:border-green-900/30 shadow-sm p-5 hover:shadow-md transition-shadow">
             <h3 className="text-sm font-bold text-green-800 dark:text-green-400 uppercase tracking-wide mb-2 flex items-center gap-2">
               <DollarSign className="w-4 h-4"/> Salary Estimate
             </h3>
             <p className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{candidate.salaryEstimation.estimated_range}</p>
             <p className="text-sm text-slate-600 dark:text-slate-300 italic mb-4">"{candidate.salaryEstimation.justification}"</p>
             <div className="space-y-1">
                {candidate.salaryEstimation.market_factors.map((f, i) => (
                  <div key={i} className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><span className="w-1 h-1 bg-green-400 rounded-full"></span>{f}</div>
                ))}
             </div>
           </div>
         )}

         {candidate.backgroundCheck && (
           <div className={`rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow ${
             candidate.backgroundCheck.risk_assessment === 'low' 
               ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800' 
               : 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'
           }`}>
             <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-2 flex items-center gap-2">
               <ShieldCheck className="w-4 h-4"/> Risk Assessment: <span className={candidate.backgroundCheck.risk_assessment === 'low' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>{candidate.backgroundCheck.risk_assessment}</span>
             </h3>
             <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{candidate.backgroundCheck.summary}</p>
             {candidate.backgroundCheck.concerns.length > 0 && (
               <div>
                 <h4 className="text-xs font-bold text-red-700 dark:text-red-400 uppercase mb-1">Concerns</h4>
                 <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400">
                   {candidate.backgroundCheck.concerns.map((c,i) => <li key={i}>{c}</li>)}
                 </ul>
               </div>
             )}
           </div>
         )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
        {/* Left Col: Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Summary */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
             <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 fill-current" /> 
                  AI Analysis
                </h3>
                {analysis?.recommendation && (
                   <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wide
                     ${analysis.recommendation === 'strong_fit' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 
                       analysis.recommendation === 'medium_fit' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                     }
                   `}>
                     {analysis.recommendation.replace('_', ' ')}
                   </span>
                )}
             </div>
            
            <div className="p-6">
              {analysis ? (
                <div className="space-y-6">
                  <div className="p-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">"{analysis.summary}"</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4"/> Strengths
                      </h4>
                      <ul className="space-y-2">
                        {analysis.strengths.map((s, i) => (
                          <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-green-400 flex-shrink-0"></span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4"/> Gaps
                      </h4>
                      <ul className="space-y-2">
                        {analysis.gaps.map((s, i) => (
                          <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                             <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-400 flex-shrink-0"></span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-3">Detected Skills</h4>
                    <div className="flex flex-wrap gap-2">
                        {analysis.skillsDetected.map((skill, i) => (
                          <span key={i} className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium border border-blue-100 dark:border-blue-900/30 hover:scale-105 transition-transform cursor-default">
                            {skill}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  Analysis pending or failed.
                </div>
              )}
            </div>
          </div>

          {/* Resume Text */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
             <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
               <FileText className="w-4 h-4 text-slate-400" /> Resume Content
             </h3>
             <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-100 dark:border-slate-800 max-h-64 overflow-y-auto text-sm font-mono text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">
               {candidate.resumeText}
             </div>
          </div>
        </div>

        {/* Right Col: Actions & Interview Guide */}
        <div className="space-y-6">
           
           {/* Offer Card */}
           {candidate.offerData && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-green-200 dark:border-green-900/50 shadow-sm p-6 relative overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="absolute top-0 right-0 w-16 h-16 bg-green-50 dark:bg-green-900/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-125"></div>
                <h3 className="font-semibold text-green-800 dark:text-green-400 mb-4 flex items-center gap-2 relative z-10">
                  <FileSignature className="w-4 h-4" /> Offer Letter Ready
                </h3>
                <div className="space-y-3 relative z-10">
                   <button 
                     onClick={() => setShowOfferModal(true)}
                     className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/40 active:scale-95"
                     title="View or modify the generated offer"
                   >
                     View / Edit Offer
                   </button>
                   <p className="text-xs text-center text-slate-400">Created: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
           )}

           {/* Notes Section */}
           <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 relative group hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                Notes & Feedback
              </h3>
              <div className="relative">
                <textarea
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all h-40 text-sm leading-relaxed resize-none bg-yellow-50/30 dark:bg-yellow-900/10 focus:bg-white dark:focus:bg-slate-950 placeholder:text-slate-400 dark:text-slate-200"
                  placeholder="Type interview notes, feedback, or internal comments here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={handleNotesBlur}
                  title="Internal notes (auto-saved)"
                />
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                   <span className="text-[10px] uppercase font-bold text-slate-300 dark:text-slate-600 bg-white dark:bg-slate-800 px-1 rounded">Auto-saving</span>
                </div>
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" /> Interview Guide
              </h3>
              
              {!candidate.interviewQuestions ? (
                 <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                    <div className="mb-3 text-slate-400 flex justify-center">
                      <Sparkles className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 px-4">Generate tailored interview questions based on the candidate's analysis.</p>
                    
                    <div className="px-4 mb-4">
                      <div className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                        <Settings2 className="w-3 h-3"/> Interview Style/Tone
                      </div>
                      <select 
                        value={selectedTone}
                        onChange={(e) => setSelectedTone(e.target.value)}
                        className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white mb-2"
                        title="Choose the persona for the interview questions"
                      >
                        {INTERVIEW_TONES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <button 
                      onClick={handleGenerateQuestions}
                      disabled={isGeneratingQuestions || !analysis}
                      className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm rounded-lg hover:border-blue-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 active:scale-95 hover:shadow-md"
                      title="Generate technical, behavioral, and culture fit questions"
                    >
                      {isGeneratingQuestions ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400"/>}
                      Generate Questions
                    </button>
                 </div>
              ) : (
                <div className="space-y-6">
                   <div>
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Technical</h4>
                     <ul className="space-y-3">
                       {candidate.interviewQuestions.technical.map((q, i) => (
                         <li key={i} className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700 leading-relaxed hover:bg-white dark:hover:bg-slate-800 transition-colors">{q}</li>
                       ))}
                     </ul>
                   </div>
                   <div>
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Behavioral</h4>
                     <ul className="space-y-3">
                       {candidate.interviewQuestions.behavioral.map((q, i) => (
                         <li key={i} className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700 leading-relaxed hover:bg-white dark:hover:bg-slate-800 transition-colors">{q}</li>
                       ))}
                     </ul>
                   </div>
                    <div>
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Culture Fit</h4>
                     <ul className="space-y-3">
                       {candidate.interviewQuestions.culture.map((q, i) => (
                         <li key={i} className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700 leading-relaxed hover:bg-white dark:hover:bg-slate-800 transition-colors">{q}</li>
                       ))}
                     </ul>
                   </div>
                   
                   <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                      <button 
                        onClick={handleCopyQuestions}
                        className="flex-1 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95 flex items-center justify-center gap-1.5" title="Copy questions to clipboard"
                      >
                        <Copy className="w-3.5 h-3.5"/> Copy All
                      </button>
                      <button 
                        onClick={handleExportQuestionsPDF}
                        className="flex-1 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95 flex items-center justify-center gap-1.5" title="Print/Save as PDF"
                      >
                        <Download className="w-3.5 h-3.5"/> Export PDF
                      </button>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 animate-slide-up transform transition-all">
             <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Generate Offer Letter</h3>
                <button onClick={() => setShowOfferModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:rotate-90 transition-transform"><XCircle className="w-6 h-6"/></button>
             </div>
             <div className="p-6 space-y-4">
               {candidate.offerData ? (
                 <div className="space-y-6">
                    <textarea 
                      readOnly 
                      className="w-full h-64 p-4 text-sm font-mono border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-300 outline-none"
                      value={candidate.offerData.offer_letter}
                    />
                    <div className="flex gap-4">
                      <button className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-all active:scale-95" title="Download PDF">Download PDF</button>
                      <button className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-2.5 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95" title="Copy email text">Copy Email</button>
                    </div>
                 </div>
               ) : (
                 <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Annual Salary</label>
                          <input 
                            className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                            placeholder="$120,000" 
                            value={offerForm.salary}
                            onChange={e => setOfferForm({...offerForm, salary: e.target.value})}
                          />
                       </div>
                       <div className="space-y-1">
                          <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Start Date</label>
                          <input 
                            type="date"
                            className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                            value={offerForm.startDate}
                            onChange={e => setOfferForm({...offerForm, startDate: e.target.value})}
                          />
                       </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Benefits Package</label>
                        <textarea 
                          className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2 rounded-lg text-sm h-20 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                          placeholder="Standard package, 401k match, etc."
                          value={offerForm.benefits}
                          onChange={e => setOfferForm({...offerForm, benefits: e.target.value})}
                        />
                     </div>
                     <button 
                       onClick={handleGenerateOffer}
                       disabled={isGeneratingOffer}
                       className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 flex justify-center items-center gap-2 shadow-lg shadow-blue-500/30 transition-all active:scale-95 hover:-translate-y-0.5"
                       title="Generate offer letter"
                     >
                       {isGeneratingOffer ? <Loader2 className="w-4 h-4 animate-spin"/> : <FileSignature className="w-4 h-4"/>}
                       Generate with AI
                     </button>
                 </div>
               )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};