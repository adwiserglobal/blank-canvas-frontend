import React, { useState } from 'react';
import { Modal } from './Modal';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, icon: string) => void;
}

const emojiSuggestions = ['🚀', '📈', '💡', '🧪', '🌐', '🎨', '⚙️', '📦'];

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🚀');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), icon);
      setName('');
      setIcon('🚀');
    }
  };

  return (
    <Modal title="Create New Project" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="projectName" className="block text-sm font-medium text-gray-300 mb-1">
            Project Name
          </label>
          <input
            id="projectName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Q4 Marketing Campaign"
            className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Icon
            </label>
            <div className="flex items-center gap-2">
                <div className="p-3 text-2xl bg-gray-900 border border-gray-700 rounded-md">
                    {icon}
                </div>
                <div className="flex flex-wrap gap-2">
                    {emojiSuggestions.map(emoji => (
                        <button
                            key={emoji}
                            type="button"
                            onClick={() => setIcon(emoji)}
                            className={`p-2 text-xl rounded-md transition-all ${icon === emoji ? 'bg-blue-600 ring-2 ring-blue-400' : 'bg-gray-700/50 hover:bg-gray-700'}`}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        <div className="flex justify-end pt-4 space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium text-white transition-colors">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-gradient-to-r from-blue-500 to-orange-500 hover:opacity-90 rounded-md text-sm font-medium text-white transition-opacity disabled:opacity-50" disabled={!name.trim()}>
            Create Project
          </button>
        </div>
      </form>
    </Modal>
  );
};
