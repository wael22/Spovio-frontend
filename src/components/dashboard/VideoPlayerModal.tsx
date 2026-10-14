import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { Button } from "@/components/ui/button";
import { Scissors, Video as VideoIcon, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VideoClipEditor } from "./VideoClipEditor";
import { toast } from "sonner";
import { getMatchKey } from "@/lib/videoUtils";

interface VideoPlayerModalProps {
    isOpen: boolean;
    onClose: () => void;
    video: any;
    allVideos?: any[];
}

export function VideoPlayerModal({ isOpen, onClose, video, allVideos = [] }: VideoPlayerModalProps) {
    const { t } = useTranslation();
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
    const [clipEditorOpen, setClipEditorOpen] = useState(false);
    const [currentVideo, setCurrentVideo] = useState<any>(video);

    useEffect(() => {
        setCurrentVideo(video);
    }, [video]);

    // Détecter les vidéos compagnons (même session de match / multi-caméras)
    const currentMatchKey = getMatchKey(currentVideo);
    const companionVideos = (currentMatchKey && allVideos?.length)
        ? allVideos.filter(v => getMatchKey(v) === currentMatchKey)
                   .sort((a, b) => (a.camera_index || 1) - (b.camera_index || 1))
        : [];

    const handleSwitchAngle = (companion: any) => {
        if (!companion || companion.id === currentVideo?.id) return;
        const savedTime = videoElement?.currentTime || 0;
        const wasPlaying = videoElement ? !videoElement.paused : false;
        setCurrentVideo(companion);

        setTimeout(() => {
            if (videoRef.current) {
                videoRef.current.currentTime = savedTime;
                if (wasPlaying) {
                    videoRef.current.play().catch(() => {});
                }
            }
        }, 300);
    };

    const handleDownloadCurrent = async () => {
        if (!currentVideo) return;
        if (currentVideo.is_expired || (currentVideo.processing_status && currentVideo.processing_status !== 'ready')) {
            toast.error(t('toasts.downloadUnavailable', 'Téléchargement indisponible'));
            return;
        }
        if (!currentVideo.bunny_video_id) {
            toast.error(t('toasts.bunnyMissing', 'Vidéo non disponible pour le téléchargement'));
            return;
        }

        const angleLabel = companionVideos.length > 1 ? ` (Angle ${currentVideo.camera_index || 1})` : '';
        try {
            toast.loading(`Préparation du téléchargement${angleLabel}...`, { id: 'player-download-toast' });
            const { getWorkingVideoUrl } = await import('@/lib/bunnyVideoHelper');
            const finalUrl = await getWorkingVideoUrl(currentVideo.bunny_video_id, '720p');

            toast.loading(`Téléchargement en cours${angleLabel}...`, { id: 'player-download-toast' });
            const response = await fetch(finalUrl);
            if (!response.ok) throw new Error('Network error');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const angleSuffix = companionVideos.length > 1 ? `_Angle${currentVideo.camera_index || 1}` : '';
            link.download = `${(currentVideo.title || 'video').replace(/\s+/g, '_')}${angleSuffix}.mp4`;
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);

            toast.dismiss('player-download-toast');
            toast.success(`Téléchargement terminé${angleLabel} !`);
        } catch (err) {
            console.error('Download error:', err);
            toast.dismiss('player-download-toast');
            window.open(`https://vz-9b857324-07d.b-cdn.net/${currentVideo.bunny_video_id}/play_720p.mp4`, '_blank');
        }
    };

    // Callback ref to capture video element when it mounts (same as PadelVar)
    const videoCallbackRef = useCallback((node: HTMLVideoElement | null) => {
        if (node) {
            videoRef.current = node;
            setVideoElement(node);
            console.log('[VideoPlayer] Video element mounted');
        }
    }, []);

    useEffect(() => {
        console.log('[VideoPlayer] useEffect START', {
            hasVideo: !!currentVideo,
            isOpen,
            hasVideoElement: !!videoElement
        });

        if (!currentVideo || !isOpen || !videoElement) {
            console.log('[VideoPlayer] Skipping HLS init:', {
                hasVideo: !!currentVideo,
                isOpen,
                hasVideoElement: !!videoElement
            });
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
            return;
        }

        const videoUrl = currentVideo.file_url || '';
        if (!videoUrl) {
            console.log('[VideoPlayer] No video URL found');
            return;
        }

        console.log('[VideoPlayer] Loading video URL:', videoUrl);

        // Cleanup previous HLS instance
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        const isHLS = videoUrl.includes('.m3u8');
        const isMP4 = videoUrl.includes('.mp4');

        if (isMP4) {
            // Direct MP4 playback
            videoElement.src = videoUrl;
            videoElement.load();
            console.log('[VideoPlayer] Loading MP4 video');
        } else if (isHLS && Hls.isSupported()) {
            // HLS playback
            console.log('[VideoPlayer] Creating HLS instance...');
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false,
            });

            hls.loadSource(videoUrl);
            hls.attachMedia(videoElement);
            hlsRef.current = hls;

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log('[VideoPlayer] HLS Ready');
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                console.error('[VideoPlayer] HLS Error:', data);
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.log('[VideoPlayer] Network error, trying to recover...');
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.log('[VideoPlayer] Media error, trying to recover...');
                            hls.recoverMediaError();
                            break;
                        default:
                            console.log('[VideoPlayer] Fatal error, cannot recover');
                            hls.destroy();
                            break;
                    }
                }
            });
        } else if (isHLS && videoElement.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari)
            videoElement.src = videoUrl;
            videoElement.load();
            console.log('[VideoPlayer] Using native HLS support');
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [currentVideo, isOpen, videoElement]);

    if (!currentVideo) return null;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-4xl md:max-w-5xl p-0">
                    <div className="flex items-center justify-between p-4 border-b flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg">{currentVideo.title || t('modals.videoPlayer.title')}</h3>
                            {companionVideos.length > 1 && (
                                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                                    {companionVideos.map((cVid) => (
                                        <Button
                                            key={cVid.id}
                                            variant={cVid.id === currentVideo.id ? "default" : "ghost"}
                                            size="sm"
                                            onClick={() => handleSwitchAngle(cVid)}
                                            className="h-7 text-xs px-2.5 font-medium gap-1"
                                        >
                                            <VideoIcon className="h-3 w-3" />
                                            {`Angle ${cVid.camera_index || 1}`}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownloadCurrent}
                                className="gap-2"
                                disabled={currentVideo.is_expired || (currentVideo.processing_status && currentVideo.processing_status !== 'ready')}
                            >
                                <Download className="h-4 w-4" />
                                {companionVideos.length > 1
                                    ? `Télécharger Angle ${currentVideo.camera_index || 1}`
                                    : t('components.videoCard.menu.download', 'Télécharger')
                                }
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setClipEditorOpen(true)}
                                className="gap-2"
                            >
                                <Scissors className="h-4 w-4" />
                                {companionVideos.length > 1
                                    ? `Créer clip (Angle ${currentVideo.camera_index || 1})`
                                    : t('modals.videoPlayer.createClip', 'Créer un clip')
                                }
                            </Button>
                        </div>
                    </div>

                    <div className="relative bg-black">
                        <video
                            ref={videoCallbackRef}
                            className="w-full aspect-video"
                            controls
                            playsInline
                        >
                            {t('modals.videoPlayer.unsupported')}
                        </video>
                    </div>
                </DialogContent>
            </Dialog>

            {clipEditorOpen && (
                <VideoClipEditor
                    isOpen={clipEditorOpen}
                    onClose={() => setClipEditorOpen(false)}
                    video={currentVideo}
                    onClipCreated={() => {
                        setClipEditorOpen(false);
                    }}
                />
            )}
        </>
    );
}
