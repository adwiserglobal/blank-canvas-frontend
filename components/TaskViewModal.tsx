
import React, { useState, useRef, useEffect } from 'react';
import { Task, User, TaskPriority, Comment } from '../types';
import { Modal } from './Modal';
import { UserIcon, CalendarIcon, ChevronUpIcon, ChevronsUpIcon, MinusIcon, EditIcon, ArrowUpRightIcon, CheckCircleIcon, CircleIcon, PinIcon, TagIcon, BriefcaseIcon, ClockIcon, FlagIcon, MessageCircleIcon, SendIcon, ListIcon } from './Icons';

const priorityConfig = {
  [TaskPriority.HIGH]: { icon: <ChevronsUpIcon className="w-4 h-4 text-red-400" />, text: 'High', bg: 'bg-red-500/10', border: 'border-red-500/20', textClass: 'text-red-200' },
  [TaskPriority.MEDIUM]: { icon: <ChevronUpIcon className="w-4 h-4 text-orange-400" />, text: 'Medium', bg: 'bg-orange-500/10', border: 'border-orange-500/20', textClass: 'text-orange-200' },
  [TaskPriority.LOW]: { icon: <MinusIcon className="w-4 h-4 text-green-400" />, text: 'Low', bg: 'bg-green-500/10', border: 'border-green-500/20', textClass: 'text-green-200' },
};

const getStatusConfig = (status: string) => {
    if (status === 'Done') return { text: status, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: <CheckCircleIcon className="w-4 h-4" /> };
    if (status === 'In Progress') return { text: status, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: <CircleIcon className="w-4 h-4 animate-pulse" /> };
    return { text: status, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: <CircleIcon className="w-4 h-4" /> };
};

interface TaskViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  users: User[];
  projectMembers: User[];
  onEdit: (task: Task) => void;
  onSendTaskToChat: (task: Task, user: User) => void;
  onPinTask: (task: Task) => void;
  onTaskUpdate: (task: Task) => void;
}

const SidebarSection: React.FC<{ title: string, icon: React.ReactNode, children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="space-y-4">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/5">
            {icon} {title}
        </h4>
        {children}
    </div>
);

