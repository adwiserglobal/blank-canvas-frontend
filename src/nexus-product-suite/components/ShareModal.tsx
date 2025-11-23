import React, { useState } from 'react';
import { Doc, User, DocPermission } from '../types';
import { Modal } from './Modal';
import { TrashIcon, XIcon } from './Icons';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  doc: Doc;
  projectUsers: User[];
  onUpdatePermissions: (docId: string, newPermissions: { [userId: string]: DocPermission }) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, doc, projectUsers, onUpdatePermissions }) => {
  const [permissions, setPermissions] = useState(doc.permissions);
  const [selectedUserId, setSelectedUserId] = useState('');

  const author = projectUsers.find(u => u.id === doc.authorId);

  const handleAddUser = () => {
    if (selectedUserId && !permissions[selectedUserId]) {
      const newPermissions = { ...permissions, [selectedUserId]: 'viewer' as DocPermission };
      setPermissions(newPermissions);
      setSelectedUserId('');
    }
  };

  const handleRemoveUser = (userId: string) => {
    const newPermissions = { ...permissions };
    delete newPermissions[userId];
    setPermissions(newPermissions);
  };
  
  const handlePermissionChange = (userId: string, permission: DocPermission) => {
    const newPermissions = { ...permissions, [userId]: permission };
    setPermissions(newPermissions);
  };

  const handleSaveChanges = () => {
    onUpdatePermissions(doc.id, permissions);
    onClose();
  };

  const usersWithAccess = Object.keys(permissions)
    .map(userId => projectUsers.find(u => u.id === userId))
    .filter((u): u is User => !!u);

  const potentialUsers = projectUsers.filter(u => !permissions[u.id] && u.id !== doc.authorId);

  return (
    <Modal title={`Share "${doc.title}"`} isOpen={isOpen} onClose={onClose}>
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
            {/* Author */}
            {author && (
              <div className="flex items-center justify-between p-2 rounded-md bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <img src={author.avatarUrl} alt={author.name} className="w-8 h-8 rounded-full" />
                  <div>
                      <p className="text-gray-100 font-medium">{author.name}</p>
                      <p className="text-xs text-gray-500">Author</p>
                  </div>
                </div>
                <span className="text-sm text-gray-400">Editor</span>
              </div>
            )}
            {/* Other users */}
            {usersWithAccess.filter(u => u.id !== doc.authorId).map(user => (
              <div key={user.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                  <p className="text-gray-200">{user.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={permissions[user.id]}
                    onChange={(e) => handlePermissionChange(user.id, e.target.value as DocPermission)}
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
