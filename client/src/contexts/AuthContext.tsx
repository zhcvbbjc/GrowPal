import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { fetchMe, getApiMessage } from '../services/growpalApi';

interface User {
    id: number;
    nickname: string;
    avatar: string | null;
    phone: string | null;
    email: string | null;
}

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    loading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const isLoggedIn = !!user && !!localStorage.getItem('token');

    useEffect(() => {
        let cancelled = false;
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                if (!cancelled) {
                    setLoading(false);
                    return;
                }
            }

            try {
                const me = await fetchMe();
                if (!cancelled) {
                    setUser(me);
                    localStorage.setItem('growpal_user', JSON.stringify(me));
                }
            } catch (e) {
                console.error('Auth initialization error:', getApiMessage(e));
                localStorage.removeItem('token');
                localStorage.removeItem('growpal_user');
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        initAuth();
        return () => {
            cancelled = true;
        };
    }, []);

    const login = useCallback((token: string, userData: User) => {
        localStorage.setItem('token', token);
        setUser(userData);
        localStorage.setItem('growpal_user', JSON.stringify(userData));
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('growpal_user');
        setUser(null);
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            const me = await fetchMe();
            setUser(me);
            localStorage.setItem('growpal_user', JSON.stringify(me));
        } catch (e) {
            console.error('Refresh user error:', getApiMessage(e));
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};
