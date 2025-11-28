import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, ArrowRight } from 'lucide-react';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const success = await register(email, password, fullName);
        if (success) {
            navigate('/');
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#05060a] px-6 py-12">
            <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
                <div className="rounded-3xl border border-white/5 bg-[rgba(9,12,20,0.85)] p-8 text-white backdrop-blur-lg">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Console</p>
                    <h1 className="mt-4 text-4xl font-semibold">Create an account</h1>
                    <p className="mt-4 text-sm text-slate-400">
                        Unlock timers, notes, snippets, and ambient focus tools in a single minimal space.
                    </p>
                    <div className="mt-10 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                            <p className="text-xs text-slate-400">Focus blocks</p>
                            <p className="text-xl font-semibold text-white">Track and review</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                            <p className="text-xs text-slate-400">Snippet vault</p>
                            <p className="text-xl font-semibold text-white">Save quick notes</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center">
                    <div className="w-full max-w-md space-y-8 rounded-3xl border border-white/5 bg-[rgba(8,10,17,0.95)] p-8 backdrop-blur">
                        <div className="flex flex-col items-center gap-3 text-center text-white">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                                <User className="h-6 w-6" />
                            </div>
                            <h2 className="text-3xl font-semibold">Create account</h2>
                            <p className="text-sm text-slate-400">Ship better habits with a lighter UI.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="text-sm font-medium text-slate-300">Full name</label>
                                <div className="relative mt-2">
                                    <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="input w-full pl-12"
                                        placeholder="Leslie Thompkins"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-300">Email</label>
                                <div className="relative mt-2">
                                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input w-full pl-12"
                                        placeholder="you@arkham.dev"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-300">Password</label>
                                <div className="relative mt-2">
                                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="input w-full pl-12"
                                        placeholder="********"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary w-full flex items-center justify-center gap-3"
                            >
                                {isLoading ? 'Creating profile...' : 'Create access'}
                                {!isLoading && <ArrowRight className="h-4 w-4" />}
                            </button>
                        </form>

                        <p className="text-center text-sm text-slate-400">
                            Already connected?{' '}
                            <Link to="/login" className="text-white underline underline-offset-4">
                                Return to login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
