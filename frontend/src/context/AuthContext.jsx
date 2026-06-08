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
        try {
            const userData = await api.get('/auth/me');
            setUser(userData);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credential) => {
        try {
            const data = await api.post('/auth/google', { credential });
            setUser(data.user);
            toast.success('Welcome back!');
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            toast.error('Login failed. Please try again.');
            return false;
        }
    };

    const loginWithEmail = async (email, password) => {
        try {
            const data = await api.post('/auth/login', { email, password });
            setUser(data.user);
            toast.success('Welcome back!');
            return { success: true };
        } catch (error) {
            const msg = error?.message || 'Login failed. Please try again.';
            toast.error(msg);
            return { success: false, message: msg };
        }
    };

    const register = async (username, email, password) => {
        try {
            const data = await api.post('/auth/register', { username, email, password });
            return { success: true, message: data.message, email };
        } catch (error) {
            const msg = error?.message || 'Registration failed. Please try again.';
            toast.error(msg);
            return { success: false, message: msg };
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout', {});
        } catch (error) {
            console.error('Logout error:', error);
        }
        setUser(null);
        toast.info('Logged out');
    };

    return (
        <AuthContext.Provider value={{ user, login, loginWithEmail, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
