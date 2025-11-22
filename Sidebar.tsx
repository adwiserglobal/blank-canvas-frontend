
import React, { useState } from 'react';
import { User, ViewType, ActiveLocation, Project } from '../types';
import { LayersIcon, HomeIcon, KanbanIcon, FileTextIcon, MessageSquareIcon, ChevronsLeftIcon, ChevronsRightIcon, ChevronDownIcon, FolderIcon, PlusIcon, MoreHorizontalIcon, LinkIcon, LayoutDashboardIcon, WorkflowIcon, TrafficLightIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  currentUser: User;
  projects: Project[];
  activeLocation: ActiveLocation;
  setActiveLocation: (location: ActiveLocation) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  onProfileClick: () => void;
  onCreateProjectClick: () => void;
}

const ProjectNavItem: React.FC<{
  project: Project;
  isExpanded: boolean;
  onToggle: () => void;
  activeLocation: ActiveLocation;
  setActiveLocation: (location: ActiveLocation) => void;
  isSidebarCollapsed: boolean;
  t: (key: string) => string;
}> = ({ project, isExpanded, onToggle, activeLocation, setActiveLocation, isSidebarCollapsed, t }) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const isActiveProject = activeLocation.projectId === project.id;
  
  const projectNavItems = [
    { view: 'overview' as ViewType, label: t('nav.overview'), icon: LayoutDashboardIcon },
    { view: 'kanban' as ViewType, label: t('nav.kanban'), icon: KanbanIcon },
    { view: 'stoplight' as ViewType, label: 'Status Report', icon: TrafficLightIcon },
    { view: 'docs' as ViewType, label: t('nav.docs'), icon: FileTextIcon },
    { view: 'folders' as ViewType, label: t('nav.folders'), icon: FolderIcon },
    { view: 'automations' as ViewType, label: t('nav.automations'), icon: WorkflowIcon },
  ];
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://nexus.app/invite/${project.id}`);
    // In a real app, show a toast notification
    setMenuOpen(false);
  };

  return (
    <div className="py-1">
      <div 
        className={`w-full flex items-center p-2 text-sm font-medium rounded-md transition-all duration-200 group relative ${isSidebarCollapsed ? 'justify-center' : ''} ${
            isActiveProject
            ? 'bg-white/5 text-white'
            : 'text-gray-400 hover:bg-white/5 hover:text-white'
        }`}
      >
        <button onClick={onToggle} className="flex items-center flex-1 min-w-0">
          <span className={`whitespace-nowrap overflow-hidden transition-all duration-200 ${isSidebarCollapsed ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-3'}`}>
              {project.name}
          </span>
        </button>
        {!isSidebarCollapsed && (
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setMenuOpen(prev => !prev); }} 
              className="p-1 rounded opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white hover:bg-white/10"
            >
              <MoreHorizontalIcon className="w-4 h-4" />
            </button>
            {isMenuOpen && (
              <div 
                onMouseLeave={() => setMenuOpen(false)}
                className="absolute top-full right-0 mt-1 w-48 bg-[#1A1A1F]/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl z-20 p-1.5"
              >
                <button onClick={handleCopyLink} className="w-full text-left flex items-center gap-2 px-2 py-1.5 text-xs rounded-md text-gray-300 hover:bg-white/10 hover:text-white">
                  <LinkIcon className="w-3 h-3" />
                  {t('nav.copy_link')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {(isExpanded || isActiveProject) && !isSidebarCollapsed && (
        <ul className="pl-6 pt-1 space-y-1 border-l border-gray-700 ml-4">
          {projectNavItems.map(item => {
            const isActive = isActiveProject && activeLocation.view === item.view;
            const Icon = item.icon;
            return (
              <li key={item.view}>
                <button
                  onClick={() => setActiveLocation({ view: item.view, projectId: project.id })}
                  className={`w-full flex items-center p-2.5 text-sm rounded-md transition-colors ${
                    isActive ? 'text-white font-semibold' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                   <Icon className="w-5 h-5 mr-3" />
                   {item.label}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}


export const Sidebar: React.FC<SidebarProps> = ({ 
  currentUser, 
  projects,
  activeLocation, 
  setActiveLocation, 
  isSidebarCollapsed, 
  setIsSidebarCollapsed, 
  onProfileClick,
  onCreateProjectClick,
}) => {

  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const { t } = useLanguage();

  const globalNavItems = [
    { view: 'home' as ViewType, label: t('nav.home'), icon: HomeIcon, id: 'tour-home' },
    { view: 'chat' as ViewType, label: t('nav.chat'), icon: MessageSquareIcon, id: 'tour-chat' },
  ];

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => ({ ...prev, [projectId]: !prev[projectId] }));
  };

  return (
    <aside className={`flex flex-col flex-shrink-0 bg-transparent border-r border-white/10 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
      <div className={`h-16 flex items-center border-b border-white/10 ${isSidebarCollapsed ? 'justify-center' : 'px-4'}`}>
        <div className="p-2 rounded-lg bg-gradient-to-tr from-blue-500 to-orange-500">
          <LayersIcon className="w-6 h-6 text-white" />
        </div>
        <h1 className={`text-xl font-bold ml-3 text-white whitespace-nowrap overflow-hidden transition-all duration-200 ${isSidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>Nexus</h1>
      </div>
      
      <nav className="flex-1 p-2 space-y-2 mt-2 overflow-y-auto">
        {/* Global Nav */}
        <ul>
          {globalNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeLocation.view === item.view;
            return (
                <li key={item.view}>
                <button
                    id={item.id}
                    onClick={() => setActiveLocation({ view: item.view, projectId: null })}
                    className={`w-full flex items-center p-3 text-sm font-medium rounded-md transition-all duration-200 group ${isSidebarCollapsed ? 'justify-center' : ''} ${
                    isActive
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                    title={isSidebarCollapsed ? item.label : ''}
                >
                    <Icon className="w-5 h-5" />
                    <span className={`whitespace-nowrap overflow-hidden transition-all duration-200 ${isSidebarCollapsed ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-3'}`}>
                        {item.label}
                    </span>
                </button>
                </li>
            )
          })}
        </ul>
        
        <div className="pt-4">
            <div className={`flex items-center justify-between px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider ${isSidebarCollapsed ? 'justify-center' : ''}`}>
               <span className={isSidebarCollapsed ? 'hidden' : ''}>{t('nav.projects')}</span>
               <button 
                 id="tour-create-project"
                 onClick={onCreateProjectClick} 
                 title="Create new project" 
                 className="p-1 hover:text-white"
               >
                 <PlusIcon className="w-4 h-4" />
               </button>
            </div>
            <ul className="mt-2" id="tour-projects-list">
                {projects.map(project => (
                   <li key={project.id}>
                      <ProjectNavItem
                        project={project}
                        isExpanded={!!expandedProjects[project.id]}
                        onToggle={() => toggleProject(project.id)}
                        activeLocation={activeLocation}
                        setActiveLocation={setActiveLocation}
                        isSidebarCollapsed={isSidebarCollapsed}
                        t={t}
                      />
                   </li>
                ))}
            </ul>
        </div>
      </nav>

      <div className="p-2 border-t border-white/10">
         <button 
            id="tour-profile"
            onClick={onProfileClick}
            className={`w-full flex items-center text-left hover:bg-white/5 rounded-md transition-all duration-200 ${isSidebarCollapsed ? 'justify-center p-2' : 'p-2'}`}
          >
            <div className="relative flex-shrink-0">
              <img className="h-9 w-9 rounded-full object-cover" src={currentUser.avatarUrl} alt={currentUser.name} />
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-[#1c1c22]"></span>
            </div>
            <div className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-200 ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
              <p className="text-sm font-medium text-white">{currentUser.name}</p>
              <p className="text-xs text-gray-400">{currentUser.role}</p>
            </div>
         </button>
         
         <div className="flex gap-1 mt-2">
             <button 
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                className="flex-1 flex justify-center items-center p-2 text-gray-400 hover:bg-white/5 hover:text-white rounded-md transition-colors"
                title={isSidebarCollapsed ? t('nav.expand') : t('nav.collapse')}
            >
                {isSidebarCollapsed ? <ChevronsRightIcon className="w-5 h-5" /> : <ChevronsLeftIcon className="w-5 h-5" />}
            </button>
         </div>
      </div>
    </aside>
  );
};
