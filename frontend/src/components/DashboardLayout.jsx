import { useState, lazy, Suspense, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Bot,
    Timer,
    History,
    CheckSquare,
    Code2,
    Settings as SettingsIcon,
    BarChart3,
    LogOut,
    Shield,
    Crosshair,
    Radar,
    Zap
} from 'lucide-react';

const FocusTimer = lazy(() => import('./FocusTimer'));
const ActivityHeatmap = lazy(() => import('./ActivityHeatmap'));
const SessionList = lazy(() => import('./SessionList'));
const TaskBoard = lazy(() => import('./TaskBoard'));
const SnippetManager = lazy(() => import('./SnippetManager'));
const Settings = lazy(() => import('./Settings'));
const StatsDashboard = lazy(() => import('./StatsDashboard'));
const AIAssistant = lazy(() => import('./AIAssistant'));

const BatSignalLoader = () => (
    <div className="flex h-64 items-center justify-center flex-col gap-4">
        <div className="relative">
            <div className="absolute inset-0 bg-red-600/15 blur-2xl rounded-full animate-pulse" 
                 style={{ animationDuration: '2s' }} />
            <img
                src="/bat-logo-circular.png"
                alt="Loading..."
                className="w-16 h-16 relative z-10 opacity-80"
            />
        </div>
        <p className="text-[10px] text-slate-600 uppercase tracking-[0.25em] font-mono">
            Loading...
        </p>
    </div>
);

const tabs = [
    { id: 'plan', label: 'Mission Control', description: 'Metrics & targets', icon: LayoutDashboard },
    { id: 'focus', label: 'Focus Mode', description: 'Deep work timer', icon: Crosshair },
    { id: 'tasks', label: 'Objectives', description: 'Task board', icon: CheckSquare },
    { id: 'review', label: 'Logbook', description: 'Session history', icon: History },
    { id: 'snippets', label: 'Intel', description: 'Code snippets', icon: Code2 },
    { id: 'alfred', label: 'Alfred', description: 'AI Assistant', icon: Bot },
    { id: 'settings', label: 'Settings', description: 'System config', icon: SettingsIcon }
];

