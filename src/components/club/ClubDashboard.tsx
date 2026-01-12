import React, { useState, useEffect } from 'react';
import { clubService } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Camera, Video, History, Loader2, Coins, Building, TrendingUp, Plus, Gift, Building2 } from 'lucide-react';
import ClubPlayersTab from './ClubPlayersTab';
import ClubCourtsTab from './ClubCourtsTab';
import ClubVideosTab from './ClubVideosTab';
import ClubHistory from './ClubHistory';
import StatCardModern from '@/components/common/StatCardModern';
import BuyClubCreditsModal from './BuyClubCreditsModal';
import Navbar from '@/components/common/Navbar';

interface ClubData {
    club: any;
    players: any[];
    videos: any[];
    courts: any[];
    stats: {
        total_videos: number;
        total_players: number;
        total_credits_offered: number;
        total_courts: number;
    };
}

/**
 * Club Dashboard - Main club management interface
 * Manages players, courts, videos, and credits
 */
const ClubDashboard: React.FC = () => {
    const [dashboardData, setDashboardData] = useState<ClubData>({
        club: null,
        players: [],
        videos: [],
        courts: [],
        stats: { total_videos: 0, total_players: 0, total_credits_offered: 0, total_courts: 0 }
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [showBuyModal, setShowBuyModal] = useState<boolean>(false);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await clubService.getDashboard();
            setDashboardData(response.data);
        } catch (error) {
            setError('Erreur lors du chargement du tableau de bord');
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar title="Tableau de bord Club" />
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar title="Tableau de bord Club" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && <Alert variant="destructive" className="mb-6"><AlertDescription>{error}</AlertDescription></Alert>}

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {dashboardData.club?.name || 'Club'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Gérez vos joueurs et suivez l'activité de votre club
                    </p>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <StatCardModern
                        icon={Users}
                        title="Joueurs Inscrits"
                        value={dashboardData.stats?.total_players ?? 0}
                        iconBgColor="bg-blue-100"
                        iconColor="text-blue-600"
                    />

                    <StatCardModern
                        icon={Video}
                        title="Vidéos Enregistrées"
                        value={dashboardData.stats?.total_videos ?? 0}
                        iconBgColor="bg-purple-100"
                        iconColor="text-purple-600"
                    />

                    {/* Club Balance Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-5 border-2 border-blue-200 dark:border-blue-700">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">💰 Solde du Club</p>
                                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                                    {dashboardData.club?.credits_balance ?? 0}
                                </p>
                                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">crédits disponibles</p>
                            </div>
                            <div className="p-3 rounded-lg bg-blue-200 dark:bg-blue-800">
                                <Coins className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                            </div>
                        </div>
                        <button
                            onClick={() => setShowBuyModal(true)}
                            className="w-full px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 bg-white dark:bg-blue-900/50 border border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-800/50 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Acheter</span>
                        </button>
                    </div>

                    <StatCardModern
                        icon={Gift}
                        title="Crédits Offerts"
                        value={dashboardData.stats?.total_credits_offered ?? 0}
                        subtitle="par le club"
                        iconBgColor="bg-green-100"
                        iconColor="text-green-600"
                    />

                    <StatCardModern
                        icon={Building2}
                        title="Terrains"
                        value={dashboardData.stats?.total_courts ?? 0}
                        iconBgColor="bg-orange-100"
                        iconColor="text-orange-600"
                    />
                </div>

                {/* Tabs */}
                <Tabs defaultValue="joueurs" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="joueurs">Joueurs</TabsTrigger>
                        <TabsTrigger value="terrains">Terrains</TabsTrigger>
                        <TabsTrigger value="videos">Vidéos</TabsTrigger>
                        <TabsTrigger value="historique">Historique</TabsTrigger>
                    </TabsList>

                    <TabsContent value="joueurs" className="mt-6">
                        <ClubPlayersTab players={dashboardData.players} videos={dashboardData.videos} onPlayersUpdated={loadDashboard} />
                    </TabsContent>

                    <TabsContent value="terrains" className="mt-6">
                        <ClubCourtsTab courts={dashboardData.courts} onCourtUpdated={loadDashboard} />
                    </TabsContent>

                    <TabsContent value="videos" className="mt-6">
                        <ClubVideosTab videos={dashboardData.videos} />
                    </TabsContent>

                    <TabsContent value="historique" className="mt-6">
                        <ClubHistory />
                    </TabsContent>
                </Tabs>
            </div>

            <BuyClubCreditsModal
                open={showBuyModal}
                onClose={() => setShowBuyModal(false)}
                onSuccess={() => loadDashboard()}
                club={dashboardData.club}
            />
        </div>
    );
};

export default ClubDashboard;
