import React, { useState } from 'react';
import { ProjectFolder, User } from '../types';
import { Modal } from './Modal';
import { TrashIcon } from './Icons';

type Permission = 'editor' | 'viewer';

interface FolderAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder: ProjectFolder;
  projectUsers: User[];
  onUpdatePermissions: (newPermissions: { [userId: string]: Permission }) => void;
}

export const FolderAccessModal: React.FC<FolderAccessModalProps> = ({ isOpen, onClose, folder, projectUsers, onUpdatePermissions }) => {
  const [permissions, setPermissions] = useState(folder.permissions);
  const [selectedUserId, setSelectedUserId] = useState('');

  const handleAddUser = () => {
    if (selectedUserId && !permissions[selectedUserId]) {
      const newPermissions = { ...permissions, [selectedUserId]: 'viewer' as Permission };
      setPermissions(newPermissions);
      setSelectedUserId('');
    }
  };

  const handleRemoveUser = (userId: string) => {
    const newPermissions = { ...permissions };
    delete newPermissions[userId];
    setPermissions(newPermissions);
  };
  
  const handlePermissionChange = (userId: string, permission: Permission) => {
    const newPermissions = { ...permissions, [userId]: permission };
    setPermissions(newPermissions);
  };

  const handleSaveChanges = () => {
    onUpdatePermissions(permissions);
    onClose();
  };

  const usersWithAccess = Object.keys(permissions)
    .map(userId => projectUsers.find(u => u.id === userId))
    .filter((u): u is User => !!u);

  const potentialUsers = projectUsers.filter(u => !permissions[u.id]);

  return (
    <Modal title={`Access for "${folder.name}"`} isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label htmlFor="addUser" className="block text-sm font-medium text-gray-300 mb-1">Add people</label>
          <div className="flex gap-2">
            <select
              id="addUser"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="flex-1 w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="" disabled>Select a user...</option>
              {potentialUsers.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            <button
              onClick={handleAddUser}
              disabled={!selectedUserId}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium text-white transition-colors disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">People with access</h4>
          <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
            {usersWithAccess.map(user => (
              <div key={user.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                  <p className="text-gray-200">{user.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={permissions[user.id]}
                    onChange={(e) => handlePermissionChange(user.id, e.target.value as Permission)}
                    className="bg-gray-700 border-none rounded-md px-2 py-1 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <button onClick={() => handleRemoveUser(user.id)} className="text-gray-400 hover:text-red-500">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
             {usersWithAccess.length === 0 && <p className="text-sm text-center py-4 text-gray-500">Only you can access this folder.</p>}
          </div>
        </div>

        <div className="flex justify-end pt-4 space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium text-white transition-colors">Cancel</button>
          <button onClick={handleSaveChanges} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-orange-500 hover:opacity-90 rounded-md text-sm font-medium text-white transition-opacity">Save Changes</button>
        </div>
      </div>
    </Modal>
  );
};
