
import React, { useState, useMemo } from 'react';
import { Project, ProjectFolder, ProjectFile, FileType, User, Task } from '../types';
import { FolderIcon, FileTextIcon, ImageIcon, VideoIcon, FilePdfIcon, PlusCircleIcon, ArrowLeftIcon, LockIcon, MoreHorizontalIcon, LinkIcon, KanbanIcon } from './Icons';
import { CreateFolderModal } from './CreateFolderModal';
import { AddFileModal } from './AddFileModal';
import { FolderAccessModal } from './FolderAccessModal';
import { Modal } from './Modal';

interface FoldersViewProps {
  project: Project;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  users: User[];
  tasks: Task[]; // Added prop
}

const getFileIcon = (type: FileType) => {
    switch(type) {
        case 'nexus-doc': return <FileTextIcon className="w-5 h-5 text-blue-400" />;
        case 'pdf': return <FilePdfIcon className="w-5 h-5 text-red-400" />;
        case 'image': return <ImageIcon className="w-5 h-5 text-green-400" />;
        case 'video': return <VideoIcon className="w-5 h-5 text-purple-400" />;
        default: return <FileTextIcon className="w-5 h-5 text-gray-400" />;
    }
}

export const FoldersView: React.FC<FoldersViewProps> = ({ project, setProjects, users, tasks }) => {
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [isCreateFolderOpen, setCreateFolderOpen] = useState(false);
    const [isAddFileOpen, setAddFileOpen] = useState(false);
    const [isAccessOpen, setAccessOpen] = useState(false);
    const [activeMenuFileId, setActiveMenuFileId] = useState<string | null>(null);
    const [fileToLink, setFileToLink] = useState<ProjectFile | null>(null);
    
    const selectedFolder = useMemo(() => {
        return project.folders.find(f => f.id === selectedFolderId);
    }, [project.folders, selectedFolderId]);

    const updateProjectFolders = (updatedFolders: ProjectFolder[]) => {
        setProjects(prev => prev.map(p => p.id === project.id ? { ...p, folders: updatedFolders } : p));
    }
    
    const handleCreateFolder = (folderName: string) => {
        const newFolder: ProjectFolder = {
            id: `folder-${Date.now()}`,
            name: folderName,
            files: [],
            permissions: {},
        };
        updateProjectFolders([...project.folders, newFolder]);
        setCreateFolderOpen(false);
    };

    const handleAddFiles = (files: ProjectFile[]) => {
        if (!selectedFolder) return;
        const updatedFolders = project.folders.map(folder => {
            if (folder.id === selectedFolder.id) {
                return { ...folder, files: [...folder.files, ...files] };
            }
            return folder;
        });
        updateProjectFolders(updatedFolders);
        setAddFileOpen(false);
    }
    
    const handleUpdatePermissions = (newPermissions: { [userId: string]: 'editor' | 'viewer' }) => {
        if (!selectedFolder) return;
         const updatedFolders = project.folders.map(folder => {
            if (folder.id === selectedFolder.id) {
                return { ...folder, permissions: newPermissions };
            }
            return folder;
        });
        updateProjectFolders(updatedFolders);
        setAccessOpen(false);
    }

    const handleLinkTask = (task: Task) => {
        if (!selectedFolder || !fileToLink) return;

        const updatedFolders = project.folders.map(folder => {
            if (folder.id === selectedFolder.id) {
                const updatedFiles = folder.files.map(file => {
                    if (file.id === fileToLink.id) {
                        const currentLinks = file.linkedTaskIds || [];
                        if (!currentLinks.includes(task.id)) {
                            return { ...file, linkedTaskIds: [...currentLinks, task.id] };
                        }
                    }
                    return file;
                });
                return { ...folder, files: updatedFiles };
            }
            return folder;
        });

        updateProjectFolders(updatedFolders);
        setFileToLink(null);
    };

    if (selectedFolder) {
        return (
            <div onClick={() => setActiveMenuFileId(null)}>
                 <div className="flex justify-between items-center mb-6">
                    <button onClick={() => setSelectedFolderId(null)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white">
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back to folders
                    </button>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setAccessOpen(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white/10 text-white rounded-md hover:bg-white/20 transition-colors">
                            <LockIcon className="w-4 h-4" /> Manage Access
                        </button>
                         <button onClick={() => setAddFileOpen(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                            <PlusCircleIcon className="w-4 h-4" /> Add File
                        </button>
                    </div>
                </div>
                <h2 className="text-3xl font-bold mb-4">{selectedFolder.name}</h2>
                <div className="bg-white/5 border border-white/10 rounded-lg">
                    <table className="w-full text-left">
                        <thead className="border-b border-white/10 text-xs text-gray-400 uppercase">
                            <tr>
                                <th className="p-3">Name</th>
                                <th className="p-3">Type</th>
                                <th className="p-3">Linked Tasks</th>
                                <th className="p-3">Date Added</th>
                                <th className="p-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                           {selectedFolder.files.map(file => (
                               <tr key={file.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                   <td className="p-3 flex items-center gap-3">
                                       {getFileIcon(file.type)}
                                       {file.name}
                                   </td>
                                   <td className="p-3 text-sm text-gray-300">{file.type}</td>
                                   <td className="p-3 text-sm text-gray-300">
                                       {file.linkedTaskIds && file.linkedTaskIds.length > 0 ? (
                                           <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-xs">
                                               {file.linkedTaskIds.length} Tasks
                                           </span>
                                       ) : <span className="text-gray-600">-</span>}
                                   </td>
                                   <td className="p-3 text-sm text-gray-400">{new Date(file.addedAt).toLocaleDateString()}</td>
                                   <td className="p-3 relative">
                                       <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenuFileId(activeMenuFileId === file.id ? null : file.id);
                                            }}
                                            className="p-1 text-gray-400 hover:text-white rounded-md hover:bg-white/10"
                                        >
                                           <MoreHorizontalIcon className="w-4 h-4" />
                                       </button>
                                       {activeMenuFileId === file.id && (
                                           <div className="absolute right-8 top-2 w-40 bg-[#1A1A1F] border border-white/10 rounded-lg shadow-xl z-10 overflow-hidden">
                                               <button 
                                                    onClick={() => setFileToLink(file)}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
                                                >
                                                   <LinkIcon className="w-3 h-3" /> Link to Task
                                               </button>
                                           </div>
                                       )}
                                   </td>
                               </tr>
                           ))}
                        </tbody>
                    </table>
                    {selectedFolder.files.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <p>This folder is empty.</p>
                        </div>
                    )}
                </div>
                <AddFileModal isOpen={isAddFileOpen} onClose={() => setAddFileOpen(false)} onAddFiles={handleAddFiles} project={project} currentFolder={selectedFolder} />
                <FolderAccessModal isOpen={isAccessOpen} onClose={() => setAccessOpen(false)} folder={selectedFolder} projectUsers={users} onUpdatePermissions={handleUpdatePermissions} />
                
                {/* Link Task Modal */}
                <Modal title="Link File to Task" isOpen={!!fileToLink} onClose={() => setFileToLink(null)} size="lg">
                    <div className="space-y-2 max-h-[400px] overflow-y-auto p-1">
                        <p className="text-sm text-gray-400 mb-4">Select a task to associate with <b>{fileToLink?.name}</b></p>
                        {tasks.map(task => (
                            <button 
                                key={task.id}
                                onClick={() => handleLinkTask(task)}
                                className={`w-full text-left p-3 rounded-lg border transition-colors flex items-center gap-3 ${fileToLink?.linkedTaskIds?.includes(task.id) ? 'bg-blue-900/20 border-blue-500/50 opacity-50 cursor-default' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'}`}
                                disabled={fileToLink?.linkedTaskIds?.includes(task.id)}
                            >
                                <div className={`p-2 rounded ${fileToLink?.linkedTaskIds?.includes(task.id) ? 'bg-blue-500/20' : 'bg-gray-800'}`}>
                                    <KanbanIcon className="w-4 h-4 text-gray-300" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">{task.title}</p>
                                    <p className="text-xs text-gray-500">{task.status}</p>
                                </div>
                                {fileToLink?.linkedTaskIds?.includes(task.id) && <span className="ml-auto text-xs text-blue-400">Linked</span>}
                            </button>
                        ))}
                    </div>
                </Modal>
            </div>
        )
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Folders</h2>
                <button onClick={() => setCreateFolderOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    <PlusCircleIcon className="w-4 h-4" /> Create New Folder
                </button>
            </div>
            {project.folders.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {project.folders.map(folder => {
                        const fileTypes = new Set(folder.files.map(f => f.type));
                        return (
                             <div key={folder.id} onClick={() => setSelectedFolderId(folder.id)} className="bg-white/10 border border-white/10 rounded-lg p-4 cursor-pointer hover:bg-white/20 hover:border-blue-500/50 transition-all group">
                                <FolderIcon className="w-10 h-10 text-blue-400 mb-3" />
                                <h3 className="font-semibold text-white truncate">{folder.name}</h3>
                                <div className="flex justify-between items-center mt-2 text-sm text-gray-400">
                                    <span>{folder.files.length} items</span>
                                    <div className="flex items-center gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                                        {/* FIX: Explicitly defined `type` as FileType to resolve a TypeScript inference issue. */}
                                        {[...fileTypes].map((type: FileType) => (
                                            <span key={type}>{getFileIcon(type)}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                 <div className="flex flex-col items-center justify-center h-64 text-gray-500 border-2 border-dashed border-gray-700 rounded-lg">
                    <FolderIcon className="w-16 h-16 mb-4 text-blue-500/30" />
                    <h2 className="text-xl font-bold">No Folders Yet</h2>
                    <p>Create a folder to start organizing your project files.</p>
                </div>
            )}
            <CreateFolderModal isOpen={isCreateFolderOpen} onClose={() => setCreateFolderOpen(false)} onCreate={handleCreateFolder} />
        </div>
    );
};
