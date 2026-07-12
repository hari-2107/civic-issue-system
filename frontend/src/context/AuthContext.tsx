import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import type { User } from '../types/index';

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<User>;
    register: (name: string, email: string, password: string, phone?: string, address?: string) => Promise<User>;
    logout: () => void;
    updateProfile: (data: Partial<User>) => Promise<User>;
    isAuthenticated: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Set default base URL for API communication dynamically, prioritizing environment configuration
axios.defaults.baseURL =
  import.meta.env.VITE_API_URL ||
  "https://civic-issue-system-gt2g.onrender.com/api";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('civic-token');
        const savedUser = localStorage.getItem('civic-user');

        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));

            // Inject Axios authorization header
            axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<User> => {
        const res = await axios.post('/auth/login', { email, password });
        const { token, user: loggedUser } = res.data;

        setToken(token);
        setUser(loggedUser);
        localStorage.setItem('civic-token', token);
        localStorage.setItem('civic-user', JSON.stringify(loggedUser));

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return loggedUser;
    };

    const register = async (name: string, email: string, password: string, phone?: string, address?: string): Promise<User> => {
        const res = await axios.post('/auth/register-citizen', { name, email, password, phone, address });
        const { token, user: registeredUser } = res.data;

        setToken(token);
        setUser(registeredUser);
        localStorage.setItem('civic-token', token);
        localStorage.setItem('civic-user', JSON.stringify(registeredUser));

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return registeredUser;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('civic-token');
        localStorage.removeItem('civic-user');
        delete axios.defaults.headers.common['Authorization'];
    };

    const updateProfile = async (data: Partial<User>): Promise<User> => {
        const res = await axios.put('/user/profile', data);
        const updatedUser = res.data;

        setUser(updatedUser);
        localStorage.setItem('civic-user', JSON.stringify(updatedUser));
        return updatedUser;
    };

    const isAuthenticated = !!token;
    const isAdmin = user?.role === 'ADMIN';

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                register,
                logout,
                updateProfile,
                isAuthenticated,
                isAdmin
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
