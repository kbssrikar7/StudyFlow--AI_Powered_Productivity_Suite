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
            console.error('Auth check failed:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credential) => {
        try {
            const data = await api.post('/auth/google', { credential });
            setUser(data.user);
            toast.success('Welcome back');
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            toast.error('Login failed.');
            return false;
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout', {});
        } catch (error) {
            console.error('Logout failed:', error);
        }
        setUser(null);
        toast.info('Logged out');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
