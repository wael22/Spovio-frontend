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
import { Badge } from '@/components/ui/badge';
import { Loader2, Scissors, User, Clock, Trash2, Edit, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';

interface ClipData {
    id: number;
    video_id: number;
    user_id: number;
    user: string;
    video_title: string;
    title: string;
    description: string | null;
    start_time: number;
    end_time: number;
    bunny_video_id: string | null;
    file_url?: string | null;
    storage_download_url?: string | null;
    status: string;
    created_at: string;
}

const ClipsManagement: React.FC = () => {
    const [clips, setClips] = useState<ClipData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal state for editing
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [selectedClip, setSelectedClip] = useState<ClipData | null>(null);
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        bunny_video_id: '',
        file_url: '',
        storage_download_url: ''
    });

    useEffect(() => {
        loadClips();
    }, []);

    const loadClips = async () => {
        try {
            setLoading(true);
            const response = await adminService.getAllClips();
            setClips(response.data.clips);
        } catch (error) {
            setError('Erreur lors du chargement des clips');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce clip définitivement (y compris sur le CDN Bunny) ?')) {
            return;
        }

        try {
            await adminService.deleteClip(id);
            toast.success('Clip supprimé avec succès');
            setClips(clips.filter(clip => clip.id !== id));
        } catch (error) {
            toast.error('Erreur lors de la suppression');
            setError('Erreur lors de la suppression du clip');
        }
    };

    const openEditDialog = (clip: ClipData) => {
        setSelectedClip(clip);
        setEditForm({
            title: clip.title || '',
            description: clip.description || '',
            bunny_video_id: clip.bunny_video_id || '',
            file_url: clip.file_url || '',
            storage_download_url: clip.storage_download_url || ''
        });
        setShowEditDialog(true);
    };

    const handleUpdateClip = async () => {
        if (!selectedClip) return;

        try {
            await adminService.updateClip(selectedClip.id, {
                title: editForm.title,
                description: editForm.description || undefined,
                bunny_video_id: editForm.bunny_video_id || undefined,
                file_url: editForm.file_url || undefined,
                storage_download_url: editForm.storage_download_url || undefined
            });
            toast.success('Clip mis à jour avec succès');
            setShowEditDialog(false);
            loadClips();
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || 'Erreur lors de la mise à jour';
            toast.error(errorMsg);
        }
    };

    const getStatusBadge = (status?: string) => {
        const statuses = {
            pending: { color: 'bg-yellow-100 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800', label: 'En attente' },
            processing: { color: 'bg-blue-100 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800 animate-pulse', label: 'En cours...' },
            uploading: { color: 'bg-indigo-100 text-indigo-800 border-indigo-200 animate-pulse', label: 'Téléchargement...' },
            completed: { color: 'bg-green-100 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800', label: 'Prêt' },
            failed: { color: 'bg-red-100 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800', label: 'Échec' }
        };

        const current = statuses[status as keyof typeof statuses] || { color: 'bg-gray-100 text-gray-800 border-gray-200 dark:border-gray-700', label: status || 'Inconnu' };

        return (
            <Badge variant="outline" className={`${current.color} font-medium`}>
                {current.label}
            </Badge>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-6">
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Clips Créés</CardTitle>
                            <CardDescription>Visualisez tous les clips créés par les utilisateurs</CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
                    ) : clips.length === 0 ? (
                        <div className="text-center py-8">
                            <Scissors className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">Aucun clip enregistré</h3>
                            <p className="text-gray-600 dark:text-gray-400">Les clips créés par les utilisateurs apparaîtront ici.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16">#</TableHead>
                                    <TableHead>Titre du Clip</TableHead>
                                    <TableHead>Créateur</TableHead>
                                    <TableHead>Vidéo d'origine</TableHead>
                                    <TableHead>Extrait</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Créé le</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clips.map((clip, index) => (
                                    <TableRow key={clip.id}>
                                        <TableCell className="text-gray-500 dark:text-gray-400 font-mono text-sm">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {clip.title}
                                            {clip.description && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400 font-normal mt-1 max-w-[200px] truncate">
                                                    {clip.description}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <User className="h-4 w-4 text-blue-500" />
                                                <span>{clip.user}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{clip.video_title}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                                                <Clock className="h-3 w-3" />
                                                <span>{formatTime(clip.start_time)} - {formatTime(clip.end_time)}</span>
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                ({formatTime(clip.end_time - clip.start_time)})
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(clip.status)}</TableCell>
                                        <TableCell>{formatDate(clip.created_at)}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-64">
                                                    <DropdownMenuItem
                                                        onClick={() => openEditDialog(clip)}
                                                        className="cursor-pointer text-blue-600"
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        <div className="flex-1">
                                                            <div>✍️ Modifier Infos / CDN</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                Mettre à jour titre, description ou Bunny ID
                                                            </div>
                                                        </div>
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuSeparator />
                                                    
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(clip.id)}
                                                        className="cursor-pointer text-red-600"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        <div className="flex-1">
                                                            <div className="font-semibold">Supprimer définitivement</div>
                                                            <div className="text-xs text-red-500 dark:text-red-400">Suppression de la DB + CDN</div>
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
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>✍️ Modifier Infos Clip / Bunny CDN</DialogTitle>
                        <DialogDescription>
                            Modifiez les métadonnées et les liaisons Bunny Stream de ce clip.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">Titre</Label>
                            <Input
                                id="title"
                                value={editForm.title}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">Description</Label>
                            <Input
                                id="description"
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="bunny_video_id" className="text-right">Bunny Video ID</Label>
                            <Input
                                id="bunny_video_id"
                                value={editForm.bunny_video_id}
                                onChange={(e) => setEditForm({ ...editForm, bunny_video_id: e.target.value })}
                                className="col-span-3 font-mono text-sm"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="file_url" className="text-right">URL Clip (Play)</Label>
                            <Input
                                id="file_url"
                                value={editForm.file_url}
                                onChange={(e) => setEditForm({ ...editForm, file_url: e.target.value })}
                                className="col-span-3 text-sm"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="storage_download_url" className="text-right">URL Stockage (DL)</Label>
                            <Input
                                id="storage_download_url"
                                value={editForm.storage_download_url}
                                onChange={(e) => setEditForm({ ...editForm, storage_download_url: e.target.value })}
                                className="col-span-3 text-sm"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditDialog(false)}>Annuler</Button>
                        <Button onClick={handleUpdateClip}>Enregistrer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ClipsManagement;
