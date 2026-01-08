// Authentication Context for MySmash
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../lib/api';  // Session-based auth

interface User {
    id: string;
    email: string;
    name: string;
    role: 'player' | 'club' | 'super_admin';
    credits?: number;
    credits_balance?: number;  // Backend uses this field
    club_id?: string;
    avatar?: string;
    phone?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (userData: Partial<User>) => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const response = await authService.getCurrentUser();
            setUser(response.data.user);
        } catch (error) {
            console.error('Failed to refresh user:', error);
            setUser(null);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await authService.login({ email, password });
            setUser(response.data.user);

            // 🆕 Token is automatically stored by axios interceptor
            console.log('[AuthContext] Login successful, token stored');
        } catch (error: any) {
            console.error('Login failed:', error);
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    };

    const register = async (userData: any) => {
        try {
            const response = await authService.register(userData);
            setUser(response.data.user);

            // 🆕 Token is automatically stored by axios interceptor
            console.log('[AuthContext] Registration successful, token stored');
        } catch (error: any) {
            console.error('Registration failed:', error);
            throw new Error(error.response?.data?.message || 'Registration failed');
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            // Session cleared by backend automatically
            console.log('[AuthContext] Logout complete, token cleared');
        }
    };

    const updateUser = (userData: Partial<User>) => {
        if (user) {
            setUser({ ...user, ...userData });
        }
    };

    // Check authentication on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await authService.getCurrentUser();
                setUser(response.data.user);
                console.log('[AuthContext] User authenticated via session cookie');
            } catch (error) {
                console.log('[AuthContext] No valid session, user not authenticated');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const value: AuthContextType = {
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

