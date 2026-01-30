
import { useEffect, useState } from "react";
// import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import StatCard from "@/components/StatCard";
import PlayersTable from "@/components/PlayersTable";
import { Users, CircleDot, Trophy } from "lucide-react";

interface Player {
    id: string;
    first_name: string;
    last_name: string;
    sport: "padel" | "tennis" | "both";
    city: string;
}

const InterestDashboard = () => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Read-only public dashboard

    const fetchPlayers = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/interest');
            if (!response.ok) throw new Error('Failed to fetch data');
            const data = await response.json();
            setPlayers(data || []);
        } catch (error) {
            console.error("Erreur lors du chargement:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPlayers();

        // Disabled Auth check for public dashboard
        // supabase.auth.getSession().then(({ data: { session } }) => {
        //   setIsAuthenticated(!!session);
        // });

        // const {
        //   data: { subscription },
        // } = supabase.auth.onAuthStateChange((_event, session) => {
        //   setIsAuthenticated(!!session);
        // });

        // return () => subscription.unsubscribe();
    }, []);

    const totalPlayers = players.length;
    const padelPlayers = players.filter((p) => p.sport === "padel" || p.sport === "both").length;
    const tennisPlayers = players.filter((p) => p.sport === "tennis" || p.sport === "both").length;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="max-w-5xl mx-auto py-12 px-4 flex-grow container">
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-foreground mb-2">
                        Dashboard - Intérêt Joueurs
                    </h1>
                    <p className="text-muted-foreground">
                        Vue d'ensemble des joueurs intéressés par la plateforme MySmash.
                    </p>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-muted rounded-lg" />
                                    <div className="space-y-2">
                                        <div className="h-4 w-20 bg-muted rounded" />
                                        <div className="h-8 w-12 bg-muted rounded" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <StatCard
                            title="Total Joueurs"
                            value={totalPlayers}
                            icon={Users}
                            variant="total"
                        />
                        <StatCard
                            title="Joueurs Padel"
                            value={padelPlayers}
                            icon={CircleDot}
                            variant="padel"
                        />
                        <StatCard
                            title="Joueurs Tennis"
                            value={tennisPlayers}
                            icon={Trophy}
                            variant="tennis"
                        />
                    </div>
                )}

                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-foreground">
                        Liste des joueurs intéressés
                    </h2>
                </div>

                {isLoading ? (
                    <div className="bg-card border border-border rounded-lg p-8 animate-pulse">
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-12 bg-muted rounded" />
                            ))}
                        </div>
                    </div>
                ) : (
                    <PlayersTable
                        players={players}
                        onUpdate={fetchPlayers}
                        isAuthenticated={isAuthenticated}
                    />
                )}

                <footer className="mt-12 pt-6 border-t border-border text-center">
                    <p className="text-sm text-muted-foreground">
                        Données collectées via formulaire d'intérêt joueurs – SPOVIO / MySmash – 2026
                    </p>
                </footer>
            </main>
            <Footer />
        </div>
    );
};

export default InterestDashboard;
