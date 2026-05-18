import React, { useState, useEffect } from 'react';
import { adminService } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Share2, User, Trash2, Edit, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';

interface SharedVideoData {
    id: number;
    video_id: number;
    video_title: string;
    owner: string;
    shared_with: string;
    shared_with_user_id: number;
    shared_at: string;
    expires_at: string | null;
    message?: string | null;
}

const SharedVideosManagement: React.FC = () => {
    const [sharedVideos, setSharedVideos] = useState<SharedVideoData[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal state for editing
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [selectedShared, setSelectedShared] = useState<SharedVideoData | null>(null);
    const [editForm, setEditForm] = useState({
        message: '',
        shared_with_user_id: 0
    });

    useEffect(() => {
        loadSharedVideos();
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await adminService.getAllUsers();
            // Filter only players or basic users
            const players = response.data.users.filter((u: any) => u.role === 'player' || u.role === 'user');
            setUsers(players.length > 0 ? players : response.data.users);
        } catch (err) {
            console.error('Erreur chargement utilisateurs:', err);
        }
    };

    const loadSharedVideos = async () => {
        try {
            setLoading(true);
            const response = await adminService.getAllSharedVideos();
            setSharedVideos(response.data.shared_videos);
        } catch (error) {
            setError('Erreur lors du chargement des vidéos partagées');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce partage ?')) {
            return;
        }

        try {
            await adminService.deleteSharedVideo(id);
            toast.success('Partage supprimé avec succès');
            setSharedVideos(sharedVideos.filter(sv => sv.id !== id));
        } catch (error) {
            toast.error('Erreur lors de la suppression');
            setError('Erreur lors de la suppression du partage');
        }
    };

    const openEditDialog = (sv: SharedVideoData) => {
        setSelectedShared(sv);
        setEditForm({
            message: sv.message || '',
            shared_with_user_id: sv.shared_with_user_id || 0
        });
        setShowEditDialog(true);
    };

    const handleUpdateSharedVideo = async () => {
        if (!selectedShared) return;

        try {
            await adminService.updateSharedVideo(selectedShared.id, {
                message: editForm.message,
                shared_with_user_id: editForm.shared_with_user_id || undefined
            });
            toast.success('Partage mis à jour avec succès');
            setShowEditDialog(false);
            loadSharedVideos();
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || 'Erreur lors de la mise à jour';
            toast.error(errorMsg);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Vidéos Partagées</CardTitle>
                            <CardDescription>Consultez les partages de vidéos entre utilisateurs</CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
                    ) : sharedVideos.length === 0 ? (
                        <div className="text-center py-8">
                            <Share2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">Aucun partage actif</h3>
                            <p className="text-gray-600">Aucune vidéo n'a été partagée pour le moment.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16">#</TableHead>
                                    <TableHead>Vidéo</TableHead>
                                    <TableHead>Propriétaire</TableHead>
                                    <TableHead>Partagé avec</TableHead>
                                    <TableHead>Date du partage</TableHead>
                                    <TableHead>Message</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sharedVideos.map((sv, index) => (
                                    <TableRow key={sv.id}>
                                        <TableCell className="text-gray-500 font-mono text-sm">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {sv.video_title}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <User className="h-4 w-4 text-blue-500" />
                                                <span>{sv.owner}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <User className="h-4 w-4 text-green-500" />
                                                <span className="font-medium">{sv.shared_with}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{formatDate(sv.shared_at)}</TableCell>
                                        <TableCell>
                                            <span className="text-xs text-gray-500 italic max-w-[200px] truncate block">
                                                {sv.message || 'Aucun message'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-64">
                                                    <DropdownMenuItem
                                                        onClick={() => openEditDialog(sv)}
                                                        className="cursor-pointer text-blue-600"
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        <div className="flex-1">
                                                            <div>✍️ Modifier Infos / Destinataire</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                Mettre à jour le destinataire ou message
                                                            </div>
                                                        </div>
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuSeparator />
                                                    
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(sv.id)}
                                                        className="cursor-pointer text-red-600"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        <div className="flex-1">
                                                            <div className="font-semibold">Supprimer le partage</div>
                                                            <div className="text-xs text-red-500">Retirer l'accès de l'utilisateur</div>
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

            {/* Edit Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle>✍️ Modifier Infos Partage</DialogTitle>
                        <DialogDescription>
                            Modifiez le message ou le destinataire de ce partage.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="shared_with_user_id" className="text-right font-medium">Partager avec</Label>
                            <select
                                id="shared_with_user_id"
                                value={editForm.shared_with_user_id}
                                onChange={(e) => setEditForm({ ...editForm, shared_with_user_id: Number(e.target.value) })}
                                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value={0} disabled>Sélectionner un destinataire...</option>
                                {users.map((u: any) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name} ({u.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="message" className="text-right font-medium">Message</Label>
                            <Input
                                id="message"
                                value={editForm.message}
                                onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                                className="col-span-3"
                                placeholder="Message optionnel..."
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditDialog(false)}>Annuler</Button>
                        <Button onClick={handleUpdateSharedVideo}>Enregistrer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SharedVideosManagement;
