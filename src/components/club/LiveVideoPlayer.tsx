import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { CameraOff, Loader2 } from 'lucide-react';

interface LiveVideoPlayerProps {
    streamUrl: string;
    className?: string;
}

export const LiveVideoPlayer: React.FC<LiveVideoPlayerProps> = ({ streamUrl, className = '' }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !streamUrl) return;

        let hls: Hls | null = null;

        const initializePlayer = () => {
            setIsLoading(true);
            setError(null);

            // Check if HLS is supported or if the browser has native HLS support (Safari)
            if (Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });

                hls.loadSource(streamUrl);
                hls.attachMedia(video);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    setIsLoading(false);
                    video.play().catch(e => {
                        console.log("Auto-play prevented", e);
                        // Auto-play might be prevented by browser policies, let user click play
                    });
                });

                hls.on(Hls.Events.ERROR, (event, data) => {
                    if (data.fatal) {
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                console.error('fatal network error encountered, try to recover');
                                hls?.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                console.error('fatal media error encountered, try to recover');
                                hls?.recoverMediaError();
                                break;
                            default:
                                hls?.destroy();
                                setError('Stream hors ligne ou inaccessible');
                                setIsLoading(false);
                                break;
                        }
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                // Native support (Safari)
                video.src = streamUrl;
                video.addEventListener('loadedmetadata', () => {
                    setIsLoading(false);
                    video.play().catch(e => console.log("Auto-play prevented (Native)", e));
                });
                video.addEventListener('error', () => {
                    setError('Stream hors ligne ou inaccessible');
                    setIsLoading(false);
                });
            } else {
                setError('HLS non supporté par ce navigateur');
                setIsLoading(false);
            }
        };

        initializePlayer();

        return () => {
            if (hls) {
                hls.destroy();
            }
        };
    }, [streamUrl]);

    if (error) {
        return (
            <div className={`flex flex-col items-center justify-center bg-gray-900 border border-red-900 rounded-md overflow-hidden aspect-video relative w-full ${className}`}>
                <CameraOff className="w-8 h-8 text-red-500/80 mb-2" />
                <p className="text-sm font-medium text-red-400">{error}</p>
                <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded bg-red-950/80">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-[10px] font-medium text-red-200 uppercase tracking-wider">Hors Ligne</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative bg-black rounded-md overflow-hidden aspect-video w-full group ${className}`}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 z-10">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
            )}

            <video
                ref={videoRef}
                className="w-full h-full object-cover"
                controls
                muted
                playsInline
                crossOrigin="anonymous"
            />

            {!isLoading && (
                <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] font-medium text-white uppercase tracking-wider">En Direct</span>
                </div>
            )}
        </div>
    );
};
