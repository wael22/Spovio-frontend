import React from 'react';
import { Play, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CurrentRecording {
    player_name: string;
    duration?: string;
}

interface Court {
    id: number | string;
    name?: string;
    court_number?: number;
    camera_name?: string;
    is_occupied: boolean;
    current_recording?: CurrentRecording;
}

interface CourtCardModernProps {
    court: Court;
    onViewLive?: (court: Court) => void;
    onConfigure?: (court: Court) => void;
}

/**
 * CourtCardModern - Modern court card component
 * Displays court status with visual indicators
 */
const CourtCardModern: React.FC<CourtCardModernProps> = ({
    court,
    onViewLive,
    onConfigure
}) => {
    const isOccupied = court.is_occupied;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
            {/* Header with status */}
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {court.name || `Terrain ${court.court_number}`}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {court.camera_name || 'Caméra non assignée'}
                    </p>
                </div>

                {/* Status indicator */}
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isOccupied ? 'bg-red-500' : 'bg-green-500'}`} />
                    <span className={`text-sm font-medium ${isOccupied ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>
                        {isOccupied ? 'Occupé' : 'Libre'}
                    </span>
                </div>
            </div>

            {/* Recording information (if occupied) */}
            {isOccupied && court.current_recording && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                        <span className="font-medium">Joueur :</span> {court.current_recording.player_name}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Durée :</span> {court.current_recording.duration || '0m'}
                    </p>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
                {isOccupied && onViewLive && (
                    <Button
                        onClick={() => onViewLive(court)}
                        className="flex-1"
                    >
                        <Play className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Voir en direct</span>
                        <span className="sm:hidden">Live</span>
                    </Button>
                )}

                {onConfigure && (
                    <Button
                        onClick={() => onConfigure(court)}
                        variant="outline"
                        className={isOccupied ? '' : 'flex-1'}
                    >
                        <Settings className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Configurer</span>
                    </Button>
                )}
            </div>

            {/* Empty state (court available) */}
            {!isOccupied && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                    Aucun enregistrement en cours
                </p>
            )}
        </div>
    );
};

export default CourtCardModern;
