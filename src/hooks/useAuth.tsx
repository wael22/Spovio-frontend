import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../lib/api';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    credits?: number;
    phone_number?: string;
    [key: string]: any;
}

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    loading: boolean;
    error: string | null;
    login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; user?: User; error?: string }>;
    register: (userData: any) => Promise<{ success: boolean; data?: any; error?: string }>;
    logout: () => Promise<{ success: boolean }>;
    fetchUser: () => Promise<User>;
    updateProfile: (profileData: any) => Promise<{ success: boolean; user?: User; error?: string }>;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isPlayer: boolean;
    isClub: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize auth on mount
    useEffect(() => {
        const initializeAuth = async () => {
            // Avoid multiple initializations
            if (isInitialized) return;

            try {
                const response = await authService.getCurrentUser();
                setUser(response.data.user);
            } catch (error: any) {
                // 401 is expected if not authenticated
                if (error.response?.status === 401) {
                    setUser(null);
                } else {
                    console.error("Error checking authentication status:", error);
                    setUser(null);
                }
            } finally {
                setLoading(false);
                setIsInitialized(true);
            }
        };

        initializeAuth();
    }, [isInitialized]);

    const login = async (credentials: { email: string; password: string }) => {
        try {
            setError(null);
            setLoading(true);
            const response = await authService.login(credentials);
            setUser(response.data.user);
            return { success: true, user: response.data.user };
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Login error';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData: any) => {
        try {
            setError(null);
            setLoading(true);
            const response = await authService.register(userData);

            // Don't set user if verification is required
            if (response.data.user) {
                setUser(response.data.user);
            }

            // Return full response data including requires_verification
            return { success: true, data: response.data };
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Registration error';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
            setUser(null);
            localStorage.removeItem('user');
            return { success: true };
        } catch (error) {
            // Even if logout fails on server, clear client state
            setUser(null);
            localStorage.removeItem('user');
            return { success: true };
        }
    };

    // Function to refresh user data
    const fetchUser = async () => {
        try {
            const response = await authService.getCurrentUser();
            setUser(response.data.user);
            return response.data.user;
        } catch (error: any) {
            if (error.response?.status === 401) {
                setUser(null);
            }
            throw error;
        }
    };

    const updateProfile = async (profileData: any) => {
        try {
            setError(null);
            setLoading(true);
            const response = await authService.updateProfile(profileData);
            setUser(response.data.user);
            return { success: true, user: response.data.user };
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Profile update error';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const isAuthenticated = !!user;
    const isAdmin = user?.role === 'super_admin';
    const isPlayer = user?.role === 'player';
    const isClub = user?.role === 'club' || user?.role === 'club_admin';

    const value: AuthContextType = {
        user,
        setUser,
        loading,
        error,
        login,
        register,
        logout,
        fetchUser,
        updateProfile,
        isAuthenticated,
        isAdmin,
        isPlayer,
        isClub,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
