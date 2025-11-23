
import React, { useState } from 'react';
import { Project, StoplightItem, StoplightStatus, User } from '../types';
import { PlusIcon, TrashIcon, EditIcon } from './Icons';
import { Modal } from './Modal';

interface StoplightViewProps {
  project: Project;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  users: User[];
}

const getStatusColor = (status: StoplightStatus) => {
    switch (status) {
        case 'on_track': return 'bg-green-500';
        case 'at_risk': return 'bg-yellow-500';
        case 'blocked': return 'bg-red-500';
        case 'completed': return 'bg-blue-500';
        default: return 'bg-gray-500';
    }
};

const getStatusLabel = (status: StoplightStatus) => {
    switch (status) {
        case 'on_track': return 'On Track';
        case 'at_risk': return 'At Risk';
        case 'blocked': return 'Blocked';
        case 'completed': return 'Completed';
        default: return 'Unknown';
    }
};

const StoplightIndicator: React.FC<{ status: StoplightStatus }> = ({ status }) => (
    <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${getStatusColor(status)} shadow-[0_0_8px_rgba(0,0,0,0.3)]`}></div>
        <span className="text-sm font-medium text-white">{getStatusLabel(status)}</span>
    </div>
);

export const StoplightView: React.FC<StoplightViewProps> = ({ project, setProjects, users }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StoplightItem | null>(null);

  // Form State
  const [workstream, setWorkstream] = useState('');
  const [status, setStatus] = useState<StoplightStatus>('on_track');
  const [ownerId, setOwnerId] = useState('');
  const [notes, setNotes] = useState('');

  const items = project.stoplightItems || [];

  const handleOpenModal = (item?: StoplightItem) => {
      if (item) {
          setEditingItem(item);
          setWorkstream(item.workstream);
          setStatus(item.status);
          setOwnerId(item.ownerId || '');
          setNotes(item.notes);
      } else {
          setEditingItem(null);
          setWorkstream('');
          setStatus('on_track');
          setOwnerId('');
          setNotes('');
      }
      setIsModalOpen(true);
  };

  const handleSave = () => {
      if (!workstream.trim()) return;

      const timestamp = new Date().toISOString();
      
      let updatedItems: StoplightItem[];

      if (editingItem) {
          // Update
          updatedItems = items.map(item => item.id === editingItem.id ? {
              ...item,
              workstream,
              status,
              ownerId: ownerId || undefined,
              notes,
              lastUpdated: timestamp,
              previousStatus: item.status !== status ? item.status : item.previousStatus
          } : item);
      } else {
          // Create
          const newItem: StoplightItem = {
              id: `sl-${Date.now()}`,
              workstream,
              status,
              ownerId: ownerId || undefined,
              notes,
              lastUpdated: timestamp
          };
          updatedItems = [...items, newItem];
      }

      setProjects(prev => prev.map(p => p.id === project.id ? { ...p, stoplightItems: updatedItems } : p));
      setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
      if (confirm('Are you sure you want to remove this item?')) {
           const updatedItems = items.filter(i => i.id !== id);
           setProjects(prev => prev.map(p => p.id === project.id ? { ...p, stoplightItems: updatedItems } : p));
      }
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                    Status Report
                </h2>
                <p className="text-gray-400">Track the health of key project workstreams.</p>
            </div>
            <button 
                onClick={() => handleOpenModal()} 
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-all shadow-lg shadow-blue-900/20"
            >
                <PlusIcon className="w-5 h-5" /> Add Workstream
            </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-black/20 border-b border-white/10 text-xs text-gray-400 uppercase tracking-wider">
                            <th className="p-4 font-semibold">Workstream</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold">Owner</th>
                            <th className="p-4 font-semibold w-1/3">Notes / Updates</th>
                            <th className="p-4 font-semibold">Last Updated</th>
                            <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {items.length > 0 ? items.map(item => {
                            const owner = users.find(u => u.id === item.ownerId);
                            return (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-4">
                                        <div className="font-medium text-white">{item.workstream}</div>
                                    </td>
                                    <td className="p-4">
                                        <StoplightIndicator status={item.status} />
                                        {item.previousStatus && item.previousStatus !== item.status && (
                                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                Was: <div className={`w-2 h-2 rounded-full ${getStatusColor(item.previousStatus)}`}></div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {owner ? (
                                            <div className="flex items-center gap-2">
                                                <img src={owner.avatarUrl} alt={owner.name} className="w-6 h-6 rounded-full" />
                                                <span className="text-sm text-gray-300">{owner.name}</span>
                                            </div>
                                        ) : <span className="text-sm text-gray-500 italic">Unassigned</span>}
                                    </td>
                                    <td className="p-4">
                                        <p className="text-sm text-gray-300 line-clamp-2 group-hover:line-clamp-none transition-all">{item.notes}</p>
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">
                                        {new Date(item.lastUpdated).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenModal(item)} className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white">
                                                <EditIcon className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-md hover:bg-red-500/20 text-gray-400 hover:text-red-400">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <p>No workstreams tracked yet.</p>
                                        <p className="text-sm">Add an item to start reporting status.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        <Modal title={editingItem ? "Edit Status" : "Add Workstream"} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Workstream Name</label>
                    <input 
                        type="text" 
                        value={workstream} 
                        onChange={(e) => setWorkstream(e.target.value)}
                        placeholder="e.g., Backend API, Design System"
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Current Status</label>
                        <select 
                            value={status}
                            onChange={(e) => setStatus(e.target.value as StoplightStatus)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            <option value="on_track">🟢 On Track</option>
                            <option value="at_risk">🟡 At Risk</option>
                            <option value="blocked">🔴 Blocked</option>
                            <option value="completed">🔵 Completed</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Owner</label>
                        <select 
                            value={ownerId}
                            onChange={(e) => setOwnerId(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            <option value="">Unassigned</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Notes / Updates</label>
                    <textarea 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                        placeholder="Describe current progress, blockers, or next steps..."
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                    <button 
                        onClick={handleSave} 
                        disabled={!workstream.trim()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Save Update
                    </button>
                </div>
            </div>
        </Modal>
    </div>
  );
};
