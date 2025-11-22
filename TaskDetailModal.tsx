
import React, { useState, useEffect } from 'react';
import { Task, TaskPriority, User, ChecklistItem } from '../types';
import { Modal } from './Modal';
import { XIcon, BellIcon, CalendarIcon, UserIcon, TagIcon, FlagIcon, ListIcon, CheckCircleIcon, PlusIcon, TrashIcon } from './Icons';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'projectId' | 'status'>) => void;
  taskToEdit: Task | null;
  users: User[];
  availableStatuses: string[];
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ isOpen, onClose, onSave, taskToEdit, users, availableStatuses }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined);
  const [involvedIds, setInvolvedIds] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Checklist State
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [checklistItemInput, setChecklistItemInput] = useState('');
  const [autoCompleteOnChecklist, setAutoCompleteOnChecklist] = useState(false);
  
  // Reminder Logic State
  const [showReminderPrompt, setShowReminderPrompt] = useState(false);
  const [reminderDate, setReminderDate] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setPriority(taskToEdit.priority);
      setDueDate(taskToEdit.dueDate);
      setAssigneeId(taskToEdit.assigneeId);
      setInvolvedIds(taskToEdit.involvedIds || []);
      setTags(taskToEdit.tags || []);
      setChecklist(taskToEdit.checklist || []);
      setAutoCompleteOnChecklist(taskToEdit.autoCompleteOnChecklist || false);
      setShowReminderPrompt(false);
    } else {
      // Reset for new task
      setTitle('');
      setDescription('');
      setPriority(TaskPriority.MEDIUM);
      setDueDate(''); 
      setAssigneeId(undefined);
      setInvolvedIds([]);
      setTags([]);
      setChecklist([]);
      setAutoCompleteOnChecklist(false);
      setShowReminderPrompt(false);
      
      const d = new Date();
      d.setDate(d.getDate() + 3);
      setReminderDate(d.toISOString().split('T')[0]);
    }
  }, [taskToEdit, isOpen]);

  const handleToggleInvolved = (userId: string) => {
    setInvolvedIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && tagInput.trim()) {
          e.preventDefault();
          if (!tags.includes(tagInput.trim())) {
              setTags(prev => [...prev, tagInput.trim()]);
          }
          setTagInput('');
      }
  };

  const handleRemoveTag = (tagToRemove: string) => {
      setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleAddChecklistItem = () => {
      if (checklistItemInput.trim()) {
          const newItem: ChecklistItem = {
              id: `item-${Date.now()}`,
              text: checklistItemInput.trim(),
              completed: false
          };
          setChecklist(prev => [...prev, newItem]);
          setChecklistItemInput('');
      }
  };

  const handleRemoveChecklistItem = (itemId: string) => {
      setChecklist(prev => prev.filter(item => item.id !== itemId));
  };
  
  const triggerSave = (includeReminder: boolean) => {
      onSave({
          title,
          description,
          priority,
          dueDate: dueDate || '',
          assigneeId,
          involvedIds,
          tags,
          checklist,
          autoCompleteOnChecklist,
          comments: taskToEdit?.comments || [],
          reminderAt: includeReminder ? reminderDate : undefined
      });
      setShowReminderPrompt(false);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskToEdit && !dueDate) {
        setShowReminderPrompt(true);
        return;
    }

    triggerSave(false);
  };
  
  const involvedUsers = users.filter(user => involvedIds.includes(user.id));
  const potentialInvolvedUsers = users.filter(user => !involvedIds.includes(user.id) && user.id !== assigneeId);

  return (
    <Modal title={taskToEdit ? "Edit Task" : "Create New Task"} isOpen={isOpen} onClose={onClose} size="5xl">
      {showReminderPrompt ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 h-full min-h-[400px]">
              <div className="p-6 bg-blue-500/10 rounded-full text-blue-400 border border-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.2)]">
                  <BellIcon className="w-16 h-16" />
              </div>
              <div className="text-center max-w-md">
                  <h3 className="text-3xl font-bold text-white mb-3">Set a Reminder?</h3>
                  <p className="text-gray-400 text-lg">
                      You haven't set a due date. Would you like us to remind you about this task later?
                  </p>
              </div>
              
              <div className="w-full max-w-xs">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2 pl-1">Remind me on</label>
                  <input 
                      type="date" 
                      value={reminderDate} 
                      onChange={(e) => setReminderDate(e.target.value)} 
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
              </div>

              <div className="flex gap-4 w-full max-w-md pt-4">
                  <button 
                    type="button" 
                    onClick={() => triggerSave(false)} 
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 font-medium transition-colors"
                  >
                      No, Skip
                  </button>
                  <button 
                    type="button" 
                    onClick={() => triggerSave(true)} 
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-900/20"
                  >
                      Set Reminder
                  </button>
              </div>
          </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row h-[700px]">
            {/* Left Column: Main Content */}
            <div className="flex-1 p-8 lg:p-10 flex flex-col gap-8 border-b lg:border-b-0 lg:border-r border-white/5 bg-gradient-to-b from-[#141419] to-[#0F0F12] overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                    <input 
                        id="title" 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        className="w-full bg-transparent border-none p-0 text-4xl font-bold text-white focus:ring-0 placeholder:text-gray-700 transition-colors"
                        placeholder="Task Title"
                        required
                        autoFocus
                    />
                </div>

                <div className="flex flex-col space-y-3">
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        Description
                    </label>
                    <textarea 
                        id="description" 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        className="w-full bg-white/5 border border-white/5 rounded-2xl p-6 text-gray-200 focus:ring-1 focus:ring-blue-500 focus:bg-black/40 focus:border-blue-500/50 focus:outline-none resize-none leading-relaxed text-lg transition-all min-h-[120px]"
                        placeholder="Add a detailed description..."
                    />
                </div>

                {/* Checklist Creation Section */}
                <div className="flex flex-col space-y-3">
                    <div className="flex justify-between items-end">
                        <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <ListIcon className="w-4 h-4" /> Checklist
                        </label>
                        <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none hover:text-white transition-colors">
                            <input 
                                type="checkbox" 
                                checked={autoCompleteOnChecklist} 
                                onChange={(e) => setAutoCompleteOnChecklist(e.target.checked)} 
                                className="rounded border-gray-700 bg-black/30 text-blue-600 focus:ring-blue-500"
                            />
                            Auto-complete task when finished
                        </label>
                    </div>
                    
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                        <div className="space-y-3 mb-4">
                            {checklist.map(item => (
                                <div key={item.id} className="flex items-center gap-3 group">
                                    <CheckCircleIcon className={`w-5 h-5 ${item.completed ? 'text-green-500' : 'text-gray-600'}`} />
                                    <span className={`flex-1 text-gray-300 ${item.completed ? 'line-through text-gray-500' : ''}`}>{item.text}</span>
                                    <button 
                                        type="button"
                                        onClick={() => handleRemoveChecklistItem(item.id)}
                                        className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {checklist.length === 0 && <p className="text-sm text-gray-600 italic">No items yet.</p>}
                        </div>
                        
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={checklistItemInput}
                                onChange={(e) => setChecklistItemInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddChecklistItem())}
                                placeholder="Add an item..."
                                className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                            <button 
                                type="button"
                                onClick={handleAddChecklistItem}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-gray-300 hover:text-white transition-colors"
                            >
                                <PlusIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Metadata & Properties */}
            <div className="w-full lg:w-[400px] bg-[#1A1A1F] p-8 flex flex-col gap-8 border-l border-white/5 shadow-2xl overflow-y-auto custom-scrollbar">
                
                {/* Properties Group */}
                <div className="space-y-6">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/5">
                        <TagIcon className="w-4 h-4" /> Properties
                    </h4>
                    
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1.5">Priority</label>
                            <div className="relative">
                                <select 
                                    value={priority} 
                                    onChange={(e) => setPriority(e.target.value as TaskPriority)} 
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer hover:bg-white/5 appearance-none"
                                >
                                    {Object.values(TaskPriority).map(p => <option key={p} value={p} className="bg-[#1A1A1F] text-white">{p}</option>)}
                                </select>
                                <FlagIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1.5">Due Date</label>
                            <div className="relative">
                                <input 
                                    type="date" 
                                    value={dueDate} 
                                    onChange={(e) => setDueDate(e.target.value)} 
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer hover:bg-white/5" 
                                />
                                <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1.5">Tags</label>
                            <div className="w-full bg-black/30 border border-white/10 rounded-xl p-2 flex flex-wrap gap-2 min-h-[50px]">
                                {tags.map(tag => (
                                    <span key={tag} className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-1 rounded-md text-xs flex items-center gap-1">
                                        {tag}
                                        <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-white"><XIcon className="w-3 h-3"/></button>
                                    </span>
                                ))}
                                <input 
                                    type="text" 
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleAddTag}
                                    placeholder={tags.length === 0 ? "Add tags..." : ""}
                                    className="bg-transparent border-none text-sm text-white focus:ring-0 p-1 flex-1 min-w-[80px] placeholder:text-gray-600"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* People Group */}
                <div className="space-y-6">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/5">
                        <UserIcon className="w-4 h-4" /> People
                    </h4>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1.5">Assignee</label>
                            <div className="relative">
                                <select 
                                    value={assigneeId || ''} 
                                    onChange={(e) => setAssigneeId(e.target.value || undefined)} 
                                    className="w-full bg-black/30 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-1 focus:ring-blue-500 outline-none appearance-none cursor-pointer hover:bg-white/5"
                                >
                                    <option value="" className="bg-[#1A1A1F] text-white">Unassigned</option>
                                    {users.map(u => <option key={u.id} value={u.id} className="bg-[#1A1A1F] text-white">{u.name}</option>)}
                                </select>
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center w-6 h-6">
                                    {assigneeId ? (
                                        <img src={users.find(u => u.id === assigneeId)?.avatarUrl} className="w-6 h-6 rounded-full" alt="" />
                                    ) : (
                                        <UserIcon className="w-5 h-5 text-gray-500" />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1.5">Involved</label>
                            <div className="flex flex-wrap gap-2 bg-black/30 border border-white/10 rounded-xl p-3 min-h-[80px] content-start">
                                {involvedUsers.map(user => (
                                    <div key={user.id} className="flex items-center gap-1.5 bg-white/10 border border-white/5 rounded-full pl-1 pr-2 py-1 text-xs text-gray-200">
                                        <img src={user.avatarUrl} alt={user.name} className="w-5 h-5 rounded-full" />
                                        <span>{user.name.split(' ')[0]}</span>
                                        <button type="button" onClick={() => handleToggleInvolved(user.id)} className="ml-1 text-gray-500 hover:text-white rounded-full hover:bg-white/20 p-0.5">
                                            <XIcon className="w-3 h-3"/>
                                        </button>
                                    </div>
                                ))}
                                <div className="relative group">
                                    <button type="button" className="h-7 px-3 text-xs font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 rounded-full transition-colors flex items-center gap-1">
                                        + Add
                                    </button>
                                    <div className="absolute top-full left-0 mt-2 w-56 bg-[#25252b] border border-white/10 rounded-xl shadow-2xl p-2 z-50 hidden group-hover:block max-h-48 overflow-y-auto">
                                        {potentialInvolvedUsers.length > 0 ? potentialInvolvedUsers.map(user => (
                                            <button key={user.id} type="button" onClick={() => handleToggleInvolved(user.id)} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-lg flex items-center gap-3 transition-colors">
                                                <img src={user.avatarUrl} className="w-6 h-6 rounded-full" alt="" />
                                                {user.name}
                                            </button>
                                        )) : <p className="px-3 py-2 text-xs text-gray-500 text-center">No users available</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-auto pt-6 flex gap-3">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-sm font-bold text-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className="flex-[2] py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all hover:shadow-blue-900/40 hover:-translate-y-0.5"
                    >
                        {taskToEdit ? 'Save Changes' : 'Create Task'}
                    </button>
                </div>
            </div>
        </form>
      )}
    </Modal>
  );
};
