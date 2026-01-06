// Protected Route Component
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'player' | 'club' | 'super_admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
                    <p className="text-muted-foreground">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        console.log("🔒 ProtectedRoute: Access denied - No user found");
        return <Navigate to="/auth" replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
        console.log(`🔒 ProtectedRoute: Access denied - Role mismatch. User: ${user.role}, Required: ${requiredRole}`);
        // Redirect based on user role
        switch (user.role) {
            case 'player':
                return <Navigate to="/dashboard" replace />;
            case 'club':
                return <Navigate to="/club" replace />;
            case 'super_admin':
                return <Navigate to="/admin" replace />;
            default:
                return <Navigate to="/auth" replace />;
        }
    }

    console.log("🔓 ProtectedRoute: Access granted");
    return <>{children}</>;
};

export default ProtectedRoute;
