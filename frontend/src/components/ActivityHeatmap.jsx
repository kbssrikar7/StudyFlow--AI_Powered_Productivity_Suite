import { useMemo } from 'react';
import { Activity } from 'lucide-react';

// Generate weeks ONCE at module load - never changes
const WEEKS = (() => {
    const weeks = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    startDate.setHours(0, 0, 0, 0);
    
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const current = new Date(startDate);
    let weekIndex = 0;
    
    while (current <= today) {
        const week = {
            days: [],
            month: null,
            showMonth: false
        };
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(current);
            date.setDate(date.getDate() + i);
            date.setHours(0, 0, 0, 0);
            
            if (date.getDate() <= 7 && i === 0 && weekIndex > 0) {
                week.month = date.toLocaleString('default', { month: 'short' });
                week.showMonth = true;
            }
            
            if (date <= today) {
                week.days.push({
                    date: date.toISOString().split('T')[0],
                    dayOfWeek: date.getDay()
                });
            } else {
                week.days.push(null);
            }
        }
        
        weeks.push(week);
        current.setDate(current.getDate() + 7);
        weekIndex++;
    }
    
    return weeks;
})();

// RED color scheme for Batman theme
const getColorClass = (count) => {
    if (!count || count === 0) return 'heatmap-empty';
    if (count <= 30) return 'heatmap-1';
    if (count <= 60) return 'heatmap-2';
    if (count <= 90) return 'heatmap-3';
    return 'heatmap-4';
};

function ActivityHeatmap({ stats }) {
    const safeStats = stats || { daily_activity: [], current_streak: 0, total_duration: 0 };
    
    const dataMap = useMemo(() => {
        const map = {};
        const activityData = Array.isArray(safeStats.daily_activity) ? safeStats.daily_activity : [];
        activityData.forEach(item => {
            if (item && item.date) {
                map[item.date] = item.totalDuration || 0;
            }
        });
        return map;
    }, [safeStats.daily_activity]);

    const totalMinutes = Math.floor((safeStats.total_duration || 0) / 60);

    return (
        <div className="p-5 bg-[#0a0a0a] border border-white/5">
            <style>{`
                .heatmap-empty { background: #161616; }
                .heatmap-1 { background: #3d1111; }
                .heatmap-2 { background: #6b1c1c; }
                .heatmap-3 { background: #9a2222; }
                .heatmap-4 { background: #CF0A0A; }
            `}</style>
            
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-slate-400">
                    <span className="font-semibold text-white">{totalMinutes}</span> minutes focused in the last year
                </span>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Activity className="w-3 h-3" />
                    <span>Streak: <span className="text-red-500 font-semibold">{safeStats.current_streak || 0}</span> days</span>
                </div>
            </div>

            {/* Heatmap */}
            <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                    {/* Month Labels */}
                    <div className="flex mb-2 ml-8 relative h-4">
                        {WEEKS.map((week, idx) => (
                            week.showMonth && (
                                <span 
                                    key={idx} 
                                    className="text-[10px] text-slate-600 absolute whitespace-nowrap"
                                    style={{ left: idx * 13 }}
                                >
                                    {week.month}
                                </span>
                            )
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="flex">
                        {/* Day Labels */}
                        <div className="flex flex-col gap-[3px] mr-2 text-[10px] text-slate-600 pr-1">
                            <div className="h-[10px]"></div>
                            <div className="h-[10px] flex items-center">Mon</div>
                            <div className="h-[10px]"></div>
                            <div className="h-[10px] flex items-center">Wed</div>
                            <div className="h-[10px]"></div>
                            <div className="h-[10px] flex items-center">Fri</div>
                            <div className="h-[10px]"></div>
                        </div>

                        {/* Weeks */}
                        <div className="flex gap-[3px]">
                            {WEEKS.map((week, weekIdx) => (
                                <div key={weekIdx} className="flex flex-col gap-[3px]">
                                    {week.days.map((day, dayIdx) => {
                                        if (!day) {
                                            return <div key={dayIdx} className="w-[10px] h-[10px]" />;
                                        }
                                        const count = dataMap[day.date] || 0;
                                        return (
                                            <div
                                                key={day.date}
                                                className={`w-[10px] h-[10px] ${getColorClass(count)}`}
                                                title={`${day.date}: ${count} mins`}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-end mt-3 text-[11px] text-slate-600">
                        <span>Less</span>
                        <div className="flex gap-[3px] mx-2">
                            <div className="w-[10px] h-[10px] heatmap-empty"></div>
                            <div className="w-[10px] h-[10px] heatmap-1"></div>
                            <div className="w-[10px] h-[10px] heatmap-2"></div>
                            <div className="w-[10px] h-[10px] heatmap-3"></div>
                            <div className="w-[10px] h-[10px] heatmap-4"></div>
                        </div>
                        <span>More</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ActivityHeatmap;
