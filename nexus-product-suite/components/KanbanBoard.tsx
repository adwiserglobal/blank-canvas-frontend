
import React, { useState, useEffect, useRef } from 'react';
import { Task, User, Project } from '../types';
import { KanbanColumn } from './KanbanColumn';
import { TaskDetailModal } from './TaskDetailModal';
import { TaskViewModal } from './TaskViewModal';
import { TaskFilesModal } from './TaskFilesModal';
import { PlusIcon, CheckCircleIcon } from './Icons';


interface KanbanBoardProps {
  tasks: Task[];
  project: Project;
  onTaskUpdate: (task: Task) => void;
  onReorderTask: (draggedTaskId: string, targetTaskId: string) => void;
  onAddTask: (task: Task) => void;
  onPinTask: (task: Task) => void;
  onAddColumn: (name: string) => void;
  onReorderColumns: (startIndex: number, endIndex: number) => void;
  users: User[];
  projectMembers: User[];
  onSendTaskToChat: (task: Task, user: User) => void;
  taskToOpen: { projectId: string; taskId: string } | null;
  onTaskOpened: () => void;
  onUpdateProject: (projectId: string, updates: Partial<Project>) => void; 
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  tasks, 
  project,
  onTaskUpdate, 
  onReorderTask,
  onAddTask, 
  onPinTask,
  onAddColumn,
  onReorderColumns,
  users,
  projectMembers,
  onSendTaskToChat,
  taskToOpen,
  onTaskOpened,
  onUpdateProject
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [addingToStatus, setAddingToStatus] = useState<string | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [filesTask, setFilesTask] = useState<Task | null>(null); // State for Files Modal
  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(null);
  
  // State for new column creation
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const newColumnInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (taskToOpen && taskToOpen.projectId === project.id) {
      const taskElement = document.getElementById(`task-${taskToOpen.taskId}`);
      if (taskElement) {
        taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // After highlighting (handled in TaskCard), reset the state.
      const timer = setTimeout(() => {
        onTaskOpened();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [taskToOpen, project.id, onTaskOpened]);
  
  useEffect(() => {
      if (isAddingColumn) {
          newColumnInputRef.current?.focus();
      }
  }, [isAddingColumn]);

  const handleDrop = (taskId: string, newStatus: string) => {
    const taskToMove = tasks.find(t => t.id === taskId);
    if (taskToMove && taskToMove.status !== newStatus) {
      onTaskUpdate({ ...taskToMove, status: newStatus });
    }
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };
  
  const handleOpenAddModal = (status: string) => {
    setAddingToStatus(status);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setAddingToStatus(null);
  };
  
  const handleSaveTask = (taskData: Omit<Task, 'id' | 'projectId' | 'status'>) => {
      if (editingTask) {
          onTaskUpdate({ ...editingTask, ...taskData });
      } else if (addingToStatus) {
          const newTask: Task = {
              id: `task-${Date.now()}`,
              projectId: project.id,
              status: addingToStatus,
              ...taskData,
          };
          onAddTask(newTask);
      }
      handleCloseModal();
  };

  const handleOpenViewModal = (task: Task) => {
    setViewingTask(task);
  };

  const handleCloseViewModal = () => {
    setViewingTask(null);
  };

  const handleEditFromView = (task: Task) => {
    handleCloseViewModal();
    handleOpenEditModal(task);
  };
  
  const submitNewColumn = () => {
      if (newColumnName.trim()) {
          onAddColumn(newColumnName.trim());
          setNewColumnName('');
          setIsAddingColumn(false);
      } else {
          setIsAddingColumn(false);
      }
  };

  // Column Drag Handlers
  const handleColumnDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
      setDraggedColumnIndex(index);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('type', 'column');
      e.dataTransfer.setData('colIndex', index.toString());
  };

  const handleColumnDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
  };

  const handleColumnDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('type');
      
      if (type === 'column') {
          const oldIndex = parseInt(e.dataTransfer.getData('colIndex'), 10);
          if (oldIndex !== index) {
              onReorderColumns(oldIndex, index);
          }
          setDraggedColumnIndex(null);
      }
  };

  // Helper to get the latest task object for the viewer
  const activeViewingTask = viewingTask ? tasks.find(t => t.id === viewingTask.id) || null : null;

  return (
    <>
      <div className="flex h-full overflow-x-auto gap-6 pb-4 items-start">
        {project.columns.map((column, index) => {
          // Filter tasks preserving global order
          const tasksInColumn = tasks.filter((task) => task.status === column.id);
          return (
            <div 
                key={column.id} 
                className={`w-80 flex-shrink-0 h-full transition-opacity duration-200 ${draggedColumnIndex === index ? 'opacity-40' : 'opacity-100'}`}
                draggable
                onDragStart={(e) => handleColumnDragStart(e, index)}
                onDragOver={handleColumnDragOver}
                onDrop={(e) => handleColumnDrop(e, index)}
            >
                <KanbanColumn
                    status={column.id}
                    title={column.title}
                    color={column.color}
                    tasks={tasksInColumn}
                    onDrop={handleDrop}
                    onReorderTask={onReorderTask}
                    onOpenAddModal={() => handleOpenAddModal(column.id)}
                    onOpenEditModal={handleOpenEditModal}
                    onOpenViewModal={handleOpenViewModal}
                    onPinTask={onPinTask}
                    users={users}
                    projectMembers={projectMembers}
                    onSendTaskToChat={onSendTaskToChat}
                    highlightTaskId={taskToOpen?.taskId || null}
                    // @ts-ignore - Adding custom prop for file modal
                    onOpenFilesModal={setFilesTask}
                />
            </div>
          );
        })}
        
        {/* Add Column Button/Input */}
        <div className="w-80 flex-shrink-0">
            {isAddingColumn ? (
                <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                    <input 
                        ref={newColumnInputRef}
                        type="text" 
                        value={newColumnName}
                        onChange={(e) => setNewColumnName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && submitNewColumn()}
                        onBlur={submitNewColumn}
                        placeholder="Column Name"
                        className="w-full bg-black/20 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none mb-2"
                    />
                    <div className="flex justify-end gap-2">
                         <button onClick={() => setIsAddingColumn(false)} className="px-3 py-1 text-xs text-gray-400 hover:text-white">Cancel</button>
                         <button onClick={submitNewColumn} className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700">Add</button>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={() => setIsAddingColumn(true)}
                    className="w-full h-[56px] flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-700 text-gray-500 hover:border-blue-500/50 hover:text-blue-400 hover:bg-white/5 transition-all"
                >
                    <PlusIcon className="w-5 h-5" />
                    Add Column
                </button>
            )}
        </div>
      </div>
      
      <TaskDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        taskToEdit={editingTask}
        users={users}
        availableStatuses={project.columns.map(c => c.id)}
      />
      <TaskViewModal
        isOpen={!!viewingTask}
        onClose={handleCloseViewModal}
        task={activeViewingTask}
        users={users}
        projectMembers={projectMembers}
        onEdit={handleEditFromView}
        onSendTaskToChat={onSendTaskToChat}
        onPinTask={onPinTask}
        onTaskUpdate={onTaskUpdate}
      />
      
      {/* Task Files Modal */}
      <TaskFilesModal 
        isOpen={!!filesTask}
        onClose={() => setFilesTask(null)}
        task={filesTask}
        project={project}
        onUpdateProject={onUpdateProject}
      />
    </>
  );
};
