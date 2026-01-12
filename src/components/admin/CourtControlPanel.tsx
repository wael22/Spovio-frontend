import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Power, PowerOff, Video, VideoOff, RefreshCw } from 'lucide-react';
import api from '@/lib/api';

interface Court {
    id: string;
    name: string;
    available: boolean;
    is_recording: boolean;
}

interface Recording {
    recording_id: string;
    court_id: string;
    player?: { name: string };
    club?: { id: string };
    court?: { name: string };
    start_time: string;
}

interface CourtControlPanelProps {
    clubId: string;
    clubName: string;
}

const CourtControlPanel: React.FC<CourtControlPanelProps> = ({ clubId, clubName }) => {
    const [courts, setCourts] = useState<Court[]>([]);
    const [activeRecordings, setActiveRecordings] = useState<Recording[]>([]);
    const [loading, setLoading] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const courtsRes = await api.get(`/admin/clubs/${clubId}/courts`);
            setCourts(courtsRes.data.courts || []);

            const recordingsRes = await api.get('/admin/recordings/active');
            const clubRecordings = (recordingsRes.data.active_recordings || []).filter(
                (rec: Recording) => rec.club?.id === clubId
            );
            setActiveRecordings(clubRecordings);
        } catch (error) {
            console.error('Erreur chargement données:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (clubId) {
            loadData();
        }
    }, [clubId]);

    const toggleCourtStatus = async (courtId: string) => {
        try {
            const res = await api.post(`/admin/courts/${courtId}/toggle-status`);
            await loadData();
        } catch (error) {
            console.error('Erreur toggle status:', error);
        }
    };

    const stopRecording = async (recordingId: string, playerName?: string) => {
        if (!confirm(`Voulez-vous vraiment arrêter l'enregistrement de ${playerName} ?`)) {
            return;
        }

        try {
            await api.post(`/admin/recordings/${recordingId}/stop`);
            await loadData();
        } catch (error) {
            console.error('Erreur arrêt enregistrement:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Contrôle des Terrains</h2>
                    <p className="text-muted-foreground">{clubName}</p>
                </div>
                <Button onClick={loadData} disabled={loading} variant="outline">
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Actualiser
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>État des Terrains</CardTitle>
                    <CardDescription>Gérer manuellement la disponibilité des terrains</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {courts.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">Aucun terrain configuré</p>
                        ) : (
                            courts.map(court => {
                                const isRecording = court.is_recording;
                                const activeRec = activeRecordings.find(r => r.court_id === court.id);

                                return (
                                    <div key={court.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-3 h-3 rounded-full ${court.available ? 'bg-green-500' : 'bg-red-500'}`} />
                                            <div>
                                                <h3 className="font-medium">{court.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {activeRec ? (
                                                        <>Enregistrement en cours • {activeRec.player?.name}</>
                                                    ) : (
                                                        court.available ? 'Disponible' : 'Indisponible'
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Badge variant={court.available ? "default" : "destructive"}>
                                                {court.available ? "Disponible" : "Occupé"}
                                            </Badge>

                                            <Button
                                                onClick={() => toggleCourtStatus(court.id)}
                                                variant={isRecording ? "destructive" : "outline"}
                                                size="sm"
                                            >
                                                {isRecording ? (
                                                    <><PowerOff className="h-4 w-4 mr-2" />Libérer</>
                                                ) : (
                                                    <><Power className="h-4 w-4 mr-2" />Bloquer</>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </CardContent>
            </Card>

            {activeRecordings.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Enregistrements en Cours</CardTitle>
                        <CardDescription>Gérer les enregistrements actifs sur ce club</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {activeRecordings.map(recording => (
                                <div key={recording.recording_id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                                    <div className="flex items-center space-x-4">
                                        <Video className="h-5 w-5 text-red-600 animate-pulse" />
                                        <div>
                                            <h3 className="font-medium">{recording.player?.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {recording.court?.name} • Depuis {new Date(recording.start_time).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => stopRecording(recording.recording_id, recording.player?.name)}
                                        variant="destructive"
                                        size="sm"
                                    >
                                        <VideoOff className="h-4 w-4 mr-2" />
                                        Arrêter
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default CourtControlPanel;
