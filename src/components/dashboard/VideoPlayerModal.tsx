import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { Button } from "@/components/ui/button";
import { Scissors, X } from "lucide-react";
import { VideoClipEditor } from "./VideoClipEditor";

interface VideoPlayerModalProps {
    isOpen: boolean;
    onClose: () => void;
    video: {
        id: string;
        title?: string;
        file_url?: string;
        bunny_video_id?: string;
    } | null;
}

export function VideoPlayerModal({ isOpen, onClose, video }: VideoPlayerModalProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
    const [clipEditorOpen, setClipEditorOpen] = useState(false);

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
            hasVideo: !!video,
            isOpen,
            hasVideoElement: !!videoElement
        });

        if (!video || !isOpen || !videoElement) {
            console.log('[VideoPlayer] Skipping HLS init:', {
                hasVideo: !!video,
                isOpen,
                hasVideoElement: !!videoElement
            });
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
            return;
        }

        const videoUrl = video.file_url || '';
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
    }, [video, isOpen, videoElement]);

    if (!video) return null;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-4xl md:max-w-5xl p-0">
                    <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="font-semibold text-lg">{video.title || 'Lecteur vidéo'}</h3>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setClipEditorOpen(true)}
                            className="gap-2"
                        >
                            <Scissors className="h-4 w-4" />
                            Créer un Clip
                        </Button>
                    </div>

                    <div className="relative bg-black">
                        <video
                            ref={videoCallbackRef}
                            className="w-full aspect-video"
                            controls
                            playsInline
                        >
                            Votre navigateur ne supporte pas la lecture vidéo.
                        </video>
                    </div>
                </DialogContent>
            </Dialog>

            {clipEditorOpen && (
                <VideoClipEditor
                    isOpen={clipEditorOpen}
                    onClose={() => setClipEditorOpen(false)}
                    video={video}
                    onClipCreated={() => {
                        setClipEditorOpen(false);
                    }}
                />
            )}
        </>
    );
}
