import { useEffect, useState } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip } from 'react-tooltip';
import { Flame, Clock, Activity } from 'lucide-react';
import { api } from '../utils/api';

function ActivityHeatmap() {
    const [stats, setStats] = useState({ daily_activity: [], current_streak: 0, total_duration: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.get('/sessions/stats');
                setStats(data);
            } catch (err) {
                console.error('Error fetching stats:', err);
            }
        };
        fetchStats();
    }, []);

    const activityData = Array.isArray(stats?.daily_activity) ? stats.daily_activity : [];
    const heatmapData = activityData.map((item) => ({
        date: item.date,
        count: item.totalDuration,
        sessionCount: item.count,
    }));

    const today = new Date();
    const startDate = new Date();
    startDate.setFullYear(today.getFullYear() - 1);

    return (
        <div className="card p-6 border-white/5">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-white/50 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-white/70" />
                        Activity log
                    </p>
                    <h3 className="text-xl font-semibold text-white mt-1">Focus heatmap</h3>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-4 py-3 rounded-2xl border border-white/10 bg-black/30">
                        <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">Streak</p>
                        <p className="text-xl font-mono text-red-500">{stats.current_streak} <span className="text-xs text-white/50">days</span></p>
                    </div>
                    <div className="px-4 py-3 rounded-2xl border border-white/10 bg-black/30">
                        <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">Total</p>
                        <p className="text-xl font-mono text-white">{Math.floor((stats.total_duration || 0) / 60)} <span className="text-xs text-white/50">mins</span></p>
                    </div>
                </div>
            </div>

            <div className="w-full overflow-x-auto">
                <CalendarHeatmap
                    startDate={startDate}
                    endDate={today}
                    values={heatmapData}
                    classForValue={(value) => {
                        if (!value) return 'color-empty';
                        return `color-scale-${Math.min(Math.ceil(value.count / 30), 4)}`;
                    }}
                    showWeekdayLabels={true}
                    showMonthLabels={true}
                    gutterSize={3}
                    tooltipDataAttrs={value => ({
                        'data-tooltip-id': 'heatmap-tooltip',
                        'data-tooltip-content': `${value.date ? new Date(value.date).toDateString() : ''}: ${value.count || 0} mins | ${value.sessionCount || 0} sessions`,
                    })}
                />
                <Tooltip
                    id="heatmap-tooltip"
                    style={{ backgroundColor: '#0f0f12', color: '#f4f4f5', borderRadius: '6px', fontSize: '12px', padding: '4px 10px', border: '1px solid rgba(255,255,255,0.1)' }}
                />
            </div>

            <div className="flex items-center justify-end mt-4 gap-2 text-[10px] text-white/50">
                <span>Low</span>
                <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-[3px] bg-[#0f0f12] border border-white/5"></div>
                    <div className="w-2.5 h-2.5 rounded-[3px] bg-[#2a0a0a]"></div>
                    <div className="w-2.5 h-2.5 rounded-[3px] bg-[#4a0404]"></div>
                    <div className="w-2.5 h-2.5 rounded-[3px] bg-[#8a0404]"></div>
                    <div className="w-2.5 h-2.5 rounded-[3px] bg-[#CF0A0A]"></div>
                </div>
                <span>High</span>
            </div>

            <style>{`
                .react-calendar-heatmap text {
                    font-size: 10px;
                    fill: #a1a1aa;
                    font-weight: 500;
                }
                .react-calendar-heatmap .color-empty {
                    fill: #0f0f12;
                    rx: 4px;
                }
                .react-calendar-heatmap .color-scale-1 { fill: #2a0a0a; }
                .react-calendar-heatmap .color-scale-2 { fill: #4a0404; }
                .react-calendar-heatmap .color-scale-3 { fill: #8a0404; }
                .react-calendar-heatmap .color-scale-4 { fill: #CF0A0A; }
                
                .react-calendar-heatmap rect {
                    stroke: rgba(255, 255, 255, 0.05);
                    stroke-width: 1px;
                    rx: 4px;
                }
            `}</style>
        </div>
    );
}

export default ActivityHeatmap;
