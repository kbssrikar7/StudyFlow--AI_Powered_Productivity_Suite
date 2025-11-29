import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowRight, Lock } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const success = await login(email, password);
        if (success) {
            navigate('/');
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#050505] px-6 py-12 flex items-center justify-center relative overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/bat-bg-main.webp"
                    alt="Gotham Background"
                    className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />

                {/* Batarang Watermark */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-10 pointer-events-none mix-blend-overlay">
                    <img
                        src="/bat-bg-watermark.png"
                        alt="Watermark"
                        className="w-full h-full object-contain"
                    />
                </div>
            </div>

            <div className="w-full max-w-md space-y-8  border border-white/10 bg-[#0a0a0a]/80 p-8 backdrop-blur-xl relative z-10 shadow-[0_0_50px_rgba(207,10,10,0.1)] fade-in">
                <div className="flex flex-col items-center gap-6 text-center text-white">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-red-600/20 blur-2xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-700" />
                        <img
                            src="/bat-logo-circular.png"
                            alt="Batman Logo"
                            className="w-32 h-32 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] opacity-90"
                        />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 mt-8">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Identity</label>
                        <div className="relative mt-2 group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-4 w-4 text-slate-500 group-focus-within:text-red-600 transition-colors" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10  text-slate-200 placeholder-slate-600 focus:border-red-600/50 focus:ring-1 focus:ring-red-600/50 focus:bg-black/60 transition-all text-sm font-medium"
                                placeholder="agent@waynetech.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Passcode</label>
                        <div className="relative mt-2 group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-4 w-4 text-slate-500 group-focus-within:text-red-600 transition-colors" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10  text-slate-200 placeholder-slate-600 focus:border-red-600/50 focus:ring-1 focus:ring-red-600/50 focus:bg-black/60 transition-all text-sm font-medium"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-sm font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(220,38,38,0.2)] hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] border border-red-600/20 bg-red-700 hover:bg-red-600"
                    >
                        {isLoading ? 'Authenticating...' : 'Initialize Session'}
                        {!isLoading && <ArrowRight className="h-4 w-4" />}
                    </button>
                </form>

                <div className="text-center pt-4 border-t border-white/5">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                        New Agent?{' '}
                        <Link to="/register" className="text-red-500 hover:text-red-400 font-bold transition-colors">
                            Register Protocol
                        </Link>
                    </p>
                    <div className="mt-4 p-3 bg-red-900/20 border border-red-900/30 ">
                        <p className="text-[10px] text-red-400 font-mono mb-1">DEFAULT ACCESS:</p>
                        <p className="text-[10px] text-slate-400 font-mono">ID: admin@admin.com</p>
                        <p className="text-[10px] text-slate-400 font-mono">KEY: admin</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
