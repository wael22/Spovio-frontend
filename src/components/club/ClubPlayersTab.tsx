import React, { useState, useMemo } from 'react';
import { clubService } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { User, Coins, Plus, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface Player {
    id: string;
    name: string;
    email: string;
    credits_balance: number;
    video_count?: number;
}

interface Video {
    id: string;
    user_id: string;
    player_name?: string;
}

interface ClubPlayersTabProps {
    players: Player[];
    videos: Video[];
    onPlayersUpdated?: () => void;
}

type SortField = 'name' | 'videos';
type SortDirection = 'asc' | 'desc' | null;

const ClubPlayersTab: React.FC<ClubPlayersTabProps> = ({ players, videos, onPlayersUpdated }) => {
    const [showCreditsModal, setShowCreditsModal] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [creditsToAdd, setCreditsToAdd] = useState(0);
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);

    // Calculate video count for each player
    const playersWithVideoCounts = useMemo(() => {
        return players.map(player => {
            const videoCount = videos.filter(video => video.user_id === player.id).length;
            return {
                ...player,
                video_count: videoCount
            };
        });
    }, [players, videos]);

    // Sort players
    const sortedPlayers = useMemo(() => {
        if (!sortField || !sortDirection) return playersWithVideoCounts;

        return [...playersWithVideoCounts].sort((a, b) => {
            let aValue: any;
            let bValue: any;

            if (sortField === 'name') {
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
            } else if (sortField === 'videos') {
                aValue = a.video_count || 0;
                bValue = b.video_count || 0;
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [playersWithVideoCounts, sortField, sortDirection]);

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

    const handleAddCredits = async () => {
        if (!selectedPlayer || creditsToAdd <= 0) return;
        try {
            await clubService.addCreditsToPlayer(selectedPlayer.id, creditsToAdd);
            setShowCreditsModal(false);
            setCreditsToAdd(0);
            // Reload dashboard data
            if (onPlayersUpdated) {
                onPlayersUpdated();
            }
        } catch (error) {
            console.error('Error adding credits:', error);
        }
    };

    const openCreditsModal = (player: Player) => {
        setSelectedPlayer(player);
        setCreditsToAdd(0);
        setShowCreditsModal(true);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Joueurs du Club</CardTitle>
                <CardDescription>
                    {sortedPlayers.length} joueur(s) inscrit(s)
                </CardDescription>
            </CardHeader>
            <CardContent>
                {sortedPlayers.length === 0 ? (
                    <div className="text-center py-8">
                        <User className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Aucun joueur inscrit</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    <button
                                        className="flex items-center hover:text-gray-900 dark:hover:text-gray-100"
                                        onClick={() => handleSort('name')}
                                    >
                                        Nom
                                        {getSortIcon('name')}
                                    </button>
                                </TableHead>
                                <TableHead>ID</TableHead>
                                <TableHead>
                                    <button
                                        className="flex items-center hover:text-gray-900 dark:hover:text-gray-100"
                                        onClick={() => handleSort('videos')}
                                    >
                                        Vidéos
                                        {getSortIcon('videos')}
                                    </button>
                                </TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedPlayers.map((player) => (
                                <TableRow key={player.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center space-x-2">
                                            <User className="h-4 w-4 text-blue-500" />
                                            <span>{player.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                                        #{player.id}
                                    </TableCell>
                                    <TableCell>{player.video_count || 0}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openCreditsModal(player)}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Offrir crédits
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

                {/* Credits Modal */}
                <Dialog open={showCreditsModal} onOpenChange={setShowCreditsModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Offrir des Crédits</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Joueur: <span className="font-medium">{selectedPlayer?.name}</span></p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Solde actuel: <span className="font-medium">{selectedPlayer?.credits_balance || 0} crédits</span></p>
                            </div>
                            <div className="space-y-2">
                                <Label>Nombre de crédits à offrir</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={creditsToAdd}
                                    onChange={(e) => setCreditsToAdd(parseInt(e.target.value) || 0)}
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setShowCreditsModal(false)}>
                                    Annuler
                                </Button>
                                <Button onClick={handleAddCredits} disabled={creditsToAdd <= 0}>
                                    <Coins className="h-4 w-4 mr-2" />
                                    Offrir {creditsToAdd} crédit{creditsToAdd > 1 ? 's' : ''}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
};

export default ClubPlayersTab;
