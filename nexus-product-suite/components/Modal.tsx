
import React from 'react';
import { XIcon } from './Icons';

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'lg' | '2xl' | '4xl' | '5xl';
  bodyClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({ title, isOpen, onClose, children, size = 'lg', bodyClassName }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    lg: 'max-w-lg',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-6xl',
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className={`bg-[#141419] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 w-full ${sizeClasses[size]} mx-auto flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300 relative`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 bg-[#1A1A1F] flex-shrink-0">
          <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className={`flex-1 bg-[#0F0F12] ${bodyClassName ? bodyClassName : 'overflow-y-auto p-0 custom-scrollbar'}`}>
          {children}
        </div>
      </div>
    </div>
  );
};
