import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';
import { toast } from 'sonner';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Verify token and get user data
                // For now, we'll just assume token is valid if it exists, 
                // but ideally we should hit /auth/me
                const userData = await api.get('/auth/me');
                setUser(userData);
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        try {
            // Use postForm for OAuth2 password flow (x-www-form-urlencoded)
            const data = await api.postForm('/auth/login', { username: email, password });
            localStorage.setItem('token', data.access_token);
            await checkAuth();
            toast.success('Welcome back');
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            toast.error('Login failed. Check your credentials.');
            return false;
        }
    };

    const register = async (email, password, fullName) => {
        try {
            await api.post('/auth/register', { email, password, full_name: fullName });
            // Auto login after register
            await login(email, password);
            return true;
        } catch (error) {
            console.error('Registration failed:', error);
            toast.error('Registration failed. Email might be taken.');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        toast.info('Logged out');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
