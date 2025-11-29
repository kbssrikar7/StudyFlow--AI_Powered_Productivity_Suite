import { useState, useEffect, useMemo } from 'react';
import { api } from '../utils/api';
import { Target, Clock, Trophy, Flame } from 'lucide-react';

import ActivityHeatmap from './ActivityHeatmap';

// Cache stats globally to prevent refetch on navigation
let cachedStats = null;

const StatsDashboard = () => {
    const [stats, setStats] = useState(cachedStats);

    useEffect(() => {
        // Only fetch if no cached data
        if (cachedStats) return;
        
        let mounted = true;
        const loadStats = async () => {
            try {
                const data = await api.get('/sessions/stats');
                if (mounted) {
                    cachedStats = data;
                    setStats(data);
                }
            } catch (error) {
                console.error('Error loading stats:', error);
            }
        };
        loadStats();
        return () => { mounted = false; };
    }, []);

    // Default empty stats to prevent loading flash
    const safeStats = stats || {
        total_sessions: 0,
        total_duration: 0,
        completion_rate: 0,
        current_streak: 0,
        daily_activity: []
    };

    const statCards = useMemo(() => {
        return [
            {
                label: 'Sessions completed',
                value: safeStats.total_sessions || 0,
                meta: 'Logged focus blocks',
                delta: '+12% vs last week',
                deltaPositive: true,
                icon: <Target size={20} />,
                progress: Math.min(100, (safeStats.total_sessions || 0) * 5)
            },
            {
                label: 'Hours recorded',
                value: Math.floor((safeStats.total_duration || 0) / 3600),
                meta: 'Deep work time',
                delta: '+8% vs last week',
                deltaPositive: true,
                icon: <Clock size={20} />,
                progress: Math.min(100, ((safeStats.total_duration || 0) / 3600) * 3)
            },
            {
                label: 'Completion rate',
                value: `${safeStats.completion_rate || 0}%`,
                meta: 'Finished vs planned',
                delta: safeStats.completion_rate >= 70 ? 'Healthy' : 'Needs attention',
                deltaPositive: safeStats.completion_rate >= 70,
                icon: <Trophy size={20} />,
                progress: Math.min(100, safeStats.completion_rate || 0)
            },
            {
                label: 'Active streak',
                value: safeStats.current_streak || 0,
                meta: 'Consecutive days',
                delta: safeStats.current_streak ? 'In progress' : 'Start today',
                deltaPositive: Boolean(safeStats.current_streak),
                icon: <Flame size={20} />,
                progress: Math.min(100, (safeStats.current_streak || 0) * 10)
            }
        ];
    }, [safeStats]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                    <div key={stat.label} className="border border-white/5 bg-[rgba(10,13,20,0.9)] p-5 backdrop-blur-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">{stat.label}</p>
                                <p className="text-3xl font-semibold text-white">{stat.value}</p>
                            </div>
                            <div className="border border-white/10 bg-white/5 p-3 text-white">
                                {stat.icon}
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                            <span>{stat.meta}</span>
                            <span className={stat.deltaPositive ? 'text-red-400' : 'text-red-600/70'}>{stat.delta}</span>
                        </div>
                        <div className="mt-4 h-1.5 overflow-hidden bg-white/5">
                            <div
                                className="h-full bg-gradient-to-r from-white via-red-400 to-red-600"
                                style={{ width: `${stat.progress}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Activity Heatmap Integration */}
            <div className="border border-white/5 bg-[rgba(10,13,20,0.5)] p-6 backdrop-blur-lg">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-red-500" />
                    Activity Heatmap
                </h3>
                <ActivityHeatmap stats={safeStats} />
            </div>
        </div>
    );
};

export default StatsDashboard;
