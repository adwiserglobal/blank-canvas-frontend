
import React, { useState } from 'react';
import { Automation, AutomationTrigger, AutomationAction, User, TaskStatus, TaskPriority } from '../types';
import { Modal } from './Modal';
import { ZapIcon, ArrowRightIcon, CheckCircleIcon, BellIcon, UserIcon, TagIcon, MessageSquareIcon, PlusIcon, TrashIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface AutomationBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (automation: Omit<Automation, 'id' | 'runCount'>) => void;
  users: User[];
  projectId: string;
}

const triggerTypes = [
    { id: 'TASK_STATUS_CHANGED', label: 'Task Status Changes', icon: <TagIcon className="w-4 h-4"/> },
    { id: 'TASK_PRIORITY_CHANGED', label: 'Priority Changes', icon: <ArrowRightIcon className="w-4 h-4"/> },
    { id: 'TASK_CREATED', label: 'New Task Created', icon: <PlusIcon className="w-4 h-4"/> },
];

const actionTypes = [
    { id: 'SEND_NOTIFICATION', label: 'Send Notification', icon: <BellIcon className="w-4 h-4"/> },
    { id: 'ASSIGN_USER', label: 'Assign User', icon: <UserIcon className="w-4 h-4"/> },
    { id: 'CHANGE_PRIORITY', label: 'Change Priority', icon: <ArrowRightIcon className="w-4 h-4"/> },
];

