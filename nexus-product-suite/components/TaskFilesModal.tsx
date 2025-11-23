
import React, { useMemo } from 'react';
import { Modal } from './Modal';
import { Project, Task, ProjectFile, FileType } from '../types';
import { FileTextIcon, FilePdfIcon, ImageIcon, VideoIcon, UploadCloudIcon, TrashIcon, DownloadIcon } from './Icons';

interface TaskFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  project: Project;
  onUpdateProject: (projectId: string, updates: Partial<Project>) => void;
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

export const TaskFilesModal: React.FC<TaskFilesModalProps> = ({ isOpen, onClose, task, project, onUpdateProject }) => {
  
  // Find the "Task Attachments" folder or create one virtually if it doesn't exist for grouping
  // In this logic, we scan ALL folders for files linked to this task.
  const linkedFiles = useMemo(() => {
      if (!task) return [];
      const allFiles: ProjectFile[] = [];
      project.folders.forEach(folder => {
          folder.files.forEach(file => {
              if (file.linkedTaskIds?.includes(task.id)) {
                  allFiles.push(file);
              }
          });
      });
      return allFiles;
  }, [project, task]);

  const handleUpload = () => {
      if (!task) return;

      // Simulate Upload
      const newFile: ProjectFile = {
          id: `file-${Date.now()}`,
          name: `Upload_${new Date().toLocaleTimeString()}.pdf`,
          type: 'pdf',
          size: '2.5MB',
          addedAt: new Date().toISOString(),
          linkedTaskIds: [task.id]
      };

      // Find or create a default "Attachments" folder
      let attachmentsFolderIndex = project.folders.findIndex(f => f.name === 'Task Attachments');
      let newFolders = [...project.folders];

      if (attachmentsFolderIndex === -1) {
          // Create folder if it doesn't exist
          const newFolder = {
              id: `folder-attachments`,
              name: 'Task Attachments',
              files: [newFile],
              permissions: {}
          };
          newFolders.push(newFolder);
      } else {
          // Add to existing folder
          const folder = newFolders[attachmentsFolderIndex];
          newFolders[attachmentsFolderIndex] = {
              ...folder,
              files: [...folder.files, newFile]
          };
      }

      onUpdateProject(project.id, { folders: newFolders });
  };

  const handleUnlink = (fileId: string) => {
      if (!task) return;
      
      const newFolders = project.folders.map(folder => ({
          ...folder,
          files: folder.files.map(file => {
              if (file.id === fileId && file.linkedTaskIds) {
                  return {
                      ...file,
                      linkedTaskIds: file.linkedTaskIds.filter(id => id !== task.id)
                  };
              }
              return file;
          })
      }));

      onUpdateProject(project.id, { folders: newFolders });
  };

  if (!task) return null;

  return (
    <Modal title={`Files for "${task.title}"`} isOpen={isOpen} onClose={onClose} size="2xl">
        <div className="p-6 space-y-6">
            
            {/* Upload Area */}
            <div 
                onClick={handleUpload}
                className="border-2 border-dashed border-gray-700 bg-white/5 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 hover:border-blue-500/50 transition-all group"
            >
                <div className="p-4 bg-gray-800 rounded-full mb-3 group-hover:scale-110 transition-transform">
                    <UploadCloudIcon className="w-8 h-8 text-gray-400 group-hover:text-blue-400" />
                </div>
                <p className="text-white font-medium">Click to upload documents</p>
                <p className="text-sm text-gray-500">Supported: PDF, Images, Video</p>
            </div>

            {/* File List */}
            <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Attached Files ({linkedFiles.length})</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {linkedFiles.length > 0 ? linkedFiles.map(file => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg hover:border-white/10 transition-colors group">
                            <div className="flex items-center gap-3">
                                {getFileIcon(file.type)}
                                <div>
                                    <p className="text-sm font-medium text-white">{file.name}</p>
                                    <p className="text-xs text-gray-500">{file.size} • {new Date(file.addedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md" title="Download">
                                    <DownloadIcon className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleUnlink(file.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-md" title="Unlink from task">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <p className="text-center text-gray-500 py-4 text-sm">No files attached to this task.</p>
                    )}
                </div>
            </div>
        </div>
    </Modal>
  );
};
