
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Project, Doc, User, DocPermission, NotificationType, ViewType, Conversation, ChatMessage, Attachment, ProjectFile } from '../types';
import { generateDocumentContent, chatWithDocument } from '../services/geminiService';
import { SparklesIcon, SaveIcon, EditIcon, FileTextIcon, PlusCircleIcon, BoldIcon, ItalicIcon, UnderlineIcon, PaletteIcon, ImageIcon, PrinterIcon, UserPlusIcon, ArrowLeftIcon, FolderIcon, SendIcon, XIcon, FolderPlusIcon, MessageCircleIcon, MessageSquareIcon, ZapIcon, FileIcon, GlobeIcon } from './Icons';
import { Modal } from './Modal';
import { ShareModal } from './ShareModal';
import { useLanguage } from '../contexts/LanguageContext';


const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
};

const EditorToolbar: React.FC<{ onCommand: (cmd: string, val?: any) => void }> = ({ onCommand }) => {
    const colorRef = useRef<HTMLInputElement>(null);
    return (
        <div className="flex items-center gap-2 p-2 border-b border-gray-700/50 bg-gray-800/80 backdrop-blur-md sticky top-0 z-10 no-print flex-wrap shadow-lg">
            <div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg">
                <button onClick={() => onCommand('bold')} className="p-2 rounded hover:bg-gray-700 text-gray-300 hover:text-white transition-colors" title="Bold"><BoldIcon className="w-4 h-4" /></button>
                <button onClick={() => onCommand('italic')} className="p-2 rounded hover:bg-gray-700 text-gray-300 hover:text-white transition-colors" title="Italic"><ItalicIcon className="w-4 h-4" /></button>
                <button onClick={() => onCommand('underline')} className="p-2 rounded hover:bg-gray-700 text-gray-300 hover:text-white transition-colors" title="Underline"><UnderlineIcon className="w-4 h-4" /></button>
            </div>
            
            <div className="w-px h-6 bg-gray-700/50 mx-1"></div>
            
            <div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg">
                <select onChange={(e) => onCommand('fontName', e.target.value)} className="bg-transparent text-gray-300 text-xs font-medium focus:outline-none cursor-pointer hover:text-white">
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Times New Roman">Times</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Courier New">Courier</option>
                </select>
                <div className="w-px h-4 bg-gray-700 mx-1"></div>
                <select onChange={(e) => onCommand('fontSize', e.target.value)} className="bg-transparent text-gray-300 text-xs font-medium focus:outline-none cursor-pointer hover:text-white" defaultValue="3">
                    <option value="1">Small</option>
                    <option value="3">Normal</option>
                    <option value="5">Large</option>
                    <option value="7">Huge</option>
                </select>
            </div>

            <div className="w-px h-6 bg-gray-700/50 mx-1"></div>

            <div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg">
                <button onClick={() => colorRef.current?.click()} className="p-2 rounded hover:bg-gray-700 relative text-gray-300 hover:text-white transition-colors" title="Text Color">
                  <PaletteIcon className="w-4 h-4" />
                  <input type="color" ref={colorRef} onChange={(e) => onCommand('foreColor', e.target.value)} className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"/>
                </button>
                <button onClick={() => {
                    const url = prompt('Enter image URL:');
                    if (url) onCommand('insertImage', url);
                }} className="p-2 rounded hover:bg-gray-700 text-gray-300 hover:text-white transition-colors" title="Insert Image"><ImageIcon className="w-4 h-4" /></button>
            </div>

            <div className="flex-1"></div>

            <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg transition-colors text-sm font-medium" title="Print Document">
                <PrinterIcon className="w-4 h-4" /> Print
            </button>
        </div>
    );
};

interface DocsViewProps {
  project: Project; 
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>; 
  users: User[]; 
  currentUser: User;
  addNotification: (message: string, type: NotificationType, link?: { view: ViewType; projectId: string; itemId: string; }) => void;
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
}

interface AiMessage {
    id: string;
    role: 'user' | 'ai';
    text: string;
    timestamp: Date;
}

type CreateMode = 'hidden' | 'selection' | 'blank' | 'smartpage';

