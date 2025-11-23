
import React, { useState } from 'react';
import { CheckCircleIcon, ArrowRightIcon } from './Icons';

interface OnboardingWizardProps {
  onComplete: () => void;
  userName: string;
}

const roles = [
    { id: 'eng', label: 'Engineering' },
    { id: 'prod', label: 'Product' },
    { id: 'design', label: 'Design' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'other', label: 'Other' },
];

const sources = [
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'friend', label: 'Friend / Colleague' },
    { id: 'search', label: 'Google Search' },
    { id: 'blog', label: 'Tech Blog' },
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, userName }) => {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  const nextStep = () => setStep(s => s + 1);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[150px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px] animate-pulse delay-1000"></div>
        </div>

        <div className="relative w-full max-w-xl bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[9px] shadow-2xl overflow-hidden flex flex-col min-h-[450px] animate-in fade-in zoom-in-95 duration-700 ease-out">
            
            {/* Header Step Indicator */}
            <div className="px-8 pt-8 pb-0 flex justify-between items-end">
                 <div className="flex gap-1.5">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1 rounded-full transition-all duration-500 ${step >= i ? 'w-8 bg-white' : 'w-4 bg-white/10'}`} />
                    ))}
                 </div>
                 <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">
                     Step {step} — 3
                 </span>
            </div>

            <div className="flex-1 p-8 flex flex-col">
                {step === 1 && (
                    <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-700">
                        <h2 className="text-2xl font-bold text-white mb-2">Welcome, {userName.split(' ')[0]}.</h2>
                        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                            To customize your experience, tell us a bit about your primary role.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-3 mb-8">
                            {roles.map(role => (
                                <button 
                                    key={role.id}
                                    onClick={() => setSelectedRole(role.id)}
                                    className={`py-3 px-4 rounded-[9px] border text-sm font-medium transition-all text-left ${selectedRole === role.id ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                                >
                                    {role.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-end mt-auto">
                            <button 
                                onClick={nextStep}
                                disabled={!selectedRole}
                                className="px-8 py-3 bg-white text-black font-semibold rounded-[14px] hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 text-sm shadow-lg shadow-white/10"
                            >
                                Continue <ArrowRightIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-700">
                        <h2 className="text-2xl font-bold text-white mb-2">One last thing.</h2>
                        <p className="text-gray-400 text-sm mb-8">Where did you hear about Nexus?</p>
                        
                        <div className="space-y-2 max-w-md w-full mb-8">
                            {sources.map(source => (
                                <button 
                                    key={source.id}
                                    onClick={() => setSelectedSource(source.id)}
                                    className={`w-full py-3 px-4 rounded-[9px] border text-left transition-all flex justify-between items-center group ${selectedSource === source.id ? 'bg-white/10 border-white/30 text-white' : 'bg-transparent border-white/5 text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                >
                                    <span className="text-sm font-medium">{source.label}</span>
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${selectedSource === source.id ? 'border-white bg-white' : 'border-gray-600 group-hover:border-gray-400'}`}>
                                        {selectedSource === source.id && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-end mt-auto">
                            <button 
                                onClick={nextStep}
                                disabled={!selectedSource}
                                className="px-8 py-3 bg-white text-black font-semibold rounded-[14px] hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 text-sm shadow-lg shadow-white/10"
                            >
                                Continue <ArrowRightIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="flex-1 flex flex-col justify-center items-center text-center animate-in fade-in slide-in-from-right-4 duration-700">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-6 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                            <CheckCircleIcon className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">All Set!</h2>
                        <p className="text-gray-400 text-sm max-w-xs mb-8 leading-relaxed">
                            We've configured your workspace. Ready to dive in?
                        </p>
                        <button 
                            onClick={onComplete}
                            className="w-full max-w-xs py-3 bg-white text-black font-bold rounded-[14px] shadow-xl shadow-white/10 hover:scale-[1.02] transition-all text-sm"
                        >
                            Start Tour
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
