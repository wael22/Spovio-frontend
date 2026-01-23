import React, { useState, useEffect } from 'react';
import { clubService } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Coins, Calendar, Gift, Loader2, User } from 'lucide-react';

interface HistoryEntry {
    id: number;
    user_id: number;
    player_name: string;
    action_type: string;
    action_details: string;
    performed_at: string;
    performed_by_name?: string;
}

const ClubHistory: React.FC = () => {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            setLoading(true);
            const response = await clubService.getClubHistory();
            const allHistory = response.data.history || [];

            // Filter to show ONLY credits offered by THIS club to its players
            const filteredHistory = allHistory.filter((entry: HistoryEntry) => {
                // Show only "add_credits" actions (credits offered to players)
                // This excludes:
                // - buy_credits (player purchases)
                // - receive_credits_from_admin (admin giving credits to club)
                // - follow_club, unfollow_club (player actions)
                // - stop_recording (player/club recording actions)
                // - add_player, update_player (should show if needed)
                return entry.action_type === 'add_credits';
            });

            setHistory(filteredHistory);
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const dateStr = dateString.endsWith('Z') ? dateString : dateString + 'Z';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const getActionLabel = (actionType: string, details: string) => {
        try {
            const parsedDetails = JSON.parse(details);

            // Credits received from admin (for clubs)
            if (actionType === 'receive_credits_from_admin') {
                const credits = parsedDetails.credits_added || parsedDetails.credits || 0;
                return {
                    text: `+${credits} crédits reçus`,
                    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
                    amount: credits
                };
            }

            // Credits offered to players
            if (actionType === 'add_credits') {
                const credits = parsedDetails.credits_added || parsedDetails.credits || 0;
                return {
                    text: `+${credits} crédits offerts`,
                    color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
                    amount: credits
                };
            }

            // Credits purchased (shouldn't appear for clubs, but just in case)
            if (actionType === 'buy_credits') {
                const credits = parsedDetails.credits_bought || parsedDetails.credits || 0;
                return {
                    text: `+${credits} crédits achetés`,
                    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
                    amount: credits
                };
            }

            // Player management
            if (actionType === 'add_player') {
                return {
                    text: 'Joueur ajouté',
                    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
                    amount: null
                };
            }

            if (actionType === 'update_player') {
                return {
                    text: 'Infos modifiées',
                    color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
                    amount: null
                };
            }

            // Club following
            if (actionType === 'follow_club') {
                return {
                    text: 'Suivi activé',
                    color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400',
                    amount: null
                };
            }

            if (actionType === 'unfollow_club') {
                return {
                    text: 'Suivi désactivé',
                    color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
                    amount: null
                };
            }

            // Recording actions
            if (actionType === 'stop_recording') {
                return {
                    text: 'Enregistrement arrêté',
                    color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
                    amount: null
                };
            }

        } catch (e) {
            // Fallback if JSON parsing fails
        }

        // Default fallback
        return {
            text: actionType.replace(/_/g, ' '),
            color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
            amount: null
        };
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <CardTitle>Historique des Crédits</CardTitle>
                </div>
                <CardDescription>
                    Historique des crédits offerts aux joueurs du club
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center py-8">
                        <Gift className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Aucun historique de crédits</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Joueur</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Crédits</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.map((entry) => {
                                const actionInfo = getActionLabel(entry.action_type, entry.action_details);
                                return (
                                    <TableRow key={entry.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center space-x-2">
                                                <User className="h-4 w-4 text-blue-500" />
                                                <span>{entry.player_name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`text-sm px-2 py-1 rounded ${actionInfo.color}`}>
                                                {actionInfo.text}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {actionInfo.amount !== null && (
                                                <div className="flex items-center space-x-2">
                                                    <Coins className="h-4 w-4 text-amber-500" />
                                                    <span className="font-medium">{actionInfo.amount}</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                                            {formatDate(entry.performed_at)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
};

export default ClubHistory;
