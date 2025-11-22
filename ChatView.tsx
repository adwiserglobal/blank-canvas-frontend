
import React, { useState, useRef, useEffect } from 'react';
import { User, Conversation, ChatMessage, Attachment, Task, ConversationType, PollData, Project, TaskPriority, TaskStatus, NotificationType } from '../types';
import { SearchIcon, PlusCircleIcon, UsersIcon, SendIcon, MessageSquareIcon, PhoneIcon, VideoIcon, InfoIcon, DownloadIcon, ChevronDownIcon, MicrophoneIcon, MicOffIcon, VideoOffIcon, PhoneOffIcon, KanbanIcon, CheckCheckIcon, PlusIcon, StopCircleIcon, FilePdfIcon, XIcon, PlayIcon, PauseIcon, WallpaperIcon, CheckCircleIcon as CheckIconFilled, SmileIcon, ReplyIcon, TrashIcon, ListIcon, BarChartIcon, ClockIcon } from './Icons';
import { CreateGroupModal } from './CreateGroupModal';
import { useLanguage } from '../contexts/LanguageContext';
import { Modal } from './Modal';

const SAMPLE_AUDIO_URL = "https://assets.mixkit.co/active_storage/sfx/2/2-preview.mp3"; // Fallback for old mock messages

// Simplified Emoji List
const COMMON_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "😡", "🎉", "🔥", "👀", "🚀", "💯", "✅", "👋", "✨", "🤔", "🙏", "🤝", "💀", "🤡", "💩"];

