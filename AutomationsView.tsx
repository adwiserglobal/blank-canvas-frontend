
import React, { useState } from 'react';
import { Automation, Project, User } from '../types';
import { ZapIcon, PlusIcon, TrashIcon, CheckCircleIcon, TagIcon, ArrowRightIcon, UserIcon, BellIcon } from './Icons';
import { AutomationBuilder } from './AutomationBuilder';
import { useLanguage } from '../contexts/LanguageContext';

interface AutomationsViewProps {
  project: Project;
  automations: Automation[];
  setAutomations: React.Dispatch<React.SetStateAction<Automation[]>>;
  users: User[];
}

export const AutomationsView: React.FC<AutomationsViewProps> = ({ project, automations, setAutomations, users }) => {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const { t } = useLanguage();

  const projectAutomations = automations.filter(a => a.projectId === project.id || a.projectId === 'global');

  const handleCreateAutomation = (automationData: Omit<Automation, 'id' | 'runCount'>) => {
      const newAutomation: Automation = {
          id: `auto-${Date.now()}`,
          runCount: 0,
          lastRun: undefined,
          ...automationData
      };
      setAutomations(prev => [...prev, newAutomation]);
  };

  const handleToggleActive = (id: string) => {
      setAutomations(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
  };

  const handleDelete = (id: string) => {
      setAutomations(prev => prev.filter(a => a.id !== id));
  };
  
  const getTriggerIcon = (type: string) => {
      switch(type) {
          case 'TASK_STATUS_CHANGED': return <TagIcon className="w-5 h-5 text-blue-400" />;
          case 'TASK_PRIORITY_CHANGED': return <ArrowRightIcon className="w-5 h-5 text-orange-400" />;
          case 'TASK_CREATED': return <PlusIcon className="w-5 h-5 text-green-400" />;
          default: return <ZapIcon className="w-5 h-5 text-gray-400" />;
      }
  }

  return (
    <div>
        <div className="flex justify-between items-center mb-8">
            <div>
                <h2 className="text-3xl font-bold text-white mb-2">{t('auto.title')}</h2>
                <p className="text-gray-400">Manage automated workflows for {project.name}.</p>
            </div>
            <button 
                onClick={() => setIsBuilderOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-all shadow-lg shadow-blue-900/20"
            >
                <PlusIcon className="w-5 h-5" />
                {t('auto.create')}
            </button>
        </div>

        {projectAutomations.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
                {projectAutomations.map(automation => (
                    <div key={automation.id} className={`bg-white/5 border border-white/10 rounded-xl p-5 flex items-center gap-6 transition-all hover:bg-white/10 ${!automation.isActive ? 'opacity-60' : ''}`}>
                        <div className={`p-3 rounded-full ${automation.isActive ? 'bg-blue-500/20' : 'bg-gray-800'}`}>
                            <ZapIcon className={`w-6 h-6 ${automation.isActive ? 'text-blue-400' : 'text-gray-500'}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-lg font-semibold text-white truncate">{automation.name}</h3>
                                {!automation.isActive && <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-400">Disabled</span>}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <div className="flex items-center gap-1.5 bg-black/30 px-2 py-1 rounded-md">
                                    {getTriggerIcon(automation.trigger.type)}
                                    <span>If {automation.trigger.conditions.field} {automation.trigger.conditions.operator.replace('_', ' ')} <b>{automation.trigger.conditions.value}</b></span>
                                </div>
                                <span className="text-gray-600">→</span>
                                <div className="flex items-center gap-1.5 bg-black/30 px-2 py-1 rounded-md">
                                    <span>{automation.actions.length} actions</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-8 text-sm text-gray-500 border-l border-white/10 pl-6">
                            <div>
                                <p className="font-medium text-gray-300">{automation.runCount}</p>
                                <p className="text-xs">{t('auto.runs')}</p>
                            </div>
                             <div className="flex items-center gap-2">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={automation.isActive} onChange={() => handleToggleActive(automation.id)} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                                <button onClick={() => handleDelete(automation.id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-800 rounded-xl text-gray-500">
                <ZapIcon className="w-16 h-16 mb-4 text-gray-700" />
                <h3 className="text-xl font-bold text-gray-400">{t('auto.no_automations')}</h3>
                <p>{t('auto.no_automations_desc')}</p>
            </div>
        )}

        <AutomationBuilder 
            isOpen={isBuilderOpen} 
            onClose={() => setIsBuilderOpen(false)} 
            onSave={handleCreateAutomation}
            users={users}
            projectId={project.id}
        />
    </div>
  );
};
