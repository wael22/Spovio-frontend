// PlayerDashboard Content - Contenu principal avec tous les modals
// Authentification + Navigation + Modals + Thème Spovio (next-themes)

import { useState } from 'react';
import { Video, Scissors, CreditCard, Share2, Play, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MobileNavbar } from './MobileNavbar';
import { LiveBanner } from './LiveBanner';
import { StatCardSpovio } from './StatCardSpovio';
import { VideoCard } from './VideoCard';
import { VideoContextMenu } from './VideoContextMenu';
import { MenuDrawer } from './MenuDrawer';
import { ClipsPage } from './ClipsPage';
import { ClubsPage } from './ClubsPage';
import { SupportPage } from './SupportPage';
import { CreditsPage } from './CreditsPage';
import { LoginModal } from './LoginModal';
import { BuyCreditsModal } from './BuyCreditsModal';
import { useDashboardData } from '../hooks/useDashboardData';
import { useMySmashAuth } from '../hooks/useMySmashAuth';
import { useTheme } from 'next-themes';
import { useThemeColors } from '../hooks/useThemeColors';
import { spovioGradients, spovioShadows } from '../constants/colors';
import type { Video as VideoType } from '../types';
import { toast } from 'sonner';

export const PlayerDashboardContent = () => {
    const { user, isAuthenticated, login, logout } = useMySmashAuth();
    const { data, activeRecording, loading, error } = useDashboardData();
    const { theme, setTheme, resolvedTheme } = useTheme();
    const colors = useThemeColors();

    // Modals state
    const [showMenu, setShowMenu] = useState(false);
    const [showLogin, setShowLogin] = useState(!isAuthenticated);
    const [showBuyCredits, setShowBuyCredits] = useState(false);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
    const [showVideoMenu, setShowVideoMenu] = useState(false);

    // Calculate stats
    const totalVideos = data?.stats.total_videos || 0;
    const totalClips = 0;
    const credits = user?.credits_balance || 15;
    const shared = 0;

    // Handlers
    const handleLogin = async (email: string, password: string) => {
        const result = await login({ email, password });
        if (result.success) {
            setShowLogin(false);
            toast.success(`Bienvenue ${result.user?.name} !`);
        }
    };

    const handleLogout = async () => {
        await logout();
        setShowLogin(true);
        toast.success('Déconnexion réussie');
    };

    const handlePurchaseCredits = (packageId: number, credits: number, price: number) => {
        console.log('Purchase:', { packageId, credits, price });
        toast.success(`${credits} crédits achetés pour ${price} DT !`);
        // TODO: Call payment API
    };

    const handleVideoPlay = (video: VideoType) => {
        console.log('Play video:', video.id);
        // TODO: Open video player
    };

    const handleVideoMenu = (video: VideoType) => {
        setSelectedVideo(video);
        setShowVideoMenu(true);
    };

    const handleCreateClip = () => {
        console.log('Create clip from video:', selectedVideo?.id);
        // TODO: Open clip editor
    };

    const handleShare = () => {
        console.log('Share video:', selectedVideo?.id);
        // TODO: Open share modal
    };

    const handleDownload = () => {
        if (selectedVideo?.file_url) {
            window.open(selectedVideo.file_url, '_blank');
        }
    };

    const handleDelete = () => {
        if (confirm('Supprimer cette vidéo ?')) {
            console.log('Delete video:', selectedVideo?.id);
            // TODO: Call delete API
        }
    };

    // Render pages
    const renderPage = () => {
        if (!isAuthenticated) {
            return (
                <div className="flex items-center justify-center min-h-[60vh] px-4">
                    <div className="text-center">
                        <Video className="h-24 w-24 mx-auto mb-6" style={{ color: colors.cyan }} />
                        <h2 className="text-2xl font-bold text-white mb-3">
                            Connecte-toi à MySmash
                        </h2>
                        <p className="text-base mb-6" style={{ color: colors.textSecondary }}>
                            Accède à tes vidéos et analyses de matchs
                        </p>
                        <Button
                            size="lg"
                            className="text-white font-semibold px-8 py-6 rounded-xl border-0"
                            style={{
                                background: spovioGradients.cyanButton,
                                boxShadow: spovioShadows.glowCyan,
                            }}
                            onClick={() => setShowLogin(true)}
                        >
                            Se Connecter
                        </Button>
                    </div>
                </div>
            );
        }

        switch (currentPage) {
            case 'clips':
                return <ClipsPage clips={[]} onCreateClip={handleCreateClip} />;
            case 'clubs':
                return <ClubsPage />;
            case 'support':
                return <SupportPage />;
            case 'credits':
                return <CreditsPage />;
            default:
                return renderDashboard();
        }
    };

    const renderDashboard = () => (
        <div className="px-4 py-6 max-w-lg mx-auto">
            {/* Welcome Message */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                    Bonjour, <span style={{ color: colors.cyan }}>{user?.name || 'Thomas'}</span> 👋
                </h1>
                <p className="text-base text-muted-foreground">
                    Prêt à analyser tes performances ?
                </p>
            </div>

            {/* Stats Grid 2x2 */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <StatCardSpovio icon={Video} value={totalVideos} label="Vidéos" iconColor="cyan" />
                <StatCardSpovio icon={Scissors} value={totalClips} label="Clips" iconColor="green" />
                <StatCardSpovio icon={CreditCard} value={credits} label="Crédits" iconColor="cyan" />
                <StatCardSpovio icon={Share2} value={shared} label="Partagées" iconColor="purple" />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mb-8">
                <Button
                    size="lg"
                    className="w-full text-white font-semibold text-base py-6 rounded-xl border-0"
                    style={{
                        background: spovioGradients.cyanButton,
                        boxShadow: spovioShadows.glowCyan,
                    }}
                    disabled={activeRecording !== null}
                >
                    <Play className="h-5 w-5 mr-2" />
                    {activeRecording ? 'Enregistrement en cours...' : 'Démarrer un enregistrement'}
                </Button>

                <Button
                    size="lg"
                    variant="outline"
                    className="w-full font-semibold text-base py-6 rounded-xl"
                    style={{
                        borderColor: colors.cyan,
                        color: colors.cyan,
                        background: 'transparent',
                    }}
                    onClick={() => setShowBuyCredits(true)}
                >
                    + Acheter des crédits
                </Button>
            </div>

            {/* Videos Section */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Mes Vidéos</h2>
            </div>

            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: colors.textSecondary }} />
                    <Input
                        placeholder="Rechercher..."
                        className="pl-10 rounded-xl border-0 text-white"
                        style={{ background: colors.bgCard }}
                    />
                </div>
            </div>

            {/* Videos List */}
            {loading ? (
                <div className="text-center py-12 rounded-2xl" style={{ background: colors.bgCard, border: `1px solid ${colors.borderDefault}` }}>
                    <p style={{ color: colors.textSecondary }}>Chargement...</p>
                </div>
            ) : data && data.videos.length > 0 ? (
                <div className="space-y-4">
                    {data.videos.map((video) => (
                        <VideoCard
                            key={video.id}
                            video={video}
                            onPlay={() => handleVideoPlay(video)}
                            onMenuClick={() => handleVideoMenu(video)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 rounded-2xl" style={{ background: colors.bgCard, border: `1px solid ${colors.borderDefault}` }}>
                    <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                        Aucune vidéo pour le moment
                    </h3>
                    <p className="text-muted-foreground">
                        Commence par enregistrer ton premier match !
                    </p>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen" style={{ background: colors.bgDark }}>
            {/* Mobile Navbar */}
            <MobileNavbar
                userName={user?.name?.substring(0, 2).toUpperCase() || 'TM'}
                userEmail={user?.email}
                notificationCount={2}
                onMenuClick={() => setShowMenu(true)}
                onProfile={() => console.log('Profile')}
                onSettings={() => console.log('Settings')}
                onLogout={handleLogout}
                onToggleTheme={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                isDark={resolvedTheme === 'dark'}
            />

            {/* Live Recording Banner */}
            {activeRecording && (
                <LiveBanner
                    recording={activeRecording}
                    onStop={() => console.log('Stop recording')}
                />
            )}

            {/* Page Content */}
            {renderPage()}

            {/* Menu Drawer */}
            <MenuDrawer
                isOpen={showMenu}
                onClose={() => setShowMenu(false)}
                currentPage={currentPage}
                onNavigate={setCurrentPage}
                credits={credits}
            />

            {/* Login Modal */}
            <LoginModal
                isOpen={showLogin}
                onClose={() => setShowLogin(false)}
                onLogin={handleLogin}
            />

            {/* Buy Credits Modal */}
            <BuyCreditsModal
                isOpen={showBuyCredits}
                onClose={() => setShowBuyCredits(false)}
                onPurchase={handlePurchaseCredits}
                currentBalance={credits}
            />

            {/* Video Context Menu */}
            {selectedVideo && (
                <VideoContextMenu
                    isOpen={showVideoMenu}
                    onClose={() => setShowVideoMenu(false)}
                    onPlay={() => {
                        handleVideoPlay(selectedVideo);
                        setShowVideoMenu(false);
                    }}
                    onCreateClip={handleCreateClip}
                    onShare={handleShare}
                    onDownload={handleDownload}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
};
