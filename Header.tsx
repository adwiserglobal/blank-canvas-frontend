
import React, { useState, useRef, useEffect } from 'react';
import { Project, ViewType, Notification, User, TaskFilter } from '../types';
import { BellIcon, ChevronDownIcon, UserPlusIcon, EditIcon, FilterIcon, CheckCircleIcon, XIcon, SearchIcon } from './Icons';
import { NotificationPopover } from './NotificationPopover';
import { InviteModal } from './InviteModal';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  activeProject: Project | null;
  activeView: ViewType;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  currentUser: User;
  projects: Project[];
  onUpdateProject?: (projectId: string, updates: Partial<Project>) => void;
  taskFilter?: TaskFilter;
  setTaskFilter?: React.Dispatch<React.SetStateAction<TaskFilter>>;
  projectMembers?: User[];
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const Header: React.FC<HeaderProps> = ({ 
    activeProject, 
    activeView, 
    notifications, 
    setNotifications, 
    currentUser, 
    projects, 
    onUpdateProject,
    taskFilter,
    setTaskFilter,
    projectMembers = []
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  
  // Filter State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState('');

  const nameInputRef = useRef<HTMLInputElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;
  const { t } = useLanguage();

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
        nameInputRef.current.focus();
    }
  }, [isEditingName]);

  useEffect(() => {
      if (!isFilterOpen) {
          setAssigneeSearch('');
      }
  }, [isFilterOpen]);

  const handleStartEditing = () => {
      if (activeProject) {
          setEditedName(activeProject.name);
          setIsEditingName(true);
      }
  };

  const handleSaveName = () => {
      if (activeProject && editedName.trim() && onUpdateProject) {
          onUpdateProject(activeProject.id, { name: editedName.trim() });
      }
      setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          handleSaveName();
      } else if (e.key === 'Escape') {
          setIsEditingName(false);
      }
  };

  const getHeaderTitle = () => {
      if (activeView === 'home') {
          return t('nav.home');
      }
      if (activeView === 'chat') {
        return t('nav.chat');
      }
      return '';
  }

  const handleToggleFilterStatus = (statusId: string) => {
      if (!taskFilter || !setTaskFilter) return;
      const current = taskFilter.status || [];
      const newStatus = current.includes(statusId) 
        ? current.filter(s => s !== statusId) 
        : [...current, statusId];
      setTaskFilter({ ...taskFilter, status: newStatus });
  };

  const handleSetFilterAssignee = (userId: string | null) => {
      if (!setTaskFilter || !taskFilter) return;
      setTaskFilter({ ...taskFilter, assigneeId: userId === taskFilter.assigneeId ? null : userId });
  };

  const handleSetFilterDate = (dateType: 'overdue' | 'no_date' | 'this_week' | null) => {
      if (!setTaskFilter || !taskFilter) return;
      setTaskFilter({ ...taskFilter, date: taskFilter.date === dateType ? null : dateType });
  };

  const clearFilters = () => {
      if (setTaskFilter) setTaskFilter({ status: [], assigneeId: null, date: null });
  };

  const hasActiveFilters = taskFilter && (
      (taskFilter.status && taskFilter.status.length > 0) || 
      taskFilter.assigneeId !== null || 
      taskFilter.date !== null
  );

  const filteredMembers = projectMembers.filter(m => m.name.toLowerCase().includes(assigneeSearch.toLowerCase()));

  return (
    <header className="h-16 flex-shrink-0 flex items-center justify-between px-4 md:px-6 bg-transparent border-b border-white/10">
      <div>
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            {activeProject ? (
                 <div className="flex items-center gap-2">
                    {isEditingName ? (
                        <input 
                            ref={nameInputRef}
                            type="text" 
                            value={editedName} 
                            onChange={(e) => setEditedName(e.target.value)}
                            onBlur={handleSaveName}
                            onKeyDown={handleKeyDown}
                            className="bg-black/20 border border-blue-500/50 rounded px-2 py-0.5 text-xl font-semibold text-white focus:outline-none min-w-[200px]"
                        />
                    ) : (
                        <span className="flex items-center gap-2 group">
                            {activeProject.name}
                            <button 
                                onClick={handleStartEditing}
                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-opacity p-1 rounded hover:bg-white/10"
                                title="Edit project name"
                            >
                                <EditIcon className="w-4 h-4" />
                            </button>
                        </span>
                    )}
                    <span className="text-gray-500 mx-2">/</span>
                    <span className="text-gray-400">{capitalize(activeView)}</span>
                 </div>
            ) : (
                <span>{getHeaderTitle() || 'Nexus'}</span>
            )}
        </h2>
      </div>
      <div className="flex items-center gap-4">
        
        {/* Filter Button (Only for Kanban) */}
        {activeView === 'kanban' && activeProject && (
            <div className="relative">
                <button 
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`flex items-center gap-2 px-3 py-1.5 border rounded-full text-sm font-medium transition-all ${hasActiveFilters ? 'bg-blue-600/20 border-blue-500/50 text-blue-300' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
                >
                    <FilterIcon className="w-4 h-4" />
                    <span>Filter</span>
                    {hasActiveFilters && <span className="w-2 h-2 bg-blue-500 rounded-full ml-1"></span>}
                </button>

                {isFilterOpen && taskFilter && (
                    <div className="absolute top-full right-0 mt-2 w-72 bg-[#1A1A1F] border border-gray-700 rounded-xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700/50">
                            <h4 className="font-semibold text-white text-sm">Filters</h4>
                            {hasActiveFilters && (
                                <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                                    <XIcon className="w-3 h-3" /> Clear
                                </button>
                            )}
                        </div>

                        {/* Status Filter */}
                        <div className="mb-4">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Status</p>
                            <div className="flex flex-wrap gap-2">
                                {activeProject.columns.map(col => (
                                    <button 
                                        key={col.id}
                                        onClick={() => handleToggleFilterStatus(col.id)}
                                        className={`px-2 py-1 rounded text-xs border transition-all ${taskFilter.status.includes(col.id) ? 'bg-blue-600 text-white border-blue-500' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}
                                    >
                                        {col.title}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Assignee Filter (Searchable List) */}
                        <div className="mb-4">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Assignee</p>
                            
                            {/* Search Input */}
                            <div className="relative mb-2">
                                <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                                <input 
                                    type="text" 
                                    value={assigneeSearch}
                                    onChange={(e) => setAssigneeSearch(e.target.value)}
                                    placeholder="Search user..."
                                    className="w-full bg-black/20 border border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 placeholder:text-gray-600"
                                />
                            </div>

                            {/* User List */}
                            <div className="max-h-40 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                {filteredMembers.length > 0 ? (
                                    filteredMembers.map(member => (
                                        <button 
                                            key={member.id}
                                            onClick={() => handleSetFilterAssignee(member.id)}
                                            className={`w-full flex items-center gap-2 p-1.5 rounded-md transition-all text-left group ${taskFilter.assigneeId === member.id ? 'bg-blue-600/20 text-blue-200 border border-blue-500/30' : 'hover:bg-white/5 text-gray-300 border border-transparent'}`}
                                        >
                                            <img src={member.avatarUrl} alt={member.name} className="w-5 h-5 rounded-full object-cover border border-white/10" />
                                            <span className="text-xs truncate flex-1">{member.name}</span>
                                            {taskFilter.assigneeId === member.id && <CheckCircleIcon className="w-3.5 h-3.5 text-blue-400" />}
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-500 text-center py-2">No users found.</p>
                                )}
                            </div>
                        </div>

                        {/* Date Filter */}
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Due Date</p>
                            <div className="space-y-1">
                                <button 
                                    onClick={() => handleSetFilterDate('overdue')}
                                    className={`w-full text-left px-3 py-2 rounded-md text-xs flex items-center justify-between ${taskFilter.date === 'overdue' ? 'bg-red-500/20 text-red-300' : 'hover:bg-white/5 text-gray-400'}`}
                                >
                                    <span>Overdue</span>
                                    {taskFilter.date === 'overdue' && <CheckCircleIcon className="w-3 h-3" />}
                                </button>
                                <button 
                                    onClick={() => handleSetFilterDate('this_week')}
                                    className={`w-full text-left px-3 py-2 rounded-md text-xs flex items-center justify-between ${taskFilter.date === 'this_week' ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-white/5 text-gray-400'}`}
                                >
                                    <span>Due This Week</span>
                                    {taskFilter.date === 'this_week' && <CheckCircleIcon className="w-3 h-3" />}
                                </button>
                                <button 
                                    onClick={() => handleSetFilterDate('no_date')}
                                    className={`w-full text-left px-3 py-2 rounded-md text-xs flex items-center justify-between ${taskFilter.date === 'no_date' ? 'bg-orange-500/20 text-orange-300' : 'hover:bg-white/5 text-gray-400'}`}
                                >
                                    <span>No Due Date</span>
                                    {taskFilter.date === 'no_date' && <CheckCircleIcon className="w-3 h-3" />}
                                </button>
                            </div>
                        </div>
                        
                        {/* Overlay to close when clicking outside (simplified) */}
                        <div className="fixed inset-0 z-[-1]" onClick={() => setIsFilterOpen(false)}></div>
                    </div>
                )}
            </div>
        )}

        <button 
            onClick={() => setIsInviteModalOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-blue-300 hover:text-white hover:border-blue-400 rounded-full text-sm font-medium transition-all"
        >
            <UserPlusIcon className="w-4 h-4" />
            {t('invite.btn')}
        </button>

        <div className="relative">
            <button 
                id="tour-notifications"
                onClick={() => setIsNotificationsOpen(prev => !prev)}
                className="relative p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-all duration-300 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]"
            >
                <BellIcon className="w-6 h-6"/>
                {unreadCount > 0 && 
                    <span className="absolute top-1 right-1 block h-3 w-3 rounded-full bg-red-500 border-2 border-black/50"></span>
                }
            </button>
            {isNotificationsOpen && (
                <NotificationPopover 
                    notifications={notifications} 
                    setNotifications={setNotifications}
                    onClose={() => setIsNotificationsOpen(false)}
                />
            )}
        </div>
      </div>
      
      <InviteModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
        projects={projects}
        activeProjectId={activeProject?.id || null}
      />
    </header>
  );
};
