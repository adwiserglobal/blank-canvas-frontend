
import React, { useState, useEffect, useRef } from 'react';
import { Modal } from './Modal';
import { Project, User, ProjectMember, ProjectColumn } from '../types';
import { CheckCircleIcon, TrashIcon, UsersIcon, BriefcaseIcon, CalendarDaysIcon, TargetIcon, MessageCircleIcon, SparklesIcon, EditIcon, ArrowLeftIcon, ZapIcon, MonitorIcon, MessageSquareIcon } from './Icons';
import { generateProjectDetails } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

type ProjectCreationData = Omit<Project, 'id' | 'docs' | 'folders'>;

interface CreateProjectWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (projectData: ProjectCreationData, createGroupChat: boolean) => void;
  users: User[];
}

const projectRoles = ['Product Manager', 'UX/UI Designer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'QA Engineer', 'Go-to-Market Specialist', 'Stakeholder', 'Project Lead'];
const aiSuggestions = ['SaaS Dashboard Redesign', 'Mobile App Launch', 'Marketing Campaign Q4', 'Internal Tool Migration'];

const initialProjectData: ProjectCreationData = {
  name: '',
  description: '',
  icon: '', // Removed default icon
  members: [],
  columns: [
      { id: 'To Do', title: 'To Do', color: 'border-l-blue-500' },
      { id: 'In Progress', title: 'In Progress', color: 'border-l-orange-500' },
      { id: 'Done', title: 'Done', color: 'border-l-green-500' }
  ],
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  slas: '',
  kpis: '',
  onboardingMessage: '',
  stoplightItems: [],
};

const WizardProgressBar: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = ["Details", "Team", "Timeline & Metrics", "Onboarding", "Review"];
    return (
        <div className="flex items-center w-full px-4 mb-8">
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentStep > index + 1 ? 'bg-blue-600 border-blue-600' : currentStep === index + 1 ? 'border-blue-500 scale-110' : 'border-gray-600 bg-gray-800'}`}>
                           {currentStep > index + 1 ? <CheckCircleIcon className="w-5 h-5 md:w-6 md:h-6 text-white" /> : <span className={`font-bold text-sm md:text-base ${currentStep === index + 1 ? 'text-blue-400' : 'text-gray-500'}`}>{index + 1}</span>}
                        </div>
                        <p className={`text-[10px] md:text-xs mt-2 font-medium transition-colors ${currentStep >= index + 1 ? 'text-white' : 'text-gray-500'}`}>{step}</p>
                    </div>
                    {index < steps.length - 1 && <div className={`flex-1 h-0.5 md:h-1 mx-2 md:mx-4 rounded-full ${currentStep > index + 1 ? 'bg-blue-600' : 'bg-gray-600'}`} />}
                </React.Fragment>
            ))}
        </div>
    );
};

type WizardMode = 'SELECT' | 'AI_INPUT' | 'WIZARD';

export const CreateProjectWizard: React.FC<CreateProjectWizardProps> = ({ isOpen, onClose, onCreate, users }) => {
  const [mode, setMode] = useState<WizardMode>('SELECT');
  const [step, setStep] = useState(1);
  const [projectData, setProjectData] = useState<ProjectCreationData>(initialProjectData);
  const [createGroupChat, setCreateGroupChat] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationLog, setGenerationLog] = useState<string[]>([]);
  const [generationComplete, setGenerationComplete] = useState(false);

  const { t } = useLanguage();

  // AI Input specific state
  const [aiInputName, setAiInputName] = useState('');
  const [aiInputDesc, setAiInputDesc] = useState('');

  useEffect(() => {
    if (isOpen) {
        setMode('SELECT');
        setStep(1);
        setProjectData(initialProjectData);
        setCreateGroupChat(false);
        setIsGenerating(false);
        setGenerationComplete(false);
        setGenerationLog([]);
        setAiInputName('');
        setAiInputDesc('');
    }
  }, [isOpen])

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));
  
  const updateData = (updates: Partial<ProjectCreationData>) => {
      setProjectData(prev => ({ ...prev, ...updates }));
  }

  const handleCreate = () => {
    onCreate(projectData, createGroupChat);
  };

  const handleStartManual = () => {
      setProjectData(initialProjectData);
      setMode('WIZARD');
      setStep(1);
  };

  const handleStartAI = () => {
      setMode('AI_INPUT');
  };

  const simulateGenerationLogs = async () => {
      const logs = [
          'wizard.step.analyzing',
          'wizard.step.detecting',
          'wizard.step.drafting',
          'wizard.step.structuring',
          'wizard.step.finalizing',
      ];

      for (const logKey of logs) {
          if(!isGenerating) break; 
          setGenerationLog(prev => [...prev, t(logKey)]);
          await new Promise(r => setTimeout(r, 800));
      }
  };

  const handleGenerateAndStart = async () => {
      if (!aiInputName || !aiInputDesc) return;
      
      setIsGenerating(true);
      setGenerationLog([t('wizard.generating')]);
      
      // Start log simulation in background
      const logPromise = simulateGenerationLogs();
      
      try {
          const aiData = await generateProjectDetails(aiInputName, aiInputDesc);
          await logPromise; // Ensure logs finish or at least some time passes
          
          setGenerationLog(prev => [...prev, t('wizard.step.complete')]);

          const enrichedColumns: ProjectColumn[] = aiData.columns.map(col => ({
              id: col.title,
              title: col.title,
              color: col.color
          }));

          setProjectData({
              ...initialProjectData,
              name: aiInputName,
              description: aiInputDesc,
              icon: aiData.icon,
              columns: enrichedColumns,
              slas: aiData.slas,
              kpis: aiData.kpis,
              onboardingMessage: aiData.onboardingMessage
          });
          
          setGenerationComplete(true);
          
      } catch (error) {
          console.error("Failed to generate with Nexia", error);
          setGenerationLog(prev => [...prev, "Error generating details. Please try again."]);
          setIsGenerating(false);
      } finally {
          setIsGenerating(false);
      }
  };

  const proceedToWizard = () => {
      setMode('WIZARD');
      setStep(1);
  };
  
  const renderWizardStep = () => {
      switch(step) {
          case 1: // Details
            return (
                <div className="animate-in fade-in slide-in-from-right duration-300">
                    <div className="space-y-6">
                         <div>
                            <label htmlFor="projectName" className="block text-sm font-medium text-gray-300 mb-2">Project Name</label>
                            <input id="projectName" type="text" value={projectData.name} onChange={(e) => updateData({ name: e.target.value })} placeholder="e.g., Feedmetrics Redesign" className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                        </div>
                        <div>
                            <label htmlFor="projectDesc" className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                            <textarea id="projectDesc" value={projectData.description} onChange={e => updateData({description: e.target.value})} rows={5} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Briefly describe what this project is about." />
                        </div>
                    </div>
                </div>
            )
          case 2: // Team
            const assignedUserIds = projectData.members.map(m => m.userId);
            const availableUsers = users.filter(u => !assignedUserIds.includes(u.id));
            
            const addMember = (userId: string) => {
                const newMember: ProjectMember = { userId, role: 'Developer' };
                updateData({ members: [...projectData.members, newMember] });
            }

            const removeMember = (userId: string) => {
                updateData({ members: projectData.members.filter(m => m.userId !== userId) });
            }

            const updateMemberRole = (userId: string, role: string) => {
                updateData({ members: projectData.members.map(m => m.userId === userId ? { ...m, role } : m) });
            }

            return (
                <div className="animate-in fade-in slide-in-from-right duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-xl font-semibold text-white">Assemble your Project Team</h4>
                        <div className="relative group">
                            <button type="button" disabled={availableUsers.length === 0} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"><UsersIcon className="w-4 h-4" /> Add Member</button>
                            <div className="absolute top-full right-0 mt-2 w-60 bg-[#1A1A1F]/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl p-1.5 z-20 hidden group-hover:block max-h-60 overflow-y-auto">
                               {availableUsers.map(user => (
                                   <button key={user.id} onClick={() => addMember(user.id)} className="w-full text-left flex items-center gap-3 p-2.5 text-sm rounded-md hover:bg-white/10">
                                       <img src={user.avatarUrl} alt={user.name} className="w-7 h-7 rounded-full" />
                                       {user.name}
                                   </button>
                               ))}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3 max-h-[340px] overflow-y-auto pr-2">
                       {projectData.members.map(({ userId, role }) => {
                           const user = users.find(u => u.id === userId);
                           if (!user) return null;
                           return (
                               <div key={userId} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                                   <div className="flex items-center gap-4">
                                       <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
                                       <span className="font-semibold text-lg">{user.name}</span>
                                   </div>
                                   <div className="flex items-center gap-3">
                                       <select value={role} onChange={e => updateMemberRole(userId, e.target.value)} className="bg-gray-800/70 border border-gray-700 rounded-md px-3 py-1.5 text-sm focus:ring-blue-500 focus:outline-none">
                                           {projectRoles.map(r => <option key={r} value={r}>{r}</option>)}
                                       </select>
                                       <button onClick={() => removeMember(userId)} className="p-2 rounded-md text-gray-400 hover:text-red-400 hover:bg-red-500/10"><TrashIcon className="w-5 h-5" /></button>
                                   </div>
                               </div>
                           )
                       })}
                       {projectData.members.length === 0 && (
                           <div className="text-center py-16 text-gray-500 border-2 border-dashed border-gray-700 rounded-lg">
                               <UsersIcon className="w-16 h-16 mx-auto mb-3" />
                               <p className="font-semibold">No members added yet.</p>
                               <p className="text-sm">Click "Add Member" to build your team.</p>
                           </div>
                       )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10">
                        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-white/5 transition-colors">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${createGroupChat ? 'bg-blue-600 border-blue-600' : 'border-gray-500'}`}>
                                {createGroupChat && <CheckCircleIcon className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <input type="checkbox" checked={createGroupChat} onChange={e => setCreateGroupChat(e.target.checked)} className="hidden" />
                            <div>
                                <p className="text-white font-medium">Create a project chat group</p>
                                <p className="text-xs text-gray-400">Automatically add all members to a new group chat.</p>
                            </div>
                        </label>
                    </div>
                </div>
            )
          case 3: // Timeline & Metrics
            return (
                <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                            <input id="startDate" type="date" value={projectData.startDate} onChange={e => updateData({startDate: e.target.value})} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-2">Target End Date</label>
                            <input id="endDate" type="date" value={projectData.endDate} onChange={e => updateData({endDate: e.target.value})} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label htmlFor="kpis" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                Key Success Metrics (KPIs)
                            </label>
                            <textarea id="kpis" value={projectData.kpis} onChange={e => updateData({kpis: e.target.value})} rows={6} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g., • Achieve 10k MAU&#10;• Reduce customer churn by 5%&#10;• Increase conversion rate to 3%" />
                        </div>
                        <div>
                            <label htmlFor="slas" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                Service Level Agreements (SLAs)
                            </label>
                            <textarea id="slas" value={projectData.slas} onChange={e => updateData({slas: e.target.value})} rows={6} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g., • P1 bugs resolved in < 24 hours&#10;• API response time < 200ms&#10;• 99.9% uptime" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                            Workflow Stages
                        </label>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {projectData.columns.map((col, idx) => (
                                <div key={idx} className={`flex-shrink-0 px-3 py-1.5 rounded border bg-black/20 text-sm text-gray-300 ${col.color.replace('border-l-', 'border-')}`}>
                                    {col.title}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )
          case 4: // Onboarding
            return (
                 <div className="animate-in fade-in slide-in-from-right duration-300">
                    <label htmlFor="onboarding" className="block text-lg font-semibold text-white mb-2">Onboarding Message</label>
                    <p className="text-sm text-gray-400 mb-4">This message will be shown to new members when they first join the project. You can use it to provide initial instructions or links.</p>
                    <textarea id="onboarding" value={projectData.onboardingMessage} onChange={e => updateData({onboardingMessage: e.target.value})} rows={10} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
            )
          case 5: // Review
            const formatDate = (dateString: string) => dateString ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not set';
            return (
                <div className="space-y-6 max-h-[500px] overflow-y-auto p-1 text-gray-300 animate-in fade-in slide-in-from-right duration-300">
                    <div className="p-4 rounded-lg bg-black/20">
                        <div className="flex items-start gap-4">
                            <BriefcaseIcon className="w-6 h-6 mt-1 text-blue-400"/>
                            <div>
                                <h4 className="font-bold text-white text-lg">Project Details</h4>
                                <div className="flex items-center gap-4 mt-2">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{projectData.name}</h3>
                                        <p className="text-gray-400 text-sm">{projectData.description || 'No description provided.'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-black/20">
                        <div className="flex items-start gap-4">
                            <UsersIcon className="w-6 h-6 mt-1 text-blue-400"/>
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-bold text-white text-lg">Team Members ({projectData.members.length})</h4>
                                    {createGroupChat && (
                                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full flex items-center gap-1">
                                            <MessageSquareIcon className="w-3 h-3" /> Group Chat Enabled
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-4 mt-2">
                                   {projectData.members.length > 0 ? projectData.members.map(({userId, role}) => {
                                        const user = users.find(u => u.id === userId);
                                        return (
                                            <div key={userId} className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
                                                <img src={user?.avatarUrl} alt={user?.name} className="w-7 h-7 rounded-full" />
                                                <div>
                                                    <p className="text-sm font-medium text-white">{user?.name}</p>
                                                    <p className="text-xs text-gray-400">{role}</p>
                                                </div>
                                            </div>
                                        )
                                   }) : <p className="text-sm text-gray-500">No members assigned.</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                     <div className="p-4 rounded-lg bg-black/20">
                         <div className="flex items-start gap-4">
                             <CalendarDaysIcon className="w-6 h-6 mt-1 text-blue-400"/>
                            <div>
                                <h4 className="font-bold text-white text-lg">Timeline</h4>
                                <p className="text-sm mt-1"><strong>Start:</strong> {formatDate(projectData.startDate)} &nbsp; • &nbsp; <strong>End:</strong> {formatDate(projectData.endDate)}</p>
                            </div>
                         </div>
                    </div>

                    <div className="p-4 rounded-lg bg-black/20">
                         <div className="flex items-start gap-4">
                             <TargetIcon className="w-6 h-6 mt-1 text-blue-400"/>
                             <div>
                                <h4 className="font-bold text-white text-lg">KPIs & SLAs</h4>
                                <h5 className="font-semibold text-gray-200 mt-2">Key Metrics:</h5>
                                <p className="whitespace-pre-wrap text-sm text-gray-400">{projectData.kpis || 'None defined'}</p>
                                <h5 className="font-semibold text-gray-200 mt-2">Agreements:</h5>
                                <p className="whitespace-pre-wrap text-sm text-gray-400">{projectData.slas || 'None defined'}</p>
                             </div>
                         </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-black/20">
                        <div className="flex items-start gap-4">
                           <MessageCircleIcon className="w-6 h-6 mt-1 text-blue-400"/>
                            <div>
                                <h4 className="font-bold text-white text-lg">Onboarding Message</h4>
                                <p className="whitespace-pre-wrap text-sm text-gray-400 bg-black/20 p-3 rounded-md mt-2">{projectData.onboardingMessage}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
      }
  }

  if (mode === 'SELECT') {
      return (
          <Modal title={t('wizard.select_mode')} isOpen={isOpen} onClose={onClose} size="2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 min-h-[300px]">
                  <button 
                    onClick={handleStartManual}
                    className="flex flex-col items-center justify-center gap-4 p-8 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all group"
                  >
                      <div className="p-5 bg-gray-800 rounded-full group-hover:scale-110 transition-transform">
                          <EditIcon className="w-10 h-10 text-gray-300" />
                      </div>
                      <div className="text-center">
                          <h3 className="text-xl font-bold text-white mb-2">{t('wizard.mode.manual')}</h3>
                          <p className="text-sm text-gray-400">{t('wizard.mode.manual.desc')}</p>
                      </div>
                  </button>

                  <button 
                    onClick={handleStartAI}
                    className="flex flex-col items-center justify-center gap-4 p-8 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-blue-400/50 hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all group relative overflow-hidden"
                  >
                      <div className="absolute top-0 right-0 p-2">
                          <SparklesIcon className="w-5 h-5 text-yellow-300 animate-pulse" />
                      </div>
                      <div className="p-5 bg-blue-600/30 rounded-full group-hover:scale-110 transition-transform">
                          <SparklesIcon className="w-10 h-10 text-blue-200" />
                      </div>
                      <div className="text-center">
                          <h3 className="text-xl font-bold text-white mb-2">{t('wizard.mode.ai')}</h3>
                          <p className="text-sm text-blue-100/70">{t('wizard.mode.ai.desc')}</p>
                      </div>
                  </button>
              </div>
          </Modal>
      )
  }

  if (mode === 'AI_INPUT') {
      return (
          <Modal title="" isOpen={isOpen} onClose={onClose} size="4xl">
              {/* Custom Header for AI Mode to accommodate full immersion */}
              <div className="flex flex-col h-[600px] -m-6 bg-[#09090b]">
                  {/* Header */}
                  <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
                             <ZapIcon className="w-6 h-6 text-white" />
                         </div>
                         <div>
                             <h3 className="text-lg font-bold text-white">{t('wizard.ai_input.title')}</h3>
                             <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Generative Engine v2.5</p>
                         </div>
                      </div>
                      <button onClick={onClose} className="text-gray-400 hover:text-white"><MonitorIcon className="w-5 h-5"/></button>
                  </div>

                  <div className="flex-1 p-8 flex flex-col justify-center relative overflow-hidden">
                      {/* Background Effects */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

                      {!isGenerating && !generationComplete ? (
                        // Input State
                        <div className="max-w-2xl mx-auto w-full relative z-10 animate-in fade-in zoom-in-95 duration-500">
                             <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-white mb-2">{t('wizard.ai_input.subtitle')}</h2>
                                <p className="text-gray-400">Describe your vision. Nexia will structure the reality.</p>
                             </div>
                             
                             <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md shadow-2xl">
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 pl-1">{t('wizard.ai_input.name_label')}</label>
                                        <input 
                                            type="text" 
                                            value={aiInputName} 
                                            onChange={(e) => setAiInputName(e.target.value)}
                                            placeholder={t('wizard.ai_input.placeholder_name')}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" 
                                            autoFocus
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 pl-1">{t('wizard.ai_input.desc_label')}</label>
                                        <textarea 
                                            value={aiInputDesc} 
                                            onChange={(e) => setAiInputDesc(e.target.value)}
                                            rows={4} 
                                            placeholder={t('wizard.ai_input.placeholder_desc')}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none" 
                                        />
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <span className="text-xs text-gray-500 py-1">{t('wizard.ai.suggestion')}</span>
                                            {aiSuggestions.map(suggestion => (
                                                <button 
                                                    key={suggestion} 
                                                    onClick={() => setAiInputDesc(suggestion)}
                                                    className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-1 text-gray-300 transition-colors"
                                                >
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                             </div>

                             <div className="flex justify-between items-center mt-8">
                                <button onClick={() => setMode('SELECT')} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/5 transition-colors">
                                    <ArrowLeftIcon className="w-4 h-4" /> {t('common.back')}
                                </button>
                                <button 
                                    onClick={handleGenerateAndStart}
                                    disabled={!aiInputName.trim() || !aiInputDesc.trim()}
                                    className="group relative px-8 py-3 bg-white text-black font-bold rounded-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        <SparklesIcon className="w-5 h-5 text-blue-600" />
                                        {t('wizard.btn.generate')}
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </button>
                             </div>
                        </div>
                      ) : !generationComplete ? (
                          // Processing State
                          <div className="flex flex-col items-center justify-center relative z-10">
                              {/* Pulsing Core */}
                              <div className="relative w-32 h-32 mb-10">
                                  <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
                                  <div className="absolute inset-2 bg-purple-500 rounded-full opacity-20 animate-pulse delay-75"></div>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="w-24 h-24 bg-black border-2 border-blue-400 rounded-full shadow-[0_0_50px_rgba(59,130,246,0.5)] flex items-center justify-center relative overflow-hidden">
                                           <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/3o7btLw8580PgGp27K/giphy.gif')] opacity-20 bg-cover"></div>
                                           <SparklesIcon className="w-10 h-10 text-white animate-pulse" />
                                      </div>
                                  </div>
                              </div>
                              
                              {/* Console Logs */}
                              <div className="w-full max-w-md bg-black/50 border border-white/10 rounded-lg p-4 font-mono text-sm h-48 overflow-hidden flex flex-col shadow-2xl">
                                  <div className="flex-1 flex flex-col justify-end space-y-2">
                                      {generationLog.map((log, index) => (
                                          <p key={index} className="text-blue-300/80 flex items-center gap-2 animate-in slide-in-from-left fade-in duration-300">
                                              <span className="text-blue-500">❯</span> {log}
                                          </p>
                                      ))}
                                      <p className="text-blue-500 animate-pulse">▋</p>
                                  </div>
                              </div>
                          </div>
                      ) : (
                          // Success State
                          <div className="max-w-lg mx-auto w-full text-center relative z-10 animate-in zoom-in-95 duration-500">
                              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/50">
                                  <CheckCircleIcon className="w-10 h-10 text-green-400" />
                              </div>
                              <h2 className="text-3xl font-bold text-white mb-2">{t('wizard.step.complete')}</h2>
                              <p className="text-gray-400 mb-8">Nexia has constructed the project architecture based on your requirements.</p>
                              
                              <div className="grid grid-cols-2 gap-4 mb-8 text-left">
                                  <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                                      <p className="text-xs text-gray-500 uppercase">KPIs</p>
                                      <p className="text-lg font-bold text-white">Generated</p>
                                  </div>
                                   <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                                      <p className="text-xs text-gray-500 uppercase">Workflow</p>
                                      <p className="text-lg font-bold text-white">{projectData.columns.length} Columns</p>
                                  </div>
                              </div>

                              <button 
                                onClick={proceedToWizard}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-900/30"
                              >
                                  {t('wizard.btn.review')}
                              </button>
                          </div>
                      )}
                  </div>
              </div>
          </Modal>
      )
  }

  return (
    <Modal title={t('common.create')} isOpen={isOpen} onClose={onClose} size="4xl">
        <div className="min-h-[550px] flex flex-col">
            <WizardProgressBar currentStep={step} />
            <div className="flex-1">
              {renderWizardStep()}
            </div>
        </div>
        <div className="flex justify-between items-center pt-6 mt-6 border-t border-white/10">
            <button 
                onClick={step === 1 ? () => setMode('SELECT') : prevStep} 
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {t('common.back')}
            </button>
            {step < 5 ? (
                <button onClick={nextStep} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-colors">
                    {t('common.next')}
                </button>
            ) : (
                <button onClick={handleCreate} className="px-6 py-2 bg-gradient-to-r from-blue-500 to-orange-500 hover:opacity-90 rounded-lg text-sm font-medium text-white transition-opacity">
                    ✨ {t('common.create')}
                </button>
            )}
        </div>
    </Modal>
  );
};
