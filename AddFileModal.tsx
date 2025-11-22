import React, { useState, useMemo } from 'react';
import { Modal } from './Modal';
import { Project, ProjectFile, ProjectFolder } from '../types';
import { FileTextIcon, UploadCloudIcon } from './Icons';

interface AddFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFiles: (files: ProjectFile[]) => void;
  project: Project;
  currentFolder: ProjectFolder;
}

type Tab = 'nexus' | 'upload';

export const AddFileModal: React.FC<AddFileModalProps> = ({ isOpen, onClose, onAddFiles, project, currentFolder }) => {
  const [activeTab, setActiveTab] = useState<Tab>('nexus');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  
  const availableDocs = useMemo(() => {
    const filesInFolder = new Set(currentFolder.files.map(f => f.nexusDocId));
    return project.docs.filter(doc => !filesInFolder.has(doc.id));
  }, [project.docs, currentFolder.files]);

  const handleToggleDoc = (docId: string) => {
    setSelectedDocIds(prev => prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]);
  }
  
  const handleAddNexusDocs = () => {
    const newFiles: ProjectFile[] = selectedDocIds.map(docId => {
        const doc = project.docs.find(d => d.id === docId)!;
        return {
            id: `file-${Date.now()}-${docId}`,
            name: doc.title,
            type: 'nexus-doc',
            size: 'N/A',
            addedAt: new Date().toISOString(),
            nexusDocId: docId,
        };
    });
    onAddFiles(newFiles);
    setSelectedDocIds([]);
  }

  const handleSimulatedUpload = () => {
      // Simulate uploading a couple of files
      const newFiles: ProjectFile[] = [
          { id: `file-${Date.now()}-pdf`, name: 'Competitor Analysis.pdf', type: 'pdf', size: '3.4MB', addedAt: new Date().toISOString() },
          { id: `file-${Date.now()}-img`, name: 'User Persona.png', type: 'image', size: '1.2MB', addedAt: new Date().toISOString() },
      ];
      onAddFiles(newFiles);
  }

  return (
    <Modal title="Add File to Folder" isOpen={isOpen} onClose={onClose}>
      <div className="flex border-b border-white/10 mb-4">
        <button onClick={() => setActiveTab('nexus')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'nexus' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400'}`}>From Nexus Docs</button>
        <button onClick={() => setActiveTab('upload')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'upload' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400'}`}>Upload</button>
      </div>

      {activeTab === 'nexus' && (
        <div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                {availableDocs.map(doc => (
                    <div key={doc.id} className={`flex items-center p-2 rounded-md border ${selectedDocIds.includes(doc.id) ? 'bg-blue-900/50 border-blue-700' : 'bg-white/5 border-transparent'}`}>
                        <input type="checkbox" checked={selectedDocIds.includes(doc.id)} onChange={() => handleToggleDoc(doc.id)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500" />
                        <FileTextIcon className="w-5 h-5 mx-3 text-gray-400"/>
                        <span className="text-sm">{doc.title}</span>
                    </div>
                ))}
                {availableDocs.length === 0 && <p className="text-sm text-gray-500 text-center py-8">All project docs are already in this folder.</p>}
            </div>
            <div className="flex justify-end mt-4">
                <button onClick={handleAddNexusDocs} disabled={selectedDocIds.length === 0} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium text-white transition-colors disabled:opacity-50">Attach Selected ({selectedDocIds.length})</button>
            </div>
        </div>
      )}

      {activeTab === 'upload' && (
          <div>
              <div onClick={handleSimulatedUpload} className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-600 rounded-lg text-center cursor-pointer hover:border-blue-500 hover:bg-white/5 transition-colors">
                  <UploadCloudIcon className="w-10 h-10 text-gray-500 mb-2"/>
                  <p className="font-semibold">Click to upload (simulated)</p>
                  <p className="text-xs text-gray-400">or drag and drop PDF, PNG, MP4</p>
              </div>
               <p className="text-xs text-gray-500 mt-2 text-center">Note: This is a simulated upload for demonstration purposes.</p>
          </div>
      )}

    </Modal>
  );
};