// Wallpaper Definitions
const CHAT_WALLPAPERS = [
    { id: 'default', name: 'Default (Glass)', style: { background: 'transparent' }, preview: 'bg-gray-800' },
    { 
        id: 'whatsapp-dark', 
        name: 'Dark Doodles', 
        style: { 
            backgroundColor: '#0b141a',
            backgroundImage: 'url("https://i.pinimg.com/originals/97/c0/07/97c00759d90d786d9b6096d274ad3e07.png")', 
            backgroundSize: '400px',
            backgroundBlendMode: 'soft-light',
            opacity: 0.9
        }, 
        preview: 'bg-[#0b141a]' 
    },
    { 
        id: 'misty-mountains', 
        name: 'Misty Mountains', 
        style: { 
            backgroundImage: 'url("https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }, 
        preview: 'bg-stone-800' 
    },
    { 
        id: 'midnight-city', 
        name: 'Midnight City', 
        style: { 
            backgroundImage: 'url("https://images.unsplash.com/photo-1495430288918-03be19c986b7?w=1200&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        },
        preview: 'bg-black'
    },
    { 
        id: 'abstract-waves', 
        name: 'Abstract Waves', 
        style: { 
            backgroundImage: 'url("https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&q=80")', 
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }, 
        preview: 'bg-purple-900' 
    },
    { 
        id: 'geometric-dark', 
        name: 'Dark Geo', 
        style: { 
            backgroundImage: 'url("https://images.unsplash.com/photo-1550684847-75bdda21cc95?w=1200&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        },
        preview: 'bg-gray-900'
    },
];

const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

const VoiceMessagePlayer: React.FC<{ audioUrl: string, durationLabel: string, isCurrentUser: boolean }> = ({ audioUrl, durationLabel, isCurrentUser }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    
    useEffect(() => {
        if (durationLabel.includes(':')) {
            const [m, s] = durationLabel.replace('Voice Message (', '').replace(')', '').split(':').map(Number);
            if (!isNaN(m) && !isNaN(s)) {
                setDuration(m * 60 + s);
            }
        }
    }, [durationLabel]);

    const togglePlay = () => {
        if (!audioRef.current) {
            const src = audioUrl === '#' ? SAMPLE_AUDIO_URL : audioUrl;
            audioRef.current = new Audio(src);
            
            audioRef.current.addEventListener('loadedmetadata', () => {
                if(audioRef.current && isFinite(audioRef.current.duration)) {
                    setDuration(audioRef.current.duration);
                }
            });

            audioRef.current.addEventListener('timeupdate', () => {
                if(audioRef.current) setCurrentTime(audioRef.current.currentTime);
            });

            audioRef.current.addEventListener('ended', () => {
                setIsPlaying(false);
                setCurrentTime(0);
            });
        }

        if (isPlaying) {
            audioRef.current?.pause();
        } else {
            audioRef.current?.play().catch(e => console.error("Playback failed", e));
        }
        setIsPlaying(!isPlaying);
    };

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);
    
    const [bars] = useState(() => Array.from({ length: 30 }, () => Math.floor(Math.random() * 3) + 1)); 
    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="flex items-center gap-3 min-w-[240px] py-1">
             <button 
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isCurrentUser ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
            >
                {isPlaying ? <PauseIcon className="w-5 h-5 fill-current" /> : <PlayIcon className="w-5 h-5 fill-current ml-0.5" />}
             </button>
             
             <div className="flex-1 flex flex-col gap-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
                 <div className="flex items-center gap-[2px] h-8">
                    {bars.map((height, i) => {
                        const barPos = (i / bars.length) * 100;
                        const isActive = barPos <= progressPercent;
                        
                        return (
                            <div 
                                key={i} 
                                className={`w-1 rounded-full transition-colors duration-100 ${isActive ? (isCurrentUser ? 'bg-white' : 'bg-blue-500') : (isCurrentUser ? 'bg-white/40' : 'bg-gray-400/40')}`}
                                style={{ height: `${height * 25}%` }}
                            />
                        )
                    })}
                 </div>
             </div>
             
             <span className={`text-xs font-medium whitespace-nowrap min-w-[40px] text-right ${isCurrentUser ? 'text-white/80' : 'text-gray-500'}`}>
                 {isPlaying || currentTime > 0
                    ? formatDuration(currentTime)
                    : durationLabel
                 }
             </span>
        </div>
    );
};

const PollMessage: React.FC<{ 
    poll: PollData, 
    messageId: string, 
    currentUser: User,
    onVote: (msgId: string, optionId: string) => void
}> = ({ poll, messageId, currentUser, onVote }) => {
    const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes.length, 0);
    
    return (
        <div className="bg-black/20 rounded-lg p-4 min-w-[250px]">
            <h4 className="font-bold text-white mb-3">{poll.question}</h4>
            <div className="space-y-2">
                {poll.options.map(option => {
                    const voteCount = option.votes.length;
                    const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                    const hasVoted = option.votes.includes(currentUser.id);
                    
                    return (
                        <button 
                            key={option.id} 
                            onClick={() => onVote(messageId, option.id)}
                            className="w-full relative h-10 bg-gray-700/50 rounded-md overflow-hidden group hover:bg-gray-700/70 transition-colors"
                        >
                             {/* Progress Bar */}
                             <div className="absolute left-0 top-0 bottom-0 bg-blue-500/30 transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                             
                             <div className="absolute inset-0 flex items-center justify-between px-3 z-10">
                                 <span className="text-sm text-white font-medium flex items-center gap-2">
                                     {hasVoted && <CheckCheckIcon className="w-4 h-4 text-blue-400" />}
                                     {option.text}
                                 </span>
                                 <span className="text-xs text-gray-300">{percentage}% ({voteCount})</span>
                             </div>
                        </button>
                    );
                })}
            </div>
            <div className="mt-3 text-xs text-gray-400 flex justify-between">
                <span>{totalVotes} votes</span>
                <span>{poll.allowMultiple ? 'Multiple selections allowed' : 'Single choice'}</span>
            </div>
        </div>
    );
};

interface ChatViewProps {
    currentUser: User;
    users: User[];
    conversations: Conversation[];
    setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
    onNavigateToTask: (projectId: string, taskId: string) => void;
    tasks: Task[];
    projects: Project[];
    onAddTask: (task: Task) => void;
    addNotification: (message: string, type: NotificationType) => void;
    initialActiveId?: string;
}

