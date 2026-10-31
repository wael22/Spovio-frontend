import React, { useState, useEffect } from 'react';
import { aiAnalysisService, AIMatchAnalysis } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import {
    Cpu,
    RefreshCw,
    Play,
    CheckCircle2,
    Clock,
    AlertCircle,
    Eye,
    Trash2,
    Copy,
    Activity,
    Flame,
    Zap,
    Maximize2
} from 'lucide-react';

export const AIMatchAnalysisManagement: React.FC = () => {
    const [analyses, setAnalyses] = useState<AIMatchAnalysis[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    // Trigger test modal
    const [showTriggerModal, setShowTriggerModal] = useState<boolean>(false);
    const [testMatchId, setTestMatchId] = useState<string>('lightsail_207_1793406574_2f385d35');
    const [testS3Key, setTestS3Key] = useState<string>('lightsail_207_1793406574_2f385d35/cam_1_4k.mp4');
    const [testS3Bucket, setTestS3Bucket] = useState<string>('spovio-temp-4k-recordings');
    const [triggerLoading, setTriggerLoading] = useState<boolean>(false);

    // Detail modal
    const [selectedAnalysis, setSelectedAnalysis] = useState<AIMatchAnalysis | null>(null);
    const [copied, setCopied] = useState<boolean>(false);

    useEffect(() => {
        loadAnalyses();
    }, []);

    const loadAnalyses = async () => {
        try {
            setRefreshing(true);
            const response = await aiAnalysisService.getAnalyses(100);
            if (response.data && response.data.analyses) {
                setAnalyses(response.data.analyses);
            }
            setError('');
        } catch (err: any) {
            console.error('Erreur chargement analyses IA:', err);
            setError('Impossible de charger les analyses IA. Vérifiez la connexion au serveur.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleTriggerTest = async () => {
        try {
            setTriggerLoading(true);
            setError('');
            const res = await aiAnalysisService.triggerTest({
                match_id: testMatchId.trim() || undefined,
                s3_key: testS3Key.trim() || undefined,
                s3_bucket: testS3Bucket.trim() || undefined
            });

            if (res.data?.success) {
                setSuccessMessage(res.data.message || 'Job IA créé avec succès !');
                setShowTriggerModal(false);
                await loadAnalyses();
            } else {
                setError(res.data?.error || 'Échec du déclenchement du test IA.');
            }
        } catch (err: any) {
            console.error('Erreur trigger IA:', err);
            setError(err.response?.data?.error || 'Erreur lors du déclenchement du test IA.');
        } finally {
            setTriggerLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Voulez-vous vraiment supprimer cet enregistrement de test ?')) return;

        try {
            await aiAnalysisService.deleteAnalysis(id);
            setAnalyses(analyses.filter(a => a.id !== id));
        } catch (err) {
            console.error('Erreur suppression:', err);
            alert('Impossible de supprimer cet enregistrement.');
        }
    };

    const copyJsonToClipboard = () => {
        if (!selectedAnalysis) return;
        const text = JSON.stringify(selectedAnalysis, null, 2);
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const completedCount = analyses.filter(a => a.status === 'completed').length;
    const pendingCount = analyses.filter(a => a.status === 'pending' || a.status === 'processing').length;
    const failedCount = analyses.filter(a => a.status === 'failed').length;

    const renderStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return (
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Terminé
                    </Badge>
                );
            case 'processing':
                return (
                    <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center gap-1 w-fit animate-pulse">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> En cours...
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1 w-fit">
                        <Clock className="h-3.5 w-3.5" /> En attente
                    </Badge>
                );
            case 'failed':
                return (
                    <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 flex items-center gap-1 w-fit">
                        <AlertCircle className="h-3.5 w-3.5" /> Échoué
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Cpu className="h-6 w-6 text-primary" />
                        Analyse IA des Matchs (Padel Pipeline)
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Pipeline cloud automatisé : S3 4K &rarr; Worker AWS EC2 GPU &rarr; Notebook Papermill &rarr; Statistiques.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadAnalyses}
                        disabled={refreshing}
                        className="flex items-center gap-1.5"
                    >
                        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Rafraîchir
                    </Button>

                    <Button
                        size="sm"
                        onClick={() => setShowTriggerModal(true)}
                        className="flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        <Play className="h-4 w-4 fill-current" />
                        Lancer un Test IA
                    </Button>
                </div>
            </div>

            {/* Notifications */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {successMessage && (
                <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <AlertDescription className="flex justify-between items-center w-full">
                        <span>{successMessage}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => setSuccessMessage('')}
                        >
                            Fermer
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Matchs</CardTitle>
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analyses.length}</div>
                        <p className="text-xs text-muted-foreground">Analyses enregistrées</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Analyses Terminées</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{completedCount}</div>
                        <p className="text-xs text-muted-foreground">Statistiques prêtes</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">En Attente / En Cours</CardTitle>
                        <Activity className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{pendingCount}</div>
                        <p className="text-xs text-muted-foreground">Dans la file de traitement</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Échecs</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">{failedCount}</div>
                        <p className="text-xs text-muted-foreground">Erreurs rapportées</p>
                    </CardContent>
                </Card>
            </div>

            {/* Results Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Résultats d'Analyse IA</CardTitle>
                    <CardDescription>
                        Historique des exécutions du notebook Papermill avec les statistiques de jeu extraites.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                            <RefreshCw className="h-8 w-8 animate-spin mb-3 text-primary" />
                            <p>Chargement des analyses...</p>
                        </div>
                    ) : analyses.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            <Cpu className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p className="text-base font-medium">Aucune analyse IA enregistrée pour le moment.</p>
                            <p className="text-sm mt-1">Cliquez sur « Lancer un Test IA » pour tester la chaîne complète.</p>
                            <Button
                                size="sm"
                                variant="outline"
                                className="mt-4"
                                onClick={() => setShowTriggerModal(true)}
                            >
                                <Play className="h-4 w-4 mr-1.5" />
                                Lancer mon premier test
                            </Button>
                        </div>
                    ) : (
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Match ID</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead>Échanges & Frappes</TableHead>
                                        <TableHead>Vidéo (Résolution / Durée)</TableHead>
                                        <TableHead>Fichier S3</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {analyses.map(item => {
                                        const stats = item.stats || {};
                                        const meta = item.video_meta || {};
                                        const hasStats = Boolean(item.stats && Object.keys(item.stats).length > 0);

                                        return (
                                            <TableRow key={item.id}>
                                                {/* Match ID */}
                                                <TableCell className="font-mono text-xs font-semibold">
                                                    {item.match_id}
                                                </TableCell>

                                                {/* Status */}
                                                <TableCell>
                                                    {renderStatusBadge(item.status)}
                                                    {item.error_message && (
                                                        <div className="text-[11px] text-red-500 mt-1 max-w-[200px] truncate" title={item.error_message}>
                                                            {item.error_message}
                                                        </div>
                                                    )}
                                                </TableCell>

                                                {/* Key Stats */}
                                                <TableCell>
                                                    {hasStats ? (
                                                        <div className="space-y-0.5 text-xs">
                                                            <div className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                                <Flame className="h-3.5 w-3.5" />
                                                                {stats.total_rallies ?? '—'} échanges &middot; {stats.total_hits ?? '—'} frappes
                                                            </div>
                                                            <div className="text-muted-foreground text-[11px]">
                                                                Max rally: {stats.longest_rally_hits ?? '—'} coups &middot; Moy: {stats.avg_rally_duration_sec ?? '—'}s
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">En attente des stats...</span>
                                                    )}
                                                </TableCell>

                                                {/* Video Metadata */}
                                                <TableCell className="text-xs">
                                                    {meta.resolution || meta.duration_seconds ? (
                                                        <div>
                                                            <div className="font-medium">{meta.resolution || '1080p'} @ {meta.fps ? Math.round(meta.fps) : 25} fps</div>
                                                            <div className="text-muted-foreground text-[11px]">
                                                                {meta.duration_seconds ? `${meta.duration_seconds}s` : ''}
                                                                {meta.total_frames ? ` (${meta.total_frames} frames)` : ''}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-[11px]">—</span>
                                                    )}
                                                </TableCell>

                                                {/* S3 Key */}
                                                <TableCell className="text-xs font-mono max-w-[180px] truncate" title={item.s3_key || ''}>
                                                    {item.s3_key || <span className="text-muted-foreground">—</span>}
                                                </TableCell>

                                                {/* Date */}
                                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {item.created_at ? new Date(item.created_at).toLocaleString('fr-FR', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    }) : '—'}
                                                </TableCell>

                                                {/* Actions */}
                                                <TableCell className="text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 px-2 text-xs"
                                                            onClick={() => setSelectedAnalysis(item)}
                                                            title="Voir les détails et JSON"
                                                        >
                                                            <Eye className="h-3.5 w-3.5 mr-1" />
                                                            Détails
                                                        </Button>

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                                                            onClick={() => handleDelete(item.id)}
                                                            title="Supprimer ce test"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Trigger Test Dialog */}
            <Dialog open={showTriggerModal} onOpenChange={setShowTriggerModal}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Play className="h-5 w-5 text-primary" />
                            Lancer un Test d'Analyse IA
                        </DialogTitle>
                        <DialogDescription>
                            Crée une entrée en attente et tente de réveiller automatiquement l'instance AWS EC2 GPU (<code className="text-xs">i-0e27083bd63c3d0d4</code>).
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="match_id">Identifiant du Match (match_id)</Label>
                            <Input
                                id="match_id"
                                value={testMatchId}
                                onChange={e => setTestMatchId(e.target.value)}
                                placeholder="ex: match_demo_123"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="s3_key">Clé S3 de la vidéo 4K (s3_key)</Label>
                            <Input
                                id="s3_key"
                                value={testS3Key}
                                onChange={e => setTestS3Key(e.target.value)}
                                placeholder="ex: recordings/match_demo_123.mp4"
                            />
                            <p className="text-[11px] text-muted-foreground">
                                Par défaut : fichier réel 4K déjà disponible sur votre bucket S3.
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="s3_bucket">Bucket S3</Label>
                            <Input
                                id="s3_bucket"
                                value={testS3Bucket}
                                onChange={e => setTestS3Bucket(e.target.value)}
                            />
                        </div>

                        <div className="p-3 bg-muted/60 rounded-md text-xs space-y-1">
                            <p className="font-semibold text-foreground">💡 Comment le test se déroule :</p>
                            <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                                <li>L'entrée est enregistrée avec le statut <code>pending</code>.</li>
                                <li>L'API envoie l'ordre de démarrage à l'instance EC2.</li>
                                <li>L'EC2 s'allume en ~30s, exécute le notebook Papermill, poste les stats ici, et s'éteint toute seule.</li>
                            </ul>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowTriggerModal(false)}
                            disabled={triggerLoading}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleTriggerTest}
                            disabled={triggerLoading}
                            className="flex items-center gap-1.5"
                        >
                            {triggerLoading ? (
                                <>
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                    Démarrage...
                                </>
                            ) : (
                                <>
                                    <Play className="h-4 w-4 fill-current" />
                                    Démarrer le Test
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Analysis Details Dialog */}
            <Dialog open={Boolean(selectedAnalysis)} onOpenChange={open => !open && setSelectedAnalysis(null)}>
                <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <Cpu className="h-5 w-5 text-primary" />
                                Détails de l'Analyse : {selectedAnalysis?.match_id}
                            </span>
                            {selectedAnalysis && renderStatusBadge(selectedAnalysis.status)}
                        </DialogTitle>
                        <DialogDescription>
                            Données complètes extraites par le notebook d'analyse IA.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedAnalysis && (
                        <div className="space-y-6 py-2">
                            {/* Key Stats Cards */}
                            {selectedAnalysis.stats && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                                        <div className="text-xs text-muted-foreground">Total Échanges</div>
                                        <div className="text-xl font-bold text-foreground mt-0.5">
                                            {selectedAnalysis.stats.total_rallies ?? '—'}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                                        <div className="text-xs text-muted-foreground">Total Frappes</div>
                                        <div className="text-xl font-bold text-foreground mt-0.5">
                                            {selectedAnalysis.stats.total_hits ?? '—'}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                                        <div className="text-xs text-muted-foreground">Total Rebonds</div>
                                        <div className="text-xl font-bold text-foreground mt-0.5">
                                            {selectedAnalysis.stats.total_bounces ?? '—'}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                                        <div className="text-xs text-muted-foreground">Échange Record</div>
                                        <div className="text-xl font-bold text-foreground mt-0.5">
                                            {selectedAnalysis.stats.longest_rally_hits ?? '—'} <span className="text-xs font-normal">coups</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                                        <div className="text-xs text-muted-foreground">Durée Moy. Échange</div>
                                        <div className="text-xl font-bold text-foreground mt-0.5">
                                            {selectedAnalysis.stats.avg_rally_duration_sec ?? '—'} <span className="text-xs font-normal">sec</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                                        <div className="text-xs text-muted-foreground">Distance Équipes</div>
                                        <div className="text-sm font-bold text-foreground mt-1">
                                            A: {selectedAnalysis.stats.court_coverage?.team_a_distance_km ?? '—'} km
                                            <br />
                                            B: {selectedAnalysis.stats.court_coverage?.team_b_distance_km ?? '—'} km
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Raw JSON */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Payload JSON Brut
                                    </Label>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs flex items-center gap-1"
                                        onClick={copyJsonToClipboard}
                                    >
                                        <Copy className="h-3.5 w-3.5" />
                                        {copied ? 'Copié !' : 'Copier'}
                                    </Button>
                                </div>
                                <pre className="p-3 bg-slate-950 text-slate-100 rounded-md text-xs font-mono overflow-x-auto max-h-[250px]">
                                    {JSON.stringify(selectedAnalysis, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedAnalysis(null)}>
                            Fermer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AIMatchAnalysisManagement;