export const DocsView: React.FC<DocsViewProps> = ({ project, setProjects, users, currentUser, addNotification, conversations, setConversations }) => {
  const [activeDoc, setActiveDoc] = useState<Doc | null>(project.docs[0] || null);
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Creation Flow State
  const [createMode, setCreateMode] = useState<CreateMode>('hidden');
  const [newDocTitle, setNewDocTitle] = useState('');
  const [smartPagePrompt, setSmartPagePrompt] = useState('');
  const [smartPageLanguage, setSmartPageLanguage] = useState<'en' | 'pt'>('en');

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // AI Sidebar State
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([
      { id: '1', role: 'ai', text: "Hi! I'm Nexia. I can help you draft, summarize, or refine this document. What do you need?", timestamp: new Date() }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Features Modal State
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isSendToChatModal, setIsSendToChatModal] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const aiScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (aiScrollRef.current) {
        aiScrollRef.current.scrollTop = aiScrollRef.current.scrollHeight;
    }
  }, [aiMessages, isAiSidebarOpen]);

  useEffect(() => {
    // When activeDoc changes, update the content of the editor if it exists
    if (editorRef.current && activeDoc) {
        editorRef.current.innerHTML = activeDoc.content;
    }
    // Automatically exit editing mode when switching docs
    setIsEditing(false);
    // Reset AI chat when switching docs
    setAiMessages([{ id: '1', role: 'ai', text: "Hi! I'm Nexia. I can help you draft, summarize, or refine this document. What do you need?", timestamp: new Date() }]);
  }, [activeDoc]);
  
  const activeDocAuthor = useMemo(() => activeDoc ? users.find(u => u.id === activeDoc.authorId) : null, [activeDoc, users]);

  const canEdit = useMemo(() => {
      if (!activeDoc) return false;
      const userPermission = activeDoc.permissions[currentUser.id];
      return userPermission === 'editor' || activeDoc.authorId === currentUser.id;
  }, [activeDoc, currentUser]);

  const handleSelectDoc = (doc: Doc) => {
    setActiveDoc(doc);
  };
  
  const handleSave = () => {
    if (!activeDoc || !editorRef.current) return;
    
    const updatedDoc = { ...activeDoc, content: editorRef.current.innerHTML, lastUpdated: new Date().toISOString() };
    const updatedDocs = project.docs.map(p => p.id === updatedDoc.id ? updatedDoc : p);
    
    setProjects(prevProjects => prevProjects.map(proj => 
      proj.id === project.id ? { ...proj, docs: updatedDocs } : proj
    ));
    
    setActiveDoc(updatedDoc);
    setIsEditing(false);
  };
  
  const handleToggleEdit = () => {
      if(isEditing && editorRef.current && activeDoc) {
          // If canceling, revert content
          editorRef.current.innerHTML = activeDoc.content;
      }
      setIsEditing(!isEditing);
  }

  const closeCreationModal = () => {
      setCreateMode('hidden');
      setNewDocTitle('');
      setSmartPagePrompt('');
      setIsGenerating(false);
      setSmartPageLanguage('en');
  }

  const handleCreateBlankDoc = () => {
      if (!newDocTitle.trim()) return;
      
      const content = `<h1>${newDocTitle}</h1><p>Start writing your document here.</p>`;
      finalizeDocCreation(newDocTitle, content);
  };

  const handleCreateSmartPage = async () => {
      if (!newDocTitle.trim() || !smartPagePrompt.trim()) return;
      
      setIsGenerating(true);
      try {
          const content = await generateDocumentContent(newDocTitle, false, smartPagePrompt, smartPageLanguage);
          finalizeDocCreation(newDocTitle, content);
      } catch (error) {
          console.error("Failed to create SmartDoc:", error);
          alert("Something went wrong creating your SmartDoc.");
          setIsGenerating(false);
      }
  };

  const finalizeDocCreation = (title: string, content: string) => {
      const newDoc: Doc = {
          id: `doc-${Date.now()}`,
          title: title,
          content: content,
          lastUpdated: new Date().toISOString(),
          authorId: currentUser.id,
          permissions: { [currentUser.id]: 'editor' },
      };

      setProjects(prevProjects => prevProjects.map(proj => 
        proj.id === project.id ? { ...proj, docs: [...proj.docs, newDoc] } : proj
      ));

      setActiveDoc(newDoc);
      closeCreationModal();
      // Auto enter edit mode for new docs
      setTimeout(() => setIsEditing(true), 100);
  }
  
  const handleUpdatePermissions = (docId: string, newPermissions: { [userId: string]: DocPermission }) => {
    const oldDoc = project.docs.find(d => d.id === docId);
    if (!oldDoc) return;

    // Find new users who were given access and are not the current user
    Object.keys(newPermissions).forEach(userId => {
        if (!oldDoc.permissions[userId] && userId !== currentUser.id) {
            addNotification(
                `${currentUser.name} shared the document "${oldDoc.title}" with you.`,
                NotificationType.DOC_SHARED
            );
        }
    });

    const updatedDocs = project.docs.map(doc =>
        doc.id === docId ? { ...doc, permissions: newPermissions } : doc
    );
    setProjects(prevProjects => prevProjects.map(proj => 
      proj.id === project.id ? { ...proj, docs: updatedDocs } : proj
    ));
    if(activeDoc?.id === docId) {
        setActiveDoc(prev => prev ? {...prev, permissions: newPermissions} : null);
    }
  };

  const executeEditorCommand = (command: string, value: any = null) => {
      document.execCommand(command, false, value);
      editorRef.current?.focus();
  };
  
  // --- AI Sidebar Logic ---
  const handleSendAiMessage = async () => {
      if (!aiInput.trim()) return;
      
      const userMsg: AiMessage = { id: Date.now().toString(), role: 'user', text: aiInput, timestamp: new Date() };
      setAiMessages(prev => [...prev, userMsg]);
      setAiInput('');
      setAiLoading(true);

      try {
          // Context is either current editor HTML or saved content
          const context = editorRef.current ? editorRef.current.innerText : activeDoc?.content || '';
          const responseText = await chatWithDocument(context, userMsg.text);
          
          const aiMsg: AiMessage = { id: (Date.now() + 1).toString(), role: 'ai', text: responseText, timestamp: new Date() };
          setAiMessages(prev => [...prev, aiMsg]);
      } catch (error) {
          console.error(error);
          const errorMsg: AiMessage = { id: (Date.now() + 1).toString(), role: 'ai', text: "Sorry, I encountered an error analyzing the document.", timestamp: new Date() };
          setAiMessages(prev => [...prev, errorMsg]);
      } finally {
          setAiLoading(false);
      }
  };

  const handleInsertAiResponse = (text: string) => {
       if (editorRef.current) {
          editorRef.current.focus();
          document.execCommand('insertHTML', false, text);
       }
  };

  // --- Save to Folder Logic ---
  const handleSaveToFolder = (folderId: string) => {
      if (!activeDoc) return;
      
      // Check if already exists
      const folder = project.folders.find(f => f.id === folderId);
      if (folder?.files.some(f => f.nexusDocId === activeDoc.id)) {
          alert("Document is already in this folder.");
          return;
      }

      const newFile: ProjectFile = {
          id: `file-${Date.now()}`,
          name: activeDoc.title,
          type: 'nexus-doc',
          size: 'N/A',
          addedAt: new Date().toISOString(),
          nexusDocId: activeDoc.id
      };

      const updatedFolders = project.folders.map(f => 
          f.id === folderId ? { ...f, files: [...f.files, newFile] } : f
      );

      setProjects(prev => prev.map(p => p.id === project.id ? { ...p, folders: updatedFolders } : p));
      setIsFolderModalOpen(false);
      addNotification(`Saved "${activeDoc.title}" to folder.`, NotificationType.DOC_SHARED);
  };

  // --- Send to Chat Logic ---
  const handleSendToChat = (conversationId: string) => {
      if (!activeDoc) return;

      const attachment: Attachment = {
          name: activeDoc.title,
          type: 'doc', // treating as generic doc for now in chat
          url: '#', // In a real app, this would be a deep link
          size: 0
      };

      const newMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          senderId: currentUser.id,
          content: `I'm sharing this document with you: ${activeDoc.title}`,
          timestamp: new Date().toISOString(),
          attachment: attachment
      };

      setConversations(prev => prev.map(c => 
          c.id === conversationId ? { ...c, messages: [...c.messages, newMessage] } : c
      ));

      setIsSendToChatModal(false);
      alert("Sent to chat!");
  };


  return (
    <>
      <div className="flex h-full gap-6">
        <aside className="w-1/4 max-w-xs flex-shrink-0 bg-white/10 border border-white/10 rounded-xl p-4 flex flex-col no-print">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Docs</h3>
            <button onClick={() => setCreateMode('selection')} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white/10 text-white rounded-md hover:bg-white/20 transition-colors">
              <PlusCircleIcon className="w-4 h-4"/> Add doc
            </button>
          </div>
          <ul className="space-y-1 overflow-y-auto -mr-2 pr-2">
            {project.docs.map(doc => (
              <li key={doc.id}>
                <button 
                  onClick={() => handleSelectDoc(doc)}
                  className={`w-full text-left p-3 rounded-md transition-colors flex items-center gap-3 ${activeDoc?.id === doc.id ? 'bg-black/30 border-l-2 border-blue-500' : 'hover:bg-black/20 border-l-2 border-transparent'}`}
                >
                  <FileTextIcon className={`w-5 h-5 flex-shrink-0 ${activeDoc?.id === doc.id ? 'text-blue-400' : 'text-gray-400'}`} />
                  <div className="flex-1 overflow-hidden">
                      <p className={`font-medium truncate ${activeDoc?.id === doc.id ? 'text-white' : 'text-gray-300'}`}>{doc.title}</p>
                      <p className="text-xs text-gray-500">Updated {formatDate(doc.lastUpdated)}</p>
                  </div>
                </button>
              </li>
            ))}
            {project.docs.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                  <FileTextIcon className="w-12 h-12 mx-auto mb-2"/>
                  <p>No docs yet.</p>
                  <p>Create one to get started!</p>
              </div>
            )}
          </ul>
        </aside>

        <main className="flex-1 bg-[#0F0F12] border border-white/10 rounded-xl flex flex-col overflow-hidden relative">
          {activeDoc ? (
            <>
              <header className="p-4 border-b border-white/10 flex-shrink-0 no-print bg-[#141419]">
                <div className="flex justify-between items-center">
                    <div>
                         <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                             {activeDoc.title}
                             {!isEditing && canEdit && (
                                 <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-white">
                                     <EditIcon className="w-4 h-4" />
                                 </button>
                             )}
                         </h2>
                         <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                              <span>Authored by {activeDocAuthor?.name}</span>
                              <span>•</span>
                              <span>Updated on {formatDate(activeDoc.lastUpdated)}</span>
                        </div>
                    </div>
                  <div className="flex items-center gap-3">
                      {/* Extra Actions: Folder & Chat */}
                      <button onClick={() => setIsFolderModalOpen(true)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-md" title="Save to Folder">
                          <FolderIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => setIsSendToChatModal(true)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-md" title="Send to Chat">
                          <SendIcon className="w-5 h-5" />
                      </button>

                      <div className="w-px h-6 bg-white/10 mx-1"></div>

                      {isEditing && canEdit && (
                          <>
                            <button 
                                onClick={() => setIsAiSidebarOpen(!isAiSidebarOpen)}
                                className={`flex items-center gap-2 px-3 py-1.5 text-sm ${isAiSidebarOpen ? 'bg-purple-600 text-white' : 'bg-gradient-to-r from-purple-900/50 to-blue-900/50 text-gray-200'} rounded-md hover:opacity-90 transition-all`}
                            >
                                <SparklesIcon className="w-4 h-4"/> AI
                            </button>
                            <div className="w-px h-6 bg-white/10 mx-1"></div>
                            <button onClick={handleSave} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                                <SaveIcon className="w-4 h-4"/> Save
                            </button>
                            <button onClick={handleToggleEdit} className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors">
                                Cancel
                            </button>
                          </>
                      )}
                      {!isEditing && (
                          <button onClick={() => setIsShareModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white/10 text-white rounded-md hover:bg-white/20 transition-colors">
                            <UserPlusIcon className="w-4 h-4" /> Share
                          </button>
                      )}
                  </div>
                </div>
              </header>
              
              <div className="flex-1 flex overflow-hidden relative bg-[#0a0a0a]">
                  
                  {/* Editor Area */}
                  <div className="flex-1 flex flex-col overflow-hidden relative">
                      {isEditing && canEdit && <EditorToolbar onCommand={executeEditorCommand} />}
                      
                      <div className="flex-1 overflow-y-auto p-8 pb-64 flex justify-center bg-[#0a0a0a] scrollbar-thin scrollbar-thumb-gray-800">
                          <div 
                            id="printable-area" 
                            className={`
                                w-full max-w-4xl min-h-[1100px] bg-[#141419] shadow-2xl p-12 md:p-16 
                                ${isEditing ? 'outline-none ring-1 ring-blue-500/30' : ''}
                                print:bg-white print:text-black print:shadow-none print:p-0 print:w-full print:max-w-none
                            `}
                            style={{
                                // Simulate Page Breaks visually every ~1050px (approx A4 content area)
                                backgroundImage: 'repeating-linear-gradient(to bottom, #141419, #141419 1050px, #000 1050px, #000 1052px)',
                                backgroundSize: '100% 1052px'
                            }}
                          >
                              <div
                                  ref={editorRef}
                                  contentEditable={isEditing && canEdit}
                                  suppressContentEditableWarning
                                  className="prose prose-invert prose-lg max-w-none focus:outline-none print:prose-black"
                                  dangerouslySetInnerHTML={{ __html: activeDoc.content }}
                                  style={{ minHeight: '100%' }}
                              />
                          </div>
                      </div>
                  </div>

                  {/* AI Sidebar (Right Panel) */}
                  {isAiSidebarOpen && (
                      <div className="w-80 flex-shrink-0 border-l border-white/10 bg-[#141419] flex flex-col shadow-xl animate-in slide-in-from-right duration-300">
                          <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <SparklesIcon className="w-4 h-4 text-purple-400" />
                                    Nexia Assistant
                                </h3>
                                <button onClick={() => setIsAiSidebarOpen(false)} className="text-gray-400 hover:text-white">
                                    <XIcon className="w-4 h-4" />
                                </button>
                          </div>
                          
                          <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={aiScrollRef}>
                                {aiMessages.map(msg => (
                                    <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[90%] rounded-lg p-3 text-sm ${
                                            msg.role === 'user' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-white/10 text-gray-200 border border-white/5'
                                        }`}>
                                            {msg.text}
                                        </div>
                                        {msg.role === 'ai' && (
                                            <button 
                                                onClick={() => handleInsertAiResponse(msg.text)}
                                                className="mt-1 text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                                            >
                                                <ArrowLeftIcon className="w-3 h-3" /> Insert to doc
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {aiLoading && (
                                    <div className="flex items-start">
                                        <div className="bg-white/10 rounded-lg p-3 text-sm text-gray-400 animate-pulse">
                                            Thinking...
                                        </div>
                                    </div>
                                )}
                          </div>

                          <div className="p-4 border-t border-white/10">
                                <div className="relative">
                                    <textarea 
                                        value={aiInput}
                                        onChange={(e) => setAiInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if(e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendAiMessage();
                                            }
                                        }}
                                        placeholder="Ask about this document..."
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-purple-500 focus:outline-none resize-none pr-10"
                                        rows={3}
                                    />
                                    <button 
                                        onClick={handleSendAiMessage}
                                        disabled={aiLoading || !aiInput.trim()}
                                        className="absolute bottom-2 right-2 p-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-md transition-colors disabled:opacity-50 disabled:bg-transparent"
                                    >
                                        <ArrowLeftIcon className="w-4 h-4 rotate-180" />
                                    </button>
                                </div>
                          </div>
                      </div>
                  )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <FileTextIcon className="w-16 h-16 mb-4"/>
                <h2 className="text-2xl font-bold">Select or Create a Document</h2>
                <p>Choose a document from the list or create a new one.</p>
            </div>
          )}
        </main>
      </div>

      {/* Creation Modal Flow */}
      {createMode !== 'hidden' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={closeCreationModal}>
              <div className="w-full max-w-3xl" onClick={e => e.stopPropagation()}>
                  
                  {/* Step 1: Selection */}
                  {createMode === 'selection' && (
                      <div className="bg-[#1E1E24] rounded-2xl p-8 shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200">
                          <h2 className="text-2xl font-bold text-white mb-6 text-center">How would you like to start?</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <button onClick={() => setCreateMode('blank')} className="flex flex-col items-center p-8 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group">
                                  <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                      <FileIcon className="w-8 h-8 text-gray-400" />
                                  </div>
                                  <h3 className="text-lg font-bold text-white">Blank Page</h3>
                                  <p className="text-sm text-gray-400 text-center mt-2">Start fresh with an empty document.</p>
                              </button>

                              <button onClick={() => setCreateMode('smartpage')} className="flex flex-col items-center p-8 rounded-xl bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-purple-500/30 hover:border-purple-500/60 transition-all group relative overflow-hidden">
                                  <div className="absolute inset-0 bg-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-purple-900/50">
                                      <SparklesIcon className="w-8 h-8 text-white animate-pulse" />
                                  </div>
                                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                      SmartDoc <span className="text-[10px] bg-purple-500 text-white px-1.5 py-0.5 rounded-full uppercase font-bold">AI</span>
                                  </h3>
                                  <p className="text-sm text-gray-300 text-center mt-2">Let Nexia build a formatted draft from your idea.</p>
                              </button>
                          </div>
                      </div>
                  )}

                  {/* Step 2: Blank Page */}
                  {createMode === 'blank' && (
                      <div className="bg-[#1E1E24] rounded-xl p-6 shadow-2xl border border-white/10 max-w-md mx-auto animate-in zoom-in-95 duration-200">
                          <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-bold text-white">New Document</h3>
                              <button onClick={closeCreationModal}><XIcon className="w-5 h-5 text-gray-500 hover:text-white" /></button>
                          </div>
                          <input 
                            type="text" 
                            value={newDocTitle} 
                            onChange={e => setNewDocTitle(e.target.value)}
                            placeholder="Document Title" 
                            className="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none mb-6"
                            autoFocus 
                          />
                          <div className="flex justify-end gap-3">
                              <button onClick={() => setCreateMode('selection')} className="text-gray-400 hover:text-white text-sm px-3">Back</button>
                              <button 
                                onClick={handleCreateBlankDoc}
                                disabled={!newDocTitle.trim()}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors"
                              >
                                  Create Doc
                              </button>
                          </div>
                      </div>
                  )}

                  {/* Step 2: SmartDoc (Glassmorphism UI) */}
                  {createMode === 'smartpage' && (
                      <div className="bg-gray-900/80 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden max-w-2xl mx-auto animate-in zoom-in-95 duration-200 relative">
                          {/* Decorative Elements */}
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                          <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px]"></div>
                          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px]"></div>

                          <div className="p-8 relative z-10">
                              <div className="flex items-start gap-4 mb-6">
                                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/30">
                                      <ZapIcon className="w-6 h-6 text-white" />
                                  </div>
                                  <div>
                                      <h2 className="text-2xl font-bold text-white">Create SmartDoc</h2>
                                      <p className="text-gray-400 text-sm">Describe your document, and Nexia will structure it for you.</p>
                                  </div>
                                  <button onClick={closeCreationModal} className="ml-auto text-gray-500 hover:text-white"><XIcon className="w-6 h-6" /></button>
                              </div>

                              <div className="space-y-4">
                                  <div>
                                      <label className="block text-xs font-bold text-purple-300 uppercase mb-1 pl-1">Title</label>
                                      <input 
                                        type="text" 
                                        value={newDocTitle} 
                                        onChange={e => setNewDocTitle(e.target.value)}
                                        placeholder="e.g. Q3 Product Strategy" 
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder:text-gray-600"
                                      />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold text-purple-300 uppercase mb-1 pl-1">What should this doc be about?</label>
                                      <textarea 
                                        value={smartPagePrompt} 
                                        onChange={e => setSmartPagePrompt(e.target.value)}
                                        rows={4}
                                        placeholder="e.g. Create a comprehensive PRD for a new fitness tracking feature, including user stories, technical requirements, and success metrics..." 
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder:text-gray-600 resize-none"
                                      />
                                  </div>
                                  
                                  <div>
                                      <label className="block text-xs font-bold text-purple-300 uppercase mb-2 pl-1">Output Language</label>
                                      <div className="flex gap-4">
                                          <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${smartPageLanguage === 'en' ? 'bg-purple-600/20 border-purple-500 text-white' : 'bg-black/40 border-white/10 text-gray-400 hover:bg-white/5'}`}>
                                              <input type="radio" name="lang" value="en" checked={smartPageLanguage === 'en'} onChange={() => setSmartPageLanguage('en')} className="hidden" />
                                              <GlobeIcon className="w-4 h-4" />
                                              <span className="text-sm font-medium">English</span>
                                          </label>
                                          <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${smartPageLanguage === 'pt' ? 'bg-purple-600/20 border-purple-500 text-white' : 'bg-black/40 border-white/10 text-gray-400 hover:bg-white/5'}`}>
                                              <input type="radio" name="lang" value="pt" checked={smartPageLanguage === 'pt'} onChange={() => setSmartPageLanguage('pt')} className="hidden" />
                                              <GlobeIcon className="w-4 h-4" />
                                              <span className="text-sm font-medium">Português</span>
                                          </label>
                                      </div>
                                  </div>
                              </div>

                              <div className="mt-8 flex items-center justify-between">
                                  <button onClick={() => setCreateMode('selection')} className="text-gray-400 hover:text-white text-sm font-medium px-2">Back</button>
                                  
                                  <button 
                                    onClick={handleCreateSmartPage}
                                    disabled={!newDocTitle.trim() || !smartPagePrompt.trim() || isGenerating}
                                    className="group relative px-6 py-3 bg-white text-black font-bold rounded-xl overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                                  >
                                      <div className="absolute inset-0 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                      <span className="relative z-10 flex items-center gap-2">
                                          {isGenerating ? (
                                              <>
                                                  <SparklesIcon className="w-5 h-5 text-purple-600 animate-spin" />
                                                  Generating Magic...
                                              </>
                                          ) : (
                                              <>
                                                  <SparklesIcon className="w-5 h-5 text-purple-600" />
                                                  Generate SmartDoc
                                              </>
                                          )}
                                      </span>
                                  </button>
                              </div>
                          </div>
                      </div>
                  )}

              </div>
          </div>
      )}

      {/* Share Permission Modal */}
      {activeDoc && (
        <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            doc={activeDoc}
            projectUsers={users}
            onUpdatePermissions={handleUpdatePermissions}
        />
      )}

      {/* Save to Folder Modal */}
      <Modal title="Save to Folder" isOpen={isFolderModalOpen} onClose={() => setIsFolderModalOpen(false)}>
          <div className="space-y-4">
              <p className="text-sm text-gray-400">Choose a folder to save <b>"{activeDoc?.title}"</b> into.</p>
              <div className="max-h-60 overflow-y-auto space-y-2">
                  {project.folders.length > 0 ? project.folders.map(folder => (
                      <button 
                        key={folder.id}
                        onClick={() => handleSaveToFolder(folder.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-left"
                      >
                          <FolderIcon className="w-5 h-5 text-blue-400" />
                          <div className="flex-1">
                              <p className="text-white font-medium">{folder.name}</p>
                              <p className="text-xs text-gray-500">{folder.files.length} items</p>
                          </div>
                          <PlusCircleIcon className="w-5 h-5 text-gray-400" />
                      </button>
                  )) : (
                      <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-700 rounded-lg">
                          No folders available. Create one in the Folders view first.
                      </div>
                  )}
              </div>
              <div className="flex justify-end">
                  <button onClick={() => setIsFolderModalOpen(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
              </div>
          </div>
      </Modal>

      {/* Send to Chat Modal */}
      <Modal title="Send to Chat" isOpen={isSendToChatModal} onClose={() => setIsSendToChatModal(false)}>
          <div className="space-y-4">
               <p className="text-sm text-gray-400">Share <b>"{activeDoc?.title}"</b> with a person or group.</p>
               <div className="max-h-60 overflow-y-auto space-y-2">
                   {conversations.map(conv => {
                       const otherUser = conv.type === 'direct' ? conv.participants.find(p => p.id !== currentUser.id) : null;
                       const name = conv.type === 'group' ? conv.name : otherUser?.name;
                       const icon = conv.type === 'group' ? <MessageSquareIcon className="w-5 h-5 text-purple-400" /> : <img src={otherUser?.avatarUrl} className="w-6 h-6 rounded-full" />;

                       return (
                           <button
                                key={conv.id}
                                onClick={() => handleSendToChat(conv.id)}
                                className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-left"
                           >
                               {icon}
                               <div className="flex-1">
                                   <p className="text-white font-medium">{name}</p>
                                   <p className="text-xs text-gray-500">{conv.type === 'group' ? 'Group Chat' : 'Direct Message'}</p>
                               </div>
                               <SendIcon className="w-4 h-4 text-gray-400" />
                           </button>
                       )
                   })}
               </div>
               <div className="flex justify-end">
                  <button onClick={() => setIsSendToChatModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
              </div>
          </div>
      </Modal>
    </>
  );
};