export const TaskViewModal: React.FC<TaskViewModalProps> = ({ isOpen, onClose, task, users, projectMembers, onEdit, onSendTaskToChat, onPinTask, onTaskUpdate }) => {
  const [isSharePopoverOpen, setSharePopoverOpen] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const commentsEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom of comments when they change or modal opens
  useEffect(() => {
      if (isOpen && commentsEndRef.current) {
          commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
  }, [task?.comments, isOpen]);

  if (!isOpen || !task) return null;

  const assignee = users.find(u => u.id === task.assigneeId);
  const involved = task.involvedIds?.map(id => users.find(u => u.id === id)).filter(Boolean) as User[] || [];
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Done';
  const statusConfig = getStatusConfig(task.status);
  const priorityStyle = priorityConfig[task.priority];
  const tags = task.tags || [];
  const comments = task.comments || [];
  const checklist = task.checklist || [];
  
  const checklistCompletedCount = checklist.filter(i => i.completed).length;
  const checklistProgress = checklist.length > 0 ? (checklistCompletedCount / checklist.length) * 100 : 0;

  const handleSendClick = (user: User) => {
    onSendTaskToChat(task, user);
    setSharePopoverOpen(false);
    onClose();
  };

  const handleAddComment = (e: React.FormEvent) => {
      e.preventDefault();
      if (!commentInput.trim()) return;

      // Assume current user is the first one in users array for this mockup or pass current user prop.
      const currentUser = users.find(u => u.id === 'user-alex') || users[0]; 

      const newComment: Comment = {
          id: `c-${Date.now()}`,
          userId: currentUser.id,
          content: commentInput,
          createdAt: new Date().toISOString()
      };

      const updatedTask = { ...task, comments: [...comments, newComment] };
      onTaskUpdate(updatedTask);
      setCommentInput('');
  };

  const handleToggleChecklistItem = (itemId: string) => {
      const updatedChecklist = checklist.map(item => 
          item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      
      let newStatus = task.status;
      
      // Auto complete logic
      if (task.autoCompleteOnChecklist) {
          const allCompleted = updatedChecklist.every(item => item.completed);
          if (allCompleted) {
              newStatus = 'Done';
          }
          // Optional: revert status if unchecked? 
          // Usually safer not to revert "Done" automatically to avoid confusion, 
          // but for "Automatically complete", one-way is standard.
      }

      onTaskUpdate({ ...task, checklist: updatedChecklist, status: newStatus });
  };

  return (
    <Modal title="Task Details" isOpen={isOpen} onClose={onClose} size="5xl">
      <div className="flex flex-col lg:flex-row h-[700px]">
          {/* Left Content Column */}
          <div className="flex-1 p-8 lg:p-10 flex flex-col gap-8 bg-gradient-to-b from-[#141419] to-[#0F0F12] overflow-y-auto custom-scrollbar">
              
              {/* Title & Actions Header */}
              <div className="flex items-start justify-between gap-4">
                  <h2 className="text-4xl font-bold text-white leading-tight tracking-tight">{task.title}</h2>
                  <div className="flex items-center gap-2 flex-shrink-0">
                        <button 
                            onClick={() => onPinTask(task)}
                            className={`p-2.5 rounded-xl border transition-all ${task.isPinned ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                            title={task.isPinned ? "Unpin" : "Pin"}
                        >
                            <PinIcon className={`w-5 h-5 ${task.isPinned ? 'fill-current' : ''}`} />
                        </button>
                        <button 
                            onClick={() => onEdit(task)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-900/20"
                        >
                            <EditIcon className="w-4 h-4" /> Edit
                        </button>
                  </div>
              </div>

              {/* Description Box */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-8">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <BriefcaseIcon className="w-4 h-4" /> Description
                  </h3>
                  <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {task.description || <span className="text-gray-600 italic">No description provided.</span>}
                  </div>
              </div>

              {/* Checklist Section */}
              {checklist.length > 0 && (
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-8">
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                              <ListIcon className="w-4 h-4" /> Checklist
                          </h3>
                          <span className="text-xs font-medium text-gray-400">{checklistCompletedCount}/{checklist.length}</span>
                      </div>
                      
                      <div className="w-full bg-black/30 h-1.5 rounded-full mb-6 overflow-hidden">
                          <div 
                              className="h-full bg-green-500 transition-all duration-500" 
                              style={{ width: `${checklistProgress}%` }}
                          />
                      </div>

                      <div className="space-y-3">
                          {checklist.map(item => (
                              <label key={item.id} className={`flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer hover:bg-white/5 ${item.completed ? 'opacity-50' : ''}`}>
                                  <div className="relative flex items-center">
                                      <input 
                                          type="checkbox" 
                                          checked={item.completed} 
                                          onChange={() => handleToggleChecklistItem(item.id)}
                                          className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border-2 border-gray-500 bg-transparent checked:border-green-500 checked:bg-green-500 transition-all"
                                      />
                                      <CheckCircleIcon className="pointer-events-none absolute left-0 top-0 h-5 w-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                  </div>
                                  <span className={`text-gray-200 font-medium select-none ${item.completed ? 'line-through text-gray-500' : ''}`}>{item.text}</span>
                              </label>
                          ))}
                      </div>
                  </div>
              )}

              {/* Comments Section */}
              <div className="flex-1 flex flex-col bg-white/5 border border-white/5 rounded-2xl overflow-hidden min-h-[300px]">
                  <div className="p-4 border-b border-white/5 bg-black/20">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                          <MessageCircleIcon className="w-4 h-4" /> Comments
                      </h3>
                  </div>
                  
                  <div className="flex-1 p-6 overflow-y-auto space-y-6 max-h-[300px] custom-scrollbar">
                      {comments.length > 0 ? comments.map(comment => {
                          const author = users.find(u => u.id === comment.userId);
                          return (
                              <div key={comment.id} className="flex gap-4">
                                  <img src={author?.avatarUrl} className="w-8 h-8 rounded-full flex-shrink-0" alt={author?.name} />
                                  <div className="flex-1">
                                      <div className="flex items-baseline justify-between">
                                          <span className="text-sm font-bold text-white">{author?.name}</span>
                                          <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                      </div>
                                      <p className="text-gray-300 text-sm mt-1 leading-relaxed">{comment.content}</p>
                                  </div>
                              </div>
                          )
                      }) : (
                          <div className="text-center py-8 text-gray-600 italic">No comments yet. Start the discussion!</div>
                      )}
                      <div ref={commentsEndRef} />
                  </div>

                  <form onSubmit={handleAddComment} className="p-4 bg-black/30 border-t border-white/5 flex gap-3">
                      <input 
                        type="text" 
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                      />
                      <button 
                        type="submit" 
                        disabled={!commentInput.trim()}
                        className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 disabled:bg-gray-700 transition-colors"
                      >
                          <SendIcon className="w-5 h-5" />
                      </button>
                  </form>
              </div>
          </div>

          {/* Right Sidebar Column */}
          <div className="w-full lg:w-[400px] bg-[#1A1A1F] border-l border-white/5 p-8 flex flex-col gap-8 shadow-2xl overflow-y-auto custom-scrollbar">
                
                {/* Status Section */}
                <div className="p-4 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-400">Status</span>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color}`}>
                        {statusConfig.icon}
                        <span className="font-bold text-sm">{statusConfig.text}</span>
                    </div>
                </div>

                <SidebarSection title="Properties" icon={<TagIcon className="w-4 h-4"/>}>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3 text-gray-300">
                                <FlagIcon className="w-5 h-5 text-gray-500" />
                                <span>Priority</span>
                            </div>
                            <div className={`flex items-center gap-2 px-2.5 py-1 rounded-md border text-xs font-bold ${priorityStyle.bg} ${priorityStyle.border} ${priorityStyle.textClass}`}>
                                {priorityStyle.icon}
                                {priorityStyle.text}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3 text-gray-300">
                                <CalendarIcon className="w-5 h-5 text-gray-500" />
                                <span>Due Date</span>
                            </div>
                            <div className={`flex items-center gap-2 px-2.5 py-1 rounded-md border text-xs font-bold ${isOverdue ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-gray-800 border-white/10 text-gray-300'}`}>
                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Date'}
                                {isOverdue && <ClockIcon className="w-3 h-3" />}
                            </div>
                        </div>

                        {/* Tags Display */}
                        <div className="p-3 rounded-lg hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3 text-gray-300 mb-2">
                                <TagIcon className="w-5 h-5 text-gray-500" />
                                <span>Tags</span>
                            </div>
                            <div className="flex flex-wrap gap-2 pl-8">
                                {tags.length > 0 ? tags.map(tag => (
                                    <span key={tag} className="text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-1 rounded-md">
                                        {tag}
                                    </span>
                                )) : <span className="text-xs text-gray-500 italic">No tags</span>}
                            </div>
                        </div>
                    </div>
                </SidebarSection>

                <SidebarSection title="People" icon={<UserIcon className="w-4 h-4"/>}>
                    <div className="space-y-6">
                        <div>
                            <p className="text-xs text-gray-500 mb-3 pl-1">Assignee</p>
                            {assignee ? (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-black/30 border border-white/5">
                                    <img src={assignee.avatarUrl} alt={assignee.name} className="w-10 h-10 rounded-full border-2 border-gray-700" />
                                    <div>
                                        <p className="text-white font-medium">{assignee.name}</p>
                                        <p className="text-xs text-gray-500">{assignee.role}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-3 rounded-xl bg-black/30 border border-white/5 text-gray-500 text-sm italic flex items-center gap-2">
                                    <UserIcon className="w-5 h-5" /> Unassigned
                                </div>
                            )}
                        </div>

                        <div>
                            <p className="text-xs text-gray-500 mb-3 pl-1">Involved</p>
                            {involved.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {involved.map(user => (
                                        <div key={user.id} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full pl-1 pr-3 py-1 text-xs text-gray-200 transition-colors cursor-default" title={user.name}>
                                            <img src={user.avatarUrl} alt={user.name} className="w-6 h-6 rounded-full" />
                                            <span>{user.name.split(' ')[0]}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-600 italic pl-1">No other members involved.</p>
                            )}
                        </div>
                    </div>
                </SidebarSection>

                <div className="mt-auto pt-6 border-t border-white/10">
                    <div className="relative">
                        <button 
                            onClick={() => setSharePopoverOpen(!isSharePopoverOpen)}
                            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                            <ArrowUpRightIcon className="w-4 h-4" /> Share to Chat
                        </button>
                        
                        {isSharePopoverOpen && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#25252b] border border-white/10 rounded-xl shadow-2xl p-2 z-50 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
                                <p className="text-xs text-gray-500 px-3 py-2 font-bold uppercase">Send to...</p>
                                {projectMembers.map(user => (
                                    <button 
                                        key={user.id} 
                                        onClick={() => handleSendClick(user)} 
                                        className="w-full text-left flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                    >
                                        <img src={user.avatarUrl} alt={user.name} className="w-6 h-6 rounded-full" />
                                        {user.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
          </div>
      </div>
    </Modal>
  );
};
