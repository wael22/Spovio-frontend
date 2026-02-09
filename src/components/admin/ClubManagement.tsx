import React, { useState, useEffect } from 'react';
import { adminService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Plus, Building, MapPin, Phone, Mail, Loader2, Edit, Trash2, MoreVertical, Coins, Video, Eye, Settings, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import ClubOverlayManager from './ClubOverlayManager';
import CourtControlPanel from './CourtControlPanel';

interface Club {
    id: string;
    name: string;
    address?: string;
    phone_number?: string;
    email?: string;
    credits_balance: number;
    video_count?: number;
    created_at: string;
}

interface ClubManagementProps {
    onStatsUpdate?: () => void;
    onDataChange?: () => void;
}

const ClubManagement: React.FC<ClubManagementProps> = ({ onStatsUpdate, onDataChange }) => {
    const [clubs, setClubs] = useState<Club[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState<keyof Club>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCourtsModal, setShowCourtsModal] = useState(false);
    const [showControlModal, setShowControlModal] = useState(false);
    const [showOverlayManager, setShowOverlayManager] = useState(false);
    const [showCourtModal, setShowCourtModal] = useState(false);
    const [showEditCourtModal, setShowEditCourtModal] = useState(false);
    const [selectedClub, setSelectedClub] = useState<Club | null>(null);
    const [selectedCourt, setSelectedCourt] = useState<any>(null);
    const [clubCourts, setClubCourts] = useState<any[]>([]);
    const [clubFormData, setClubFormData] = useState({
        name: '', address: '', phone_number: '', email: '', password: '', credits_balance: 0
    });
    const [courtFormData, setCourtFormData] = useState({
        name: '', camera_url: '', qr_code: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadClubs();
    }, []);

    const loadClubs = async () => {
        try {
            setLoading(true);
            const response = await adminService.getAllClubs();
            setClubs(response.data.clubs);
        } catch (error) {
            setError('Erreur lors du chargement des clubs');
        } finally {
            setLoading(false);
        }
    };

    const loadClubCourts = async (clubId: string) => {
        try {
            const response = await adminService.getClubCourts(clubId);
            setClubCourts(response.data.courts || []);
        } catch (error) {
            setError('Erreur lors du chargement des terrains');
        }
    };

    const handleCreateClub = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await adminService.createClub(clubFormData);
            setShowCreateModal(false);
            resetForm();
            loadClubs();
            onStatsUpdate?.();
            onDataChange?.();
        } catch (error) {
            setError('Erreur lors de la création du club');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateClub = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await adminService.updateClub(selectedClub!.id, {
                name: clubFormData.name,
                address: clubFormData.address,
                phone_number: clubFormData.phone_number,
                email: clubFormData.email,
                credits_balance: clubFormData.credits_balance
            });

            setShowEditModal(false);
            resetForm();
            loadClubs();
            onStatsUpdate?.();
            onDataChange?.();
        } catch (error) {
            setError('Erreur lors de la mise à jour du club');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClub = async (clubId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce club ?')) return;
        try {
            await adminService.deleteClub(clubId);
            loadClubs();
            onStatsUpdate?.();
            onDataChange?.();
        } catch (error) {
            setError('Erreur lors de la suppression du club');
        }
    };

    const handleAddCredits = (club: Club) => {
        const credits = prompt(`Combien de crédits offrir à ${club.name} ?\n\nSolde actuel : ${club.credits_balance || 0} crédits`, "100");
        if (credits && parseInt(credits) > 0) {
            adminService.addCreditsToClub(club.id, parseInt(credits))
                .then(() => {
                    alert(`✅ ${credits} crédits offerts à ${club.name} !`);
                    loadClubs();
                })
                .catch(() => alert("Erreur lors de l'ajout des crédits"));
        }
    };

    const resetForm = () => {
        setClubFormData({ name: '', address: '', phone_number: '', email: '', password: '', credits_balance: 0 });
        setSelectedClub(null);
    };

    const openEditModal = (club: Club) => {
        setSelectedClub(club);
        setClubFormData({
            name: club.name,
            address: club.address || '',
            phone_number: club.phone_number || '',
            email: club.email || '',

            password: '',
            credits_balance: club.credits_balance || 0
        });
        setShowEditModal(true);
    };

    const openCourtsModal = async (club: Club) => {
        setSelectedClub(club);
        await loadClubCourts(club.id);
        setShowCourtsModal(true);
    };

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('fr-FR');

    const handleSort = (column: keyof Club) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const getSortIcon = (column: keyof Club) => {
        if (sortBy !== column) return <ArrowUpDown className="h-4 w-4 ml-1 opacity-30" />;
        return sortOrder === 'asc' ?
            <ArrowUp className="h-4 w-4 ml-1" /> :
            <ArrowDown className="h-4 w-4 ml-1" />;
    };

    const sortedClubs = [...clubs].sort((a, b) => {
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
                            <CardTitle>Gestion des Clubs</CardTitle>
                            <CardDescription>Créez et gérez les clubs de padel</CardDescription>
                        </div>
                        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                            <DialogTrigger asChild>
                                <Button><Plus className="h-4 w-4 mr-2" />Nouveau Club</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Créer un Club</DialogTitle>
                                    <DialogDescription>Ajoutez un nouveau club de padel à la plateforme</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreateClub} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Nom du club</Label>
                                        <Input value={clubFormData.name} onChange={(e) => setClubFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Ex: Club de Padel Paris" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Adresse</Label>
                                        <Input value={clubFormData.address} onChange={(e) => setClubFormData(prev => ({ ...prev, address: e.target.value }))} placeholder="123 Rue de la Paix, 75001 Paris" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Téléphone</Label>
                                        <Input value={clubFormData.phone_number} onChange={(e) => setClubFormData(prev => ({ ...prev, phone_number: e.target.value }))} placeholder="+33 1 23 45 67 89" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input type="email" value={clubFormData.email} onChange={(e) => setClubFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="contact@clubpadel.com" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Mot de passe</Label>
                                        <Input type="password" value={clubFormData.password} onChange={(e) => setClubFormData(prev => ({ ...prev, password: e.target.value }))} placeholder="Mot de passe du club" required />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Annuler</Button>
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                            Créer le Club
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>

                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : clubs.length === 0 ? (
                        <div className="text-center py-8">
                            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">Aucun club enregistré</h3>
                            <p className="text-gray-600 mb-4">Commencez par créer votre premier club</p>
                            <Button onClick={() => setShowCreateModal(true)}><Plus className="h-4 w-4 mr-2" />Créer un Club</Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort('name')}>
                                        <div className="flex items-center">Nom {getSortIcon('name')}</div>
                                    </TableHead>
                                    <TableHead>Adresse</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort('credits_balance')}>
                                        <div className="flex items-center">Crédits {getSortIcon('credits_balance')}</div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort('created_at')}>
                                        <div className="flex items-center">Date de création {getSortIcon('created_at')}</div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort('video_count')}>
                                        <div className="flex items-center">Vidéos {getSortIcon('video_count')}</div>
                                    </TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedClubs.map((club) => (
                                    <TableRow key={club.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center space-x-2">
                                                <Building className="h-4 w-4 text-blue-500" />
                                                <span>{club.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {club.address ? (
                                                <div className="flex items-center space-x-2">
                                                    <MapPin className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm">{club.address}</span>
                                                </div>
                                            ) : <span className="text-gray-400">-</span>}
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                {club.phone_number && (
                                                    <div className="flex items-center space-x-2 text-sm">
                                                        <Phone className="h-3 w-3 text-gray-400" />
                                                        <span>{club.phone_number}</span>
                                                    </div>
                                                )}
                                                {club.email && (
                                                    <div className="flex items-center space-x-2 text-sm">
                                                        <Mail className="h-3 w-3 text-gray-400" />
                                                        <span>{club.email}</span>
                                                    </div>
                                                )}
                                                {!club.phone_number && !club.email && <span className="text-gray-400">-</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Coins className="h-4 w-4 text-amber-500" />
                                                <span className="font-medium">{club.credits_balance || 0}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{formatDate(club.created_at)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Video className="h-4 w-4 text-blue-500" />
                                                <span className="font-medium">{club.video_count || 0}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openEditModal(club)}>
                                                        <Edit className="mr-2 h-4 w-4" />Modifier
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openCourtsModal(club)}>
                                                        <Eye className="mr-2 h-4 w-4" />Voir Terrains
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => { setSelectedClub(club); setShowControlModal(true); }}>
                                                        <Settings className="mr-2 h-4 w-4" />Contrôler Terrains
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => { setSelectedClub(club); setShowOverlayManager(true); }}>
                                                        <Settings className="mr-2 h-4 w-4" />Gérer Overlays
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => { setSelectedClub(club); setShowCourtModal(true); }}>
                                                        <Plus className="mr-2 h-4 w-4" />Ajouter Terrain
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleAddCredits(club)}>
                                                        <Plus className="mr-2 h-4 w-4 text-blue-600" />
                                                        <span className="text-blue-600">Ajouter des Crédits</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDeleteClub(club.id)} className="text-red-600">
                                                        <Trash2 className="mr-2 h-4 w-4" />Supprimer
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

            {/* Edit Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifier le Club</DialogTitle>
                        <DialogDescription>Modifiez les informations du club</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateClub} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nom du club</Label>
                            <Input value={clubFormData.name} onChange={(e) => setClubFormData(prev => ({ ...prev, name: e.target.value }))} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Adresse</Label>
                            <Input value={clubFormData.address} onChange={(e) => setClubFormData(prev => ({ ...prev, address: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Téléphone</Label>
                            <Input value={clubFormData.phone_number} onChange={(e) => setClubFormData(prev => ({ ...prev, phone_number: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" value={clubFormData.email} onChange={(e) => setClubFormData(prev => ({ ...prev, email: e.target.value }))} />
                        </div>
                        <div className="space-y-2 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                            <Label className="flex items-center gap-2 text-yellow-800">
                                <Coins className="h-4 w-4" />
                                Solde de Crédits
                            </Label>
                            <Input
                                type="number"
                                min="0"
                                value={clubFormData.credits_balance}
                                onChange={(e) => setClubFormData(prev => ({ ...prev, credits_balance: parseInt(e.target.value) || 0 }))}
                                placeholder="0"
                                className="bg-white"
                            />
                            <p className="text-xs text-yellow-700">
                                Modifiez directement le solde de crédits du club.
                            </p>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>Annuler</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Sauvegarder
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Courts Modal */}
            <Dialog open={showCourtsModal} onOpenChange={setShowCourtsModal}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Terrains de {selectedClub?.name}</DialogTitle>
                        <DialogDescription>Gérez les terrains et leurs caméras associées</DialogDescription>
                    </DialogHeader>
                    <div>
                        {clubCourts.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-600">Aucun terrain enregistré pour ce club</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {clubCourts.map((court: any) => (
                                    <div key={court.id} className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-all">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-lg mb-2">{court.name}</h4>
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Video className="h-4 w-4 text-gray-500" />
                                                        <span className="text-gray-600 font-mono text-xs">{court.camera_url}</span>
                                                    </div>
                                                    {court.qr_code && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-gray-500 font-medium">QR Code:</span>
                                                            <span className="text-blue-600 font-mono text-xs bg-blue-50 px-2 py-1 rounded">{court.qr_code}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedCourt(court);
                                                    setCourtFormData({
                                                        name: court.name,
                                                        camera_url: court.camera_url,
                                                        qr_code: court.qr_code || ''
                                                    });
                                                    setShowEditCourtModal(true);
                                                }}
                                            >
                                                <Edit className="h-4 w-4 mr-1" />
                                                Modifier
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Overlay Manager Modal */}
            {showOverlayManager && selectedClub && (
                <ClubOverlayManager
                    club={selectedClub}
                    isOpen={showOverlayManager}
                    onClose={() => setShowOverlayManager(false)}
                />
            )}

            {/* Control Courts Modal */}
            <Dialog open={showControlModal} onOpenChange={setShowControlModal}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Contrôler Terrains - {selectedClub?.name}</DialogTitle>
                        <DialogDescription>Gérez et contrôlez les terrains de ce club</DialogDescription>
                    </DialogHeader>
                    {selectedClub && (
                        <CourtControlPanel clubId={selectedClub.id} clubName={selectedClub.name} />
                    )}
                </DialogContent>
            </Dialog>

            {/* Add Court Modal - Full Implementation */}
            <Dialog open={showCourtModal} onOpenChange={setShowCourtModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ajouter un Terrain - {selectedClub?.name}</DialogTitle>
                        <DialogDescription>Créez un nouveau terrain pour ce club</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const courtData = {
                            name: formData.get('court-name') as string,
                            camera_url: formData.get('camera-url') as string
                        };

                        if (!selectedClub) return;

                        setLoading(true);
                        adminService.createCourt(selectedClub.id, courtData)
                            .then(() => {
                                setShowCourtModal(false);
                                loadClubs();
                            })
                            .catch(err => console.error('Error creating court:', err))
                            .finally(() => setLoading(false));
                    }} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="court-name">Nom du terrain</Label>
                            <Input
                                id="court-name"
                                name="court-name"
                                placeholder="Ex: Terrain 1, Court Central..."
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="camera-url">URL de la caméra</Label>
                            <Input
                                id="camera-url"
                                name="camera-url"
                                placeholder="http://212.231.225.55:88/axis-cgi/mjpg/video.cgi"
                                required
                            />
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                                <Video className="h-5 w-5 text-blue-600" />
                                <span className="font-medium text-blue-900">QR Code automatique</span>
                            </div>
                            <p className="text-sm text-blue-700">
                                Un QR code unique sera automatiquement généré pour ce terrain.
                                Les joueurs pourront le scanner pour démarrer un enregistrement.
                            </p>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setShowCourtModal(false)}>
                                Annuler
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Créer le Terrain
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Court Modal */}
            <Dialog open={showEditCourtModal} onOpenChange={setShowEditCourtModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifier le Terrain - {selectedCourt?.name}</DialogTitle>
                        <DialogDescription>Modifiez les informations du terrain {selectedCourt?.name}</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        if (!selectedCourt || !selectedClub) return;

                        setIsSubmitting(true);
                        try {
                            await adminService.updateCourt(selectedCourt.id, courtFormData);
                            setShowEditCourtModal(false);
                            await loadClubCourts(selectedClub.id);
                        } catch (error) {
                            console.error('Error updating court:', error);
                            setError('Erreur lors de la mise à jour du terrain');
                        } finally {
                            setIsSubmitting(false);
                        }
                    }} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-court-name">Nom du terrain</Label>
                            <Input
                                id="edit-court-name"
                                value={courtFormData.name}
                                onChange={(e) => setCourtFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Ex: Terrain 1, Court Central..."
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-camera-url">URL de la caméra</Label>
                            <Input
                                id="edit-camera-url"
                                value={courtFormData.camera_url}
                                onChange={(e) => setCourtFormData(prev => ({ ...prev, camera_url: e.target.value }))}
                                placeholder="http://212.231.225.55:88/axis-cgi/mjpg/video.cgi"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-qr-code">QR Code du terrain</Label>
                            <Input
                                id="edit-qr-code"
                                value={courtFormData.qr_code}
                                onChange={(e) => setCourtFormData(prev => ({ ...prev, qr_code: e.target.value }))}
                                placeholder="Ex: terrain-001 ou UUID"
                            />
                            <p className="text-xs text-gray-500">
                                Modifiez le QR code unique de ce terrain. Les joueurs devront scanner ce code pour enregistrer.
                            </p>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setShowEditCourtModal(false)}>
                                Annuler
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Mettre à jour
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ClubManagement;
