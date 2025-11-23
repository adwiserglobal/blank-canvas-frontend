
import React from 'react';
import { Notification } from '../types';
import { BellIcon, CheckCheckIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface NotificationPopoverProps {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  onClose: () => void;
}

const timeAgo = (date: string): string => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "just now";
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({ notifications, setNotifications, onClose }) => {
    const { t } = useLanguage();
    
    const handleMarkAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const handleMarkAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    return (
        <div className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-[#1A1A1F] border border-gray-700 rounded-xl shadow-2xl z-50 text-white">
            <div className="flex justify-between items-center p-3 border-b border-gray-700/50">
                <h4 className="font-semibold">{t('header.notifications')}</h4>
                <button
                    onClick={handleMarkAllAsRead}
                    className="flex items-center gap-1.5 text-xs text-blue-400 hover:underline disabled:text-gray-500 disabled:no-underline disabled:cursor-not-allowed"
                    disabled={notifications.every(n => n.read)}
                >
                    <CheckCheckIcon className="w-4 h-4" />
                    {t('header.mark_all_read')}
                </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    <ul>
                        {notifications.map(n => (
                            <li 
                                key={n.id}
                                className={`flex items-start gap-3 p-3 border-b border-gray-800/60 transition-colors ${!n.read ? 'bg-blue-900/20' : ''}`}
                            >
                                <div className={`mt-1 flex-shrink-0 w-2.5 h-2.5 rounded-full ${n.read ? 'bg-transparent' : 'bg-blue-500'}`}></div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-200">{n.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">{timeAgo(n.timestamp)}</p>
                                </div>
                                {!n.read && (
                                    <button 
                                        onClick={() => handleMarkAsRead(n.id)}
                                        className="p-1 text-gray-400 hover:text-white"
                                        title="Mark as read"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        <BellIcon className="w-12 h-12 mx-auto mb-2"/>
                        <p className="text-sm">{t('header.caught_up')}</p>
                    </div>
                )}
            </div>
            <div className="p-2 bg-gray-900/50 text-center rounded-b-xl">
                 <button onClick={onClose} className="text-xs text-gray-400 hover:underline">{t('header.close')}</button>
            </div>
        </div>
    );
};
