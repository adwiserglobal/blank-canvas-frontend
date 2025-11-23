
import React, { useState } from 'react';
import { Modal } from './Modal';
import { Project } from '../types';
import { LinkIcon, MailIcon, CopyIcon, CheckCircleIcon, CheckCheckIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  activeProjectId: string | null;
}

export const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, projects, activeProjectId }) => {
  const { t } = useLanguage();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(activeProjectId || (projects[0]?.id || ''));
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'editor' | 'viewer'>('editor');
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  const handleCopyLink = () => {
    const link = `https://nexus.app/invite/${selectedProjectId}?role=${role}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      // In a real app, this would call an API
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setEmail('');
        onClose();
      }, 2000);
    }
  };

  return (
    <Modal title={t('invite.title')} isOpen={isOpen} onClose={onClose} size="lg">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">{t('invite.select_project')}</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-4">
           <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600/20 rounded-lg text-blue-400">
                      <LinkIcon className="w-6 h-6" />
                  </div>
                  <div>
                      <h4 className="text-white font-medium">{t('invite.link.title')}</h4>
                      <p className="text-sm text-gray-400">{t('invite.link.desc')}</p>
                  </div>
              </div>
              <button 
                onClick={handleCopyLink}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${copied ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                {copied ? <CheckCircleIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                {copied ? t('invite.copied') : t('invite.copy')}
              </button>
           </div>

           <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-700"></div>
                <span className="flex-shrink-0 mx-4 text-gray-500 text-sm">OR</span>
                <div className="flex-grow border-t border-gray-700"></div>
            </div>

           <form onSubmit={handleSendInvite} className="space-y-4">
              <div className="flex gap-4">
                 <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('invite.email')}</label>
                    <div className="relative">
                        <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="colleague@company.com"
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>
                 </div>
                 <div className="w-1/3">
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('invite.role')}</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as 'editor' | 'viewer')}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                    </select>
                 </div>
              </div>
              
              <div className="flex justify-end pt-2">
                  <button 
                    type="submit" 
                    disabled={sent || !email}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white transition-all ${sent ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                      {sent ? <CheckCheckIcon className="w-4 h-4" /> : <MailIcon className="w-4 h-4" />}
                      {sent ? t('invite.sent') : t('invite.send')}
                  </button>
              </div>
           </form>
        </div>
      </div>
    </Modal>
  );
};
