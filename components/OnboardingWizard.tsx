import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Sparkles, ArrowRight, CheckCircle, X } from 'lucide-react';

export const OnboardingWizard: React.FC = () => {
  const { onboardingStep, setOnboardingStep, skipOnboarding } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect logic ensuring user is on the right page for the step
  useEffect(() => {
    if (onboardingStep === 1 && location.pathname !== '/create-job') {
      // Don't auto-redirect immediately on load to avoid jarring UX, 
      // but the UI below will provide the button.
    }
    if (onboardingStep === 2 && location.pathname !== '/add-candidate') {
      // UI button handles redirect
    }
  }, [onboardingStep, location.pathname]);

  if (onboardingStep === 0) return null;

  const steps = [
    { title: 'Create Job', desc: 'Define your role and let AI write the description.' },
    { title: 'Screen Candidate', desc: 'Upload a resume to instantly match against the job.' },
    { title: 'Review Analysis', desc: 'See AI fit scores and detected skills.' },
    { title: 'Prep Interview', desc: 'Generate tailored interview questions.' },
  ];

  const handleNextStep = () => {
     if (onboardingStep === 3) setOnboardingStep(4);
     else if (onboardingStep === 5) skipOnboarding();
  };

  const handleActionClick = () => {
    if (onboardingStep === 1) navigate('/create-job');
    if (onboardingStep === 2) navigate('/add-candidate');
    // Step 3 is just a review step, next button handles it
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900 text-white rounded-xl shadow-2xl p-6 border border-slate-700 relative overflow-hidden ring-1 ring-white/10">
        {/* Progress Bar */}
        <div className="flex gap-1 mb-4">
          {steps.map((_, i) => (
             <div 
               key={i} 
               className={`h-1 rounded-full flex-1 transition-colors ${i + 1 <= onboardingStep ? 'bg-blue-500' : 'bg-slate-700'}`}
             ></div>
          ))}
        </div>

        <button 
          onClick={skipOnboarding}
          className="absolute top-2 right-2 text-slate-500 hover:text-white p-2 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {onboardingStep === 1 && (
          <div className="animate-fade-in">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mb-3">
              <span className="font-bold">1</span>
            </div>
            <h3 className="text-lg font-bold mb-1">Let's create your first Job</h3>
            <p className="text-slate-300 text-sm mb-4">
              We'll use AI to generate a full job description from just a few keywords.
            </p>
            {location.pathname !== '/create-job' ? (
              <button 
                onClick={handleActionClick}
                className="w-full py-2 bg-white text-slate-900 rounded-lg font-medium text-sm hover:bg-slate-100 flex items-center justify-center gap-2 transition-colors"
              >
                Go to Create Job <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="text-sm text-blue-300 bg-blue-900/30 p-2 rounded border border-blue-800 flex items-start gap-2">
                <Sparkles className="w-4 h-4 mt-0.5 shrink-0"/>
                Fill in the title and skills, then click "Publish Job" to continue.
              </div>
            )}
          </div>
        )}

        {onboardingStep === 2 && (
          <div className="animate-fade-in">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mb-3">
              <span className="font-bold">2</span>
            </div>
            <h3 className="text-lg font-bold mb-1">Upload a Candidate</h3>
            <p className="text-slate-300 text-sm mb-4">
              Upload a resume (or use sample text) to screen it against your new job.
            </p>
             {location.pathname !== '/add-candidate' ? (
              <button 
                onClick={handleActionClick}
                className="w-full py-2 bg-white text-slate-900 rounded-lg font-medium text-sm hover:bg-slate-100 flex items-center justify-center gap-2 transition-colors"
              >
                Go to Add Candidate <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="text-sm text-blue-300 bg-blue-900/30 p-2 rounded border border-blue-800 flex items-start gap-2">
                <Sparkles className="w-4 h-4 mt-0.5 shrink-0"/>
                Fill in details and click "Screen with AI".
              </div>
            )}
          </div>
        )}

        {onboardingStep === 3 && (
          <div className="animate-fade-in">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mb-3">
              <span className="font-bold">3</span>
            </div>
            <h3 className="text-lg font-bold mb-1">Review AI Analysis</h3>
            <p className="text-slate-300 text-sm mb-4">
              Check out the fit score, strengths, and gaps detected by the AI agent.
            </p>
            <button 
              onClick={handleNextStep}
              className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
            >
              Next: Interview Prep <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {onboardingStep === 4 && (
          <div className="animate-fade-in">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mb-3">
              <span className="font-bold">4</span>
            </div>
            <h3 className="text-lg font-bold mb-1">Generate Questions</h3>
            <p className="text-slate-300 text-sm mb-4">
              Click the "Generate Questions" button to create a custom interview script.
            </p>
             <div className="text-sm text-blue-300 bg-blue-900/30 p-2 rounded border border-blue-800 flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-0.5 shrink-0"/>
                Find the button in the action toolbar above.
              </div>
          </div>
        )}

        {onboardingStep === 5 && (
           <div className="text-center animate-fade-in">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-3 mx-auto">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">You're a Pro!</h3>
            <p className="text-slate-300 text-sm mb-6">
              You've mastered the core workflow. Explore the Sourcing Hub and Offers next.
            </p>
            <button 
              onClick={handleNextStep}
              className="w-full py-2 bg-white text-slate-900 rounded-lg font-medium text-sm hover:bg-slate-100 transition-colors"
            >
              Finish Onboarding
            </button>
          </div>
        )}
      </div>
    </div>
  );
};