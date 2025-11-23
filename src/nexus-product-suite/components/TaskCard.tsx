
import React, { useState, useEffect } from 'react';
import { Task, TaskPriority, TaskStatus, User } from '../types';
import { CalendarIcon, ChevronUpIcon, ChevronsUpIcon, MinusIcon, ArrowUpRightIcon, EyeIcon, EditIcon, PinIcon, MessageSquareIcon, FolderIcon, CheckCircleIcon, UserIcon } from './Icons';

interface TaskCardProps {
  task: Task;
  onReorderTask: (draggedTaskId: string, targetTaskId: string) => void;
  onOpenEditModal: (task: Task) => void;
  onOpenViewModal: (task: Task) => void;
  onPinTask: () => void;
  users: User[];
  projectMembers: User[];
  onSendTaskToChat: (task: Task, user: User) => void;
  highlightTaskId: string | null;
  onOpenFilesModal?: (task: Task) => void;
}

const priorityConfig = {
  [TaskPriority.HIGH]: { icon: <ChevronsUpIcon className="w-4 h-4 text-red-500" />, text: 'High' },
  [TaskPriority.MEDIUM]: { icon: <ChevronUpIcon className="w-4 h-4 text-orange-400" />, text: 'Medium' },
  [TaskPriority.LOW]: { icon: <MinusIcon className="w-4 h-4 text-green-500" />, text: 'Low' },
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onReorderTask, onOpenEditModal, onOpenViewModal, onPinTask, users, projectMembers, onSendTaskToChat, highlightTaskId, onOpenFilesModal }) => {
  const [isSharePopoverOpen, setSharePopoverOpen] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Done';
  const assignee = users.find(u => u.id === task.assigneeId);
  const tags = task.tags || [];
  const commentCount = task.comments?.length || 0;
  
  const checklist = task.checklist || [];
  const checklistCompleted = checklist.filter(i => i.completed).length;

  useEffect(() => {
    if (highlightTaskId === task.id) {
      setIsHighlighted(true);
      const timer = setTimeout(() => {
        setIsHighlighted(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [highlightTaskId, task.id]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
      e.stopPropagation();
      e.dataTransfer.setData('taskId', task.id);
      e.dataTransfer.setData('type', 'task');
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const draggedTaskId = e.dataTransfer.getData('taskId');
      const type = e.dataTransfer.getData('type');
      
      if (type === 'task' && draggedTaskId && draggedTaskId !== task.id) {
          onReorderTask(draggedTaskId, task.id);
      }
  };

  const handleSendClick = (e: React.MouseEvent, user: User) => {
    e.stopPropagation();
    onSendTaskToChat(task, user);
    setSharePopoverOpen(false);
  };
  
  return (
    <div 
        id={`task-${task.id}`}
        className={`group relative flex flex-col rounded-xl p-4 border transition-all duration-300 cursor-grab active:cursor-grabbing 
        bg-[#0a0a0a]/60 backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]
        hover:bg-[#0a0a0a]/80 hover:shadow-xl hover:shadow-black/30 hover:border-white/10
        ${isHighlighted ? 'animate-pulse-neon border-blue-400' : ''}
        ${task.isPinned ? 'border-blue-500/40 shadow-[0_0_15px_-3px_rgba(59,130,246,0.2)]' : 'border-white/5'}
        `}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
    >
      {/* Header: Tags & Top Actions */}
      <div className="flex justify-between items-start mb-2 min-h-[24px]">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 flex-1 mr-2">
              {tags.map(tag => (
                  <span key={tag} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">
                      {tag}
                  </span>
              ))}
          </div>

          {/* Top Actions (Folder, Pin, Share) */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
             {/* Files */}
             {onOpenFilesModal && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onOpenFilesModal(task); }}
                    className="p-1 rounded-md text-gray-400 hover:text-blue-400 hover:bg-white/10 transition-colors"
                    title="Files"
                >
                    <FolderIcon className="w-3.5 h-3.5" />
                </button>
             )}

             {/* Pin */}
             <button 
              onClick={(e) => { e.stopPropagation(); onPinTask(); }}
              className={`p-1 rounded-md transition-all ${task.isPinned ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
              title={task.isPinned ? "Unpin Task" : "Pin Task"}
            >
              <PinIcon className={`w-3.5 h-3.5 ${task.isPinned ? 'fill-current' : ''}`} />
            </button>

            {/* Share */}
            <div className="relative">
                <button 
                  onClick={(e) => { e.stopPropagation(); setSharePopoverOpen(prev => !prev); }}
                  className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10"
                  title="Send to chat"
                >
                  <ArrowUpRightIcon className="w-3.5 h-3.5" />
                </button>
                 {isSharePopoverOpen && (
                    <div onMouseLeave={() => setSharePopoverOpen(false)} className="absolute top-full right-0 w-48 bg-[#1A1A1F] border border-white/10 rounded-lg shadow-2xl z-20 p-1 mt-2">
                        <p className="text-[10px] text-gray-500 px-2 py-1 uppercase font-bold">Send to...</p>
                        <div className="max-h-40 overflow-y-auto">
                            {projectMembers.map(user => (
                            <button key={user.id} onClick={(e) => handleSendClick(e, user)} className="w-full text-left flex items-center gap-2 px-2 py-1.5 text-xs rounded text-gray-300 hover:bg-white/10 hover:text-white">
                                <img src={user.avatarUrl} alt={user.name} className="w-5 h-5 rounded-full" />
                                {user.name}
                            </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
          </div>
      </div>

      {/* Standalone Pin Indicator (Visible when pinned and NOT hovering, placed near top right) */}
      {task.isPinned && (
          <div className="absolute top-3 right-3 text-blue-500 transition-opacity duration-200 opacity-100 group-hover:opacity-0 pointer-events-none">
              <PinIcon className="w-3.5 h-3.5 fill-current" />
          </div>
      )}

      {/* Content */}
      <div className="flex-1 pr-1 pointer-events-none">
          <h4 className="font-medium text-gray-100 mb-1.5 leading-snug pr-2 tracking-tight text-sm">{task.title}</h4>
          {task.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{task.description}</p>}
      </div>
      
      {/* Footer Metadata & Actions */}
      <div className="flex justify-between items-end pt-3 mt-auto border-t border-white/5 gap-2">
        {/* Left: Assignee & Priority */}
        <div className="flex items-center gap-2 overflow-hidden pointer-events-none">
          {assignee ? (
            <img
              src={assignee.avatarUrl}
              alt={assignee.name}
              className="w-5 h-5 rounded-full border border-white/10 shadow-sm flex-shrink-0"
              title={assignee.name}
            />
          ) : (
             <div className="w-5 h-5 rounded-full border border-white/10 bg-white/5 flex items-center justify-center flex-shrink-0">
                 <UserIcon className="w-3 h-3 text-gray-600" />
             </div>
          )}
          <div className="flex items-center" title={`Priority: ${task.priority}`}>
            {priorityConfig[task.priority].icon}
          </div>
        </div>
        
        {/* Right: View/Edit Actions, Indicators & Date */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
            
            {/* Action Buttons (View / Edit) */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity mr-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); onOpenViewModal(task); }} 
                  className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  title="View Task"
                >
                    <EyeIcon className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onOpenEditModal(task); }} 
                  className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  title="Edit Task"
                >
                    <EditIcon className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Indicators Group */}
            {(commentCount > 0 || checklist.length > 0) && (
                <div className="flex items-center gap-2 bg-black/20 px-1.5 py-0.5 rounded border border-white/5 pointer-events-none">
                    {checklist.length > 0 && (
                        <div className={`flex items-center gap-1 text-[10px] font-medium ${checklistCompleted === checklist.length ? 'text-green-400' : 'text-gray-400'}`} title="Checklist">
                            <CheckCircleIcon className="w-3 h-3" />
                            <span>{checklistCompleted}/{checklist.length}</span>
                        </div>
                    )}
                    {commentCount > 0 && (
                        <div className="flex items-center gap-1 text-[10px] font-medium text-gray-400" title="Comments">
                            <MessageSquareIcon className="w-3 h-3" />
                            <span>{commentCount}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Date */}
            {task.dueDate && (
                <div className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border ${isOverdue ? 'text-red-300 bg-red-500/10 border-red-500/20' : 'text-gray-400 bg-white/5 border-white/5'} pointer-events-none`}>
                    <CalendarIcon className="w-3 h-3" />
                    <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
