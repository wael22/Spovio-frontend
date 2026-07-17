import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Video, User, Calendar, Clock, ArrowUpDown, ArrowUp, ArrowDown, Search, X } from 'lucide-react';

interface ClubVideo {
    id: string;
    player_name: string;
    recorded_at: string;
    duration?: number;
    court_name?: string;
    title?: string;
}

interface ClubVideosTabProps {
    videos: ClubVideo[];
}

type SortField = 'title' | 'player' | 'date' | 'duration';
type SortDirection = 'asc' | 'desc' | null;

const ClubVideosTab: React.FC<ClubVideosTabProps> = ({ videos }) => {
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const formatDuration = (seconds?: number) => {
        if (!seconds) return 'N/A';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Filter videos by search term
    const filteredVideos = useMemo(() => {
        if (!searchTerm) return videos;
        const term = searchTerm.toLowerCase();
        return videos.filter(v =>
            (v.title || 'Sans titre').toLowerCase().includes(term) ||
            v.player_name.toLowerCase().includes(term) ||
            (v.court_name || '').toLowerCase().includes(term)
        );
    }, [videos, searchTerm]);

    // Sort videos
    const sortedVideos = useMemo(() => {
        if (!sortField || !sortDirection) return filteredVideos;

        return [...filteredVideos].sort((a, b) => {
            let aValue: any;
            let bValue: any;

            if (sortField === 'title') {
                aValue = (a.title || 'Sans titre').toLowerCase();
                bValue = (b.title || 'Sans titre').toLowerCase();
            } else if (sortField === 'player') {
                aValue = a.player_name.toLowerCase();
                bValue = b.player_name.toLowerCase();
            } else if (sortField === 'date') {
                aValue = new Date(a.recorded_at).getTime();
                bValue = new Date(b.recorded_at).getTime();
            } else if (sortField === 'duration') {
                aValue = a.duration || 0;
                bValue = b.duration || 0;
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredVideos, sortField, sortDirection]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            // Cycle through: asc -> desc -> null
            if (sortDirection === 'asc') {
                setSortDirection('desc');
            } else if (sortDirection === 'desc') {
                setSortDirection(null);
                setSortField(null);
            }
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) {
            return <ArrowUpDown className="h-4 w-4 ml-1" />;
        }
        if (sortDirection === 'asc') {
            return <ArrowUp className="h-4 w-4 ml-1" />;
        }
        return <ArrowDown className="h-4 w-4 ml-1" />;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Vidéos du Club</CardTitle>
                <CardDescription>
                    {searchTerm
                        ? `${sortedVideos.length} résultat(s) pour "${searchTerm}" (${videos.length} total)`
                        : `${sortedVideos.length} vidéo(s) enregistrée(s)`
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                {videos.length > 0 && (
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Rechercher par titre, joueur ou terrain..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-10"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                )}
                {sortedVideos.length === 0 ? (
                    <div className="text-center py-8">
                        <Video className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                            {searchTerm ? `Aucun résultat pour "${searchTerm}"` : 'Aucune vidéo enregistrée'}
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    <button
                                        className="flex items-center hover:text-gray-900 dark:hover:text-gray-100"
                                        onClick={() => handleSort('title')}
                                    >
                                        Titre
                                        {getSortIcon('title')}
                                    </button>
                                </TableHead>
                                <TableHead>
                                    <button
                                        className="flex items-center hover:text-gray-900 dark:hover:text-gray-100"
                                        onClick={() => handleSort('player')}
                                    >
                                        Joueur
                                        {getSortIcon('player')}
                                    </button>
                                </TableHead>
                                <TableHead>Terrain</TableHead>
                                <TableHead>
                                    <button
                                        className="flex items-center hover:text-gray-900 dark:hover:text-gray-100"
                                        onClick={() => handleSort('date')}
                                    >
                                        Date
                                        {getSortIcon('date')}
                                    </button>
                                </TableHead>
                                <TableHead>
                                    <button
                                        className="flex items-center hover:text-gray-900 dark:hover:text-gray-100"
                                        onClick={() => handleSort('duration')}
                                    >
                                        Durée
                                        {getSortIcon('duration')}
                                    </button>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedVideos.map((video) => (
                                <TableRow key={video.id}>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Video className="h-4 w-4 text-purple-500" />
                                            <span className="font-medium">{video.title || 'Sans titre'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <User className="h-4 w-4 text-blue-500" />
                                            <span>{video.player_name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{video.court_name || '-'}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm">{formatDate(video.recorded_at)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm">{formatDuration(video.duration)}</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
};

export default ClubVideosTab;
