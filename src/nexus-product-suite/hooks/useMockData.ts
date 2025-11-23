
import { useState, useCallback } from 'react';
import { Project, Task, TaskStatus, TaskPriority, User, Conversation, ConversationType, Notification, NotificationType, ViewType, SharedFile, Automation } from '../types';

const initialUsers: User[] = [
  { id: 'user-alex', name: 'Alex Grayson', avatarUrl: 'https://i.pravatar.cc/150?u=user', role: 'Product Manager', isActive: true },
  { id: 'user-jane', name: 'Jane Doe', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', role: 'UX/UI Designer', isActive: true },
  { id: 'user-john', name: 'John Smith', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705d', role: 'Frontend Developer', isActive: false },
  { id: 'user-peter', name: 'Peter Jones', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026706d', role: 'Backend Developer', isActive: true },
  { id: 'user-sarah', name: 'Sarah Lee', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026707d', role: 'QA Engineer', isActive: false },
  { id: 'user-eduardo', name: 'Eduardo Campos', avatarUrl: 'https://i.pravatar.cc/150?u=ecampos', role: 'Go-to-Market Specialist', isActive: true },
];

const defaultColumns = [
    { id: 'To Do', title: 'To Do', color: 'border-l-blue-500' },
    { id: 'In Progress', title: 'In Progress', color: 'border-l-orange-500' },
    { id: 'Done', title: 'Done', color: 'border-l-green-500' }
];

const initialProjects: Project[] = [
  { 
    id: 'proj-1', 
    name: 'Feedmetrics Product Engineering', 
    description: 'Developing the next generation of customer experience management tools for enterprise and e-commerce.',
    icon: '📊', 
    members: [
        { userId: 'user-alex', role: 'Product Manager' },
        { userId: 'user-jane', role: 'UX/UI Designer' },
        { userId: 'user-john', role: 'Frontend Developer' },
        { userId: 'user-peter', role: 'Backend Developer' },
        { userId: 'user-sarah', role: 'QA Engineer' },
        { userId: 'user-eduardo', role: 'Go-to-Market Specialist' },
    ],
    columns: [...defaultColumns],
    startDate: '2024-07-01',
    endDate: '2024-12-31',
    slas: 'All P1 bugs to be resolved within 24 hours. API response time under 200ms.',
    kpis: 'Achieve 10,000 monthly active users. Reduce customer support tickets by 15%.',
    onboardingMessage: 'Welcome to the Feedmetrics team! Please review the project documentation and familiarize yourself with the Kanban board.',
    stoplightItems: [],
    docs: [
        {
            id: 'doc-1',
            title: 'Entendendo o produto',
            content: `<strong>A Feedmetrics</strong> é uma plataforma de última geração em CXM (Customer Experience Management) que permite que empresas de diferentes portes e indústrias possam entender melhor a jornada de seus clientes e prover uma experiência de alta qualidade para diversos canais.<br><br>A Feedmetrics se divide em dois segmentos:<ul><li><strong>Feedmetrics for enterprise</strong>: A experiência e os recursos clássicos para coletar e analisar Feedbacks, pontos de atrito e a jornada de cliente ponta a ponta em tempo real.</li><li><strong>Feedcommerce</strong>: Uma plataforma by Feedmetrics projetada para atender especificamente o mercado de e-commerce, com maior granularidade e funcionalidade únicas.</li></ul>`,
            lastUpdated: '2025-10-14T21:43:00Z',
            authorId: 'user-eduardo',
            permissions: {
                'user-eduardo': 'editor',
                'user-alex': 'editor',
                'user-jane': 'viewer',
            }
        },
        {
            id: 'doc-2',
            title: 'Especificações técnicas gerais',
            content: `<h1>General Technical Specifications</h1><p>This document covers the high-level technical architecture.</p><p><span style="color: rgb(234, 179, 8);">Please review the attached diagrams.</span></p>`,
            lastUpdated: '2025-10-12T11:00:00Z',
            authorId: 'user-jane',
            permissions: {
                'user-jane': 'editor',
                'user-alex': 'viewer',
            }
        },
        {
            id: 'doc-3',
            title: 'Micro-PRD (Afterclick)',
            content: `<h1>Micro-PRD for Afterclick Feature</h1><h2>Problem</h2><p>Users want to provide feedback <i>immediately</i> after an interaction.</p>`,
            lastUpdated: '2025-10-11T15:30:00Z',
            authorId: 'user-alex',
            permissions: {
                'user-alex': 'editor',
                'user-jane': 'viewer',
            }
        }
    ],
    folders: []
  }
];

const initialTasks: Task[] = [
    { id: 't1', projectId: 'proj-1', title: 'Implement OAuth 2.0', description: 'Set up authentication using Google and GitHub providers.', status: 'Done', priority: TaskPriority.HIGH, dueDate: '2024-10-15', assigneeId: 'user-peter', involvedIds: ['user-alex'], comments: [], isPinned: false, tags: ['Auth', 'Backend'], checklist: [], autoCompleteOnChecklist: false },
    { id: 't2', projectId: 'proj-1', title: 'Design Dashboard Layout', description: 'Create high-fidelity mockups for the main dashboard.', status: 'In Progress', priority: TaskPriority.MEDIUM, dueDate: '2024-10-20', assigneeId: 'user-jane', involvedIds: ['user-alex'], comments: [], isPinned: true, tags: ['Design', 'UI'], checklist: [{id: 'c1', text: 'Wireframes', completed: true}, {id: 'c2', text: 'High Fidelity', completed: false}], autoCompleteOnChecklist: true },
    { id: 't3', projectId: 'proj-1', title: 'API Rate Limiting', description: 'Implement rate limiting to prevent abuse.', status: 'To Do', priority: TaskPriority.HIGH, dueDate: '2024-10-25', assigneeId: 'user-peter', involvedIds: [], comments: [], isPinned: false, tags: ['Backend', 'Security'], checklist: [], autoCompleteOnChecklist: false },
    { id: 't4', projectId: 'proj-1', title: 'Mobile Responsive Check', description: 'Ensure all views work on mobile devices.', status: 'To Do', priority: TaskPriority.LOW, dueDate: '2024-10-28', assigneeId: 'user-john', involvedIds: [], comments: [], isPinned: false, tags: ['QA', 'Mobile'], checklist: [], autoCompleteOnChecklist: false },
];

const initialConversations: Conversation[] = [
    {
        id: 'conv-1',
        type: ConversationType.GROUP,
        name: 'Feedmetrics Team',
        participants: initialUsers,
        messages: [
            { id: 'm1', senderId: 'user-alex', content: 'Welcome to the new project!', timestamp: '2024-10-01T09:00:00Z' },
            { id: 'm2', senderId: 'user-jane', content: 'Excited to start!', timestamp: '2024-10-01T09:05:00Z' }
        ],
        unreadCount: 0,
        sharedPhotos: [],
    }
];

export const useMockData = () => {
    const [projects, setProjects] = useState<Project[]>(initialProjects);
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [automations, setAutomations] = useState<Automation[]>([]);

    const addNotification = useCallback((message: string, type: NotificationType, link?: { view: ViewType; projectId: string; itemId: string; }) => {
        const newNotification: Notification = {
            id: `notif-${Date.now()}`,
            type,
            message,
            timestamp: new Date().toISOString(),
            read: false,
            link
        };
        setNotifications(prev => [newNotification, ...prev]);
    }, []);

    return {
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
    };
};
