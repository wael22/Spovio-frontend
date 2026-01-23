import React, { useState, useEffect } from 'react';
import { adminService } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
    History,
    Loader2,
    Heart,
    HeartOff,
    Edit,
    Plus,
    UserPlus,
    UserMinus,
    Calendar,
    User,
    Building,
    Filter,
    Search,
    ShoppingCart,
    Trash2,
    Eye,
    Video
} from 'lucide-react';

interface HistoryEntry {
    id: string;
    club_id: number;
    club_name: string;
    player_name: string;
    performed_by_name: string;
    action_type: string;
    action_details?: string;
    action_summary?: string;
    performed_at: string;
}

interface Club {
    id: number;
    name: string;
}

const ClubHistoryAdmin: React.FC = () => {
    const [allHistory, setAllHistory] = useState<HistoryEntry[]>([]);
    const [filteredHistory, setFilteredHistory] = useState<HistoryEntry[]>([]);
    const [clubs, setClubs] = useState<Club[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        clubId: 'all',
        actionType: 'all',
        search: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [allHistory, filters]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [historyResponse, clubsResponse] = await Promise.all([
                adminService.getAllClubsHistory(),
                adminService.getAllClubs()
            ]);

            setAllHistory(historyResponse.data.history || []);
            setClubs(clubsResponse.data.clubs || []);
        } catch (error) {
            setError('Erreur lors du chargement des données');
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...allHistory];

        if (filters.clubId && filters.clubId !== 'all') {
            const clubIdToFilter = parseInt(filters.clubId, 10);
            filtered = filtered.filter(entry => entry.club_id === clubIdToFilter);
        }

        if (filters.actionType && filters.actionType !== 'all') {
            filtered = filtered.filter(entry => entry.action_type === filters.actionType);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(entry =>
                (entry.player_name && entry.player_name.toLowerCase().includes(searchLower)) ||
                (entry.club_name && entry.club_name.toLowerCase().includes(searchLower)) ||
                (entry.performed_by_name && entry.performed_by_name.toLowerCase().includes(searchLower))
            );
        }

        setFilteredHistory(filtered);
    };

    const getActionIcon = (actionType: string) => {
        const normalizedType = actionType?.toLowerCase().replace(/\s+/g, '_');

        switch (normalizedType) {
            case 'follow_club':
                return <Heart className="h-4 w-4 text-green-600" />;
            case 'unfollow_club':
                return <HeartOff className="h-4 w-4 text-red-600" />;
            case 'add_credits':
            case 'buy_credits':
                return <ShoppingCart className="h-4 w-4 text-blue-600" />;
            case 'update_player':
                return <Edit className="h-4 w-4 text-blue-600" />;
            case 'create_player':
                return <UserPlus className="h-4 w-4 text-green-600" />;
            case 'delete_player':
                return <UserMinus className="h-4 w-4 text-red-600" />;
            case 'unlock_video':
                return <Eye className="h-4 w-4 text-cyan-600" />;
            case 'video_upload':
                return <Video className="h-4 w-4 text-green-600" />;
            case 'video_delete':
                return <Trash2 className="h-4 w-4 text-red-600" />;
            default:
                return <History className="h-4 w-4 text-gray-600" />;
        }
    };

    const getActionLabel = (actionType: string) => {
        const labels: Record<string, string> = {
            'follow_club': 'Suivi du club',
            'unfollow_club': 'Arrêt du suivi',
            'add_credits': 'Ajout de crédits',
            'buy_credits': 'Achat de crédits',
            'update_player': 'Modification joueur',
            'create_player': 'Création joueur',
            'delete_player': 'Suppression joueur',
            'unlock_video': 'Déblocage vidéo',
            'video_upload': 'Upload vidéo',
            'video_delete': 'Suppression vidéo'
        };

        const normalizedKey = actionType?.toLowerCase().replace(/\s+/g, '_');
        return labels[normalizedKey] || actionType || 'Action inconnue';
    };

    const getActionVariant = (actionType: string): "default" | "destructive" | "secondary" | "outline" => {
        const normalizedType = actionType?.toLowerCase().replace(/\s+/g, '_');

        switch (normalizedType) {
            case 'follow_club':
            case 'create_player':
            case 'buy_credits':
            case 'video_upload':
                return 'default';
            case 'unfollow_club':
            case 'delete_player':
            case 'video_delete':
                return 'destructive';
            case 'update_player':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    const formatDate = (dateString: string) => {
        const dateStr = dateString.endsWith('Z') ? dateString : dateString + 'Z';
        return new Date(dateStr).toLocaleString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const clearFilters = () => {
        setFilters({ clubId: 'all', actionType: 'all', search: '' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Historique Global des Clubs</h2>
                <p className="text-muted-foreground mt-2">
                    Suivi de toutes les actions effectuées sur la plateforme ({filteredHistory.length} résultats).
                </p>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filtres
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Club</label>
                            <Select
                                value={filters.clubId}
                                onValueChange={(value) => setFilters({ ...filters, clubId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Tous les clubs" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les clubs</SelectItem>
                                    {clubs.map((club) => (
                                        <SelectItem key={club.id} value={club.id.toString()}>
                                            {club.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Type d'action</label>
                            <Select
                                value={filters.actionType}
                                onValueChange={(value) => setFilters({ ...filters, actionType: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Toutes les actions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Toutes les actions</SelectItem>
                                    <SelectItem value="follow_club">Suivi du club</SelectItem>
                                    <SelectItem value="unfollow_club">Arrêt du suivi</SelectItem>
                                    <SelectItem value="update_player">Modification du joueur</SelectItem>
                                    <SelectItem value="add_credits">Ajout de crédits</SelectItem>
                                    <SelectItem value="create_player">Création du joueur</SelectItem>
                                    <SelectItem value="delete_player">Suppression du joueur</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Recherche</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Nom du joueur, club..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="flex items-end">
                            <Button variant="outline" onClick={clearFilters} className="w-full">
                                Effacer
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {filteredHistory.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Aucun historique trouvé</h3>
                        <p className="text-muted-foreground">Aucune action ne correspond à vos filtres.</p>
                        {allHistory.length > 0 && (
                            <Button variant="outline" onClick={clearFilters} className="mt-4">
                                Voir tout l'historique
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredHistory.map((entry) => (
                        <Card key={entry.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 mt-1">
                                        {getActionIcon(entry.action_type)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <Badge variant={getActionVariant(entry.action_type)}>
                                                {getActionLabel(entry.action_type)}
                                            </Badge>
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                                <Building className="h-3 w-3 mr-1" />
                                                {entry.club_name}
                                            </Badge>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm flex-wrap">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium">{entry.player_name}</span>
                                                <span className="text-muted-foreground">par {entry.performed_by_name}</span>
                                            </div>

                                            {entry.action_summary && (
                                                <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                                                    {entry.action_summary}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0 text-right text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>{formatDate(entry.performed_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClubHistoryAdmin;
