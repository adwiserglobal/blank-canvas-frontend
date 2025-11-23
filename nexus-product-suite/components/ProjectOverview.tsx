
import React, { useMemo } from 'react';
import { Project, Task, User, TaskStatus } from '../types';
import { TargetIcon, MessageCircleIcon, UsersIcon, BriefcaseIcon, ClockIcon, AlertCircleIcon, CalendarDaysIcon, CheckCircleIcon, BarChartIcon } from './Icons';

interface ProjectOverviewProps {
  project: Project;
  tasks: Task[];
  members: User[];
}

// Helper to determine if a task is done
const isTaskDone = (status: string) => ['Done', 'Completed', 'Finalizado', 'Concluído'].includes(status);

const InfoCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="glass-card bg-[#0a0a0a]/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6 h-full flex flex-col hover:bg-[#0a0a0a]/50 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] transition-all duration-300 group relative overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
        {/* Ambient Hover Glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"></div>
        
        <div className="flex items-center gap-3 mb-3 relative z-10">
            <div className="text-blue-400 group-hover:text-blue-300 transition-colors shadow-blue-900/50 drop-shadow-sm">{icon}</div>
            <h3 className="text-lg font-semibold text-white/90">{title}</h3>
        </div>
        <div className="flex-1 text-sm text-gray-400 group-hover:text-gray-300 whitespace-pre-wrap leading-relaxed overflow-y-auto scrollbar-none relative z-10 transition-colors">
            {children}
        </div>
    </div>
);

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({ project, tasks, members }) => {
    
    // --- Statistics Calculation ---
    const stats = useMemo(() => {
        const totalTasks = tasks.length;
        const doneTasks = tasks.filter(t => isTaskDone(t.status)).length;
        const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

        // Calculate Overdue
        const now = new Date();
        const overdueTasks = tasks.filter(t => {
            if (!t.dueDate || isTaskDone(t.status)) return false;
            return new Date(t.dueDate) < now;
        });

        // Calculate Task Distribution per Column
        const distribution = project.columns.map(col => ({
            id: col.id,
            title: col.title,
            color: col.color,
            count: tasks.filter(t => t.status === col.id).length,
            percentage: totalTasks > 0 ? Math.round((tasks.filter(t => t.status === col.id).length / totalTasks) * 100) : 0
        }));

        // Timeline Math
        const startDate = new Date(project.startDate);
        const endDate = project.endDate ? new Date(project.endDate) : new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000); // Default 90 days
        const totalDuration = endDate.getTime() - startDate.getTime();
        const elapsed = now.getTime() - startDate.getTime();
        
        // Clamp elapsed percentage between 0 and 100
        const timeElapsedPercent = Math.min(Math.max(Math.round((elapsed / totalDuration) * 100), 0), 100);
        
        const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const isOverdueProject = daysLeft < 0;

        // Health Check
        let healthStatus = 'On Track';
        let healthColor = 'text-green-400';
        let healthBg = 'bg-green-500/10 border-green-500/30';
        
        if (timeElapsedPercent > 100 && progress < 100) {
            healthStatus = 'Overdue';
            healthColor = 'text-red-400';
            healthBg = 'bg-red-500/10 border-red-500/30';
        } else if (timeElapsedPercent > progress + 15) {
            healthStatus = 'At Risk';
            healthColor = 'text-orange-400';
            healthBg = 'bg-orange-500/10 border-orange-500/30';
        }

        return {
            totalTasks,
            doneTasks,
            progress,
            overdueTasks,
            distribution,
            startDate,
            endDate,
            timeElapsedPercent,
            daysLeft: isOverdueProject ? 0 : daysLeft,
            isOverdueProject,
            healthStatus,
            healthColor,
            healthBg
        };
    }, [tasks, project]);

    return (
        <div className="space-y-6 pb-10">
            {/* Header & Main Progress Bar - Liquid Glass Effect */}
            <div className="glass-card p-8 rounded-2xl bg-gradient-to-b from-white/10 to-black/20 backdrop-blur-3xl border border-white/10 shadow-2xl relative overflow-hidden group transition-all duration-500 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
                {/* Ambient Glows */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/30 rounded-full blur-[100px] pointer-events-none group-hover:bg-blue-500/40 transition-colors duration-700 z-0 mix-blend-screen"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-600/30 rounded-full blur-[100px] pointer-events-none group-hover:bg-purple-500/40 transition-colors duration-700 z-0 mix-blend-screen"></div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 relative z-10">
                    <div>
                        <h2 className="text-3xl font-bold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] tracking-tight">{project.name}</h2>
                        <p className="text-blue-100/80 text-sm mt-1 font-light leading-relaxed max-w-2xl">{project.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                         <div className={`glass-card px-4 py-2 rounded-xl border backdrop-blur-md flex flex-col items-center min-w-[100px] ${stats.healthBg} transition-all`}>
                            <p className="text-[10px] uppercase tracking-wider font-bold opacity-80 text-white">Health</p>
                            <p className={`font-bold text-lg ${stats.healthColor} drop-shadow-sm`}>{stats.healthStatus}</p>
                        </div>
                        <div className="w-px h-10 bg-white/10 mx-1"></div>
                         <div className="glass-card px-4 py-2 rounded-xl bg-black/20 border border-white/10 backdrop-blur-md flex flex-col items-center min-w-[100px]">
                            <p className="text-[10px] text-gray-300 uppercase tracking-wider font-bold">Days Left</p>
                            <p className="font-bold text-lg text-white">{stats.isOverdueProject ? 'Ends Today' : stats.daysLeft}</p>
                        </div>
                    </div>
                </div>

                <div className="relative pt-4 z-10">
                    <div className="flex justify-between text-sm mb-2 font-medium items-end">
                        <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300 drop-shadow-sm">{stats.progress}%</span>
                        <span className="text-gray-300 bg-black/30 border border-white/5 px-3 py-1 rounded-lg backdrop-blur-md text-xs font-semibold tracking-wide">{stats.doneTasks} / {stats.totalTasks} Tasks Completed</span>
                    </div>
                    
                    {/* Liquid Progress Bar Container */}
                    <div className="w-full h-6 bg-[#0a0a0a]/50 rounded-full p-1 border border-white/5 shadow-inner backdrop-blur-sm relative overflow-hidden">
                         {/* The Liquid Bar */}
                        <div 
                            className="h-full rounded-full bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600 animate-liquid relative shadow-[0_0_25px_rgba(59,130,246,0.5)] transform-gpu"
                            style={{ width: `${stats.progress}%` }}
                        >
                            {/* Shine/Reflection overlay on the bar */}
                            <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-white/50 to-transparent rounded-t-full pointer-events-none"></div>
                            
                            {/* Sparkle particles */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-40 mix-blend-overlay"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Task Status Distribution Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {stats.distribution.map((col) => (
                    <div 
                        key={col.id} 
                        className="glass-card bg-[#0a0a0a]/30 backdrop-blur-xl border border-white/5 rounded-2xl p-5 flex flex-col justify-between hover:bg-[#0a0a0a]/50 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_8px_30px_-5px_rgba(0,0,0,0.5)] transition-all duration-300 cursor-default group relative overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                    >
                        {/* Subtle gradient wash on hover */}
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br ${col.color.replace('border-l-', 'from-').replace('-500', '-500')} to-transparent pointer-events-none`}></div>

                        <div className="flex items-center gap-2 mb-3 relative z-10">
                            <div className={`w-2.5 h-2.5 rounded-full ${col.color.replace('border-l-', 'bg-')} shadow-[0_0_8px_currentColor]`}></div>
                            <span className="text-xs text-gray-300 font-semibold tracking-wide truncate">{col.title}</span>
                        </div>
                        <div className="relative z-10">
                            <span className="text-3xl font-bold text-white drop-shadow-md">{col.count}</span>
                            <div className="w-full bg-gray-700/30 h-1.5 rounded-full mt-3 overflow-hidden">
                                <div 
                                    className={`h-full ${col.color.replace('border-l-', 'bg-')} shadow-[0_0_10px_currentColor] transition-all duration-500 transform-gpu`} 
                                    style={{ width: `${col.percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Split View: Timeline & Overdue */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Timeline (Milestone View) */}
                <div className="glass-card lg:col-span-2 bg-[#0a0a0a]/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6 flex flex-col shadow-lg overflow-hidden relative shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                    
                    <div className="flex items-center gap-2 mb-8 relative z-10">
                        <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                             <CalendarDaysIcon className="w-5 h-5 text-purple-300" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Project Timeline</h3>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center px-4 py-4 relative z-10">
                        <div className="relative h-1.5 bg-gray-800/80 rounded-full">
                             {/* Progress Fill (Time Elapsed) */}
                            <div 
                                className="absolute top-0 left-0 h-full bg-blue-500/50 rounded-full blur-[2px] transition-all duration-1000"
                                style={{ width: `${stats.timeElapsedPercent}%` }}
                            ></div>
                             <div 
                                className="absolute top-0 left-0 h-full bg-blue-400 rounded-full opacity-90 transition-all duration-1000 shadow-[0_0_10px_rgba(96,165,250,0.6)]"
                                style={{ width: `${stats.timeElapsedPercent}%` }}
                            ></div>

                            {/* Start Point */}
                            <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center group z-10 cursor-default">
                                <div className="w-3 h-3 rounded-full bg-[#0a0a0a] border-2 border-gray-500 group-hover:border-white transition-colors"></div>
                                <div className="absolute top-6 w-max text-center opacity-60 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-white/10">
                                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">Start</p>
                                    <p className="text-[10px] text-gray-400">{stats.startDate.toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Current Point (Today) */}
                            <div 
                                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center z-20 transition-all duration-1000"
                                style={{ left: `${stats.timeElapsedPercent}%` }}
                            >
                                {/* Fixed: Removed opaque border, used box-shadow for separation on glass */}
                                <div className="w-5 h-5 rounded-full bg-blue-500 shadow-[0_0_0_4px_rgba(0,0,0,0.3),_0_0_20px_rgba(59,130,246,1)]"></div>
                                <div className="absolute -top-10 bg-blue-600 text-white text-[10px] px-2 py-1 rounded-md font-bold shadow-lg after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-blue-600">
                                    Today
                                </div>
                            </div>

                            {/* End Point */}
                            <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 flex flex-col items-center group z-10 cursor-default">
                                <div className={`w-3 h-3 rounded-full border-2 transition-colors ${stats.progress === 100 ? 'bg-green-500 border-green-400' : 'bg-[#0a0a0a] border-gray-500 group-hover:border-white'}`}></div>
                                <div className="absolute top-6 w-max text-center opacity-60 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-white/10">
                                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">Target</p>
                                    <p className="text-[10px] text-gray-400">{stats.endDate.toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                         {/* Context Bar */}
                        <div className="mt-16 flex items-center justify-between text-xs text-gray-400 bg-[#0a0a0a]/40 p-3 rounded-xl border border-white/5 backdrop-blur-md">
                            <div className="flex items-center gap-2">
                                <ClockIcon className="w-4 h-4 text-gray-500" />
                                <span>Time Elapsed: <strong className="text-white font-mono">{stats.timeElapsedPercent}%</strong></span>
                            </div>
                            <div className="h-4 w-px bg-white/10"></div>
                            <div className="flex items-center gap-2">
                                <BarChartIcon className="w-4 h-4 text-gray-500" />
                                <span>Work Completed: <strong className="text-white font-mono">{stats.progress}%</strong></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Overdue Tasks List */}
                <div className="glass-card bg-[#0a0a0a]/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6 flex flex-col h-full shadow-lg relative overflow-hidden group shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                    {/* Subtle red tint for urgency if overdue tasks exist */}
                    {stats.overdueTasks.length > 0 && (
                        <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/10 rounded-full blur-[80px] pointer-events-none transition-opacity duration-500 group-hover:opacity-50"></div>
                    )}
                    
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                                <AlertCircleIcon className="w-5 h-5 text-red-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Overdue</h3>
                        </div>
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${stats.overdueTasks.length > 0 ? 'bg-red-500/20 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-gray-800 text-gray-500'}`}>
                            {stats.overdueTasks.length}
                        </span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-1 max-h-[250px] space-y-2 scrollbar-thin scrollbar-thumb-gray-700/50 relative z-10">
                        {stats.overdueTasks.length > 0 ? stats.overdueTasks.map(task => {
                            const assignee = members.find(u => u.id === task.assigneeId);
                            return (
                                <div key={task.id} className="bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/5 hover:border-red-500/40 hover:bg-red-500/5 transition-all group/item cursor-pointer">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm text-gray-300 font-medium line-clamp-1 mb-1 group-hover/item:text-white transition-colors">{task.title}</p>
                                        {assignee && (
                                            <img src={assignee.avatarUrl} title={assignee.name} className="w-6 h-6 rounded-full border border-white/10" alt={assignee.name}/>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between text-xs mt-2">
                                        <span className="text-red-300 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/10 flex items-center gap-1">
                                            <ClockIcon className="w-3 h-3" />
                                            {new Date(task.dueDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                        </span>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
                                <CheckCircleIcon className="w-12 h-12 mb-3 text-green-500/30" />
                                <p className="text-sm font-medium">All caught up!</p>
                                <p className="text-xs">No overdue tasks.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Info Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card lg:col-span-1 bg-[#0a0a0a]/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-lg hover:bg-[#0a0a0a]/50 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                    <div className="flex items-center gap-3 mb-4">
                        <UsersIcon className="w-5 h-5 text-blue-400" />
                        <h3 className="text-lg font-semibold text-white">Team Members</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-700/50">
                         {members.map(member => (
                            <div key={member.id} className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-full border border-white/5 hover:border-white/20 hover:bg-white/5 transition-colors cursor-default">
                                <img src={member.avatarUrl} alt={member.name} className="w-6 h-6 rounded-full" />
                                <p className="text-xs font-medium text-white truncate max-w-[100px]">{member.name.split(' ')[0]}</p>
                            </div>
                        ))}
                    </div>
                </div>
                
                <InfoCard icon={<TargetIcon className="w-5 h-5" />} title="KPIs">
                    {project.kpis || "No KPIs defined."}
                </InfoCard>
                <InfoCard icon={<BriefcaseIcon className="w-5 h-5" />} title="SLAs">
                    {project.slas || "No SLAs defined."}
                </InfoCard>
                <InfoCard icon={<MessageCircleIcon className="w-5 h-5" />} title="Onboarding">
                    {project.onboardingMessage || "No onboarding message."}
                </InfoCard>
            </div>
        </div>
    );
};
