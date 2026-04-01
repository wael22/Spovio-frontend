import React, { useEffect, useState } from "react";
import {
    Users,
    Activity,
    Trophy,
    MapPin,
    Building2,
    User,
    RefreshCw,
    AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import StatCard from "../components/dashboard/StatCard";
import PartnerClubs, { clubs } from "../components/dashboard/PartnerClubs";

// Utilisation de l'API (compatible Flask local et Vercel Cloud)
const API_URL = "/api/interest";
const STATS_URL = "/api/interest/stats";

interface PlayerInterest {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    age: number;
    sport: string;
    city: string;
    club?: string;
    created_at: string;
}

interface DashboardStats {
    total: number;
    padel: number;
    tennis: number;
    both: number;
    cities: number;
}

const InterestDashboard = () => {
    const [players, setPlayers] = useState<PlayerInterest[]>([]);
    const [stats, setStats] = useState<DashboardStats>({
        total: 0,
        padel: 0,
        tennis: 0,
        both: 0,
        cities: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [playersRes, statsRes] = await Promise.all([
                fetch(API_URL).catch(() => null),
                fetch(STATS_URL).catch(() => null)
            ]);

            if (playersRes && playersRes.ok) {
                const playersData = await playersRes.json();
                setPlayers(playersData || []);
            } else {
                console.warn("Backend player data unreachable");
                if (playersRes && playersRes.status === 500) setError("Erreur serveur (500)");
            }

            if (statsRes && statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData || { total: 0, padel: 0, tennis: 0, both: 0, cities: 0 });
            }
        } catch (err) {
            console.error("Erreur lors du chargement:", err);
            // On ne bloque pas l'affichage car les clubs sont statiques
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-6xl mx-auto py-8 px-4">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Dashboard - Intérêt Clubs et Joueurs
                    </h1>
                    <p className="text-gray-600">
                        Vue d'ensemble des joueurs et clubs intéressés par la plateforme Spovio.
                    </p>
                </div>

                {/* Stats Cards - Toujours affichées, les données clubs sont statiques */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <StatCard
                        title="Total Clubs"
                        value={clubs.length}
                        icon={Building2}
                        variant="total"
                    />
                    <StatCard
                        title="Total Joueurs"
                        value={stats.total || players.length}
                        icon={Users}
                        variant="total"
                    />
                    <StatCard
                        title="Joueurs Padel"
                        value={stats.padel || players.filter(p => p.sport === 'padel' || p.sport === 'both').length}
                        icon={Activity}
                        variant="padel"
                    />
                    <StatCard
                        title="Joueurs Tennis"
                        value={stats.tennis || players.filter(p => p.sport === 'tennis' || p.sport === 'both').length}
                        icon={Trophy}
                        variant="tennis"
                    />
                </div>

                {/* Partner Clubs Section - TOUJOURS EN HAUT comme demandé */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Nos Clubs Partenaires</h2>
                    </div>
                    <PartnerClubs />
                </div>

                {/* Players List Section - EN BAS et gère le chargement/erreur sans bloquer le reste */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-12">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Liste des joueurs intéressés {players.length > 0 && `(${players.length})`}
                        </h2>
                        <button 
                            onClick={fetchData}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                            title="Rafraîchir"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center">
                            <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
                            <p className="text-red-600 font-medium">{error}</p>
                            <p className="text-gray-500 text-sm mt-1">Le serveur backend est probablement arrêté.</p>
                        </div>
                    ) : players.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            Aucun joueur inscrit pour le moment.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Joueur
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Sport
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ville
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {players.map((player, index) => (
                                        <tr key={player.id || index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                                                         <User size={16} />
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {player.first_name} {player.last_name}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    player.sport === 'padel' ? 'bg-blue-100 text-blue-800' :
                                                    player.sport === 'tennis' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                    {player.sport === 'both' ? 'Padel & Tennis' :
                                                        player.sport.charAt(0).toUpperCase() + player.sport.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <MapPin size={14} className="mr-1 text-gray-400" />
                                                    {player.city}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <footer className="mt-12 text-center text-sm text-gray-500 border-t border-gray-200 pt-8">
                    <p>Données collectées via formulaire d'intérêt joueurs - SPOVIO / MySmash - {new Date().getFullYear()}</p>
                </footer>
            </main>
        </div>
    );
};

export default InterestDashboard;
