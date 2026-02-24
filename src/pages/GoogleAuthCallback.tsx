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
        console.log("GoogleAuthCallback: Token received:", token ? "Yes" : "No");

        if (!token) {
            console.error("GoogleAuthCallback: No token found in URL");
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
                console.log("GoogleAuthCallback: Authenticating with backend...");
                // Call backend to verify token and get user session
                const response = await authService.googleAuthenticate(token);
                console.log("GoogleAuthCallback: Backyard response:", response.data);

                if (response.data && response.data.token) {
                    // 1. Stocker le token explicitement
                    localStorage.setItem('token', response.data.token);
                    console.log("GoogleAuthCallback: Token stored in localStorage");

                    // 2. Mettre à jour le contexte d'authentification si possible
                    // (On suppose que login() gère ça, sinon on reloading)

                    toast({
                        title: "Connexion réussie",
                        description: `Bienvenue ${response.data.user.name}!`,
                    });

                    // 3. Redirection
                    const role = response.data.user.role;
                    console.log("GoogleAuthCallback: User role:", role);

                    let dest = "/dashboard"; // Default to dashboard for players

                    if (role === 'super_admin') {
                        dest = "/admin";
                    } else if (role === 'club_admin') {
                        dest = "/club";
                    }

                    console.log("GoogleAuthCallback: Redirecting to:", dest);

                    // Force refresh to ensure all axios interceptors pick up the new token
                    // Use replace to avoid back button loop
                    setTimeout(() => {
                        window.location.replace(dest);
                    }, 500); // Small delay to ensure storage and toast
                } else {
                    console.warn("GoogleAuthCallback: No token in response data");
                    throw new Error("No token received");
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
