import React, { useState, useEffect } from 'react';
import { adminService } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Video, Loader2, Trash2, User, Building, MoreVertical, HardDrive, Cloud, AlertTriangle, ArrowUpDown, ArrowUp, ArrowDown, RefreshCw, Edit, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface VideoData {
    id: string;
    title?: string;
    player_name: string;
    club_name?: string;
    recorded_at: string;
    duration?: number;
    deletion_mode?: string;
    processing_status?: string;
    bunny_video_id?: string;
    has_local_file?: boolean;
}

interface VideoManagementProps {
    onStatsUpdate?: () => void;
}

const VideoManagement: React.FC<VideoManagementProps> = ({ onStatsUpdate }) => {
    const [videos, setVideos] = useState<VideoData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState<keyof VideoData>('recorded_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Modal state - Update URL
    const [showManualUrlDialog, setShowManualUrlDialog] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
    const [bunnyVideoId, setBunnyVideoId] = useState('');
    const [bunnyUrl, setBunnyUrl] = useState('');

    // Modal state - Create Manual Video
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [courts, setCourts] = useState<any[]>([]);
    const [createForm, setCreateForm] = useState({
        user_id: '',
        bunny_video_id: '',
        bunny_url: '',
        title: '',
        description: '',
        court_id: '',
        duration: ''  // En minutes
    });

    useEffect(() => {
        loadVideos();
        loadUsers();
        loadCourts();
    }, []);

    const loadVideos = async () => {
        try {
            setLoading(true);
            const response = await adminService.getAllVideos();
            setVideos(response.data.videos);
        } catch (error) {
            setError('Erreur lors du chargement des vidéos');
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const response = await adminService.getAllUsers();
            // Filter only players
            const players = response.data.users.filter((u: any) => u.role === 'player');
            setUsers(players);
        } catch (error) {
            console.error('Erreur chargement joueurs:', error);
        }
    };

    const loadCourts = async () => {
        try {
            const clubs = await adminService.getAllClubs();
            const allCourts: any[] = [];
            for (const club of clubs.data.clubs) {
                const courtsResponse = await adminService.getClubCourts(club.id);
                const clubCourts = courtsResponse.data.courts.map((c: any) => ({
                    ...c,
                    club_name: club.name
                }));
                allCourts.push(...clubCourts);
            }
            setCourts(allCourts);
        } catch (error) {
            console.error('Erreur chargement terrains:', error);
        }
    };

    const handleDeleteVideo = async (videoId: string, videoTitle: string, mode: string) => {
        const confirmMessages: Record<string, string> = {
            local_only: `Supprimer le fichier local de "${videoTitle}" ?\n\n✅ La vidéo restera regardable depuis le cloud`,
            cloud_only: `Expirer "${videoTitle}" du cloud ?\n\n⚠️ La vidéo ne sera plus regardable\n✅ Les statistiques seront préservées`,
            local_and_cloud: `Supprimer tous les fichiers de "${videoTitle}" ?\n\n⚠️ Fichier local + Cloud supprimés\n✅ Les statistiques seront préservées`,
            database: `⚠️ SUPPRESSION DÉFINITIVE de "${videoTitle}" ?\n\n❌ Tout sera supprimé\n❌ Les statistiques seront PERDUES\n\nCette action est IRRÉVERSIBLE !`
        };

        if (!confirm(confirmMessages[mode])) return;

        try {
            await adminService.deleteVideo(videoId, mode as any);
            toast.success('Vidéo supprimée avec succès');
            loadVideos();
            onStatsUpdate?.();
        } catch (error) {
            toast.error('Erreur lors de la suppression');
            setError('Erreur lors de la suppression');
        }
    };

    const handleRetryUpload = async (videoId: string) => {
        try {
            const response = await adminService.retryBunnyUpload(videoId);
            toast.success('Upload programmé avec succès');
            loadVideos();
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || 'Erreur lors du retry';
            toast.error(errorMsg);
        }
    };

    const openManualUrlDialog = (video: VideoData) => {
        setSelectedVideo(video);
        setBunnyVideoId(video.bunny_video_id || '');
        setBunnyUrl('');
        setShowManualUrlDialog(true);
    };

    const handleUpdateBunnyUrl = async () => {
        if (!selectedVideo || !bunnyVideoId) return;

        try {
            await adminService.updateBunnyUrl(selectedVideo.id, {
                bunny_video_id: bunnyVideoId,
                bunny_url: bunnyUrl || undefined
            });
            toast.success('URL mise à jour avec succès');
            setShowManualUrlDialog(false);
            setBunnyVideoId('');
            setBunnyUrl('');
            setSelectedVideo(null);
            loadVideos();
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || 'Erreur lors de la mise à jour';
            toast.error(errorMsg);
        }
    };

    const openCreateDialog = () => {
        setCreateForm({
            user_id: '',
            bunny_video_id: '',
            bunny_url: '',
            title: '',
            description: '',
            court_id: '',
            duration: ''
        });
        setShowCreateDialog(true);
    };

    const handleCreateManualVideo = async () => {
        if (!createForm.user_id || !createForm.bunny_video_id || !createForm.title) {
            toast.error('Veuillez remplir tous les champs requis');
            return;
        }

        try {
            const payload: any = {
                user_id: parseInt(createForm.user_id),
                bunny_video_id: createForm.bunny_video_id,
                title: createForm.title,
            };

            if (createForm.bunny_url) payload.bunny_url = createForm.bunny_url;
            if (createForm.description) payload.description = createForm.description;
            if (createForm.court_id) payload.court_id = parseInt(createForm.court_id);
            if (createForm.duration) payload.duration = parseInt(createForm.duration) * 60; // Convertir minutes en secondes

            await adminService.createManualVideo(payload);
            toast.success('Vidéo créée avec succès');
            setShowCreateDialog(false);
            loadVideos();
            onStatsUpdate?.();
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || 'Erreur lors de la création';
            toast.error(errorMsg);
        }
    };

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const formatDuration = (seconds?: number) => {
        if (!seconds) return 'N/A';
        const mins = Math.floor(seconds / 60);
        return `${mins}m`;
    };

    const handleSort = (column: keyof VideoData) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const getSortIcon = (column: keyof VideoData) => {
        if (sortBy !== column) return <ArrowUpDown className="h-4 w-4 ml-1 opacity-30" />;
        return sortOrder === 'asc' ?
            <ArrowUp className="h-4 w-4 ml-1" /> :
            <ArrowDown className="h-4 w-4 ml-1" />;
    };

    const getStatusBadge = (status?: string) => {
        const statusConfig: Record<string, { label: string; className: string }> = {
            'ready': { label: '✅ Prête', className: 'bg-green-100 text-green-800 border-green-200' },
            'processing': { label: '⏳ Traitement', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
            'uploading': { label: '📤 Upload', className: 'bg-blue-100 text-blue-800 border-blue-200' },
            'failed': { label: '❌ Échec', className: 'bg-red-100 text-red-800 border-red-200' },
            'pending': { label: '⏸️ En attente', className: 'bg-gray-100 text-gray-800 border-gray-200' }
        };

        const config = statusConfig[status || 'pending'] || { label: status || 'Inconnu', className: 'bg-gray-100 text-gray-800 border-gray-200' };
        return (
            <Badge variant="outline" className={config.className}>
                {config.label}
            </Badge>
        );
    };

    const handleFilterChange = (filter: string) => {
        setStatusFilter(filter);
    };

    const filteredVideos = videos.filter(video => {
        if (statusFilter === 'all') return true;
        return video.processing_status === statusFilter;
    });

    const sortedVideos = [...filteredVideos].sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        if (aVal === undefined || aVal === null) return 1;
        if (bVal === undefined || bVal === null) return -1;
        if (typeof aVal === 'string' && typeof bVal === 'string') {
            return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
    });

    return (
        <div className="space-y-6">
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Gestion des Vidéos</CardTitle>
                            <CardDescription>Gérez toutes les vidéos de la plateforme</CardDescription>
                        </div>

                        {/* Filtre par statut et bouton créer */}
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={openCreateDialog}
                                className="flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Nouvelle Vidéo
                            </Button>

                            <div className="flex items-center gap-2">
                                <Label className="text-sm text-gray-600">Filtrer :</Label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => handleFilterChange(e.target.value)}
                                    className="px-3 py-2 border rounded-md text-sm bg-white"
                                >
                                    <option value="all">Toutes les vidéos</option>
                                    <option value="ready">✅ Prêtes</option>
                                    <option value="processing">⏳ En traitement</option>
                                    <option value="failed">❌ Échecs</option>
                                    <option value="uploading">📤 Upload</option>
                                    <option value="pending">⏸️ En attente</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : sortedVideos.length === 0 ? (
                        <div className="text-center py-8">
                            <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">
                                {statusFilter === 'all' ? 'Aucune vidéo enregistrée' : `Aucune vidéo ${statusFilter === 'failed' ? 'en échec' : statusFilter}`}
                            </h3>
                            <p className="text-gray-600">
                                {statusFilter === 'all' ? 'Les vidéos apparaîtront ici une fois enregistrées' : 'Changez le filtre pour voir d\'autres vidéos'}
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16">#</TableHead>
                                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort('title')}>
                                        <div className="flex items-center">Nom {getSortIcon('title')}</div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort('player_name')}>
                                        <div className="flex items-center">Joueur {getSortIcon('player_name')}</div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort('club_name')}>
                                        <div className="flex items-center">Club {getSortIcon('club_name')}</div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort('recorded_at')}>
                                        <div className="flex items-center">Date {getSortIcon('recorded_at')}</div>
                                    </TableHead>
                                    <TableHead>Durée</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedVideos.map((video, index) => (
                                    <TableRow key={video.id}>
                                        <TableCell className="text-gray-500 font-mono text-sm">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {video.title || `Vidéo ${index + 1}`}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <User className="h-4 w-4 text-blue-500" />
                                                <span className="font-medium">{video.player_name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {video.club_name ? (
                                                <div className="flex items-center space-x-2">
                                                    <Building className="h-4 w-4 text-gray-400" />
                                                    <span>{video.club_name}</span>
                                                </div>
                                            ) : <span className="text-gray-400">-</span>}
                                        </TableCell>
                                        <TableCell>{formatDate(video.recorded_at)}</TableCell>
                                        <TableCell>{formatDuration(video.duration)}</TableCell>
                                        <TableCell>
                                            {getStatusBadge(video.processing_status)}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-64">
                                                    {/* Edit URL - Available for all videos */}
                                                    <DropdownMenuItem
                                                        onClick={() => openManualUrlDialog(video)}
                                                        className="cursor-pointer text-blue-600"
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        <div className="flex-1">
                                                            <div>✍️ Modifier Infos / URL Bunny</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                Mettre à jour Video ID ou URL
                                                            </div>
                                                        </div>
                                                    </DropdownMenuItem>

                                                    {/* Retry upload - Only for failed videos */}
                                                    {video.processing_status === 'failed' && (
                                                        <>
                                                            <DropdownMenuSeparator />

                                                            <DropdownMenuItem
                                                                onClick={() => handleRetryUpload(video.id)}
                                                                disabled={!video.has_local_file}
                                                                className="cursor-pointer text-blue-600"
                                                            >
                                                                <RefreshCw className="mr-2 h-4 w-4" />
                                                                <div className="flex-1">
                                                                    <div>🔄 Retry Upload Auto</div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {video.has_local_file ? 'Re-upload depuis fichier local' : 'Fichier local introuvable'}
                                                                    </div>
                                                                </div>
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}

                                                    <DropdownMenuSeparator />

                                                    {/* Standard deletion options */}
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteVideo(video.id, video.player_name, 'local_only')}
                                                        className="cursor-pointer"
                                                    >
                                                        <HardDrive className="mr-2 h-4 w-4" />
                                                        <div className="flex-1">
                                                            <div>Supprimer fichier local</div>
                                                            <div className="text-xs text-muted-foreground">Libère espace serveur</div>
                                                        </div>
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteVideo(video.id, video.player_name, 'cloud_only')}
                                                        className="cursor-pointer"
                                                    >
                                                        <Cloud className="mr-2 h-4 w-4" />
                                                        <div className="flex-1">
                                                            <div>Supprimer du cloud</div>
                                                            <div className="text-xs text-muted-foreground">Expire la vidéo, garde stats</div>
                                                        </div>
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteVideo(video.id, video.player_name, 'local_and_cloud')}
                                                        className="cursor-pointer text-orange-600"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        <div className="flex-1">
                                                            <div>Tout supprimer (garder stats)</div>
                                                            <div className="text-xs text-muted-foreground">Local + Cloud, stats OK</div>
                                                        </div>
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteVideo(video.id, video.player_name, 'database')}
                                                        className="cursor-pointer text-red-600"
                                                    >
                                                        <AlertTriangle className="mr-2 h-4 w-4" />
                                                        <div className="flex-1">
                                                            <div className="font-semibold">Supprimer définitivement</div>
                                                            <div className="text-xs">TOUT disparaît, stats perdues</div>
                                                        </div>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Manual URL Dialog */}
            <Dialog open={showManualUrlDialog} onOpenChange={setShowManualUrlDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Mettre à jour URL Bunny</DialogTitle>
                        <DialogDescription>
                            Vidéo : {selectedVideo?.title || selectedVideo?.player_name}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="bunny-video-id">Bunny Video ID *</Label>
                            <Input
                                id="bunny-video-id"
                                value={bunnyVideoId}
                                onChange={(e) => setBunnyVideoId(e.target.value)}
                                placeholder="e660b8a0-f342-41fb-872e-3824ab90ab66"
                                className="mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Format GUID (ex: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="bunny-url">URL Bunny (optionnel)</Label>
                            <Input
                                id="bunny-url"
                                value={bunnyUrl}
                                onChange={(e) => setBunnyUrl(e.target.value)}
                                placeholder="https://vz-9b857324-07d.b-cdn.net/..."
                                className="mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Laissez vide pour génération automatique
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowManualUrlDialog(false)}>
                            Annuler
                        </Button>
                        <Button onClick={handleUpdateBunnyUrl} disabled={!bunnyVideoId}>
                            Sauvegarder
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Manual Video Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>➕ Créer une Nouvelle Vidéo Manuelle</DialogTitle>
                        <DialogDescription>
                            Ajouter une vidéo uploadée via le dashboard Bunny pour un joueur
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Joueur */}
                        <div>
                            <Label htmlFor="user-select">Joueur *</Label>
                            <select
                                id="user-select"
                                value={createForm.user_id}
                                onChange={(e) => setCreateForm({ ...createForm, user_id: e.target.value })}
                                className="w-full mt-1 px-3 py-2 border rounded-md"
                            >
                                <option value="">Sélectionnez un joueur...</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Bunny Video ID */}
                        <div>
                            <Label htmlFor="create-bunny-id">Bunny Video ID *</Label>
                            <Input
                                id="create-bunny-id"
                                value={createForm.bunny_video_id}
                                onChange={(e) => setCreateForm({ ...createForm, bunny_video_id: e.target.value })}
                                placeholder="e660b8a0-f342-41fb-872e-3824ab90ab66"
                                className="mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Format GUID (ex: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
                            </p>
                        </div>

                        {/* Titre */}
                        <div>
                            <Label htmlFor="create-title">Titre *</Label>
                            <Input
                                id="create-title"
                                value={createForm.title}
                                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                                placeholder="Ma vidéo de padel"
                                className="mt-1"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <Label htmlFor="create-description">Description (optionnel)</Label>
                            <Input
                                id="create-description"
                                value={createForm.description}
                                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                                placeholder="Description de la vidéo..."
                                className="mt-1"
                            />
                        </div>

                        {/* Durée */}
                        <div>
                            <Label htmlFor="create-duration">Durée en minutes (optionnel)</Label>
                            <Input
                                id="create-duration"
                                type="number"
                                min="1"
                                value={createForm.duration}
                                onChange={(e) => setCreateForm({ ...createForm, duration: e.target.value })}
                                placeholder="90"
                                className="mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Laissez vide pour détection automatique depuis Bunny
                            </p>
                        </div>

                        {/* Terrain */}
                        <div>
                            <Label htmlFor="court-select">Terrain (optionnel)</Label>
                            <select
                                id="court-select"
                                value={createForm.court_id}
                                onChange={(e) => setCreateForm({ ...createForm, court_id: e.target.value })}
                                className="w-full mt-1 px-3 py-2 border rounded-md"
                            >
                                <option value="">Aucun terrain...</option>
                                {courts.map((court) => (
                                    <option key={court.id} value={court.id}>
                                        {court.club_name} - {court.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* URL Bunny */}
                        <div>
                            <Label htmlFor="create-bunny-url">URL Bunny (optionnel)</Label>
                            <Input
                                id="create-bunny-url"
                                value={createForm.bunny_url}
                                onChange={(e) => setCreateForm({ ...createForm, bunny_url: e.target.value })}
                                placeholder="https://vz-9b857324-07d.b-cdn.net/..."
                                className="mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Laissez vide pour génération automatique
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                            Annuler
                        </Button>
                        <Button
                            onClick={handleCreateManualVideo}
                            disabled={!createForm.user_id || !createForm.bunny_video_id || !createForm.title}
                        >
                            Créer la Vidéo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default VideoManagement;
