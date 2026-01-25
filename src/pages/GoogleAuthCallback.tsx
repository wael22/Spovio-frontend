import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const GoogleAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { login } = useAuth(); // We'll just use the navigate/toast part mostly, but useAuth stores state

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            toast({
                title: "Erreur d'authentification",
                description: "Token Google manquant",
                variant: "destructive"
            });
            navigate('/auth');
            return;
        }

        const authenticate = async () => {
            try {
                // Call backend to verify token and get user session
                const response = await authService.googleAuthenticate(token);

                if (response.data && response.data.user) {
                    // Manually force a reload or re-fetch of auth state if needed
                    // But usually the backend sets a session cookie

                    toast({
                        title: "Connexion réussie",
                        description: `Bienvenue ${response.data.user.name}!`,
                    });

                    // Redirect based on role
                    const role = response.data.user.role;
                    if (role === 'super_admin') {
                        navigate("/admin");
                    } else if (role === 'club_admin') {
                        navigate("/club");
                    } else {
                        navigate("/dashboard");
                    }

                    // Ideally we should update the useAuth context here
                    // Since useAuth likely checks /auth/me on mount, a page reload might be safest 
                    // or if useAuth exposes a setUser method.
                    // For now, let's assume session cookie + redirect works.
                    // To be safe, we can reload to trigger useAuth init:
                    window.location.href = role === 'player' ? '/dashboard' : (role === 'club_admin' ? '/club' : '/admin');
                }
            } catch (error) {
                console.error("Google auth error:", error);
                toast({
                    title: "Erreur de connexion",
                    description: "Échec de l'authentification Google",
                    variant: "destructive"
                });
                navigate('/auth');
            }
        };

        authenticate();
    }, [searchParams, navigate, toast]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-muted-foreground animate-pulse">Authentification avec Google...</p>
            </div>
        </div>
    );
};

export default GoogleAuthCallback;
