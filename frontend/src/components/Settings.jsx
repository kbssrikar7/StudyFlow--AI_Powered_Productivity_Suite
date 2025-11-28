import { useState } from 'react';
import { Save, User, Bell, Moon } from 'lucide-react';
import { toast } from 'sonner';

function Settings() {
    const [name, setName] = useState('User');
    const [notifications, setNotifications] = useState(Notification.permission === 'granted');

    const handleNotificationToggle = async () => {
        if (!notifications) {
            // Turning on
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    setNotifications(true);
                    toast.success('Notifications Enabled', {
                        description: 'You will now receive updates for your sessions.'
                    });
                    new Notification('Notifications Enabled', {
                        body: 'You will now receive updates for your sessions.',
                        icon: '/icon.png'
                    });
                } else {
                    toast.error('Permission denied', {
                        description: 'Please enable notifications in your browser settings.'
                    });
                    setNotifications(false);
                }
            } else {
                toast.error('Not Supported', {
                    description: 'This browser does not support desktop notifications.'
                });
            }
        } else {
            // Turning off (just update state, can't revoke permission)
            setNotifications(false);
            toast.info('Notifications Disabled');
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-6 shadow-sm">
                <div className="flex items-center space-x-2 mb-6 text-zinc-100">
                    <User className="w-5 h-5" />
                    <h2 className="text-lg font-bold tracking-tight">Profile Settings</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-zinc-400 mb-2 text-xs font-medium uppercase tracking-wider">Display Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 bg-zinc-900 text-zinc-100 rounded-md border border-zinc-800 focus:border-zinc-600 focus:ring-0 transition-all outline-none placeholder:text-zinc-600"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-6 shadow-sm">
                <div className="flex items-center space-x-2 mb-6 text-zinc-100">
                    <Bell className="w-5 h-5" />
                    <h2 className="text-lg font-bold tracking-tight">Preferences</h2>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                        <div className="flex items-center space-x-3">
                            <Bell className="w-4 h-4 text-zinc-400" />
                            <span className="text-sm text-zinc-200">Enable Notifications</span>
                        </div>
                        <button
                            onClick={handleNotificationToggle}
                            className={`w-10 h-5 rounded-full transition-colors relative ${notifications ? 'bg-zinc-100' : 'bg-zinc-700'}`}
                        >
                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-black transition-all ${notifications ? 'left-6' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                        <div className="flex items-center space-x-3">
                            <Moon className="w-4 h-4 text-zinc-400" />
                            <span className="text-sm text-zinc-200">Dark Mode</span>
                        </div>
                        <span className="text-xs text-zinc-500 font-medium uppercase">Always On</span>
                    </div>
                </div>
            </div>

            <button className="flex items-center space-x-2 bg-zinc-100 hover:bg-white text-zinc-900 px-6 py-2 rounded-md font-bold transition-colors shadow-sm">
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
            </button>
        </div>
    );
}

export default Settings;
