
export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done',
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: string; // Changed from TaskStatus enum to string to support custom columns
  dueDate: string;
  priority: TaskPriority;
  assigneeId?: string;
  involvedIds?: string[];
  completedAt?: string;
  isPinned?: boolean;
  reminderAt?: string;
  tags?: string[];
  comments?: Comment[];
  checklist?: ChecklistItem[];
  autoCompleteOnChecklist?: boolean;
}

export interface TaskFilter {
    status: string[];
    assigneeId: string | null;
    date: 'overdue' | 'no_date' | 'this_week' | null;
}

export type DocPermission = 'editor' | 'viewer';

export interface Doc {
  id: string;
  title: string;
  content: string;
  lastUpdated: string;
  authorId: string;
  permissions: {
    [userId: string]: DocPermission;
  };
}

export interface ProjectMember {
  userId: string;
  role: string;
}

export type FileType = 'nexus-doc' | 'pdf' | 'image' | 'video';

export interface ProjectFile {
  id: string;
  name: string;
  type: FileType;
  size: string;
  addedAt: string;
  nexusDocId?: string;
  linkedTaskIds?: string[]; // IDs of tasks this file is associated with
}

export interface ProjectFolder {
    id: string;
    name: string;
    files: ProjectFile[];
    permissions: {
        [userId: string]: 'editor' | 'viewer';
    };
}

export interface ProjectColumn {
    id: string;
    title: string;
    color: string; // Tailwind border color class
}

export type StoplightStatus = 'on_track' | 'at_risk' | 'blocked' | 'completed';

export interface StoplightItem {
    id: string;
    workstream: string; // e.g., "Backend API", "Design System", "QA"
    status: StoplightStatus;
    ownerId?: string;
    notes: string;
    lastUpdated: string;
    previousStatus?: StoplightStatus;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  icon: string;
  docs: Doc[];
  folders: ProjectFolder[];
  members: ProjectMember[];
  columns: ProjectColumn[];
  stoplightItems: StoplightItem[];
  startDate: string;
  endDate: string;
  slas: string;
  kpis: string;
  onboardingMessage: string;
}

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  role: string;
  isActive?: boolean;
  hasCompletedOnboarding?: boolean;
}

export interface Attachment {
  name: string;
  type: string;
  url: string;
  size: number;
}

export interface SharedFile {
    id: string;
    name: string;
    type: 'pdf' | 'doc' | 'csv';
    size: string;
    url: string;
}

export interface PollOption {
    id: string;
    text: string;
    votes: string[]; // userIds
}

export interface PollData {
    question: string;
    options: PollOption[];
    allowMultiple: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  attachment?: Attachment;
  taskLink?: {
    projectId: string;
    taskId: string;
    title: string;
  };
  replyToId?: string;
  pollData?: PollData;
}

export enum ConversationType {
  DIRECT = 'direct',
  GROUP = 'group',
}

export interface Conversation {
  id: string;
  type: ConversationType;
  participants: User[];
  messages: ChatMessage[];
  name?: string;
  unreadCount?: number;
  sharedFiles?: SharedFile[];
  sharedPhotos?: string[];
  wallpaper?: string; // ID of the selected wallpaper
}

export enum NotificationType {
    TASK_ASSIGNED = 'task_assigned',
    DOC_SHARED = 'doc_shared',
    MENTION = 'mention',
    REMINDER = 'reminder',
    AUTOMATION = 'automation',
}

export interface Notification {
    id:string;
    type: NotificationType;
    message: string;
    timestamp: string;
    read: boolean;
    link?: {
        view: ViewType;
        projectId: string;
        itemId: string;
    };
}

// --- AUTOMATION TYPES ---

export type TriggerType = 'TASK_STATUS_CHANGED' | 'TASK_PRIORITY_CHANGED' | 'TASK_CREATED';
export type ActionType = 'SEND_NOTIFICATION' | 'CHANGE_PRIORITY' | 'ASSIGN_USER' | 'ADD_COMMENT';

export interface AutomationTrigger {
    type: TriggerType;
    conditions: {
        field: string;
        operator: 'equals' | 'not_equals';
        value: string;
    };
}

export interface AutomationAction {
    type: ActionType;
    payload: {
        target?: string; // e.g., userId, 'all_members'
        value?: string; // e.g., 'High', new status, message content
    };
}

export interface Automation {
    id: string;
    projectId: string; // Linked to a specific project or 'global'
    name: string;
    description: string;
    isActive: boolean;
    trigger: AutomationTrigger;
    actions: AutomationAction[];
    lastRun?: string;
    runCount: number;
}


export type ViewType = 'home' | 'kanban' | 'docs' | 'chat' | 'folders' | 'overview' | 'automations' | 'stoplight';

export interface ActiveLocation {
  view: ViewType;
  projectId: string | null;
  itemId?: string;
}