
import React, { useState } from 'react';
import { Modal } from './Modal';
import { User } from '../types';
import { CameraIcon, CheckCircleIcon, CircleIcon, PlusIcon, SearchIcon, UsersIcon } from './Icons';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, photoUrl: string | undefined, memberIds: string[]) => void;
  users: User[];
  currentUser: User;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose, onCreate, users, currentUser }) => {
  const [groupName, setGroupName] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter users to exclude current user and match search
  const availableUsers = users.filter(u => 
      u.id !== currentUser.id && 
      u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleUser = (userId: string) => {
      setSelectedUserIds(prev => 
          prev.includes(userId) 
          ? prev.filter(id => id !== userId) 
          : [...prev, userId]
      );
  };

  const handlePhotoUpload = () => {
      // Simulate upload by setting a random unsplash image
      setPhotoUrl('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&q=80');
  };

  const handleSubmit = () => {
      if (groupName.trim() && selectedUserIds.length > 0) {
          onCreate(groupName, photoUrl, selectedUserIds);
          // Reset state
          setGroupName('');
          setPhotoUrl(undefined);
          setSelectedUserIds([]);
          setSearchQuery('');
      }
  };

  return (
    <Modal title="Create Group" isOpen={isOpen} onClose={onClose}>
        <div className="space-y-6">
            {/* Top Section: Photo & Name */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={handlePhotoUpload}
                    className="relative w-16 h-16 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center overflow-hidden hover:bg-gray-700 transition-colors group flex-shrink-0"
                    title="Upload Group Photo"
                >
                    {photoUrl ? (
                        <img src={photoUrl} alt="Group" className="w-full h-full object-cover" />
                    ) : (
                        <CameraIcon className="w-6 h-6 text-gray-400 group-hover:text-white" />
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <PlusIcon className="w-4 h-4 text-white" />
                    </div>
                </button>
                <div className="flex-1">
                    <label className="block text-xs text-gray-400 uppercase font-semibold mb-1">Group Name</label>
                    <input 
                        type="text" 
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="e.g. Marketing Team"
                        className="w-full bg-transparent border-b border-gray-600 focus:border-blue-500 text-white py-2 px-1 focus:outline-none transition-colors text-lg"
                        autoFocus
                    />
                </div>
            </div>

            {/* Member Selection */}
            <div>
                <div className="flex justify-between items-end mb-2">
                    <label className="block text-xs text-gray-400 uppercase font-semibold">Add Members</label>
                    <span className="text-xs text-blue-400">{selectedUserIds.length} selected</span>
                </div>
                
                {/* Search */}
                <div className="relative mb-3">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search people..." 
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                </div>

                {/* List */}
                <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                    {availableUsers.map(user => {
                        const isSelected = selectedUserIds.includes(user.id);
                        return (
                            <div 
                                key={user.id} 
                                onClick={() => handleToggleUser(user.id)}
                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-blue-900/30 border border-blue-500/30' : 'hover:bg-white/5 border border-transparent'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                                    <div>
                                        <p className={`text-sm font-medium ${isSelected ? 'text-blue-100' : 'text-gray-200'}`}>{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.role}</p>
                                    </div>
                                </div>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-600'}`}>
                                    {isSelected && <CheckCircleIcon className="w-3.5 h-3.5 text-white" />}
                                </div>
                            </div>
                        );
                    })}
                    {availableUsers.length === 0 && (
                        <p className="text-center text-gray-500 text-sm py-4">No users found.</p>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                 <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
                 <button 
                    onClick={handleSubmit} 
                    disabled={!groupName.trim() || selectedUserIds.length === 0}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Create Group
                 </button>
            </div>
        </div>
    </Modal>
  );
};
