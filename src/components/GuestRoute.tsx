import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface GuestRouteProps {
    children: React.ReactNode;
}

const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
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

    if (user) {
        console.log(`↩️ GuestRoute: User already authenticated (${user.role}), redirecting...`);
        switch (user.role) {
            case 'super_admin':
                return <Navigate to="/admin" replace />;
            case 'club':
            case 'club_admin':
                return <Navigate to="/club" replace />;
            case 'player':
            default:
                return <Navigate to="/dashboard" replace />;
        }
    }

    return <>{children}</>;
};

export default GuestRoute;