export const ChatView: React.FC<ChatViewProps> = ({
    currentUser,
    users,
    conversations,
    setConversations,
    onNavigateToTask,
    tasks,
    projects,
    onAddTask,
    addNotification,
    initialActiveId
}) => {
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateGroupOpen, setCreateGroupOpen] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [showWallpaperModal, setShowWallpaperModal] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recordingIntervalRef = useRef<any>(null);
    
    const { t } = useLanguage();

    const activeConversation = conversations.find(c => c.id === activeConversationId);

    // Handle Deep Links / Navigation from Notifications
    useEffect(() => {
        if (initialActiveId) {
            setActiveConversationId(initialActiveId);
        }
    }, [initialActiveId]);

    // Handle Default Selection
    useEffect(() => {
        // Only set default if no conversation is selected AND no deep link is forcing a selection
        if (!activeConversationId && !initialActiveId && conversations.length > 0) {
            setActiveConversationId(conversations[0].id);
        }
    }, [conversations, activeConversationId, initialActiveId]);

    useEffect(() => {
        if (activeConversationId) {
             setConversations(prev => prev.map(c => 
                c.id === activeConversationId ? { ...c, unreadCount: 0 } : c
             ));
        }
    }, [activeConversationId]);

    useEffect(() => {
        // Scroll on new messages
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeConversation?.messages]);

    const handleSendMessage = () => {
        if (!messageInput.trim() || !activeConversationId) return;

        const newMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            senderId: currentUser.id,
            content: messageInput,
            timestamp: new Date().toISOString(),
        };

        setConversations(prev => prev.map(c => 
            c.id === activeConversationId ? { ...c, messages: [...c.messages, newMessage] } : c
        ));
        
        setMessageInput('');
        setShowEmojiPicker(false);
    };

    const handleCreateGroup = (name: string, photoUrl: string | undefined, memberIds: string[]) => {
        const members = users.filter(u => memberIds.includes(u.id) || u.id === currentUser.id);
        if (!members.find(u => u.id === currentUser.id)) {
            members.push(currentUser);
        }
        
        const newGroup: Conversation = {
            id: `conv-${Date.now()}`,
            type: ConversationType.GROUP,
            name,
            participants: members,
            messages: [],
            sharedPhotos: photoUrl ? [photoUrl] : [],
            unreadCount: 0
        };
        
        setConversations(prev => [newGroup, ...prev]);
        setCreateGroupOpen(false);
        setActiveConversationId(newGroup.id);
    };
    
    const handleStartRecording = () => {
        setIsRecording(true);
        setRecordingDuration(0);
        recordingIntervalRef.current = setInterval(() => {
            setRecordingDuration(p => p + 1);
        }, 1000);
    };

    const handleStopRecording = () => {
        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
        }
        setIsRecording(false);
        
        if (activeConversationId) {
             const newMessage: ChatMessage = {
                id: `msg-${Date.now()}`,
                senderId: currentUser.id,
                content: '', 
                timestamp: new Date().toISOString(),
                attachment: {
                    name: `Voice Message (${formatDuration(recordingDuration)})`,
                    type: 'audio',
                    url: '#', 
                    size: 0
                }
            };
             setConversations(prev => prev.map(c => 
                c.id === activeConversationId ? { ...c, messages: [...c.messages, newMessage] } : c
            ));
        }
        setRecordingDuration(0);
    };

    const handleVote = (msgId: string, optionId: string) => {
        if (!activeConversationId) return;
        
        setConversations(prev => prev.map(c => {
            if (c.id !== activeConversationId) return c;
            return {
                ...c,
                messages: c.messages.map(m => {
                    if (m.id !== msgId || !m.pollData) return m;
                    
                    const newOptions = m.pollData.options.map(opt => {
                        if (opt.id === optionId) {
                            const hasVoted = opt.votes.includes(currentUser.id);
                            if (hasVoted) return opt;
                            return { ...opt, votes: [...opt.votes, currentUser.id] };
                        } else {
                            if (!m.pollData!.allowMultiple) {
                                return { ...opt, votes: opt.votes.filter(id => id !== currentUser.id) };
                            }
                            return opt;
                        }
                    });
                    
                    return { ...m, pollData: { ...m.pollData, options: newOptions } };
                })
            }
        }));
    };

    const filteredConversations = conversations.filter(c => {
        if (c.type === 'group') {
            return c.name?.toLowerCase().includes(searchQuery.toLowerCase());
        } else {
            const otherUser = c.participants.find(p => p.id !== currentUser.id);
            return otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase());
        }
    });
    
    const activeWallpaper = CHAT_WALLPAPERS.find(w => w.id === activeConversation?.wallpaper) || CHAT_WALLPAPERS[0];

    return (
        <div className="flex h-full bg-transparent gap-6 overflow-hidden">
             {/* Sidebar - Chat List */}
             <aside className="w-80 flex-shrink-0 flex flex-col bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                 <div className="p-4 border-b border-white/10 space-y-4">
                     <div className="flex justify-between items-center">
                         <h2 className="text-xl font-bold text-white">{t('nav.chat')}</h2>
                         <button 
                            onClick={() => setCreateGroupOpen(true)} 
                            className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
                            title={t('chat.create_group')}
                        >
                             <PlusCircleIcon className="w-5 h-5" />
                         </button>
                     </div>
                     <div className="relative">
                         <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                         <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('chat.search')}
                            className="w-full bg-black/20 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                     </div>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-2 space-y-1">
                     {filteredConversations.map(conv => {
                         const otherUser = conv.type === ConversationType.DIRECT ? conv.participants.find(p => p.id !== currentUser.id) : null;
                         const name = conv.type === ConversationType.GROUP ? conv.name : otherUser?.name;
                         const avatar = conv.type === ConversationType.GROUP 
                            ? (conv.sharedPhotos?.[0] || <UsersIcon className="w-5 h-5 text-gray-400" />) 
                            : otherUser?.avatarUrl;
                         const lastMessage = conv.messages[conv.messages.length - 1];
                         const isActive = conv.id === activeConversationId;
                         
                         return (
                             <button 
                                key={conv.id}
                                onClick={() => setActiveConversationId(conv.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${isActive ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-white/5 border border-transparent'}`}
                             >
                                 <div className="relative flex-shrink-0">
                                     {typeof avatar === 'string' ? (
                                         <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover" />
                                     ) : (
                                         <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                                             {avatar}
                                         </div>
                                     )}
                                     {conv.type === 'direct' && otherUser?.isActive && (
                                         <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#1A1A1F] rounded-full"></span>
                                     )}
                                 </div>
                                 <div className="flex-1 text-left min-w-0">
                                     <div className="flex justify-between items-baseline">
                                         <h4 className={`font-semibold truncate ${isActive ? 'text-white' : 'text-gray-200'}`}>{name}</h4>
                                         {lastMessage && <span className="text-xs text-gray-500 flex-shrink-0">{new Date(lastMessage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
                                     </div>
                                     <div className="flex justify-between items-center">
                                        <p className="text-sm text-gray-400 truncate pr-2">
                                            {lastMessage ? (lastMessage.senderId === currentUser.id ? 'You: ' : '') + (lastMessage.content || (lastMessage.attachment ? '📎 Attachment' : '')) : 'No messages yet'}
                                        </p>
                                        {!!conv.unreadCount && conv.unreadCount > 0 && (
                                            <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                     </div>
                                 </div>
                             </button>
                         );
                     })}
                 </div>
             </aside>

             {/* Chat Area */}
             <main className="flex-1 bg-black/20 border border-white/10 rounded-xl overflow-hidden flex flex-col relative">
                {activeConversation ? (
                    <>
                        {/* Wallpaper Layer */}
                        <div className="absolute inset-0 z-0 transition-all duration-500 pointer-events-none" style={activeWallpaper.style} />
                        <div className="absolute inset-0 z-0 bg-black/40 pointer-events-none backdrop-blur-[1px]" />

                        {/* Header */}
                        <header className="relative z-10 p-4 border-b border-white/10 bg-black/40 backdrop-blur-md flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                 {activeConversation.type === 'group' ? (
                                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                         <UsersIcon className="w-5 h-5 text-white" />
                                     </div>
                                 ) : (
                                     <div className="relative">
                                         <img src={activeConversation.participants.find(p => p.id !== currentUser.id)?.avatarUrl} alt="User" className="w-10 h-10 rounded-full" />
                                         {activeConversation.participants.find(p => p.id !== currentUser.id)?.isActive && (
                                             <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-black rounded-full"></span>
                                         )}
                                     </div>
                                 )}
                                 <div>
                                     <h3 className="font-bold text-white">
                                         {activeConversation.type === 'group' ? activeConversation.name : activeConversation.participants.find(p => p.id !== currentUser.id)?.name}
                                     </h3>
                                     <p className="text-xs text-green-400 flex items-center gap-1">
                                         {activeConversation.type === 'direct' && activeConversation.participants.find(p => p.id !== currentUser.id)?.isActive ? t('chat.active_now') : ''}
                                     </p>
                                 </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button onClick={() => setShowWallpaperModal(true)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full" title={t('chat.wallpaper')}>
                                    <WallpaperIcon className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full">
                                    <PhoneIcon className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full">
                                    <VideoIcon className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full">
                                    <InfoIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </header>

                        {/* Messages */}
                        <div className="relative z-10 flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-700">
                            {activeConversation.messages.map((msg, index) => {
                                const isCurrentUser = msg.senderId === currentUser.id;
                                const sender = users.find(u => u.id === msg.senderId);
                                const showAvatar = !isCurrentUser && (index === 0 || activeConversation.messages[index - 1].senderId !== msg.senderId);
                                
                                return (
                                    <div key={msg.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`flex max-w-[70%] gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                            {!isCurrentUser && (
                                                <div className="flex-shrink-0 w-8">
                                                    {showAvatar && <img src={sender?.avatarUrl} alt={sender?.name} className="w-8 h-8 rounded-full" />}
                                                </div>
                                            )}
                                            
                                            <div className={`space-y-1 ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
                                                {/* Name in Group Chat */}
                                                {!isCurrentUser && showAvatar && activeConversation.type === 'group' && (
                                                    <span className="text-xs text-gray-400 ml-1">{sender?.name}</span>
                                                )}
                                                
                                                <div className={`p-3 rounded-2xl text-sm relative group ${
                                                    isCurrentUser 
                                                    ? 'bg-blue-600 text-white rounded-tr-sm' 
                                                    : 'bg-[#2A2A30] text-gray-200 rounded-tl-sm'
                                                } shadow-md`}>
                                                    
                                                    {/* Task Link Attachment */}
                                                    {msg.taskLink && (
                                                        <div 
                                                            onClick={() => onNavigateToTask(msg.taskLink!.projectId, msg.taskLink!.taskId)}
                                                            className={`mb-2 p-3 rounded-lg cursor-pointer flex items-center gap-3 transition-colors ${isCurrentUser ? 'bg-blue-700 hover:bg-blue-800' : 'bg-black/20 hover:bg-black/30'}`}
                                                        >
                                                            <div className="p-2 bg-blue-500/20 rounded-md">
                                                                <KanbanIcon className="w-5 h-5 text-blue-300" />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-xs uppercase opacity-70">Task Shared</p>
                                                                <p className="font-semibold">{msg.taskLink.title}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* File/Media Attachment */}
                                                    {msg.attachment && (
                                                        <div className="mb-2">
                                                            {msg.attachment.type === 'image' ? (
                                                                <img src={msg.attachment.url} alt="Attachment" className="rounded-lg max-w-full max-h-60 object-cover" />
                                                            ) : msg.attachment.type === 'audio' ? (
                                                                <VoiceMessagePlayer audioUrl={msg.attachment.url} durationLabel={msg.attachment.name} isCurrentUser={isCurrentUser} />
                                                            ) : (
                                                                <div className={`flex items-center gap-3 p-2 rounded-lg ${isCurrentUser ? 'bg-white/10' : 'bg-black/20'}`}>
                                                                    <FilePdfIcon className="w-8 h-8 text-red-400" />
                                                                    <div>
                                                                        <p className="font-medium text-xs">{msg.attachment.name}</p>
                                                                        <p className="text-[10px] opacity-70">{msg.attachment.size} KB</p>
                                                                    </div>
                                                                    <button className="p-1 hover:bg-white/10 rounded">
                                                                        <DownloadIcon className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Poll */}
                                                    {msg.pollData && (
                                                        <PollMessage 
                                                            poll={msg.pollData} 
                                                            messageId={msg.id} 
                                                            currentUser={currentUser}
                                                            onVote={handleVote}
                                                        />
                                                    )}
                                                    
                                                    {/* Text Content */}
                                                    {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}

                                                    {/* Timestamp */}
                                                    <span className={`text-[10px] block text-right mt-1 ${isCurrentUser ? 'text-blue-200' : 'text-gray-500'}`}>
                                                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="relative z-10 p-4 bg-black/40 backdrop-blur-md border-t border-white/10">
                             <div className="flex items-end gap-3">
                                 <button 
                                    onClick={() => setCreateGroupOpen(true)} /* Placeholder for attachments menu */
                                    className="p-3 bg-gray-800 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                                >
                                     <PlusIcon className="w-5 h-5" />
                                 </button>
                                 
                                 <div className="flex-1 bg-gray-900/80 border border-gray-700 rounded-2xl flex items-center px-4 min-h-[50px]">
                                     <textarea 
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if(e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        placeholder={isRecording ? t('chat.recording') : t('chat.type_message')}
                                        className="w-full bg-transparent border-none focus:ring-0 text-white resize-none py-3 max-h-32 placeholder-gray-500"
                                        rows={1}
                                        disabled={isRecording}
                                     />
                                     <div className="flex items-center gap-2">
                                          <div className="relative">
                                              <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 text-gray-400 hover:text-yellow-400 transition-colors">
                                                  <SmileIcon className="w-5 h-5" />
                                              </button>
                                              {showEmojiPicker && (
                                                  <div className="absolute bottom-full right-0 mb-2 bg-[#1A1A1F] border border-gray-700 rounded-xl shadow-xl p-3 grid grid-cols-5 gap-2 w-64 z-50">
                                                      {COMMON_EMOJIS.map(emoji => (
                                                          <button 
                                                            key={emoji} 
                                                            onClick={() => {
                                                                setMessageInput(prev => prev + emoji);
                                                                setShowEmojiPicker(false);
                                                            }}
                                                            className="text-xl hover:bg-white/10 p-1 rounded"
                                                          >
                                                              {emoji}
                                                          </button>
                                                      ))}
                                                  </div>
                                              )}
                                          </div>
                                          
                                          <button 
                                              onMouseDown={handleStartRecording}
                                              onMouseUp={handleStopRecording}
                                              className={`p-2 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-white'}`}
                                          >
                                              {isRecording ? <StopCircleIcon className="w-5 h-5" /> : <MicrophoneIcon className="w-5 h-5" />}
                                          </button>
                                     </div>
                                 </div>

                                 <button 
                                    onClick={handleSendMessage}
                                    disabled={!messageInput.trim()}
                                    className="p-3 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:bg-gray-700"
                                >
                                     <SendIcon className="w-5 h-5" />
                                 </button>
                             </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-black/20">
                        <MessageSquareIcon className="w-20 h-20 mb-4 opacity-20" />
                        <h3 className="text-xl font-bold text-gray-300">{t('chat.select_conversation')}</h3>
                        <p>{t('chat.choose_chat')}</p>
                    </div>
                )}
             </main>
             
             <CreateGroupModal 
                isOpen={isCreateGroupOpen} 
                onClose={() => setCreateGroupOpen(false)} 
                onCreate={handleCreateGroup} 
                users={users}
                currentUser={currentUser}
             />

             <Modal title={t('chat.wallpaper')} isOpen={showWallpaperModal} onClose={() => setShowWallpaperModal(false)}>
                 <div className="grid grid-cols-3 gap-4">
                     {CHAT_WALLPAPERS.map(wp => (
                         <button 
                            key={wp.id}
                            onClick={() => {
                                if (activeConversationId) {
                                    setConversations(prev => prev.map(c => c.id === activeConversationId ? { ...c, wallpaper: wp.id } : c));
                                }
                                setShowWallpaperModal(false);
                            }}
                            className={`aspect-video rounded-lg border-2 transition-all overflow-hidden relative ${activeConversation?.wallpaper === wp.id ? 'border-blue-500' : 'border-transparent hover:border-gray-500'}`}
                         >
                             <div className={`w-full h-full ${wp.preview}`} style={wp.id !== 'default' ? { backgroundImage: wp.style.backgroundImage, backgroundSize: 'cover' } : {}}></div>
                             <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1 text-xs text-white text-center truncate">{wp.name}</div>
                         </button>
                     ))}
                 </div>
             </Modal>
        </div>
    );
};
