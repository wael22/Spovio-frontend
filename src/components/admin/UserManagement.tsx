import React, { useState, useEffect } from 'react';
import { adminService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, Edit, Trash2, Coins, Loader2, Search, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    phone_number?: string;
    credits_balance: number;
    video_count?: number;
}

interface UserManagementProps {
    onStatsUpdate?: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onStatsUpdate }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<keyof User>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreditsModal, setShowCreditsModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: '', email: '', role: 'player', phone_number: '', credits_balance: 0, password: ''
    });
    const [creditsToAdd, setCreditsToAdd] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await adminService.getAllUsers();
            const filtered = response.data.users.filter((user: User) => user.role !== 'club');
            setUsers(filtered);
        } catch (error) {
            setError('Erreur lors du chargement des utilisateurs');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await adminService.createUser(formData);
            setShowCreateModal(false);
            resetForm();
            loadUsers();
            onStatsUpdate?.();
        } catch (error) {
            setError('Erreur lors de la création');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await adminService.updateUser(selectedUser!.id, formData);
            setShowEditModal(false);
            resetForm();
            loadUsers();
            onStatsUpdate?.();
        } catch (error) {
            setError('Erreur lors de la mise à jour');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
        try {
            await adminService.deleteUser(userId);
            loadUsers();
            onStatsUpdate?.();
        } catch (error) {
            setError('Erreur lors de la suppression');
        }
    };

    const handleAddCredits = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await adminService.addCredits(selectedUser!.id, creditsToAdd);
            setShowCreditsModal(false);
            setCreditsToAdd(0);
            loadUsers();
            onStatsUpdate?.();
        } catch (error) {
            setError('Erreur lors de l\'ajout de crédits');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', email: '', role: 'player', phone_number: '', credits_balance: 0, password: '' });
        setSelectedUser(null);
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            phone_number: user.phone_number || '',
            credits_balance: user.credits_balance,
            password: ''
        });
        setShowEditModal(true);
    };

    const openCreditsModal = (user: User) => {
        setSelectedUser(user);
        setCreditsToAdd(0);
        setShowCreditsModal(true);
    };

    const handleSort = (column: keyof User) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const getSortIcon = (column: keyof User) => {
        if (sortBy !== column) return <ArrowUpDown className="h-4 w-4 ml-1 opacity-30" />;
        return sortOrder === 'asc' ?
            <ArrowUp className="h-4 w-4 ml-1" /> :
            <ArrowDown className="h-4 w-4 ml-1" />;
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedUsers = [...filteredUsers].sort((a, b) => {
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

    const getRoleBadge = (role: string) => {
        const variants: Record<string, "destructive" | "secondary"> = {
            'super_admin': 'destructive',
            'player': 'secondary'
        };
        const labels: Record<string, string> = {
            'super_admin': 'Super Admin',
            'player': 'Joueur'
        };
        return <Badge variant={variants[role] || 'secondary'}>{labels[role] || role}</Badge>;
    };

    return (
        <div className="space-y-6">
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Gestion des Utilisateurs</CardTitle>
                            <CardDescription>Gérez les comptes administrateurs et joueurs.</CardDescription>
                        </div>
                        <div className="flex space-x-2">
                            <Button variant="outline" onClick={loadUsers} disabled={loading}>
                                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Actualiser
                            </Button>
                            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                                <DialogTrigger asChild>
                                    <Button><Plus className="h-4 w-4 mr-2" />Nouvel Utilisateur</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>Créer un Utilisateur</DialogTitle></DialogHeader>
                                    <form onSubmit={handleCreateUser} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Nom complet</Label>
                                            <Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <Input type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Rôle</Label>
                                            <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="player">Joueur</SelectItem>
                                                    <SelectItem value="super_admin">Super Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Crédits initiaux</Label>
                                            <Input type="number" min="0" value={formData.credits_balance} onChange={(e) => setFormData(prev => ({ ...prev, credits_balance: parseInt(e.target.value) || 0 }))} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Mot de passe</Label>
                                            <Input type="password" value={formData.password} onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))} required />
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Annuler</Button>
                                            <Button type="submit" disabled={isSubmitting}>
                                                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                                Créer
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="flex items-center space-x-2 mb-4">
                        <Search className="h-4 w-4 text-gray-400" />
                        <Input placeholder="Rechercher par nom ou email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm" />
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort('name')}>
                                        <div className="flex items-center">Nom {getSortIcon('name')}</div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort('email')}>
                                        <div className="flex items-center">Email {getSortIcon('email')}</div>
                                    </TableHead>
                                    <TableHead>Téléphone</TableHead>
                                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort('role')}>
                                        <div className="flex items-center">Rôle {getSortIcon('role')}</div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort('credits_balance')}>
                                        <div className="flex items-center">Crédits {getSortIcon('credits_balance')}</div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort('video_count')}>
                                        <div className="flex items-center">Vidéos {getSortIcon('video_count')}</div>
                                    </TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.phone_number || '-'}</TableCell>
                                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-1">
                                                <Coins className="h-4 w-4 text-yellow-500" />
                                                <span>{user.credits_balance}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell><span className="font-medium">{user.video_count || 0}</span></TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openEditModal(user)}><Edit className="mr-2 h-4 w-4" />Modifier</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openCreditsModal(user)}><Coins className="mr-2 h-4 w-4" />Ajouter crédits</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" />Supprimer</DropdownMenuItem>
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
                    <DialogHeader><DialogTitle>Modifier l'Utilisateur</DialogTitle></DialogHeader>
                    <form onSubmit={handleUpdateUser} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nom complet</Label>
                            <Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Rôle</Label>
                            <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="player">Joueur</SelectItem>
                                    <SelectItem value="super_admin">Super Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Crédits</Label>
                            <Input type="number" min="0" value={formData.credits_balance} onChange={(e) => setFormData(prev => ({ ...prev, credits_balance: parseInt(e.target.value) || 0 }))} />
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

            {/* Credits Modal */}
            <Dialog open={showCreditsModal} onOpenChange={setShowCreditsModal}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Ajouter des Crédits</DialogTitle></DialogHeader>
                    <form onSubmit={handleAddCredits} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nombre de crédits à ajouter</Label>
                            <Input type="number" min="1" value={creditsToAdd} onChange={(e) => setCreditsToAdd(parseInt(e.target.value) || 0)} required />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setShowCreditsModal(false)}>Annuler</Button>
                            <Button type="submit" disabled={isSubmitting || creditsToAdd <= 0}>
                                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Ajouter {creditsToAdd} crédit{creditsToAdd > 1 ? 's' : ''}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UserManagement;
