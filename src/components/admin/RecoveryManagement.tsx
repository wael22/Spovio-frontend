import React, { useState, useEffect } from 'react';
import { adminService, recoveryService } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw, FileVideo, Clock, User, Building } from 'lucide-react';

interface RecoveryRequest {
    id: number;
    court_id: number;
    court_name: string;
    club_name: string;
    user_id: number;
    user_name: string;
    user_email: string;
    request_type: string;
    status: string;
    start_time: string;
    end_time: string;
    created_at: string;
    video_id?: number;
    video_url?: string;
    video_status?: string;
    error_message?: string;
}

const RecoveryManagement: React.FC = () => {
    const [requests, setRequests] = useState<RecoveryRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadRequests();
    }, []);

    const [clubs, setClubs] = useState<any[]>([]);
    const [selectedClubId, setSelectedClubId] = useState<string>('');
    const [courts, setCourts] = useState<any[]>([]);
    const [selectedCourtId, setSelectedCourtId] = useState<string>('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [description, setDescription] = useState('');
    const [triggerLoading, setTriggerLoading] = useState(false);

    useEffect(() => {
        loadRequests();
        loadClubs();
    }, []);

    useEffect(() => {
        if (selectedClubId) {
            loadCourts(selectedClubId);
        } else {
            setCourts([]);
        }
    }, [selectedClubId]);

    const loadClubs = async () => {
        try {
            const response = await adminService.getAllClubs();
            setClubs(response.data.clubs || []);
        } catch (err) {
            console.error("Error loading clubs:", err);
        }
    };

    const loadCourts = async (clubId: string) => {
        try {
            const response = await adminService.getClubCourts(clubId);
            setCourts(response.data.courts || []);
        } catch (err) {
            console.error("Error loading courts:", err);
        }
    };

    const loadRequests = async () => {
        try {
            setLoading(true);
            const response = await adminService.getRecoveryRequests();
            setRequests(response.data.requests);
            setError('');
        } catch (error) {
            console.error('Erreur chargement demandes récupération:', error);
            setError('Impossible de charger les demandes de récupération');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleTriggerRecovery = async () => {
        if (!selectedCourtId || !startTime || !endTime) {
            setError("Veuillez remplir tous les champs obligatoires (Terrain, Début, Fin)");
            return;
        }

        try {
            setTriggerLoading(true);
            setError('');

            // Convert local datetime to ISO string for backend
            const start = new Date(startTime).toISOString();
            const end = new Date(endTime).toISOString();

            await recoveryService.reportIssue({
                court_id: parseInt(selectedCourtId),
                match_start: start,
                match_end: end,
                description: description || "Déclenchement manuel admin"
            });

            // Reset form
            setDescription('');
            // Keep times/court for easier repeated requests if needed? Or reset?
            // Let's reset times to avoid mistakes
            setStartTime('');
            setEndTime('');

            // Reload list
            await loadRequests();

        } catch (err: any) {
            console.error("Error triggering recovery:", err);
            setError(err.response?.data?.error || "Erreur lors du déclenchement de la récupération");
        } finally {
            setTriggerLoading(false);
        }
    };

    const formatDateTimeLocal = (date: Date) => {
        return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'processing': 'bg-blue-100 text-blue-800 border-blue-200',
            'completed': 'bg-green-100 text-green-800 border-green-200',
            'failed': 'bg-red-100 text-red-800 border-red-200'
        };
        const labels: Record<string, string> = {
            'pending': 'En attente',
            'processing': 'En cours',
            'completed': 'Terminé',
            'failed': 'Échec'
        };

        return (
            <Badge variant="outline" className={styles[status] || 'bg-gray-100'}>
                {labels[status] || status}
            </Badge>
        );
    };

    const getTypeBadge = (type: string) => {
        return (
            <Badge variant="secondary">
                {type === 'auto' ? '🤖 Auto' : '👤 Manuel'}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            {/* Manual Trigger Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Déclenchement Manuel</CardTitle>
                    <CardDescription>
                        Lancer une récupération d'urgence pour une plage horaire spécifique
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        {/* Club Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Club</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={selectedClubId}
                                onChange={(e) => setSelectedClubId(e.target.value)}
                            >
                                <option value="">Sélectionner un club</option>
                                {clubs.map((club: any) => (
                                    <option key={club.id} value={club.id}>{club.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Court Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Terrain</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={selectedCourtId}
                                onChange={(e) => setSelectedCourtId(e.target.value)}
                                disabled={!selectedClubId || courts.length === 0}
                            >
                                <option value="">Sélectionner un terrain</option>
                                {courts.map((court: any) => (
                                    <option key={court.id} value={court.id}>{court.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Start Time */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Début</label>
                            <input
                                type="datetime-local"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>

                        {/* End Time */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Fin</label>
                            <div className="flex gap-2">
                                <input
                                    type="datetime-local"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                />
                                <Button
                                    onClick={handleTriggerRecovery}
                                    disabled={triggerLoading || !selectedCourtId || !startTime || !endTime}
                                >
                                    {triggerLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lancer'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Récupération de Vidéos (SD Card)</CardTitle>
                            <CardDescription>
                                Suivi des tentatives de récupération depuis les cartes SD caméras
                            </CardDescription>
                        </div>
                        <Button onClick={loadRequests} variant="outline" size="sm">
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Actualiser
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {loading && requests.length === 0 ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <FileVideo className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>Aucune demande de récupération</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Terrain / Club</TableHead>
                                    <TableHead>Utilisateur</TableHead>
                                    <TableHead>Plage Horaire</TableHead>
                                    <TableHead>Créé le</TableHead>
                                    <TableHead>Vidéo ID</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.map((req) => (
                                    <TableRow key={req.id}>
                                        <TableCell>{getTypeBadge(req.request_type)}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {getStatusBadge(req.status)}
                                                {req.error_message && (
                                                    <span className="text-xs text-red-500 max-w-[200px] truncate" title={req.error_message}>
                                                        {req.error_message}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium flex items-center gap-1">
                                                    <Building className="h-3 w-3" /> {req.court_name}
                                                </span>
                                                <span className="text-xs text-gray-500">{req.club_name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium flex items-center gap-1">
                                                    <User className="h-3 w-3" /> {req.user_name}
                                                </span>
                                                <span className="text-xs text-gray-500">{req.user_email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" /> {formatDate(req.start_time)}
                                                </span>
                                                <span className="text-xs text-gray-400 ml-4">
                                                    au {formatDate(req.end_time)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs text-gray-500">
                                            {new Date(req.created_at).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {req.video_id ? (
                                                    <Badge variant="outline">Video #{req.video_id}</Badge>
                                                ) : '-'}

                                                {req.video_url && (
                                                    <a
                                                        href={req.video_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                                    >
                                                        <FileVideo className="h-3 w-3" /> Voir la vidéo
                                                    </a>
                                                )}

                                                {req.video_status && req.video_status !== 'ready' && (
                                                    <span className="text-[10px] text-orange-500 uppercase font-bold">
                                                        {req.video_status}
                                                    </span>
                                                )}
                                            </div>
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

export default RecoveryManagement;
