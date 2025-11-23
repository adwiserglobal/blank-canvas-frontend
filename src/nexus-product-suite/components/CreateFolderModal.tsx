import React, { useState } from 'react';
import { Modal } from './Modal';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (folderName: string) => void;
}

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim());
      setName('');
    }
  };

  return (
    <Modal title="Create New Folder" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="folderName" className="block text-sm font-medium text-gray-300 mb-1">
            Folder Name
          </label>
          <input
            id="folderName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Design Assets"
            className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
            autoFocus
          />
        </div>

        <div className="flex justify-end pt-2 space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium text-white transition-colors">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-gradient-to-r from-blue-500 to-orange-500 hover:opacity-90 rounded-md text-sm font-medium text-white transition-opacity disabled:opacity-50" disabled={!name.trim()}>
            Create Folder
          </button>
        </div>
      </form>
    </Modal>
  );
};
