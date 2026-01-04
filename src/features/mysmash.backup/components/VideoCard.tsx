// VideoCard Component - Spovio Design
// Card vidéo avec thumbnail, badge "Partagée", menu 3 points

import { MoreVertical, Play, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { spovioColors, spovioShadows } from '../constants/colors';
import type { Video } from '../types';

interface VideoCardProps {
    video: Video;
    onPlay?: () => void;
    onMenuClick?: () => void;
}

export const VideoCard = ({ video, onPlay, onMenuClick }: VideoCardProps) => {
    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    return (
        <div
            className="rounded-2xl overflow-hidden relative group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
            style={{
                background: spovioColors.bgCard,
                border: `1px solid ${spovioColors.borderDefault}`,
                boxShadow: spovioShadows.card,
            }}
            onClick={onPlay}
        >
            {/* Thumbnail */}
            <div className="relative w-full aspect-video bg-gradient-to-br from-gray-800 to-gray-900">
                {video.thumbnail_url ? (
                    <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Play className="h-12 w-12" style={{ color: spovioColors.textSecondary }} />
                    </div>
                )}

                {/* Badge "Partagée" */}
                {video.is_shared && (
                    <div className="absolute top-3 left-3">
                        <Badge
                            className="text-xs font-semibold px-3 py-1 rounded-full text-white border-0"
                            style={{
                                background: spovioColors.green,
                                boxShadow: '0 0 10px rgba(0, 255, 179, 0.3)',
                            }}
                        >
                            ✓ Partagée
                        </Badge>
                    </div>
                )}

                {/* Duration Badge */}
                <div
                    className="absolute bottom-3 left-3 px-3 py-1 rounded-lg text-white text-sm font-semibold flex items-center gap-1"
                    style={{ background: 'rgba(0, 0, 0, 0.7)' }}
                >
                    <Clock className="h-3 w-3" />
                    {formatDuration(video.duration)}
                </div>

                {/* Menu 3 points */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 h-8 w-8 rounded-full text-white hover:bg-white/20"
                    style={{ background: 'rgba(0, 0, 0, 0.5)' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onMenuClick?.();
                    }}
                >
                    <MoreVertical className="h-5 w-5" />
                </Button>
            </div>

            {/* Video Info */}
            <div className="p-4">
                <h3 className="text-white font-semibold mb-2 line-clamp-1">
                    {video.title}
                </h3>
                <div
                    className="flex items-center gap-3 text-sm"
                    style={{ color: spovioColors.textSecondary }}
                >
                    <span>{formatDate(video.recorded_at)}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>Court 1</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
