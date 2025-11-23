
import React, { useState } from 'react';
import { XIcon, CheckCircleIcon, SendIcon } from './Icons';

interface FeedbackSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const RatingInput: React.FC<{ value: number; onChange: (val: number) => void }> = ({ value, onChange }) => {
    return (
        <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((rating) => (
                <button
                    key={rating}
                    onClick={() => onChange(rating)}
                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 ${
                        value === rating
                            ? 'bg-blue-600 border-blue-500 text-white scale-110 shadow-[0_0_15px_rgba(37,99,235,0.5)]'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/30'
                    }`}
                >
                    {rating}
                </button>
            ))}
        </div>
    );
};

export const FeedbackSidebar: React.FC<FeedbackSidebarProps> = ({ isOpen, onClose }) => {
  const [q1, setQ1] = useState(0);
  const [q2, setQ2] = useState('');
  const [q3, setQ3] = useState(0);
  const [q4, setQ4] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
      console.log({ 
          q1: `Easy to use: ${q1}`, 
          q2: `Simplicity improvements: ${q2}`, 
          q3: `NPS: ${q3}`, 
          q4: `General improvements: ${q4}` 
      });
      
      setSubmitted(true);
      setTimeout(() => {
          onClose();
          // Reset after closing
          setTimeout(() => {
              setSubmitted(false);
              setQ1(0);
              setQ2('');
              setQ3(0);
              setQ4('');
          }, 500);
      }, 2000);
  };

  return (
    <>
        {/* Backdrop */}
        <div 
            className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            onClick={onClose}
        />

        {/* Drawer - Reverted to Side Panel Style */}
        <div className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-[#141419] border-l border-white/10 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/10 bg-black/20">
                    <h2 className="text-xl font-bold text-white">Seu Feedback</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {submitted ? (
                        <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                                <CheckCircleIcon className="w-10 h-10 text-green-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Obrigado!</h3>
                            <p className="text-gray-400">Sua opinião é fundamental para evoluirmos a plataforma.</p>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            {/* Question 1 */}
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-200">
                                    1. Quão fácil foi realizar o que você queria fazer hoje?
                                </label>
                                <RatingInput value={q1} onChange={setQ1} />
                                <div className="flex justify-between text-xs text-gray-500 px-1">
                                    <span>Muito Difícil</span>
                                    <span>Muito Fácil</span>
                                </div>
                            </div>

                            {/* Question 2 */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-200">
                                    2. O que poderia ter tornado essa tarefa ainda mais simples?
                                </label>
                                <textarea 
                                    value={q2}
                                    onChange={(e) => setQ2(e.target.value)}
                                    rows={3}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:outline-none placeholder:text-gray-600 resize-none"
                                    placeholder="Sua resposta..."
                                />
                            </div>

                            {/* Question 3 */}
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-200">
                                    3. Em uma escala de 1 a 5, qual a chance de você indicar a plataforma para um amigo?
                                </label>
                                <RatingInput value={q3} onChange={setQ3} />
                                <div className="flex justify-between text-xs text-gray-500 px-1">
                                    <span>Nenhuma Chance</span>
                                    <span>Com Certeza</span>
                                </div>
                            </div>

                            {/* Question 4 */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-200">
                                    4. O que você gostaria que a plataforma tivesse ou o que podemos melhorar?
                                </label>
                                <textarea 
                                    value={q4}
                                    onChange={(e) => setQ4(e.target.value)}
                                    rows={4}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:outline-none placeholder:text-gray-600 resize-none"
                                    placeholder="Sua resposta..."
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!submitted && (
                    <div className="p-6 border-t border-white/10 bg-black/20">
                        <button 
                            onClick={handleSubmit}
                            disabled={!q1 || !q3}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/30"
                        >
                            <SendIcon className="w-4 h-4" /> Enviar Feedback
                        </button>
                    </div>
                )}
            </div>
        </div>
    </>
  );
};
