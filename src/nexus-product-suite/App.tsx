
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { DocsView } from './components/PRDView';
import { ChatView } from './components/ChatView';
import { HomeView } from './components/HomeView';
import { FoldersView } from './components/FoldersView';
import { ProjectOverview } from './components/ProjectOverview';
import { AutomationsView } from './components/AutomationsView';
import { StoplightView } from './components/StoplightView';
import { ChatNotificationBubble } from './components/ChatNotificationBubble';
import { AuthScreen } from './components/AuthScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { OnboardingWizard } from './components/OnboardingWizard';
import { ProductTour } from './components/ProductTour';
import { FeedbackSidebar } from './components/FeedbackSidebar';
import { Project, Task, User, NotificationType, ActiveLocation, ChatMessage, ConversationType, Conversation, ProjectColumn, TaskFilter } from './types';
import { useMockData } from './hooks/useMockData';
import { LayoutDashboardIcon, StarIcon } from './components/Icons';
import { ProfileSettingsModal } from './components/ProfileSettingsModal';
import { CreateProjectWizard } from './components/CreateProjectWizard';

const App: React.FC = () => {
  const { 
    projects, 
    setProjects, 
    tasks, 
    setTasks, 
    users,
    setUsers,
    conversations,
    setConversations,
    notifications,
    setNotifications,
    addNotification,
    automations,
    setAutomations
  } = useMockData();
  
  const [isLoading, setIsLoading] = useState(true);
  const [activeLocation, setActiveLocation] = useState<ActiveLocation>({ view: 'home', projectId: null }); // Start at home
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);
  const [isCreateProjectWizardOpen, setCreateProjectWizardOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [theme, setTheme] = useState('nebula');
  const [taskToOpen, setTaskToOpen] = useState<{ projectId: string; taskId: string } | null>(null);
  
  // Filter State
  const [taskFilter, setTaskFilter] = useState<TaskFilter>({ status: [], assigneeId: null, date: null });

  // Notification State
  const [lastDismissedMessageId, setLastDismissedMessageId] = useState<string | null>(null);

  // Onboarding States
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);
  const [showProductTour, setShowProductTour] = useState(false);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Initialize Supabase auth
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Fetch profile data
          setTimeout(async () => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (profile) {
              const appUser: User = {
                id: session.user.id,
                name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User',
                email: session.user.email || '',
                avatarUrl: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
                role: 'Product Manager',
                hasCompletedOnboarding: profile.has_completed_onboarding || false,
              };
              setCurrentUser(appUser);
            }
          }, 0);
        } else {
          setCurrentUser(null);
        }
        
        setAuthInitialized(true);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        setAuthInitialized(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle loading state
  useEffect(() => {
    if (authInitialized) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [authInitialized]);

  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  // Reset filter when switching projects
  useEffect(() => {
      setTaskFilter({ status: [], assigneeId: null, date: null });
  }, [activeLocation.projectId]);

  // Reminder check logic
  useEffect(() => {
      if (!currentUser) return;

      const interval = setInterval(() => {
          setTasks(currentTasks => {
              let hasUpdates = false;
              const now = new Date();
              const updatedTasks = currentTasks.map(task => {
                  if (task.reminderAt && new Date(task.reminderAt) <= now) {
                      // Trigger notification
                      addNotification(
                          `Reminder: Task "${task.title}" is due now.`,
                          NotificationType.REMINDER,
                          { view: 'kanban', projectId: task.projectId, itemId: task.id }
                      );
                      hasUpdates = true;
                      // Clear reminder so it doesn't fire again
                      return { ...task, reminderAt: undefined };
                  }
                  return task;
              });
              return hasUpdates ? updatedTasks : currentTasks;
          });
      }, 10000); // Check every 10 seconds

      return () => clearInterval(interval);
  }, [setTasks, addNotification, currentUser]);
  
  // Simulate incoming message after a delay
  useEffect(() => {
    if (!currentUser) return;

    const timer = setTimeout(() => {
      if (activeLocation.view !== 'chat') {
          const targetConv = conversations[0]; 
          const sender = targetConv.participants.find(p => p.id !== currentUser.id);
          
          if (sender) {
              const newMessage: ChatMessage = {
                  id: `msg-auto-${Date.now()}`,
                  senderId: sender.id,
                  content: "Hey Alex, can you check the latest deployment logs?",
                  timestamp: new Date().toISOString(),
              };
              
              setConversations(prev => prev.map(c => 
                  c.id === targetConv.id 
                  ? { ...c, messages: [...c.messages, newMessage], unreadCount: (c.unreadCount || 0) + 1 } 
                  : c
              ));
          }
      }
    }, 10000); 
    return () => clearTimeout(timer);
  }, [currentUser]); 

  const activeProject = useMemo(() => {
    if (activeLocation.projectId) {
      return projects.find(p => p.id === activeLocation.projectId) || null;
    }
    return null;
  }, [activeLocation.projectId, projects]);
  
  // Logic to find the latest unread message for the bubble
  const latestUnread = useMemo(() => {
    if (!currentUser) return null;
    const unreadConvs = conversations.filter(c => (c.unreadCount || 0) > 0);
    if (unreadConvs.length === 0) return null;

    // Find the conversation with the most recent last message
    const sorted = [...unreadConvs].sort((a, b) => {
        const lastA = a.messages[a.messages.length - 1]?.timestamp || '';
        const lastB = b.messages[b.messages.length - 1]?.timestamp || '';
        return new Date(lastB).getTime() - new Date(lastA).getTime();
    });

    const topConv = sorted[0];
    const msg = topConv.messages[topConv.messages.length - 1];
    if (!msg) return null;
    
    // If this message was already dismissed, don't show it
    if (msg.id === lastDismissedMessageId) return null;

    // Identify sender
    const sender = topConv.participants.find(p => p.id === msg.senderId) || users.find(u => u.id === msg.senderId);
    
    return { message: msg, sender, conversationId: topConv.id };
  }, [conversations, users, currentUser, lastDismissedMessageId]);

  // --- AUTOMATION ENGINE ---
  const runAutomations = (triggerType: string, task: Task, changes?: any) => {
      if (!currentUser) return;

      const relevantAutomations = automations.filter(a => 
          a.isActive && 
          (a.projectId === task.projectId || a.projectId === 'global') &&
          a.trigger.type === triggerType
      );

      relevantAutomations.forEach(auto => {
          let conditionMet = false;
          
          // Check conditions
          if (triggerType === 'TASK_STATUS_CHANGED') {
             if (auto.trigger.conditions.field === 'status' && 
                 auto.trigger.conditions.operator === 'equals' && 
                 task.status === auto.trigger.conditions.value) {
                 conditionMet = true;
             }
          } else if (triggerType === 'TASK_PRIORITY_CHANGED') {
              if (auto.trigger.conditions.field === 'priority' && 
                 auto.trigger.conditions.operator === 'equals' && 
                 task.priority === auto.trigger.conditions.value) {
                 conditionMet = true;
             }
          } else if (triggerType === 'TASK_CREATED') {
              conditionMet = true; 
          }

          if (conditionMet) {
              setAutomations(prev => prev.map(a => a.id === auto.id ? { ...a, runCount: a.runCount + 1, lastRun: new Date().toISOString() } : a));

              auto.actions.forEach(action => {
                  if (action.type === 'SEND_NOTIFICATION') {
                      if (action.payload.target === 'all_members') {
                           addNotification(
                              `🤖 Auto: ${action.payload.value || 'Automation triggered'}`,
                              NotificationType.AUTOMATION,
                              { view: 'kanban', projectId: task.projectId, itemId: task.id }
                          );
                      } else if (action.payload.target === currentUser.id) {
                           addNotification(
                              `🤖 Auto: ${action.payload.value}`,
                              NotificationType.AUTOMATION,
                              { view: 'kanban', projectId: task.projectId, itemId: task.id }
                          );
                      }
                  }
                  if (action.type === 'ASSIGN_USER') {
                      const user = users.find(u => u.id === action.payload.target);
                      if (user) {
                          addNotification(`🤖 Auto: Assigned task to ${user.name}`, NotificationType.AUTOMATION);
                      }
                  }
              });
          }
      });
  };

  const handleUserUpdate = (updatedUser: User) => {
    if (!currentUser) return;
    setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (updatedUser.id === currentUser.id) {
        setCurrentUser(updatedUser);
    }
    setIsProfileSettingsOpen(false);
  };

  const handleTaskUpdate = useCallback((updatedTask: Task) => {
    if (!currentUser) return;
    const originalTask = tasks.find(t => t.id === updatedTask.id);
    
    if (updatedTask.assigneeId && originalTask?.assigneeId !== updatedTask.assigneeId && updatedTask.assigneeId !== currentUser.id) {
        const assignee = users.find(u => u.id === updatedTask.assigneeId);
        if (assignee) {
            addNotification(
                `${currentUser.name} assigned you the task "${updatedTask.title}"`,
                NotificationType.TASK_ASSIGNED
            );
        }
    }
    
    if (originalTask && originalTask.status !== updatedTask.status) {
        if (updatedTask.status === 'Done') {
             updatedTask.completedAt = new Date().toISOString();
        } else if (originalTask.status === 'Done') {
             delete updatedTask.completedAt;
        }
        runAutomations('TASK_STATUS_CHANGED', updatedTask);
    }

    if (originalTask && originalTask.priority !== updatedTask.priority) {
        runAutomations('TASK_PRIORITY_CHANGED', updatedTask);
    }

    setTasks(prevTasks => prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task));
  }, [setTasks, tasks, addNotification, currentUser, users, automations]);

  // Handle reordering (drag and drop within list)
  const handleReorderTask = (draggedTaskId: string, targetTaskId: string) => {
      setTasks(prev => {
          const draggedIndex = prev.findIndex(t => t.id === draggedTaskId);
          if (draggedIndex === -1) return prev;

          const newTasks = [...prev];
          const [draggedTask] = newTasks.splice(draggedIndex, 1);
          
          // Find index of target (note: index might have shifted if we removed something before it)
          // We find it again in the *new* array to be safe, or find original then adjust
          const targetIndexInNewArray = newTasks.findIndex(t => t.id === targetTaskId);
          
          if (targetIndexInNewArray === -1) {
              // Fallback if target not found
              newTasks.push(draggedTask);
          } else {
              // Insert before target
              // Also update status to match target (important if we dragged across columns onto a specific card)
              const targetTask = newTasks[targetIndexInNewArray];
              draggedTask.status = targetTask.status;
              newTasks.splice(targetIndexInNewArray, 0, draggedTask);
          }
          
          return newTasks;
      });
  };

  const handleAddTask = useCallback((newTask: Task) => {
      if (!currentUser) return;
      setTasks(prevTasks => [...prevTasks, newTask]);
       if (newTask.assigneeId && newTask.assigneeId !== currentUser.id) {
        const assignee = users.find(u => u.id === newTask.assigneeId);
        if (assignee) {
             addNotification(
                `${currentUser.name} assigned you a new task "${newTask.title}"`,
                NotificationType.TASK_ASSIGNED
            );
        }
      }
      
      if (newTask.reminderAt) {
           addNotification(
              `Reminder scheduled for ${new Date(newTask.reminderAt).toLocaleDateString()}`,
              NotificationType.REMINDER
          );
      }
      
      runAutomations('TASK_CREATED', newTask);

  }, [setTasks, addNotification, currentUser, users, automations]);

  const handleTogglePinTask = (task: Task) => {
    const updatedTask = { ...task, isPinned: !task.isPinned };
    setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));
  };

  const handleAddColumn = (projectId: string, columnName: string) => {
      const newColumn: ProjectColumn = {
          id: columnName, 
          title: columnName,
          color: 'border-l-gray-500'
      };
      setProjects(prev => prev.map(p => {
          if (p.id === projectId) {
              return { ...p, columns: [...p.columns, newColumn] };
          }
          return p;
      }));
  };
  
  const handleReorderColumns = (projectId: string, startIndex: number, endIndex: number) => {
      setProjects(prev => prev.map(p => {
          if (p.id === projectId) {
              const newColumns = [...p.columns];
              const [removed] = newColumns.splice(startIndex, 1);
              newColumns.splice(endIndex, 0, removed);
              return { ...p, columns: newColumns };
          }
          return p;
      }));
  };

  const handleUpdateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates } : p));
  };

  const handleCreateProject = (projectData: Omit<Project, 'id' | 'docs' | 'folders'>, createGroupChat: boolean) => {
    if (!currentUser) return;
    const newProject: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
      docs: [],
      folders: [],
      stoplightItems: [],
      columns: projectData.columns || [
          { id: 'To Do', title: 'To Do', color: 'border-l-blue-500' },
          { id: 'In Progress', title: 'In Progress', color: 'border-l-orange-500' },
          { id: 'Done', title: 'Done', color: 'border-l-green-500' }
      ]
    };
    setProjects(prev => [...prev, newProject]);

    if (createGroupChat) {
      const memberUsers = users.filter(u => projectData.members.some(m => m.userId === u.id));
      const participants = [currentUser, ...memberUsers.filter(u => u.id !== currentUser.id)];
      
      const newGroup: Conversation = {
        id: `conv-${Date.now()}`,
        type: ConversationType.GROUP,
        name: projectData.name,
        participants: participants,
        messages: [],
        unreadCount: 0,
        sharedPhotos: [],
      };
      setConversations(prev => [newGroup, ...prev]);
      addNotification(`Group chat created for "${projectData.name}"`, NotificationType.MENTION);
    }

    setActiveLocation({ view: 'overview', projectId: newProject.id });
    setCreateProjectWizardOpen(false);
  };

  const handleSendTaskToChat = (task: Task, recipient: User) => {
    if (!currentUser) return;
    const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        senderId: currentUser.id,
        content: `I've shared a task with you:`,
        timestamp: new Date().toISOString(),
        taskLink: {
            projectId: task.projectId,
            taskId: task.id,
            title: task.title,
        },
    };
    
    let conversation = conversations.find(c => 
        c.type === ConversationType.DIRECT &&
        c.participants.some(p => p.id === currentUser.id) &&
        c.participants.some(p => p.id === recipient.id)
    );

    if (conversation) {
        setConversations(prev => prev.map(c => 
            c.id === conversation!.id 
            ? { ...c, messages: [...c.messages, newMessage] } 
            : c
        ));
    } else {
        const newConversation: Conversation = {
            id: `conv-${Date.now()}`,
            type: ConversationType.DIRECT,
            participants: [currentUser, recipient],
            messages: [newMessage],
        };
        setConversations(prev => [newConversation, ...prev]);
    }
    
    setActiveLocation({ view: 'chat', projectId: null });
  };

  const handleNavigateToTask = (projectId: string, taskId: string) => {
      setActiveLocation({ view: 'kanban', projectId });
      setTaskToOpen({ projectId, taskId });
  };

  const handleAuthSuccess = () => {
    // Auth state will be handled by onAuthStateChange
    // Check for onboarding will happen there
    if (currentUser && !currentUser.hasCompletedOnboarding) {
      setShowOnboardingWizard(true);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setSession(null);
    setActiveLocation({ view: 'home', projectId: null });
  };

  // Onboarding Handlers
  const handleWizardComplete = () => {
      setShowOnboardingWizard(false);
      setTimeout(() => {
          setShowProductTour(true);
      }, 500);
  };

  const handleTourComplete = () => {
      setShowProductTour(false);
      if (currentUser) {
          // Update user state to prevent onboarding from showing again
          const updatedUser = { ...currentUser, hasCompletedOnboarding: true };
          setCurrentUser(updatedUser);
          setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
      }
  };

  const tourSteps = [
      {
          targetId: 'tour-projects-list',
          title: 'Your Projects',
          content: 'This is where all your active projects live. You can navigate between Overview, Kanban, Docs, and more.',
          position: 'right' as const
      },
      {
          targetId: 'tour-create-project',
          title: 'Start Something New',
          content: 'Ready to kick off a new initiative? Use our AI-powered wizard to setup projects in seconds.',
          position: 'right' as const
      },
      {
          targetId: 'tour-chat',
          title: 'Team Communication',
          content: 'Keep the conversation flowing. Chat is built right into your workflow, so you never miss a beat.',
          position: 'right' as const
      },
      {
          targetId: 'tour-notifications',
          title: 'Stay Updated',
          content: 'All your mentions, task assignments, and reminders will appear here.',
          position: 'bottom' as const
      }
  ];

  // Filter Tasks Logic
  const projectTasks = useMemo(() => {
      let filtered = tasks.filter(task => task.projectId === activeProject?.id);
      
      // Apply Task Filters
      if (taskFilter.status && taskFilter.status.length > 0) {
          filtered = filtered.filter(t => taskFilter.status.includes(t.status));
      }
      
      if (taskFilter.assigneeId) {
          filtered = filtered.filter(t => t.assigneeId === taskFilter.assigneeId);
      }

      if (taskFilter.date) {
          const now = new Date();
          now.setHours(0,0,0,0);
          
          if (taskFilter.date === 'overdue') {
              filtered = filtered.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Done');
          } else if (taskFilter.date === 'no_date') {
              filtered = filtered.filter(t => !t.dueDate);
          } else if (taskFilter.date === 'this_week') {
              const nextWeek = new Date(now);
              nextWeek.setDate(now.getDate() + 7);
              filtered = filtered.filter(t => {
                  if (!t.dueDate) return false;
                  const due = new Date(t.dueDate);
                  return due >= now && due <= nextWeek;
              });
          }
      }

      return filtered;
  }, [tasks, activeProject, taskFilter]);

  const needsGlobalPadding = ['home', 'overview', 'automations', 'stoplight', 'folders'].includes(activeLocation.view);

  const renderView = () => {
    if (!currentUser) return null;

    const projectMembers = users.filter(u => activeProject?.members.some(m => m.userId === u.id));

    switch (activeLocation.view) {
      case 'home':
        return <HomeView 
          currentUser={currentUser}
          tasks={tasks}
          notifications={notifications}
          setActiveView={(view) => setActiveLocation({ view, projectId: null })}
        />;
      case 'chat':
        return <ChatView 
          currentUser={currentUser}
          users={users}
          conversations={conversations}
          setConversations={setConversations}
          onNavigateToTask={handleNavigateToTask}
          tasks={tasks}
          projects={projects}
          onAddTask={handleAddTask}
          addNotification={addNotification}
          initialActiveId={activeLocation.itemId} 
        />;
    }
    
    if (!activeProject) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <LayoutDashboardIcon className="w-16 h-16 mb-4" />
          <h2 className="text-2xl font-bold">No Project Selected</h2>
          <p>Please select a project to begin.</p>
        </div>
      );
    }
    
    switch (activeLocation.view) {
      case 'overview':
        return <ProjectOverview 
          project={activeProject}
          tasks={projectTasks}
          members={projectMembers}
        />;
      case 'docs':
        return <DocsView 
          project={activeProject} 
          setProjects={setProjects} 
          users={users} 
          currentUser={currentUser}
          addNotification={addNotification}
          conversations={conversations}
          setConversations={setConversations}
        />;
      case 'kanban':
        return <KanbanBoard 
          tasks={projectTasks}
          project={activeProject} 
          onTaskUpdate={handleTaskUpdate} 
          onReorderTask={handleReorderTask}
          onAddTask={handleAddTask} 
          onPinTask={handleTogglePinTask}
          onAddColumn={(name) => handleAddColumn(activeProject.id, name)}
          onReorderColumns={(start, end) => handleReorderColumns(activeProject.id, start, end)}
          users={users}
          projectMembers={projectMembers}
          onSendTaskToChat={handleSendTaskToChat}
          taskToOpen={taskToOpen}
          onTaskOpened={() => setTaskToOpen(null)}
          onUpdateProject={handleUpdateProject}
        />;
       case 'folders':
        return <FoldersView 
            project={activeProject} 
            setProjects={setProjects} 
            users={users} 
            tasks={projectTasks}
        />;
       case 'automations':
        return <AutomationsView 
            project={activeProject} 
            automations={automations} 
            setAutomations={setAutomations}
            users={projectMembers}
        />;
        case 'stoplight':
        return <StoplightView
            project={activeProject}
            setProjects={setProjects}
            users={users}
        />;
    }
  };

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  // --- AUTH GUARD ---
  if (!session) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  // Show loading while fetching user profile
  if (!currentUser) {
    return <LoadingScreen onComplete={() => {}} />;
  }

  return (
    <>
      <div className="flex h-full w-full bg-transparent text-gray-200 font-sans overflow-hidden">
        <div className="animate-slide-in-left flex-shrink-0 h-full flex">
            <Sidebar 
              currentUser={currentUser}
              projects={projects}
              activeLocation={activeLocation}
              setActiveLocation={setActiveLocation} 
              isSidebarCollapsed={isSidebarCollapsed}
              setIsSidebarCollapsed={setIsSidebarCollapsed}
              onProfileClick={() => setIsProfileSettingsOpen(true)}
              onCreateProjectClick={() => setCreateProjectWizardOpen(true)}
            />
        </div>
        <div className="flex flex-col flex-1 transition-all duration-300 min-w-0 relative">
          <div className="animate-slide-in-down z-20">
              <Header 
                activeProject={activeProject}
                activeView={activeLocation.view}
                notifications={notifications}
                setNotifications={setNotifications}
                currentUser={currentUser}
                projects={projects}
                onUpdateProject={handleUpdateProject}
                taskFilter={taskFilter}
                setTaskFilter={setTaskFilter}
                projectMembers={users.filter(u => activeProject?.members.some(m => m.userId === u.id))}
              />
          </div>
          <main className={`flex-1 overflow-y-auto p-4 md:p-6 bg-black/10 animate-scale-up-fade ${needsGlobalPadding ? 'pb-32' : ''}`}>
            {renderView()}
          </main>
          
          {/* Chat Notification Bubble */}
          {latestUnread && activeLocation.view !== 'chat' && (
             <ChatNotificationBubble 
                message={latestUnread.message}
                sender={latestUnread.sender}
                onClick={() => setActiveLocation({ view: 'chat', projectId: null, itemId: latestUnread.conversationId })}
                onDismiss={() => setLastDismissedMessageId(latestUnread.message.id)}
             />
          )}
        </div>
      </div>
      
      {/* Modals */}
      <ProfileSettingsModal
        isOpen={isProfileSettingsOpen}
        onClose={() => setIsProfileSettingsOpen(false)}
               currentUser={currentUser}
               onSave={handleUserUpdate}
               currentTheme={theme}
               setTheme={setTheme}
               onLogout={handleLogout}
      />
      <CreateProjectWizard
        isOpen={isCreateProjectWizardOpen}
        onClose={() => setCreateProjectWizardOpen(false)}
        onCreate={handleCreateProject}
        users={users}
      />
      
      {/* Feedback Floating Trigger - Horizontal at Bottom Right */}
      {/* Hide in Chat view to avoid obstructing input */}
      {activeLocation.view !== 'chat' && (
        <button
            onClick={() => setIsFeedbackOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 group"
        >
            <StarIcon className="w-5 h-5 fill-current group-hover:rotate-180 transition-transform duration-500" />
            <span className="font-bold text-sm tracking-wide">Feedback</span>
        </button>
      )}

      {/* Feedback Drawer */}
      <FeedbackSidebar 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
      />

      {/* Onboarding Flow */}
      {showOnboardingWizard && (
          <OnboardingWizard 
            onComplete={handleWizardComplete} 
            userName={currentUser.name} 
          />
      )}
      {showProductTour && (
          <ProductTour 
            steps={tourSteps} 
            onComplete={handleTourComplete} 
          />
      )}
    </>
  );
};

export default App;
