import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Target, Clock, Trophy, Flame } from 'lucide-react';

import ActivityHeatmap from './ActivityHeatmap';

const StatsDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await api.get('/sessions/stats');
            setStats(data);
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((item) => (
                        <div key={item} className="h-36 rounded-2xl border border-white/5 bg-white/5 animate-pulse" />
                    ))}
                </div>
                <div className="h-64 rounded-2xl border border-white/5 bg-white/5 animate-pulse" />
            </div>
        );
    }

    const statCards = [
        {
            label: 'Sessions completed',
            value: stats?.total_sessions || 0,
            meta: 'Logged focus blocks',
            delta: '+12% vs last week',
            deltaPositive: true,
            icon: <Target size={20} />,
            progress: Math.min(100, (stats?.total_sessions || 0) * 5)
        },
        {
            label: 'Hours recorded',
            value: Math.floor((stats?.total_duration || 0) / 3600),
            meta: 'Deep work time',
            delta: '+8% vs last week',
            deltaPositive: true,
            icon: <Clock size={20} />,
            progress: Math.min(100, ((stats?.total_duration || 0) / 3600) * 3)
        },
        {
            label: 'Completion rate',
            value: `${stats?.completion_rate || 0}%`,
            meta: 'Finished vs planned',
            delta: stats?.completion_rate >= 70 ? 'Healthy' : 'Needs attention',
            deltaPositive: stats?.completion_rate >= 70,
            icon: <Trophy size={20} />,
            progress: Math.min(100, stats?.completion_rate || 0)
        },
        {
            label: 'Active streak',
            value: stats?.current_streak || 0,
            meta: 'Consecutive days',
            delta: stats?.current_streak ? 'In progress' : 'Start today',
            deltaPositive: Boolean(stats?.current_streak),
            icon: <Flame size={20} />,
            progress: Math.min(100, (stats?.current_streak || 0) * 10)
        }
    ];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-white/5 bg-[rgba(10,13,20,0.9)] p-5 backdrop-blur-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">{stat.label}</p>
                                <p className="text-3xl font-semibold text-white">{stat.value}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white">
                                {stat.icon}
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                            <span>{stat.meta}</span>
                            <span className={stat.deltaPositive ? 'text-emerald-400' : 'text-rose-400'}>{stat.delta}</span>
                        </div>
                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-white via-red-400 to-red-600 transition-all duration-700"
                                style={{ width: `${stat.progress}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Activity Heatmap Integration */}
            <div className="rounded-3xl border border-white/5 bg-[rgba(10,13,20,0.5)] p-6 backdrop-blur-lg">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-red-500" />
                    Activity Heatmap
                </h3>
                <ActivityHeatmap />
            </div>
        </div>
    );
};

export default StatsDashboard;
