import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, tokenManager } from '../lib/api';

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
    verifyEmail: (email: string, code: string) => Promise<{ success: boolean; user?: User; error?: string }>;
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

            // Try to restore session from localStorage first (fast)
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error("Failed to parse stored user", e);
                    localStorage.removeItem('user');
                }
            }

            try {
                // Verify with backend
                const response = await authService.getCurrentUser();
                setUser(response.data.user);
                // Update storage with fresh data
                localStorage.setItem('user', JSON.stringify(response.data.user));
            } catch (error: any) {
                // 401 is expected if not authenticated
                if (error.response?.status === 401) {
                    setUser(null);
                    localStorage.removeItem('user');
                } else {
                    console.error("Error checking authentication status:", error);
                    // Don't clear user here if it's a network error, keep offline state if possible
                    // But for now, safe default:
                    // setUser(null); 
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
            const userData = response.data.user;
            const token = response.data.token;

            // 🔥 CRITICAL: Store token FIRST before setting user
            if (token) {
                tokenManager.setToken(token);
                console.log('[useAuth] JWT token stored explicitly');
            } else {
                console.warn('[useAuth] No token in login response!');
            }

            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));

            return { success: true, user: userData };
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
                localStorage.setItem('user', JSON.stringify(response.data.user));
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
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            setUser(null);
            localStorage.removeItem('user');
            tokenManager.clearToken(); // 🆕 Clear JWT token
            return { success: true };
        }
    };

    // Function to refresh user data
    const fetchUser = async () => {
        try {
            const response = await authService.getCurrentUser();
            const userData = response.data.user;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return userData;
        } catch (error: any) {
            if (error.response?.status === 401) {
                setUser(null);
                localStorage.removeItem('user');
            }
            throw error;
        }
    };

    const updateProfile = async (profileData: any) => {
        try {
            setError(null);
            setLoading(true);
            const response = await authService.updateProfile(profileData);
            const userData = response.data.user;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return { success: true, user: userData };
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Profile update error';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const verifyEmail = async (email: string, code: string) => {
        try {
            setError(null);
            setLoading(true);
            const response = await authService.verifyEmail(email, code);
            const userData = response.data.user;
            const token = response.data.token;

            // 🔥 CRITICAL: Store token FIRST before setting user
            if (token) {
                tokenManager.setToken(token);
                console.log('[useAuth] JWT token stored from email verification');
            }

            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return { success: true, user: userData };
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Verification error';
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
        verifyEmail,
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
