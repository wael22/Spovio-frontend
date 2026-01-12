import React, { useState, useEffect } from 'react';
import { adminService } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import {
    Users,
    Building,
    Video,
    TrendingUp,
    Loader2,
    History,
    Settings,
    FileText,
    MessageSquare,
    Moon,
    Sun,
    User,
    LogOut,
    Shield
} from 'lucide-react';
import UserManagement from './UserManagement';
import ClubManagement from './ClubManagement';
import VideoManagement from './VideoManagement';
import ClubHistoryAdmin from './ClubHistoryAdmin';
import SystemConfiguration from './SystemConfiguration';
import SystemLogs from './SystemLogs';
import SupportManagement from './SupportManagement';
import OverviewTab from './OverviewTab';
import { useAuth } from '@/hooks/useAuth';

interface AdminStats {
    totalRealUsers: number;
    totalClubs: number;
    totalVideos: number;
    totalCredits: number;
}

/**
 * Admin Dashboard - Main super admin control panel
 * Manages all aspects of the platform: users, clubs, videos, configuration, support
 */
const AdminDashboard: React.FC = () => {
    const { logout } = useAuth();
    const [stats, setStats] = useState<AdminStats>({
        totalRealUsers: 0,
        totalClubs: 0,
        totalVideos: 0,
        totalCredits: 0
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);

            const [usersResponse, clubsResponse, videosResponse] = await Promise.all([
                adminService.getAllUsers(),
                adminService.getAllClubs(),
                adminService.getAllVideos()
            ]);

            const allUsers = usersResponse.data.users || [];
            const clubs = clubsResponse.data.clubs || [];
            const videos = videosResponse.data.videos || [];

            // Calculate users who are not clubs
            const realUsers = allUsers.filter((user: any) => user.role !== 'club');

            // Calculate total credits
            const totalCredits = allUsers.reduce((sum: number, user: any) =>
                sum + (user.credits_balance || 0), 0);

            setStats({
                totalRealUsers: realUsers.length,
                totalClubs: clubs.length,
                totalVideos: videos.length,
                totalCredits
            });
        } catch (error) {
            setError('Erreur lors du chargement des statistiques');
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        window.location.href = '/auth';
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Top Navigation Bar */}
            <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center space-x-3">
                            <Shield className="h-8 w-8 text-blue-600" />
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">MySmash</h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Administration</p>
                            </div>
                        </div>

                        {/* Right side menu */}
                        <div className="flex items-center space-x-4">
                            {/* Dark mode toggle */}
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setDarkMode(!darkMode)}
                                className="rounded-full"
                            >
                                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </Button>

                            {/* User menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full bg-blue-600 hover:bg-blue-700 text-white">
                                        <User className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium">Super Admin</p>
                                            <p className="text-xs text-gray-500">admin@mysmash.com</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setShowProfileModal(true)}>
                                        <User className="mr-2 h-4 w-4" />
                                        Mon Profil
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setActiveTab('configuration')}>
                                        <Settings className="mr-2 h-4 w-4" />
                                        Paramètres
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Déconnexion
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Tableau de bord administrateur
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Gérez les utilisateurs, clubs et vidéos de la plateforme
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : error ? (
                    <Alert variant="destructive" className="mb-8">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalRealUsers}</div>
                                <p className="text-xs text-muted-foreground">
                                    Joueurs et admins
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Clubs</CardTitle>
                                <Building className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalClubs}</div>
                                <p className="text-xs text-muted-foreground">
                                    Clubs enregistrés
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Vidéos</CardTitle>
                                <Video className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalVideos}</div>
                                <p className="text-xs text-muted-foreground">
                                    Matchs enregistrés
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Crédits Distribués</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalCredits}</div>
                                <p className="text-xs text-muted-foreground">
                                    Crédits en circulation
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-8">
                        <TabsTrigger value="overview">Vue d'Ensemble</TabsTrigger>
                        <TabsTrigger value="users">Utilisateurs</TabsTrigger>
                        <TabsTrigger value="clubs">Clubs</TabsTrigger>
                        <TabsTrigger value="videos">Vidéos</TabsTrigger>
                        <TabsTrigger value="history">
                            <span className="inline-flex items-center gap-1">
                                <History className="h-4 w-4" />Historique
                            </span>
                        </TabsTrigger>
                        <TabsTrigger value="configuration">
                            <span className="inline-flex items-center gap-1">
                                <Settings className="h-4 w-4" />Configuration
                            </span>
                        </TabsTrigger>
                        <TabsTrigger value="logs">
                            <span className="inline-flex items-center gap-1">
                                <FileText className="h-4 w-4" />Logs
                            </span>
                        </TabsTrigger>
                        <TabsTrigger value="support">
                            <span className="inline-flex items-center gap-1">
                                <MessageSquare className="h-4 w-4" />Support
                            </span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6">
                        <OverviewTab />
                    </TabsContent>

                    <TabsContent value="users" className="mt-6">
                        <UserManagement onStatsUpdate={loadStats} />
                    </TabsContent>

                    <TabsContent value="clubs" className="mt-6">
                        <ClubManagement onStatsUpdate={loadStats} />
                    </TabsContent>

                    <TabsContent value="videos" className="mt-6">
                        <VideoManagement onStatsUpdate={loadStats} />
                    </TabsContent>

                    <TabsContent value="history" className="mt-6">
                        <ClubHistoryAdmin />
                    </TabsContent>

                    <TabsContent value="configuration" className="mt-6">
                        <SystemConfiguration />
                    </TabsContent>

                    <TabsContent value="logs" className="mt-6">
                        <SystemLogs />
                    </TabsContent>

                    <TabsContent value="support" className="mt-6">
                        <SupportManagement />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default AdminDashboard;
