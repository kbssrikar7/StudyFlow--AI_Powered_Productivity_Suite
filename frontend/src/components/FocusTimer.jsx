import { useEffect, useRef } from 'react';
import useTimerStore from '../store/useTimerStore';
import { api } from '../utils/api';
import { toast } from 'sonner';
import AmbiencePlayer from './AmbiencePlayer';

const FocusTimer = ({ onComplete }) => {
    const {
        time,
        duration,
        isRunning,
        sessionId,
        startTimer,
        pauseTimer,
        stopTimer,
        resetTimer,
        setSessionId,
        setDuration
    } = useTimerStore();

    const audioRef = useRef(null);
    const completionHandledRef = useRef(false);

    useEffect(() => {
        audioRef.current = new Audio('/sounds/notification.mp3');
        return () => {
            if (isRunning) pauseTimer();
        };
    }, []);

    useEffect(() => {
        if (time === 0 && !completionHandledRef.current) {
            completionHandledRef.current = true;
            handleTimerComplete();
        } else if (time > 0) {
            completionHandledRef.current = false;
        }
    }, [time]);

    const handleTimerComplete = async () => {
        try {
            if (audioRef.current) {
                audioRef.current.play().catch(err => console.warn('Sound error:', err));
            }

            if (sessionId) {
                await api.put(`/sessions/${sessionId}`, {
                    completed: true,
                    end_time: new Date().toISOString(),
                });
            }

            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Focus Session Complete', {
                    body: 'Great job! Take a break.',
                    icon: '/icon.png',
                });
            }

            toast.success('Session Complete', {
                description: 'Focus session recorded successfully.',
                duration: 5000,
            });

            if (onComplete) onComplete();
        } catch (error) {
            console.error('Error completing session:', error);
            toast.error('Error saving session');
        }
    };

    const handleStart = async () => {
        if (isRunning) return;

        if (!sessionId) {
            try {
                const response = await api.post('/sessions/', {
                    title: "Focus Session",
                    duration: duration * 60
                });
                setSessionId(response.id);
            } catch (err) {
                console.error("Failed to create session", err);
                toast.error("Failed to start session");
            }
        }
        startTimer();
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const totalSeconds = duration * 60;
    const percentage = ((totalSeconds - time) / totalSeconds) * 100;
    const radius = 112;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="card p-6 flex flex-col items-center justify-center min-h-[360px] bg-black/30 backdrop-blur-sm border border-white/5 rounded-3xl">
            {/* Header */}
            <div className="flex items-center justify-between w-full mb-8">
                <h3 className="text-xl font-bold text-white tracking-tight">Focus Timer</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${isRunning
                    ? 'bg-red-500/10 text-red-500 border-red-500/20'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}>
                    {isRunning ? 'ACTIVE' : 'READY'}
                </span>
            </div>

            {/* Circular Timer */}
            <div className="relative w-64 h-64 mb-6">
                {/* Outer glow ring */}
                <div className={`absolute inset-0 rounded-full transition-opacity duration-1000 ${isRunning ? 'bg-red-600/10 blur-3xl opacity-100' : 'opacity-0'
                    }`}></div>

                <svg className="transform -rotate-90 w-full h-full relative z-10">
                    {/* Background track */}
                    <circle
                        cx="128"
                        cy="128"
                        r={radius}
                        stroke="#1a1a1a"
                        strokeWidth="8"
                        fill="none"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="128"
                        cy="128"
                        r={radius}
                        stroke="url(#timerGradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-linear"
                        style={{ filter: isRunning ? 'drop-shadow(0 0 8px rgba(207, 10, 10, 0.5))' : 'none' }}
                    />
                    <defs>
                        <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#CF0A0A" />
                            <stop offset="100%" stopColor="#8a0404" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-5xl font-bold text-white mb-1 tracking-tighter font-mono">
                        {formatTime(time)}
                    </div>
                    <div className="text-xs text-zinc-500 font-medium tracking-widest uppercase">
                        {isRunning ? 'Focusing' : 'Set Duration'}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4 mb-8 w-full">
                {!isRunning ? (
                    <button onClick={handleStart} className="btn-primary w-32">
                        Start
                    </button>
                ) : (
                    <button onClick={pauseTimer} className="btn-secondary w-32">
                        Pause
                    </button>
                )}

                <button onClick={stopTimer} className="btn-secondary w-32">
                    Stop
                </button>

                <button onClick={resetTimer} className="btn-ghost">
                    Reset
                </button>
            </div>

            {/* Presets */}
            <div className="w-full border-t border-arkham-border pt-6">
                <div className="flex justify-between gap-2">
                    {[5, 15, 25, 45, 60].map((mins) => (
                        <button
                            key={mins}
                            onClick={() => setDuration(mins)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${duration === mins
                                ? 'bg-red-600 text-white font-bold'
                                : 'bg-arkham-light text-zinc-400 hover:text-white hover:bg-zinc-700'
                                }`}
                        >
                            {mins}m
                        </button>
                    ))}
                </div>
            </div>

            {/* Ambience Player Integration */}
            <div className="mt-6 w-full flex justify-center">
                <AmbiencePlayer />
            </div>
        </div>
    );
};

export default FocusTimer;
