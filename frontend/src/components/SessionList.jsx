import { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';
import { api } from '../utils/api';

function SessionList() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const data = await api.get('/sessions/');
                if (Array.isArray(data)) {
                    setSessions(data);
                }
            } catch (err) {
                console.error('Error fetching sessions:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, []);

    const [isLogging, setIsLogging] = useState(false);
    const [newSession, setNewSession] = useState({ title: '', duration: 25, created_at: '' });

    const handleManualLog = async (e) => {
        e.preventDefault();
        try {
            const sessionData = {
                title: newSession.title || 'Manual Session',
                duration: parseInt(newSession.duration) * 60, // Convert to seconds
                completed: true,
                created_at: newSession.created_at ? new Date(newSession.created_at).toISOString() : new Date().toISOString()
            };

            const created = await api.post('/sessions/', sessionData);
            setSessions([created, ...sessions]);
            setIsLogging(false);
            setNewSession({ title: '', duration: 25, created_at: '' });
        } catch (err) {
            console.error('Failed to log session:', err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">Session Log</h2>
                <button
                    onClick={() => setIsLogging(!isLogging)}
                    className="text-xs bg-white/5 hover:bg-white/10 text-white px-3 py-1.5  border border-white/10 transition-colors"
                >
                    {isLogging ? 'Cancel' : 'Log Manual Session'}
                </button>
            </div>

            {isLogging && (
                <form onSubmit={handleManualLog} className="bg-black/40 border border-white/10  p-4 space-y-4 animate-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wider font-medium">Title</label>
                            <input
                                type="text"
                                value={newSession.title}
                                onChange={e => setNewSession({ ...newSession, title: e.target.value })}
                                placeholder="What did you work on?"
                                className="w-full bg-black/50 border border-white/10  px-3 py-2 text-sm text-white focus:border-red-500/50 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wider font-medium">Duration (min)</label>
                            <input
                                type="number"
                                value={newSession.duration}
                                onChange={e => setNewSession({ ...newSession, duration: e.target.value })}
                                className="w-full bg-black/50 border border-white/10  px-3 py-2 text-sm text-white focus:border-red-500/50 outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wider font-medium">Date (Optional)</label>
                            <input
                                type="datetime-local"
                                value={newSession.created_at}
                                onChange={e => setNewSession({ ...newSession, created_at: e.target.value })}
                                className="w-full bg-black/50 border border-white/10  px-3 py-2 text-sm text-white focus:border-red-500/50 outline-none"
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-2  text-sm font-medium transition-colors">
                        Save Session
                    </button>
                </form>
            )}

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-white/5 border border-white/5  animate-pulse"></div>
                    ))}
                </div>
            ) : sessions.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 bg-white/5  border border-white/5 border-dashed">
                    <p className="text-sm">No sessions logged yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sessions.map((session) => (
                        <div key={session.id} className="bg-black/40 border border-white/5  p-4 hover:border-red-600/30 transition-all duration-300">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-sm font-bold text-white mb-1">{session.title || 'Untitled Session'}</h3>
                                    <p className="text-xs text-gray-500 line-clamp-2">{session.description}</p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center space-x-1 text-gray-500 mb-1 justify-end">
                                        <Calendar className="w-3 h-3" />
                                        <span className="text-xs">
                                            {session.created_at ? new Date(session.created_at).toLocaleDateString() : 'No date'}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-1 text-red-500 justify-end">
                                        <Clock className="w-3 h-3" />
                                        <span className="text-xs font-medium">{Math.round(session.duration / 60)}m</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SessionList;
