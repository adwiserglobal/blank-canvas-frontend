
import React, { useState, useMemo } from 'react';
import { Task, User } from '../types';
import { TaskCard } from './TaskCard';
import { PlusCircleIcon } from './Icons';

interface KanbanColumnProps {
  status: string;
  title: string;
  color: string;
  tasks: Task[];
  users: User[];
  projectMembers: User[];
  onDrop: (taskId: string, newStatus: string) => void;
  onReorderTask: (draggedTaskId: string, targetTaskId: string) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (task: Task) => void;
  onOpenViewModal: (task: Task) => void;
  onPinTask: (task: Task) => void;
  onSendTaskToChat: (task: Task, user: User) => void;
  highlightTaskId: string | null;
  onOpenFilesModal?: (task: Task) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ 
  status, 
  title,
  color,
  tasks, 
  onDrop,
  onReorderTask,
  onOpenAddModal, 
  onOpenEditModal,
  onOpenViewModal,
  onPinTask,
  users,
  projectMembers,
  onSendTaskToChat,
  highlightTaskId,
  onOpenFilesModal
}) => {
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    // Only allow drop if dragging a task, not a column
    if (e.dataTransfer.types.includes('task')) {
        e.preventDefault();
        setIsDraggedOver(true);
    }
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDraggedOver(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('type');
    
    if (type === 'task') {
        // CRITICAL: Stop propagation so the column container doesn't try to handle this as a column reorder
        e.stopPropagation();
        const taskId = e.dataTransfer.getData('taskId');
        onDrop(taskId, status);
        setIsDraggedOver(false);
    }
  };
  
  // We remove local sorting (e.g. by pinned) to respect the drag-and-drop order defined by the user.
  // If 'tasks' prop is passed in the correct order from parent, it will render correctly.

  return (
    <div 
      className={`flex flex-col h-full bg-white/10 rounded-xl overflow-hidden border border-white/10 transition-colors duration-300`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={`p-4 flex justify-between items-center border-l-4 ${color} bg-black/20 cursor-grab active:cursor-grabbing`}>
        <h3 className="font-semibold text-white truncate pr-2 select-none" title={title}>
          {title}
          <span className="ml-2 text-sm font-normal bg-gray-700/50 text-gray-300 rounded-full px-2 py-0.5">
            {tasks.length}
          </span>
        </h3>
        <button onClick={(e) => { e.stopPropagation(); onOpenAddModal(); }} className="text-gray-400 hover:text-white transition-colors flex-shrink-0">
          <PlusCircleIcon className="w-6 h-6" />
        </button>
      </div>
      <div className={`flex-1 overflow-y-auto p-4 pb-20 space-y-4 rounded-b-xl transition-all duration-300 ${isDraggedOver ? 'bg-blue-500/10' : ''}`}>
        {tasks.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onReorderTask={onReorderTask}
            onOpenEditModal={() => onOpenEditModal(task)}
            onOpenViewModal={() => onOpenViewModal(task)}
            onPinTask={() => onPinTask(task)}
            users={users}
            projectMembers={projectMembers}
            onSendTaskToChat={onSendTaskToChat}
            highlightTaskId={highlightTaskId}
            onOpenFilesModal={onOpenFilesModal}
          />
        ))}
      </div>
    </div>
  );
};
