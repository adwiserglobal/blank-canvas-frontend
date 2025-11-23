
import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { User } from '../types';
import { UserIcon, ShieldIcon, PaletteIcon, UploadCloudIcon, CreditCardIcon, BellRingIcon, PlugIcon, CheckCircleIcon, MonitorIcon, SmartphoneIcon, LogOutIcon, PlusIcon, TrashIcon, DownloadIcon, GlobeIcon, ZapIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSave: (user: User) => void;
  currentTheme: string;
  setTheme: (theme: string) => void;
  onLogout?: () => void;
}

type Tab = 'profile' | 'billing' | 'notifications' | 'integrations' | 'security' | 'appearance';

const themes = [
    { id: 'nebula', name: 'Nebula', class: 'bg-gradient-to-br from-purple-500 to-red-500' },
    { id: 'oceanic', name: 'Oceanic', class: 'bg-gradient-to-br from-blue-500 to-teal-500' },
    { id: 'sunset', name: 'Sunset', class: 'bg-gradient-to-br from-orange-500 to-pink-500' },
    { id: 'forest', name: 'Forest', class: 'bg-gradient-to-br from-green-600 to-emerald-800' },
    { id: 'monochrome', name: 'Monochrome', class: 'bg-gradient-to-br from-gray-500 to-gray-800' },
];