const DashboardLayout = () => {
    const [activeTab, setActiveTab] = useState('focus');
    const { user, logout } = useAuth();
    const currentTab = tabs.find(tab => tab.id === activeTab);

    // Keyboard shortcuts for navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Only trigger if not typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            const keyMap = {
                '1': 'plan',
                '2': 'focus',
                '3': 'tasks',
                '4': 'review',
                '5': 'snippets',
                '6': 'alfred',
                '7': 'settings'
            };

            if (keyMap[e.key]) {
                setActiveTab(keyMap[e.key]);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="flex h-screen overflow-hidden bg-[#050505] text-slate-100 font-sans selection:bg-red-900/30 selection:text-red-200">
            {/* Global Background Image */}
            <div className="fixed top-0 right-0 bottom-0 left-72 z-0 pointer-events-none overflow-hidden">
                <img
                    src="/bat-bg-main.webp"
                    alt="Background"
                    className="w-full h-full object-cover opacity-50"
                />
                <img
                    src="/bat-bg-watermark.png"
                    alt="Watermark"
                    className="absolute -bottom-20 -right-20 w-[600px] h-[600px] object-contain opacity-20 rotate-12"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/70 via-[#050505]/50 to-[#050505]/80" />
            </div>

            {/* Sidebar */}
            <aside className="w-72 flex-shrink-0 border-r border-white/5 bg-[#0a0a0a] p-4 flex flex-col relative overflow-hidden z-10">
                {/* Sidebar Background Effects */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,rgba(207,10,10,0.03),transparent_40%)] pointer-events-none" />

                {/* Brand - Clickable to go to Mission Control (Home) */}
                <div className="flex flex-col items-center justify-center mb-4 relative z-10 px-2 pt-1">
                    <button 
                        onClick={() => setActiveTab('plan')}
                        className="relative group cursor-pointer transition-transform hover:scale-105 active:scale-95"
                        title="Go to Mission Control"
                    >
                        <div className="absolute inset-0 bg-red-600/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <img
                            src="/bat-logo-circular.png"
                            alt="Batman Logo - Click to go home"
                            className="w-20 h-20 object-contain relative z-10 opacity-100 drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] group-hover:drop-shadow-[0_0_20px_rgba(207,10,10,0.3)]"
                        />
                    </button>
                    <div className="mt-2 text-center">
                        <h1 className="text-[10px] font-bold tracking-[0.3em] text-white/80 uppercase">StudyFlow</h1>
                        <p className="text-[8px] text-slate-600 tracking-widest mt-0.5">ARKHAM OPS</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 flex flex-col gap-1 overflow-y-auto relative z-10 -mx-2 px-2">
                    {tabs.map((tab, index) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        const shortcutKey = index + 1;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`group flex items-center gap-3 px-3 py-2.5 text-left border transition-all duration-200 ${isActive
                                    ? 'bg-red-600/10 border-red-600/20 text-red-500 shadow-[0_0_20px_rgba(220,38,38,0.1)]'
                                    : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200 hover:border-white/5'
                                    }`}
                                title={`Press ${shortcutKey} to switch`}
                            >
                                <div className="relative">
                                    <Icon
                                        size={18}
                                        className={`transition-transform duration-200 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]' : 'group-hover:scale-110'}`}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                    <span className={`absolute -top-1 -right-1.5 text-[7px] font-mono font-bold ${isActive ? 'text-red-400' : 'text-slate-600 group-hover:text-slate-400'}`}>
                                        {shortcutKey}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <p className={`text-[13px] font-semibold tracking-wide ${isActive ? 'text-red-100' : ''}`}>{tab.label}</p>
                                    <p className={`text-[9px] ${isActive ? 'text-red-500/70' : 'text-slate-600'}`}>{tab.description}</p>
                                </div>
                                {isActive && (
                                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* User Profile */}
                <div className="mt-4 pt-4 border-t border-white/5 relative z-10">
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <div className="w-8 h-8 bg-gradient-to-br from-slate-800 to-black border border-white/10 flex items-center justify-center text-slate-400 shadow-inner">
                            <Shield size={14} />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold text-slate-200 truncate">{user?.full_name || 'Bruce Wayne'}</p>
                            <p className="text-[9px] text-slate-500 truncate font-mono">ID: {user?.email?.split('@')[0].toUpperCase() || 'BW-001'}</p>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 border border-white/5 bg-white/5 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 group"
                    >
                        <LogOut size={12} className="group-hover:-translate-x-1 transition-transform" />
                        Terminate Session
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-transparent relative scroll-smooth z-10">
                {/* Top Bar / Header */}
                <header className="sticky top-0 z-20 bg-[#050505]/95 backdrop-blur-sm border-b border-white/5 px-8 py-5 glow-bar">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-gradient-to-b from-red-600 to-red-900/50" />
                        <div>
                            <p className="text-[9px] uppercase tracking-[0.2em] text-slate-600 font-mono mb-0.5">Active Module</p>
                            <h2 className="text-xl font-bold text-white tracking-tight">{currentTab?.label}</h2>
                        </div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto p-8 space-y-8 pb-20">
                    <Suspense fallback={<BatSignalLoader />}>
                        {activeTab === 'plan' && (
                            <div>
                                <StatsDashboard />
                            </div>
                        )}

                        {activeTab === 'focus' && (
                            <div className="fade-in">
                                <FocusTimer />
                            </div>
                        )}

                        {activeTab === 'review' && (
                            <div className="fade-in">
                                <SessionList />
                            </div>
                        )}

                        {activeTab === 'tasks' && (
                            <div className="fade-in">
                                <TaskBoard />
                            </div>
                        )}

                        {activeTab === 'snippets' && (
                            <div className="fade-in">
                                <SnippetManager />
                            </div>
                        )}

                        {activeTab === 'alfred' && (
                            <div className="fade-in">
                                <AIAssistant />
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="fade-in">
                                <Settings />
                            </div>
                        )}
                    </Suspense>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
