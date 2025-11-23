
import React from 'react';
import { Task, User, Notification, TaskPriority, TaskStatus, ViewType } from '../types';
import { BellIcon, ChevronsUpIcon, FileTextIcon, MessageSquareIcon, CheckCircleIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface HomeViewProps {
  currentUser: User;
  tasks: Task[];
  notifications: Notification[];
  setActiveView: (view: ViewType) => void;
}

const getGreetingKey = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'home.greeting.morning';
    if (hour < 18) return 'home.greeting.afternoon';
    return 'home.greeting.evening';
};

const timeAgo = (date: string): string => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

const ProductivityChart: React.FC<{ tasks: Task[], t: (key: string) => string }> = ({ tasks, t }) => {
    const data = Array(7).fill(0);
    const labels = Array(7).fill(0).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toLocaleDateString('en-US', { weekday: 'short' });
    }).reverse();

    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    tasks.forEach(task => {
        if (task.completedAt) {
            const completedDate = new Date(task.completedAt);
            if (completedDate >= sevenDaysAgo) {
                const dayIndex = 6 - Math.floor((today.getTime() - completedDate.getTime()) / (1000 * 3600 * 24));
                if (dayIndex >= 0 && dayIndex < 7) {
                    data[dayIndex]++;
                }
            }
        }
    });
    
    const maxVal = Math.max(...data, 1); // Avoid division by zero

    return (
        <div className="bg-white/10 border border-white/10 rounded-xl p-4 flex flex-col h-full">
            <h3 className="text-lg font-semibold text-white mb-4">{t('home.productivity')}</h3>
            <div className="flex-1 flex items-end justify-between gap-2 text-xs text-gray-400">
                {data.map((value, index) => (
                    <div key={index} className="flex flex-col items-center flex-1 h-full justify-end group">
                        <div className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 -mb-2">{value}</div>
                        <div 
                            className="w-full bg-gradient-to-t from-blue-600 to-orange-500/80 rounded-t-md transition-all duration-500 hover:opacity-100 opacity-80"
                            style={{ height: `${(value / maxVal) * 100}%` }}
                            title={`${value} tasks`}
                        ></div>
                        <span className="mt-2">{labels[index]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


export const HomeView: React.FC<HomeViewProps> = ({ currentUser, tasks, notifications, setActiveView }) => {
  const { t } = useLanguage();
  const todayString = new Date().toISOString().split('T')[0];

  const tasksForToday = tasks.filter(t => 
    t.assigneeId === currentUser.id && 
    t.dueDate === todayString &&
    t.status !== TaskStatus.DONE
  );

  const urgentTasks = tasks.filter(t => 
    t.assigneeId === currentUser.id &&
    t.priority === TaskPriority.HIGH &&
    t.status !== TaskStatus.DONE
  );

  const recentNotifications = notifications.slice(0, 5);
  
  const getIconForNotification = (type: Notification['type']) => {
    switch(type) {
        case 'task_assigned': return <ChevronsUpIcon className="w-5 h-5 text-orange-400" />;
        case 'doc_shared': return <FileTextIcon className="w-5 h-5 text-blue-400" />;
        case 'mention': return <MessageSquareIcon className="w-5 h-5 text-green-400" />;
        case 'reminder': return <BellIcon className="w-5 h-5 text-yellow-400" />;
        default: return <BellIcon className="w-5 h-5 text-gray-400" />;
    }
  }

  return (
    <div>
        <h2 className="text-4xl font-bold text-white mb-2">
            {t(getGreetingKey())}, {currentUser.name.split(' ')[0]}!
        </h2>
        <hr className="border-white/10 mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tasks for today */}
            <div className="bg-white/10 border border-white/10 rounded-xl p-6 border-t-2 border-t-blue-500/70">
              <h3 className="text-lg font-semibold text-white mb-4">{t('home.tasks_today')}</h3>
              {tasksForToday.length > 0 ? (
                <ul className="space-y-3">
                  {tasksForToday.map(task => (
                    <li key={task.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg hover:bg-black/40 hover:shadow-lg hover:shadow-black/20 transition-all cursor-pointer" onClick={() => setActiveView('kanban')}>
                      <p className="text-gray-200">{task.title}</p>
                      <span className="text-xs text-gray-400 px-2 py-1 bg-black/30 rounded-full">{task.priority}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">{t('home.no_tasks_today')}</p>
              )}
            </div>

            {/* Urgent Tasks */}
            <div className="bg-white/10 border border-white/10 rounded-xl p-6 border-t-2 border-t-orange-500/70">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ChevronsUpIcon className="w-5 h-5 text-red-500" />
                {t('home.urgent_tasks')}
              </h3>
               {urgentTasks.length > 0 ? (
                <ul className="space-y-3">
                  {urgentTasks.map(task => (
                    <li key={task.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg hover:bg-black/40 hover:shadow-lg hover:shadow-black/20 transition-all cursor-pointer" onClick={() => setActiveView('kanban')}>
                      <div>
                        <p className="text-gray-200">{task.title}</p>
                        <p className="text-xs text-gray-500">{t('home.due_in')}: {new Date(task.dueDate).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${task.status === TaskStatus.IN_PROGRESS ? 'bg-orange-900/50 text-orange-400' : 'bg-blue-900/50 text-blue-400'}`}>{task.status}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">{t('home.no_urgent_tasks')}</p>
              )}
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-6">
            <ProductivityChart tasks={tasks} t={t} />

            {/* Notifications */}
            <div className="bg-white/10 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">{t('header.notifications')}</h3>
              {recentNotifications.length > 0 ? (
                <ul className="space-y-4">
                  {recentNotifications.map(notif => (
                    <li key={notif.id} className="flex items-start gap-3">
                       <div className="mt-1">{getIconForNotification(notif.type)}</div>
                       <div>
                           <p className={`text-sm ${notif.read ? 'text-gray-400' : 'text-gray-100'}`}>{notif.message}</p>
                           <p className="text-xs text-gray-500">{timeAgo(notif.timestamp)}</p>
                       </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">{t('header.no_notifs')}</p>
              )}
            </div>
          </div>
        </div>
    </div>
  );
};
