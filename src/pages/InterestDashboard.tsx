
import React, { useEffect, useState } from "react";
import { Users, Activity, Trophy, MapPin, Phone, Calendar, User } from "lucide-react";
import { toast } from "sonner";
import StatCard from "../components/dashboard/StatCard";
import PartnerClubs from "../components/dashboard/PartnerClubs";

interface Player {
    id: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    age: number | null;
    sport: "padel" | "tennis" | "both";
    city: string;
    created_at: string;
}

// Utilisation de l'API backend locale
const API_URL = "/api/player-interests";

const InterestDashboard = () => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPlayers = async () => {
        try {
            const response = await fetch(API_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setPlayers(data || []);
        } catch (error) {
            console.error("Erreur lors du chargement:", error);
            toast.error("Impossible de charger les données");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPlayers();
    }, []);

    const totalPlayers = players.length;
    const padelPlayers = players.filter((p) => p.sport === "padel" || p.sport === "both").length;
    const tennisPlayers = players.filter((p) => p.sport === "tennis" || p.sport === "both").length;

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-6xl mx-auto py-8 px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Dashboard - Intérêt Joueurs et Clubs
                    </h1>
                    <p className="text-gray-600">
                        Vue d'ensemble des joueurs et clubs intéressés par la plateforme Spovio.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <StatCard
                                title="Total Joueurs"
                                value={totalPlayers}
                                icon={Users}
                                variant="total"
                            />
                            <StatCard
                                title="Joueurs Padel"
                                value={padelPlayers}
                                icon={Activity}
                                variant="padel"
                            />
                            <StatCard
                                title="Joueurs Tennis"
                                value={tennisPlayers}
                                icon={Trophy}
                                variant="tennis"
                            />
                        </div>

                        {/* Players List */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-12">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Liste des joueurs intéressés ({players.length})
                                </h2>
                            </div>

                            {players.length === 0 ? (
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
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${player.sport === 'padel' ? 'bg-blue-100 text-blue-800' :
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

                        {/* Partner Clubs Section */}
                        <div className="mb-12">
                            <PartnerClubs />
                        </div>
                    </>
                )}

                <footer className="mt-12 text-center text-sm text-gray-500 border-t border-gray-200 pt-8">
                    <p>Données collectées via formulaire d'intérêt joueurs - SPOVIO / MySmash - {new Date().getFullYear()}</p>
                </footer>
            </main>
        </div>
    );
};

export default InterestDashboard;
