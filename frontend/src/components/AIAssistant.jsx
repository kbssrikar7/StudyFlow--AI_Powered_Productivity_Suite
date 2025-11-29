import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    MessageSquare,
    Activity,
    CalendarClock,
    Code2,
    Workflow,
    Sparkles,
    ChevronDown,
    FileCode
} from 'lucide-react';
import { api } from '../utils/api';

const tabDefinitions = [
    { id: 'chat', label: 'Dialogue', icon: MessageSquare },
    { id: 'analyze', label: 'Pattern scan', icon: Activity },
    { id: 'plan', label: 'Study plan', icon: CalendarClock },
    { id: 'code', label: 'Explain code', icon: Code2 },
    { id: 'task', label: 'Task breakdown', icon: Workflow }
];

const LanguageDropdown = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const languages = [
        { value: 'javascript', label: 'JavaScript', icon: 'JS' },
        { value: 'python', label: 'Python', icon: 'PY' }
    ];

    const currentLanguage = languages.find(l => l.value === value) || languages[0];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="bg-black/40 border border-white/10 px-4 py-3 text-white/70 focus:outline-none focus:border-red-600/50 flex items-center gap-3 min-w-[140px] justify-between hover:bg-black/50 transition-all duration-200"
            >
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-white/10 flex items-center justify-center text-xs font-mono font-semibold text-white/90">
                        {currentLanguage.icon}
                    </div>
                    <span className="font-medium">{currentLanguage.label}</span>
                </div>
                <ChevronDown className={`w-4 h-4 opacity-50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 left-0 w-full bg-[#0a0a0a] border border-white/10 overflow-hidden z-[100] shadow-xl transition-all duration-200 ease-out">
                    {languages.map((lang) => (
                        <button
                            key={lang.value}
                            type="button"
                            onClick={() => {
                                onChange(lang.value);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 hover:bg-white/5 text-sm transition-all duration-150 flex items-center gap-3 ${
                                value === lang.value ? 'bg-white/5' : ''
                            }`}
                        >
                            <div className={`w-6 h-6 flex items-center justify-center text-xs font-mono font-semibold ${
                                value === lang.value 
                                    ? 'bg-red-600/20 text-red-400' 
                                    : 'bg-white/10 text-white/70'
                            }`}>
                                {lang.icon}
                            </div>
                            <span className={`${value === lang.value ? 'text-white font-medium' : 'text-white/80'}`}>
                                {lang.label}
                            </span>
                            {value === lang.value && (
                                <FileCode className="w-4 h-4 ml-auto text-red-500" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const AIAssistant = () => {
    const [activeTab, setActiveTab] = useState('chat');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const [chatMessage, setChatMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [goals, setGoals] = useState('');
    const [hours, setHours] = useState(10);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [task, setTask] = useState('');

    const handleChat = async () => {
        if (!chatMessage.trim()) return;
        setLoading(true);
        try {
            const response = await api.get(`/ai/chat?message=${encodeURIComponent(chatMessage)}`);
            setChatHistory((prev) => [
                ...prev,
                { role: 'user', content: chatMessage },
                { role: 'assistant', content: response.response }
            ]);
            setChatMessage('');
        } catch (error) {
            console.error('Chat error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyzePatterns = async () => {
        setLoading(true);
        try {
            const response = await api.post('/ai/analyze-patterns', { limit: 20 });
            setResult(response.analysis);
        } catch (error) {
            console.error('Analysis error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePlan = async () => {
        if (!goals.trim()) return;
        setLoading(true);
        try {
            const response = await api.post('/ai/generate-study-plan', {
                goals,
                available_hours: hours
            });
            setResult(response.plan);
        } catch (error) {
            console.error('Plan generation error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExplainCode = async () => {
        if (!code.trim()) return;
        setLoading(true);
        try {
            const response = await api.post('/ai/explain-code', {
                code,
                language
            });
            setResult(response.explanation);
        } catch (error) {
            console.error('Code explanation error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBreakdownTask = async () => {
        if (!task.trim()) return;
        setLoading(true);
        try {
            const response = await api.post('/ai/break-down-task', { task });
            setResult(response.subtasks.join('\n'));
        } catch (error) {
            console.error('Task breakdown error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMotivation = async () => {
        setLoading(true);
        try {
            const response = await api.post('/ai/motivation', { context: 'general' });
            setResult(response.message);
        } catch (error) {
            console.error('Motivation error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] flex-col border border-white/5 bg-black/40 shadow-xl backdrop-blur-sm">
            <div className="border-b border-white/5 p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Alfred</p>
                        <h2 className="text-2xl font-semibold text-white">Your assistant</h2>
                        <p className="text-sm text-slate-500">Clean responses powered by Groq.</p>
                    </div>
                    <span className="inline-flex items-center gap-2 border border-white/10 px-3 py-1 text-xs text-slate-400">
                        <Sparkles size={12} />
                        Groq API
                    </span>
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto border-b border-white/5 p-4">
                {tabDefinitions.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                setResult(null);
                            }}
                            className={`flex items-center gap-2 px-4 py-2 text-sm transition ${isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'chat' && (
                    <div className="flex h-full flex-col gap-4">
                        <div className="flex-1 space-y-3 border border-white/5 bg-black/30 p-4">
                            {chatHistory.length === 0 ? (
                                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                                    Start a conversation to anchor context.
                                </div>
                            ) : (
                                chatHistory.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div
                                            className={`max-w-[80%] px-4 py-3 text-sm ${msg.role === 'user'
                                                    ? 'bg-white text-slate-900'
                                                    : 'bg-white/5 text-slate-100 border border-white/10'
                                                }`}
                                        >
                                            <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-invert max-w-none text-sm">
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                                placeholder="Ask about algorithms, habits, or architecture"
                                className="input flex-1"
                            />
                            <button
                                onClick={handleChat}
                                disabled={loading || !chatMessage.trim()}
                                className="btn-primary whitespace-nowrap px-6"
                            >
                                {loading ? 'Sending...' : 'Send'}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'analyze' && (
                    <div className="mx-auto max-w-2xl space-y-4">
                        <p className="text-sm text-slate-400 text-center">Surface trends from your most recent focus sessions.</p>
                        <button
                            onClick={handleAnalyzePatterns}
                            disabled={loading}
                            className="btn-primary w-full justify-center"
                        >
                            {loading ? 'Analyzing...' : 'Run pattern analysis'}
                        </button>
                        <button
                            onClick={handleMotivation}
                            disabled={loading}
                            className="btn-secondary w-full justify-center"
                        >
                            {loading ? 'Working...' : 'Send a motivation pulse'}
                        </button>
                    </div>
                )}

                {activeTab === 'plan' && (
                    <div className="mx-auto max-w-2xl space-y-6">
                        <div>
                            <label className="text-sm font-medium text-slate-300">Learning goals</label>
                            <textarea
                                value={goals}
                                onChange={(e) => setGoals(e.target.value)}
                                placeholder="Example: strengthen React, revisit DSA, ship a systems project"
                                className="input mt-2 w-full bg-black/30"
                                rows={3}
                            />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-medium text-slate-300">
                                    Available hours per week
                                </label>
                                <span className="text-xl font-mono font-bold text-red-500 bg-red-500/10 px-3 py-1 border border-red-500/20">{hours}h</span>
                            </div>
                            <div className="relative">
                                {/* Track background */}
                                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 bg-white/5 border border-white/10" />
                                {/* Filled track */}
                                <div 
                                    className="absolute top-1/2 -translate-y-1/2 left-0 h-2 bg-gradient-to-r from-red-900 to-red-600"
                                    style={{ width: `${((hours - 5) / 35) * 100}%` }}
                                />
                                <input
                                    type="range"
                                    min="5"
                                    max="40"
                                    value={hours}
                                    onChange={(e) => setHours(Number(e.target.value))}
                                    className="relative w-full h-2 appearance-none cursor-pointer bg-transparent z-10 slider-red"
                                />
                                <div className="flex justify-between text-[10px] text-slate-500 mt-2 px-1">
                                    <span>5h</span>
                                    <span>20h</span>
                                    <span>40h</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleGeneratePlan}
                            disabled={loading || !goals.trim()}
                            className="btn-primary w-full justify-center"
                        >
                            {loading ? 'Generating...' : 'Generate schedule'}
                        </button>
                    </div>
                )}

                {activeTab === 'code' && (
                    <div className="mx-auto max-w-3xl space-y-6">
                        <div>
                            <label className="text-sm font-medium text-slate-300">Language</label>
                            <div className="mt-2">
                                <LanguageDropdown
                                    value={language}
                                    onChange={(val) => setLanguage(val)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-300">Code snippet</label>
                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Paste or draft the block you want Alfred to explain"
                                className="input mt-2 w-full bg-black/30 font-mono text-sm"
                                rows={8}
                            />
                        </div>
                        <button
                            onClick={handleExplainCode}
                            disabled={loading || !code.trim()}
                            className="btn-primary w-full justify-center"
                        >
                            {loading ? 'Explaining...' : 'Explain this code'}
                        </button>
                    </div>
                )}

                {activeTab === 'task' && (
                    <div className="mx-auto max-w-2xl space-y-6">
                        <div>
                            <label className="text-sm font-medium text-slate-300">Complex initiative</label>
                            <textarea
                                value={task}
                                onChange={(e) => setTask(e.target.value)}
                                placeholder="Example: ship a full-stack billing dashboard with analytics"
                                className="input mt-2 w-full bg-black/30"
                                rows={3}
                            />
                        </div>
                        <button
                            onClick={handleBreakdownTask}
                            disabled={loading || !task.trim()}
                            className="btn-primary w-full justify-center"
                        >
                            {loading ? 'Breaking down...' : 'Produce subtasks'}
                        </button>
                    </div>
                )}

                {result && (
                    <div className="mt-6 space-y-3 border border-white/5 bg-black/30 p-6">
                        <p className="text-sm font-semibold text-white">Assistant output</p>
                        <div className="prose prose-invert max-w-none text-sm text-slate-100">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code({ inline, className, children, ...props }) {
                                        if (inline) {
                                            return (
                                                <code className="bg-white/10 px-1 py-0.5 text-xs" {...props}>
                                                    {children}
                                                </code>
                                            );
                                        }
                                        return (
                                            <div className="border border-white/10 bg-black/60 p-4 font-mono text-xs" {...props}>
                                                <code className={className}>{children}</code>
                                            </div>
                                        );
                                    }
                                }}
                            >
                                {result}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIAssistant;