// Mock Data for Billing
const invoices = [
    { id: 'inv-001', date: 'Oct 01, 2024', amount: '$24.00', status: 'Paid' },
    { id: 'inv-002', date: 'Sep 01, 2024', amount: '$24.00', status: 'Paid' },
    { id: 'inv-003', date: 'Aug 01, 2024', amount: '$24.00', status: 'Paid' },
];

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ isOpen, onClose, currentUser, onSave, currentTheme, setTheme, onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const { t, language, setLanguage } = useLanguage();
  
  // Profile State
  const [name, setName] = useState(currentUser.name);
  const [role, setRole] = useState(currentUser.role);
  const [avatar, setAvatar] = useState(currentUser.avatarUrl);
  const [bio, setBio] = useState('Product Manager enthusiast. Love building things that matter.');
  const [timezone, setTimezone] = useState('UTC-5 (Eastern Time)');

  // Notification State
  const [notifyEmailTasks, setNotifyEmailTasks] = useState(true);
  const [notifyPushMentions, setNotifyPushMentions] = useState(true);
  const [notifyPushUpdates, setNotifyPushUpdates] = useState(false);

  // Integration State
  const [integrations, setIntegrations] = useState({
      slack: true,
      github: true,
      figma: false,
      drive: false,
  });

  useEffect(() => {
    if (isOpen) {
      setName(currentUser.name);
      setRole(currentUser.role);
      setAvatar(currentUser.avatarUrl);
    }
  }, [isOpen, currentUser]);

  const handleSave = () => {
    onSave({ ...currentUser, name, role, avatarUrl: avatar });
  };
  
  const handleAvatarChange = () => {
      const randomId = Math.floor(Math.random() * 1000);
      setAvatar(`https://i.pravatar.cc/150?u=${randomId}`);
  }
  
  const toggleIntegration = (key: keyof typeof integrations) => {
      setIntegrations(prev => ({ ...prev, [key]: !prev[key] }));
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex items-center gap-6">
                <div className="relative group cursor-pointer" onClick={handleAvatarChange}>
                    <img src={avatar} alt={name} className="w-28 h-28 rounded-full object-cover border-4 border-white/10 shadow-xl"/>
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                        <UploadCloudIcon className="w-8 h-8 text-white"/>
                    </div>
                </div>
                <div className="flex-1">
                    <h3 className="text-3xl font-bold text-white mb-1">{name}</h3>
                    <p className="text-gray-400 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">{role}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-sm">{currentUser.id}@nexus.app</span>
                    </p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Display Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 transition-all" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Role / Title</label>
                    <input type="text" value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 transition-all" />
                </div>
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Bio</label>
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 transition-all" />
                </div>
                 <div>
                     <label className="block text-sm font-medium text-gray-400 mb-2">Timezone</label>
                     <div className="relative">
                         <GlobeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                         <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none">
                             <option>UTC-8 (Pacific Time)</option>
                             <option>UTC-5 (Eastern Time)</option>
                             <option>UTC+0 (GMT)</option>
                             <option>UTC+1 (Central European)</option>
                         </select>
                     </div>
                </div>
            </div>
          </div>
        );

      case 'billing':
        return (
            <div className="space-y-8 animate-in fade-in duration-300">
                {/* Plan Card */}
                <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-white/10 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ZapIcon className="w-32 h-32 text-white" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-1">Current Plan</h4>
                                <h3 className="text-3xl font-bold text-white">Professional Team</h3>
                            </div>
                            <span className="px-3 py-1 bg-white/10 rounded-full text-sm font-medium text-white">$24/mo</span>
                        </div>
                        <div className="w-full bg-black/30 rounded-full h-2 mb-2 overflow-hidden">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                        <div className="flex justify-between text-sm text-gray-400">
                            <span>3 of 5 seats used</span>
                            <button className="text-white hover:underline">Manage seats</button>
                        </div>
                    </div>
                </div>

                {/* Payment Method */}
                <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Payment Method</h4>
                    <div className="flex items-center justify-between p-4 bg-black/20 border border-white/10 rounded-lg">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-white/10 rounded-md">
                                <CreditCardIcon className="w-6 h-6 text-gray-300" />
                            </div>
                            <div>
                                <p className="font-medium text-white">Visa ending in 4242</p>
                                <p className="text-sm text-gray-400">Expiry 12/25</p>
                            </div>
                        </div>
                        <button className="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded transition-colors">{t('common.edit')}</button>
                    </div>
                    <button className="mt-3 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                        <PlusIcon className="w-4 h-4" /> Add new payment method
                    </button>
                </div>

                {/* Invoice History */}
                <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Invoice History</h4>
                    <div className="bg-black/20 border border-white/10 rounded-lg overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-gray-400">
                                <tr>
                                    <th className="p-3 font-medium">Date</th>
                                    <th className="p-3 font-medium">Amount</th>
                                    <th className="p-3 font-medium">Status</th>
                                    <th className="p-3 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {invoices.map(inv => (
                                    <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-3 text-gray-300">{inv.date}</td>
                                        <td className="p-3 text-white font-medium">{inv.amount}</td>
                                        <td className="p-3"><span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs">{inv.status}</span></td>
                                        <td className="p-3 text-right">
                                            <button className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded">
                                                <DownloadIcon className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );

      case 'notifications':
        return (
             <div className="space-y-8 animate-in fade-in duration-300">
                <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg flex gap-3">
                    <BellRingIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h5 className="text-blue-100 font-medium text-sm">Stay Updated</h5>
                        <p className="text-blue-300/70 text-xs mt-1">Manage how and when you receive notifications to keep your workflow uninterrupted.</p>
                    </div>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Email Notifications</h4>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white font-medium">Task Assignments</p>
                                <p className="text-sm text-gray-400">Get emailed when you're assigned a new task.</p>
                            </div>
                            <button 
                                onClick={() => setNotifyEmailTasks(!notifyEmailTasks)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${notifyEmailTasks ? 'bg-blue-600' : 'bg-gray-700'}`}
                            >
                                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${notifyEmailTasks ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="border-t border-white/10 pt-6">
                     <h4 className="text-lg font-semibold text-white mb-4">Push Notifications</h4>
                     <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white font-medium">Mentions & Comments</p>
                                <p className="text-sm text-gray-400">When someone mentions you or replies to your comment.</p>
                            </div>
                             <button 
                                onClick={() => setNotifyPushMentions(!notifyPushMentions)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${notifyPushMentions ? 'bg-blue-600' : 'bg-gray-700'}`}
                            >
                                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${notifyPushMentions ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white font-medium">Project Updates</p>
                                <p className="text-sm text-gray-400">Daily summary of project activity.</p>
                            </div>
                            <button 
                                onClick={() => setNotifyPushUpdates(!notifyPushUpdates)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${notifyPushUpdates ? 'bg-blue-600' : 'bg-gray-700'}`}
                            >
                                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${notifyPushUpdates ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                     </div>
                </div>
             </div>
        );

      case 'integrations':
          const integrationList = [
              { key: 'slack', name: 'Slack', desc: 'Receive notifications in your channels.', icon: 'S' },
              { key: 'github', name: 'GitHub', desc: 'Link commits to tasks.', icon: 'G' },
              { key: 'figma', name: 'Figma', desc: 'Embed designs directly.', icon: 'F' },
              { key: 'drive', name: 'Google Drive', desc: 'Attach files from Drive.', icon: 'D' },
          ];
        return (
             <div className="space-y-6 animate-in fade-in duration-300">
                 <p className="text-gray-400 text-sm">Connect your favorite tools to streamline your workflow.</p>
                 <div className="grid grid-cols-1 gap-4">
                     {integrationList.map((app) => {
                         const isConnected = integrations[app.key as keyof typeof integrations];
                         return (
                             <div key={app.key} className={`p-4 rounded-xl border transition-all flex items-center justify-between ${isConnected ? 'bg-blue-900/10 border-blue-500/30' : 'bg-black/20 border-white/10'}`}>
                                 <div className="flex items-center gap-4">
                                     <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold ${isConnected ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                                         {app.icon}
                                     </div>
                                     <div>
                                         <h4 className="text-white font-medium">{app.name}</h4>
                                         <p className="text-sm text-gray-400">{app.desc}</p>
                                     </div>
                                 </div>
                                 <button 
                                    onClick={() => toggleIntegration(app.key as keyof typeof integrations)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isConnected ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                 >
                                     {isConnected ? 'Disconnect' : 'Connect'}
                                 </button>
                             </div>
                         );
                     })}
                 </div>
             </div>
        );

      case 'security':
        return (
            <div className="space-y-8 animate-in fade-in duration-300">
                <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Password</h4>
                    <div className="grid gap-4">
                        <input type="password" placeholder="Current Password" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="password" placeholder="New Password" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            <input type="password" placeholder="Confirm New Password" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                        </div>
                        <button className="w-fit px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors">Update Password</button>
                    </div>
                </div>
                
                <div className="border-t border-white/10 pt-6">
                     <div className="flex items-center justify-between mb-4">
                        <div>
                            <h4 className="text-lg font-semibold text-white">Two-Factor Authentication</h4>
                            <p className="text-sm text-gray-400">Add an extra layer of security to your account.</p>
                        </div>
                        <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors">Enable 2FA</button>
                     </div>
                </div>

                <div className="border-t border-white/10 pt-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Active Sessions</h4>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5">
                            <div className="flex items-center gap-3">
                                <MonitorIcon className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-white font-medium">MacBook Pro <span className="ml-2 text-green-400 text-xs bg-green-400/10 px-1.5 py-0.5 rounded">Current</span></p>
                                    <p className="text-xs text-gray-500">San Francisco, US • Chrome</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5">
                             <div className="flex items-center gap-3">
                                <SmartphoneIcon className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-white font-medium">iPhone 13</p>
                                    <p className="text-xs text-gray-500">San Francisco, US • App</p>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-red-400"><LogOutIcon className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>

                {onLogout && (
                  <div className="border-t border-white/10 pt-6">
                      <div className="flex items-center justify-between">
                          <div>
                              <h4 className="text-lg font-semibold text-white">Sign Out</h4>
                              <p className="text-sm text-gray-400">Sign out from your account on this device.</p>
                          </div>
                          <button 
                              onClick={() => {
                                  onLogout();
                                  onClose();
                              }}
                              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm transition-colors flex items-center gap-2"
                          >
                              <LogOutIcon className="w-4 h-4" />
                              Sign Out
                          </button>
                      </div>
                  </div>
                )}
            </div>
        );

      case 'appearance':
        return (
            <div className="animate-in fade-in duration-300 space-y-8">
                <div>
                    <h4 className="text-lg font-semibold text-white mb-2">{t('settings.language')}</h4>
                    <p className="text-sm text-gray-400 mb-4">{t('settings.language.desc')}</p>
                    <div className="relative w-full md:w-1/2">
                         <GlobeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                         <select 
                            value={language} 
                            onChange={(e) => setLanguage(e.target.value as any)} 
                            className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
                        >
                             <option value="en">English (US)</option>
                             <option value="pt">Português (BR)</option>
                         </select>
                     </div>
                </div>
                
                <div className="border-t border-white/10 pt-6">
                    <h4 className="text-lg font-semibold text-white mb-2">{t('settings.theme')}</h4>
                    <p className="text-sm text-gray-400 mb-6">{t('settings.theme.desc')}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {themes.map(theme => (
                            <div key={theme.id} className="text-center group">
                                <button 
                                    onClick={() => setTheme(theme.id)}
                                    className={`w-full h-24 rounded-xl ${theme.class} border-4 transition-all duration-200 relative overflow-hidden ${currentTheme === theme.id ? 'border-white shadow-xl scale-105' : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'}`}
                                >
                                    {currentTheme === theme.id && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <CheckCircleIcon className="w-8 h-8 text-white" />
                                        </div>
                                    )}
                                </button>
                                <p className={`mt-3 text-sm font-medium transition-colors ${currentTheme === theme.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>{theme.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
  };
  
  const tabs = [
    { id: 'profile' as Tab, label: t('settings.tabs.profile'), icon: UserIcon },
    { id: 'billing' as Tab, label: t('settings.tabs.billing'), icon: CreditCardIcon },
    { id: 'notifications' as Tab, label: t('settings.tabs.notifications'), icon: BellRingIcon },
    { id: 'integrations' as Tab, label: t('settings.tabs.integrations'), icon: PlugIcon },
    { id: 'security' as Tab, label: t('settings.tabs.security'), icon: ShieldIcon },
    { id: 'appearance' as Tab, label: t('settings.tabs.appearance'), icon: PaletteIcon },
  ];

  return (
    <Modal title={t('settings.title')} isOpen={isOpen} onClose={onClose} size="4xl" bodyClassName="flex flex-col overflow-hidden h-full">
        <div className="flex flex-col md:flex-row h-[650px] bg-[#0F0F12]">
            {/* Sidebar - Fixed */}
            <div className="md:w-64 flex-shrink-0 bg-[#111111] border-r border-white/10 p-4 flex flex-col overflow-y-auto">
                <h2 className="text-xl font-bold text-white px-3 mb-6 mt-2">{t('settings.title')}</h2>
                <nav className="flex-1 space-y-1">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                             <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}/>
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
                <div className="pt-4 border-t border-white/10 mt-4">
                    <div className="px-3 py-2">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Nexus v2.4.0</p>
                        <a href="#" className="text-xs text-blue-400 hover:underline">Help Center</a>
                        <span className="mx-2 text-gray-600">•</span>
                        <a href="#" className="text-xs text-blue-400 hover:underline">Privacy</a>
                    </div>
                </div>
            </div>

            {/* Content Area - Scrollable */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0F0F12] overflow-y-auto custom-scrollbar relative">
                <div className="flex-1 p-8">
                    <div className="max-w-3xl mx-auto">
                         <div className="mb-8 border-b border-white/10 pb-4">
                            <h2 className="text-2xl font-bold text-white">{tabs.find(t => t.id === activeTab)?.label}</h2>
                            <p className="text-gray-400 text-sm mt-1">Manage your {activeTab} settings and preferences.</p>
                         </div>
                        {renderContent()}
                    </div>
                </div>
                
                {/* Footer Actions (Sticky at bottom of content or flowing) */}
                <div className="p-6 border-t border-white/10 bg-[#0F0F12] sticky bottom-0 flex justify-end gap-3 backdrop-blur-sm">
                     <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">{t('settings.cancel')}</button>
                     <button onClick={handleSave} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40">{t('settings.save')}</button>
                </div>
            </div>
        </div>
    </Modal>
  );
};