export const AutomationBuilder: React.FC<AutomationBuilderProps> = ({ isOpen, onClose, onSave, users, projectId }) => {
  const { t } = useLanguage();
  
  const [name, setName] = useState('New Automation');
  const [trigger, setTrigger] = useState<AutomationTrigger>({ 
      type: 'TASK_STATUS_CHANGED', 
      conditions: { field: 'status', operator: 'equals', value: 'Done' } 
  });
  const [actions, setActions] = useState<AutomationAction[]>([
      { type: 'SEND_NOTIFICATION', payload: { target: 'all_members', value: 'A task has been updated.' } }
  ]);

  const handleAddAction = () => {
      setActions([...actions, { type: 'SEND_NOTIFICATION', payload: {} }]);
  };

  const handleRemoveAction = (index: number) => {
      const newActions = [...actions];
      newActions.splice(index, 1);
      setActions(newActions);
  };

  const updateAction = (index: number, updates: Partial<AutomationAction>) => {
      const newActions = [...actions];
      newActions[index] = { ...newActions[index], ...updates };
      setActions(newActions);
  };

  const updateActionPayload = (index: number, updates: any) => {
      const newActions = [...actions];
      newActions[index].payload = { ...newActions[index].payload, ...updates };
      setActions(newActions);
  };

  const handleSave = () => {
      onSave({
          projectId,
          name,
          description: 'Created via Automation Builder',
          isActive: true,
          trigger,
          actions
      });
      onClose();
  };

  return (
    <Modal title={t('auto.builder.title')} isOpen={isOpen} onClose={onClose} size="5xl">
        <div className="flex flex-col h-[750px] -m-6">
             {/* Header Config */}
             <div className="p-6 border-b border-white/10 bg-[#1A1A1F]">
                 <label className="block text-xs text-gray-400 uppercase font-semibold mb-1">Automation Name</label>
                 <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent border-none text-2xl font-bold text-white focus:ring-0 p-0"
                 />
             </div>

             <div className="flex-1 overflow-y-auto p-8 bg-[#0F0F12] relative">
                 {/* Connector Line */}
                 <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-800 -translate-x-1/2 z-0"></div>

                 {/* Trigger Block */}
                 <div className="relative z-10 mb-12">
                     <div className="w-fit mx-auto bg-gray-800 text-xs text-gray-400 px-3 py-1 rounded-full mb-4 border border-gray-700">
                        {t('auto.trigger.when')}
                     </div>
                     <div className="bg-[#1E1E24] border border-blue-500/50 rounded-xl p-6 shadow-[0_0_40px_rgba(59,130,246,0.15)] max-w-2xl mx-auto relative">
                         <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 p-2 rounded-full shadow-lg">
                             <ZapIcon className="w-6 h-6 text-white"/>
                         </div>
                         <div className="mt-3 space-y-5">
                             <div>
                                 <label className="block text-sm font-medium text-gray-400 mb-2">Event</label>
                                 <select 
                                    value={trigger.type}
                                    onChange={(e) => setTrigger({ ...trigger, type: e.target.value as any })}
                                    className="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none"
                                 >
                                     {triggerTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                 </select>
                             </div>

                             {/* Trigger Condition Config */}
                             {trigger.type === 'TASK_STATUS_CHANGED' && (
                                 <div>
                                     <label className="block text-sm font-medium text-gray-400 mb-2">Status becomes</label>
                                     <select
                                        value={trigger.conditions.value}
                                        onChange={(e) => setTrigger({ ...trigger, conditions: { ...trigger.conditions, value: e.target.value } })}
                                        className="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none"
                                     >
                                         {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                     </select>
                                 </div>
                             )}
                             {trigger.type === 'TASK_PRIORITY_CHANGED' && (
                                 <div>
                                     <label className="block text-sm font-medium text-gray-400 mb-2">Priority becomes</label>
                                      <select
                                        value={trigger.conditions.value}
                                        onChange={(e) => setTrigger({ ...trigger, conditions: { ...trigger.conditions, value: e.target.value } })}
                                        className="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none"
                                     >
                                         {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                                     </select>
                                 </div>
                             )}
                         </div>
                     </div>
                 </div>

                 {/* Arrow Down */}
                 <div className="relative z-10 flex justify-center mb-12">
                     <div className="bg-gray-800 p-2 rounded-full border border-gray-700 shadow-md">
                         <ArrowRightIcon className="w-5 h-5 text-gray-400 rotate-90" />
                     </div>
                 </div>

                 {/* Actions Block */}
                 <div className="relative z-10 space-y-6">
                     <div className="w-fit mx-auto bg-gray-800 text-xs text-gray-400 px-3 py-1 rounded-full mb-4 border border-gray-700">
                        {t('auto.action.then')}
                     </div>
                     
                     {actions.map((action, index) => (
                         <div key={index} className="bg-[#1E1E24] border border-purple-500/50 rounded-xl p-6 shadow-[0_0_40px_rgba(168,85,247,0.15)] max-w-2xl mx-auto relative transition-all">
                             {index === 0 && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-600 p-2 rounded-full shadow-lg">
                                    <CheckCircleIcon className="w-6 h-6 text-white"/>
                                </div>
                             )}
                             <button onClick={() => handleRemoveAction(index)} className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-500/10">
                                 <TrashIcon className="w-5 h-5" />
                             </button>
                             
                             <div className="mt-3 space-y-5">
                                 <div>
                                     <label className="block text-sm font-medium text-gray-400 mb-2">Do this</label>
                                     <select 
                                        value={action.type}
                                        onChange={(e) => updateAction(index, { type: e.target.value as any })}
                                        className="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none"
                                     >
                                         {actionTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                     </select>
                                 </div>
                                 
                                 {/* Action Config */}
                                 {action.type === 'SEND_NOTIFICATION' && (
                                     <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">To</label>
                                            <select
                                                value={action.payload.target || 'all_members'}
                                                onChange={(e) => updateActionPayload(index, { target: e.target.value })}
                                                className="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none"
                                            >
                                                <option value="all_members">All Project Members</option>
                                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                                            <input 
                                                type="text"
                                                value={action.payload.value || ''}
                                                onChange={(e) => updateActionPayload(index, { value: e.target.value })}
                                                className="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none"
                                                placeholder="Notification text..."
                                            />
                                        </div>
                                     </>
                                 )}
                                 
                                 {action.type === 'ASSIGN_USER' && (
                                     <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Assign To</label>
                                        <select
                                            value={action.payload.target || ''}
                                            onChange={(e) => updateActionPayload(index, { target: e.target.value })}
                                            className="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none"
                                        >
                                            <option value="">Select User</option>
                                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                        </select>
                                    </div>
                                 )}
                                 
                                 {action.type === 'CHANGE_PRIORITY' && (
                                     <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Set Priority</label>
                                        <select
                                            value={action.payload.value || 'Medium'}
                                            onChange={(e) => updateActionPayload(index, { value: e.target.value })}
                                            className="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none"
                                        >
                                            {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                 )}
                             </div>
                         </div>
                     ))}

                     <button 
                        onClick={handleAddAction}
                        className="w-full max-w-2xl mx-auto flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-700 rounded-xl text-gray-400 hover:text-white hover:border-gray-500 transition-all bg-black/20 hover:bg-black/30"
                     >
                         <PlusIcon className="w-5 h-5" /> Add Action
                     </button>
                 </div>
             </div>

             <div className="p-6 border-t border-white/10 bg-[#1A1A1F] flex justify-end gap-3">
                 <button onClick={onClose} className="px-6 py-3 text-sm font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors">{t('common.cancel')}</button>
                 <button onClick={handleSave} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition-all hover:scale-105">{t('auto.save')}</button>
             </div>
        </div>
    </Modal>
  );
};
