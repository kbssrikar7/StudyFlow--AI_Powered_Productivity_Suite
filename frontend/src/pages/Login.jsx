import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';

const REQUIREMENTS = [
    { label: 'At least 8 characters', test: (p) => p.length >= 8 },
    { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
    { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
    { label: 'One number', test: (p) => /\d/.test(p) },
    { label: 'One special character', test: (p) => /[!@#$%^&*()_+\-=\[\]{}|;':",./<>?]/.test(p) },
];

const Login = () => {
    const { login, loginWithEmail, register } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [mode, setMode] = useState('signin'); // 'signin' | 'register' | 'verify-pending'
    const [pendingEmail, setPendingEmail] = useState('');

    // Sign-in form state
    const [signInEmail, setSignInEmail] = useState('');
    const [signInPassword, setSignInPassword] = useState('');
    const [signInLoading, setSignInLoading] = useState(false);

    // Register form state
    const [regUsername, setRegUsername] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirm, setRegConfirm] = useState('');
    const [regLoading, setRegLoading] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    useEffect(() => {
        if (searchParams.get('verified') === '1') {
            toast.success('Email verified! You can now sign in.');
        }
    }, [searchParams]);

    const handleGoogleSuccess = async (credentialResponse) => {
        const success = await login(credentialResponse.credential);
        if (success) navigate('/');
    };

    const handleSignIn = async (e) => {
        e.preventDefault();
        setSignInLoading(true);
        const result = await loginWithEmail(signInEmail, signInPassword);
        setSignInLoading(false);
        if (result.success) navigate('/');
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (regPassword !== regConfirm) {
            toast.error('Passwords do not match');
            return;
        }
        const unmet = REQUIREMENTS.filter((r) => !r.test(regPassword));
        if (unmet.length > 0) {
            toast.error(`Password: ${unmet[0].label}`);
            return;
        }
        setRegLoading(true);
        const result = await register(regUsername, regEmail, regPassword);
        setRegLoading(false);
        if (result.success) {
            setPendingEmail(result.email);
            setMode('verify-pending');
        }
    };

    const inputClass =
        'w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 px-4 py-3 text-sm focus:outline-none focus:border-red-500/50 focus:bg-white/8 transition-colors';

    return (
        <div className="min-h-screen bg-[#050505] px-6 py-12 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img
                    src="/bat-bg-main.webp"
                    alt="Background"
                    className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
            </div>

            <div className="w-full max-w-md border border-white/10 bg-[#0a0a0a]/80 p-8 backdrop-blur-xl relative z-10 shadow-[0_0_50px_rgba(207,10,10,0.1)]">
                {/* Logo */}
                <div className="flex flex-col items-center gap-4 text-center text-white mb-6">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-red-600/20 blur-2xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-700" />
                        <img
                            src="/bat-logo-circular.png"
                            alt="Logo"
                            className="w-24 h-24 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] opacity-90"
                        />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-wide">StudyFlow</h1>
                        <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">AI Productivity Suite</p>
                    </div>
                </div>

                {/* Verify Pending */}
                {mode === 'verify-pending' && (
                    <div className="text-center space-y-4">
                        <div className="text-4xl">📧</div>
                        <h2 className="text-white font-semibold text-lg">Check your inbox</h2>
                        <p className="text-slate-400 text-sm">
                            We sent a verification link to{' '}
                            <span className="text-white font-medium">{pendingEmail}</span>.
                            Click the link in that email to activate your account.
                        </p>
                        <p className="text-slate-500 text-xs">
                            (In dev mode, the link is printed to the server console.)
                        </p>
                        <button
                            onClick={() => setMode('signin')}
                            className="text-red-400 hover:text-red-300 text-sm underline underline-offset-2 transition-colors"
                        >
                            Back to Sign In
                        </button>
                    </div>
                )}

                {/* Tab bar */}
                {mode !== 'verify-pending' && (
                    <>
                        <div className="flex border border-white/10 mb-6">
                            <button
                                onClick={() => setMode('signin')}
                                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                                    mode === 'signin'
                                        ? 'bg-white/10 text-white'
                                        : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => setMode('register')}
                                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                                    mode === 'register'
                                        ? 'bg-white/10 text-white'
                                        : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                Register
                            </button>
                        </div>

                        {/* Sign In */}
                        {mode === 'signin' && (
                            <form onSubmit={handleSignIn} className="space-y-3">
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    value={signInEmail}
                                    onChange={(e) => setSignInEmail(e.target.value)}
                                    required
                                    className={inputClass}
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={signInPassword}
                                    onChange={(e) => setSignInPassword(e.target.value)}
                                    required
                                    className={inputClass}
                                />
                                <button
                                    type="submit"
                                    disabled={signInLoading}
                                    className="w-full bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white py-3 text-sm font-semibold uppercase tracking-widest transition-colors"
                                >
                                    {signInLoading ? 'Signing in…' : 'Initialize Session'}
                                </button>
                            </form>
                        )}

                        {/* Register */}
                        {mode === 'register' && (
                            <form onSubmit={handleRegister} className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Username (min 3 characters)"
                                    value={regUsername}
                                    onChange={(e) => setRegUsername(e.target.value)}
                                    required
                                    minLength={3}
                                    maxLength={50}
                                    className={inputClass}
                                />
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    value={regEmail}
                                    onChange={(e) => setRegEmail(e.target.value)}
                                    required
                                    className={inputClass}
                                />
                                <div>
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={regPassword}
                                        onChange={(e) => setRegPassword(e.target.value)}
                                        onFocus={() => setPasswordFocused(true)}
                                        required
                                        className={inputClass}
                                    />
                                    {(passwordFocused || regPassword) && (
                                        <div className="mt-2 space-y-1 px-1">
                                            {REQUIREMENTS.map((req) => {
                                                const met = req.test(regPassword);
                                                return (
                                                    <div key={req.label} className="flex items-center gap-2 text-xs">
                                                        <span className={met ? 'text-green-400' : 'text-red-400'}>
                                                            {met ? '✓' : '✗'}
                                                        </span>
                                                        <span className={met ? 'text-green-400' : 'text-slate-400'}>
                                                            {req.label}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="password"
                                    placeholder="Confirm password"
                                    value={regConfirm}
                                    onChange={(e) => setRegConfirm(e.target.value)}
                                    required
                                    className={`${inputClass} ${
                                        regConfirm && regConfirm !== regPassword
                                            ? 'border-red-500/50'
                                            : ''
                                    }`}
                                />
                                {regConfirm && regConfirm !== regPassword && (
                                    <p className="text-xs text-red-400 px-1">Passwords do not match</p>
                                )}
                                <button
                                    type="submit"
                                    disabled={regLoading}
                                    className="w-full bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white py-3 text-sm font-semibold uppercase tracking-widest transition-colors"
                                >
                                    {regLoading ? 'Creating account…' : 'Create Account'}
                                </button>
                            </form>
                        )}

                        {/* Single shared Google button — rendered once to avoid SDK re-initialization */}
                        <OrDivider />
                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => toast.error('Google Sign In failed')}
                                theme="filled_black"
                                shape="pill"
                                size="large"
                                useOneTap={false}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const OrDivider = () => (
    <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-slate-600 text-xs uppercase tracking-widest">or</span>
        <div className="flex-1 h-px bg-white/10" />
    </div>
);

export default Login;
