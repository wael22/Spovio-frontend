import React, { useState } from 'react';
import { clubService } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Camera, Circle, StopCircle, User, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Court {
    id: string;
    name: string;
    camera_url?: string;
    qr_code?: string;
    is_occupied?: boolean;
    current_player?: string;
    recording_player?: string;
    recording_remaining?: number;
}

interface ClubCourtsTabProps {
    courts: Court[];
    onCourtUpdated?: () => void;
}

const ClubCourtsTab: React.FC<ClubCourtsTabProps> = ({ courts, onCourtUpdated }) => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleStopRecording = async (courtId: string) => {
        try {
            setError('');
            setLoading(true);
            await clubService.stopRecording(courtId);
            // Recharger les données du dashboard
            if (onCourtUpdated) {
                onCourtUpdated();
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erreur lors de l\'arrêt de l\'enregistrement');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Terrains du Club</CardTitle>
                <CardDescription>
                    {courts.length} terrain(x) configuré(s)
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {courts.length === 0 ? (
                    <div className="text-center py-8">
                        <Camera className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Aucun terrain configuré</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {courts.map((court) => (
                            <Card key={court.id} className={`border-l-4 ${court.is_occupied ? 'border-l-red-500' : 'border-l-green-500'}`}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{court.name}</CardTitle>
                                        <Badge variant={court.is_occupied ? "destructive" : "secondary"} className="flex items-center gap-1">
                                            <Circle className={`h-3 w-3 ${court.is_occupied ? 'fill-current animate-pulse' : ''}`} />
                                            {court.is_occupied ? 'Occupé' : 'Libre'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {/* Current Player and Time Remaining */}
                                    {court.is_occupied && (court.recording_player || court.current_player) && (
                                        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                                            <div className="flex items-center gap-2 text-sm text-red-900 dark:text-red-100 mb-1">
                                                <User className="h-4 w-4" />
                                                <span className="font-medium">{court.recording_player || court.current_player}</span>
                                            </div>
                                            {court.recording_remaining && (
                                                <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{court.recording_remaining}min restant</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* QR Code */}
                                    {court.qr_code && (
                                        <div className="text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">QR Code:</span>{' '}
                                            <span className="font-mono text-xs font-medium">{court.qr_code}</span>
                                        </div>
                                    )}

                                    {/* Camera URL */}
                                    <div className="flex items-center space-x-2 text-sm">
                                        <Camera className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-600 dark:text-gray-400 text-xs truncate">
                                            {court.camera_url || 'Non configuré'}
                                        </span>
                                    </div>

                                    {/* Stop Recording Button */}
                                    {court.is_occupied && (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => handleStopRecording(court.id)}
                                            disabled={loading}
                                        >
                                            <StopCircle className="h-4 w-4 mr-2" />
                                            Arrêter l'Enregistrement
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ClubCourtsTab;
