import React, { useState, useEffect } from 'react';
import { adminService } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Video, Loader2, Trash2, User, Building, MoreVertical, HardDrive, Cloud, AlertTriangle, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface VideoData {
    id: string;
    title?: string;
    player_name: string;
    club_name?: string;
    recorded_at: string;
    duration?: number;
    deletion_mode?: string;
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

    useEffect(() => {
        loadVideos();
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
            loadVideos();
            onStatsUpdate?.();
        } catch (error) {
            setError('Erreur lors de la suppression');
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

    const sortedVideos = [...videos].sort((a, b) => {
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
                    <CardTitle>Gestion des Vidéos</CardTitle>
                    <CardDescription>Gérez toutes les vidéos de la plateforme</CardDescription>
                </CardHeader>

                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : videos.length === 0 ? (
                        <div className="text-center py-8">
                            <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">Aucune vidéo enregistrée</h3>
                            <p className="text-gray-600">Les vidéos apparaîtront ici une fois enregistrées</p>
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
                                            {video.deletion_mode === 'cloud_only' ? (
                                                <Badge variant="outline" className="text-orange-600">Expiré</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-green-600">Actif</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-64">
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
        </div>
    );
};

export default VideoManagement;
