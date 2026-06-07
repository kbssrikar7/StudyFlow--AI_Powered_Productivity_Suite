import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSuccess = async (credentialResponse) => {
        const success = await login(credentialResponse.credential);
        if (success) {
            navigate('/');
        }
    };

    const handleError = () => {
        console.error('Google Sign In failed');
    };

    return (
        <div className="min-h-screen bg-[#050505] px-6 py-12 flex items-center justify-center relative overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/bat-bg-main.webp"
                    alt="Background"
                    className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
            </div>

            <div className="w-full max-w-md space-y-8 border border-white/10 bg-[#0a0a0a]/80 p-8 backdrop-blur-xl relative z-10 shadow-[0_0_50px_rgba(207,10,10,0.1)] fade-in">
                <div className="flex flex-col items-center gap-6 text-center text-white">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-red-600/20 blur-2xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-700" />
                        <img
                            src="/bat-logo-circular.png"
                            alt="Logo"
                            className="w-32 h-32 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] opacity-90"
                        />
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center space-y-6 mt-8">
                    <h2 className="text-xl font-bold text-slate-200">Initialize Session</h2>
                    <GoogleLogin
                        onSuccess={handleSuccess}
                        onError={handleError}
                        theme="filled_black"
                        shape="pill"
                        size="large"
                    />
                </div>
            </div>
        </div>
    );
};

export default Login;
