// Custom Hook: useMySmashAuth
// Handles authentication for MySmash using padelvar-backend

import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';
import type { User, LoginCredentials, RegisterData } from '../types';
import { STORAGE_KEYS } from '../constants/routes';
import { toast } from 'sonner';

export const useMySmashAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Load user from localStorage on mount
    useEffect(() => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const savedUser = localStorage.getItem(STORAGE_KEYS.USER);

        if (token && savedUser) {
            try {
                setUser(JSON.parse(savedUser));
                setIsAuthenticated(true);
            } catch (err) {
                console.error('Failed to parse saved user:', err);
                localStorage.removeItem(STORAGE_KEYS.TOKEN);
                localStorage.removeItem(STORAGE_KEYS.USER);
            }
        }

        setLoading(false);
    }, []);

    // Login
    const login = useCallback(async (credentials: LoginCredentials) => {
        try {
            const response = await authService.login(credentials.email, credentials.password);
            const { token, user } = response.data;

            // Save to localStorage
            localStorage.setItem(STORAGE_KEYS.TOKEN, token);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

            setUser(user);
            setIsAuthenticated(true);

            toast.success(`Bienvenue ${user.name} !`);
            return { success: true, user };
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Erreur de connexion';
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    // Register
    const register = useCallback(async (data: RegisterData) => {
        try {
            const response = await authService.register(data);
            const { token, user } = response.data;

            // Save to localStorage
            localStorage.setItem(STORAGE_KEYS.TOKEN, token);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

            setUser(user);
            setIsAuthenticated(true);

            toast.success('Inscription réussie !');
            return { success: true, user };
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Erreur lors de l\'inscription';
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    // Logout
    const logout = useCallback(async () => {
        await authService.logout();

        // Clear storage
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);

        setUser(null);
        setIsAuthenticated(false);

        toast.success('Déconnexion réussie');
    }, []);

    // Update user (after credit purchase, etc.)
    const updateUser = useCallback((updates: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...updates };
            setUser(updatedUser);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        }
    }, [user]);

    return {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
    };
};
