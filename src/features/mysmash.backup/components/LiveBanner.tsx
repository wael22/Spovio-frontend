// LiveBanner Component - Banner "EN DIRECT" rouge vif
// Affiché quand un enregistrement est actif

import { Camera, Pause, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ActiveRecording } from '../types';

interface LiveBannerProps {
    recording: ActiveRecording;
    onStop?: () => void;
    onDismiss?: () => void;
}

export const LiveBanner = ({ recording, onStop, onDismiss }: LiveBannerProps) => {
    return (
        <div
            className="w-full bg-[#E53935] text-white py-4 px-4 flex items-center justify-between"
            style={{ boxShadow: '0 0 15px rgba(229, 57, 53, 0.5)' }}
        >
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                    <Camera className="h-5 w-5" />
                    <span className="font-bold text-sm uppercase tracking-wide">
                        EN DIRECT
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {onStop && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20 gap-2"
                        onClick={onStop}
                    >
                        <Pause className="h-4 w-4" />
                        <span className="hidden sm:inline">Arrêter</span>
                    </Button>
                )}

                {onDismiss && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 h-8 w-8"
                        onClick={onDismiss}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                )}
            </div>
        </div>
    );
};
