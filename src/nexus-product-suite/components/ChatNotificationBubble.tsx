
import React from 'react';
import { ChatMessage, User } from '../types';
import { XIcon } from './Icons';

interface ChatNotificationBubbleProps {
  message: ChatMessage;
  sender?: User;
  onClick: () => void;
  onDismiss: () => void;
}

export const ChatNotificationBubble: React.FC<ChatNotificationBubbleProps> = ({ message, sender, onClick, onDismiss }) => {
  if (!sender) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="relative group">
        <button 
            onClick={onClick} 
            className="flex items-center gap-4 bg-black/40 backdrop-blur-2xl border border-white/10 p-4 pr-8 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] hover:bg-white/5 transition-all duration-300 cursor-pointer group-hover:scale-[1.02] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] group-hover:border-white/20 ring-1 ring-white/5 overflow-hidden relative"
        >
            {/* Glossy overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="relative">
                <img src={sender.avatarUrl} alt={sender.name} className="w-12 h-12 rounded-full border border-white/20 object-cover shadow-md" />
                <div className="absolute -top-0.5 -right-0.5">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-black"></span>
                    </span>
                </div>
            </div>
            
            <div className="flex flex-col items-start text-left max-w-[220px]">
                <div className="flex items-center gap-2 w-full">
                    <span className="text-xs font-bold text-white tracking-wide">{sender.name}</span>
                    <span className="text-[10px] text-gray-400 ml-auto">Now</span>
                </div>
                <span className="text-sm text-gray-200 truncate w-full mt-0.5 font-light opacity-90">
                    {message.attachment ? (
                        <span className="italic text-blue-300 flex items-center gap-1">
                            📎 Attachment
                        </span>
                    ) : message.content}
                </span>
            </div>
        </button>
        
        <button 
            onClick={(e) => { e.stopPropagation(); onDismiss(); }}
            className="absolute -top-2 -left-2 bg-black/60 backdrop-blur-md border border-white/20 text-gray-300 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-500/80 hover:text-white shadow-lg transform scale-90 hover:scale-100 hover:border-red-400"
        >
            <XIcon className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
