/**
 * Video Clip Editor Component
 * High-performance Reel / Filmstrip trimmer with True Moving Backline (60fps),
 * custom resizable width (3s to 60s max), Light/Dark theme compatibility,
 * and seamless full-match slider navigation.
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Hls from 'hls.js';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
    Scissors,
    Play,
    Pause,
    Loader2,
    CheckCircle2,
    AlertCircle,
    SlidersHorizontal,
    Clock
} from 'lucide-react';
import { clipService } from '@/lib/api';
import { getPreferredPlaybackUrl } from '@/lib/bunnyVideoHelper';
import { toast } from 'sonner';
import { useTranslation } from "react-i18next";

interface VideoClipEditorProps {
    isOpen: boolean;
    onClose: () => void;
    video: {
        id: string;
        title?: string;
        file_url?: string;
        bunny_video_id?: string;
        camera_index?: number;
        duration?: number;
    } | null;
    onClipCreated?: (clip: any) => void;
    initialStartTime?: number;
    initialEndTime?: number;
    initialTitle?: string;
    initialDescription?: string;
}

type ProcessingStep = 'upload' | '';

const MIN_DURATION = 3;       // Minimum clip duration in seconds
const MAX_DURATION = 60;      // Maximum clip duration in seconds
const PIXELS_PER_SEC = 5;     // 5 pixels per second for tactile precision (60s = 300px)

export function VideoClipEditor({
    isOpen,
    onClose,
    video,
    onClipCreated,
    initialStartTime,
    initialEndTime,
    initialTitle,
    initialDescription,
}: VideoClipEditorProps) {
    const { t } = useTranslation();

    // UI States
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [processingStep, setProcessingStep] = useState<ProcessingStep>('');
    const [progress, setProgress] = useState(0);

    // Player states
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPreviewing, setIsPreviewing] = useState(false);

    // RAF Video seek throttle to prevent browser media stalls & dropped frames
    const rafSeekId = useRef<number | null>(null);
    const targetSeekTime = useRef<number | null>(null);

    const smoothSeekVideo = useCallback((time: number) => {
        targetSeekTime.current = time;
        if (rafSeekId.current === null) {
            rafSeekId.current = requestAnimationFrame(() => {
                if (videoRef.current && targetSeekTime.current !== null) {
                    videoRef.current.currentTime = targetSeekTime.current;
                }
                rafSeekId.current = null;
            });
        }
    }, []);

    useEffect(() => {
        return () => {
            if (rafSeekId.current !== null) {
                cancelAnimationFrame(rafSeekId.current);
            }
        };
    }, []);

    // Selection states (absolute seconds)
    const [startTime, setStartTime] = useState(initialStartTime ?? 0);
    const [clipDuration, setClipDuration] = useState(25);

    // Track viewport measurement with ResizeObserver
    const trackRef = useRef<HTMLDivElement | null>(null);
    const [trackWidth, setTrackWidth] = useState(0);
    const observerRef = useRef<ResizeObserver | null>(null);

    // Callback ref ensures immediate, subpixel measurement as soon as DOM element mounts
    const trackCallbackRef = useCallback((node: HTMLDivElement | null) => {
        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }

        trackRef.current = node;

        if (node) {
            if (node.clientWidth > 0) {
                setTrackWidth(node.clientWidth);
            }

            const ro = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const width = Math.round(entry.contentRect.width);
                    if (width > 0) {
                        setTrackWidth(width);
                    }
                }
            });
            ro.observe(node);
            observerRef.current = ro;
        }
    }, []);

    useEffect(() => {
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }
        };
    }, []);

    // Sync initial values whenever editor opens
    useEffect(() => {
        if (!isOpen) return;
        setError('');
        setSuccess(false);
        setProcessingStep('');

        const s = typeof initialStartTime === 'number' ? Math.max(0, initialStartTime) : 0;
        const dur = video?.duration || 120;
        let cDur = 25;
        if (typeof initialEndTime === 'number' && initialEndTime > s) {
            cDur = Math.max(MIN_DURATION, Math.min(MAX_DURATION, initialEndTime - s));
        }

        setStartTime(Number(s.toFixed(1)));
        setClipDuration(Number(cDur.toFixed(1)));
        setTitle(initialTitle ?? '');
        setDescription(initialDescription ?? '');
    }, [isOpen, initialStartTime, initialEndTime, initialTitle, initialDescription, video?.id, video?.duration]);

    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

    // Callback ref for video element
    const videoCallbackRef = useCallback((node: HTMLVideoElement | null) => {
        if (node) {
            videoRef.current = node;
            setVideoElement(node);
        }
    }, []);

    // Initialize HLS player
    useEffect(() => {
        if (!video || !isOpen || !videoElement) {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
            return;
        }

        const videoUrl = getPreferredPlaybackUrl(video) || video.file_url || '';
        if (!videoUrl) return;

        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        const isMP4 = videoUrl.includes('.mp4');
        const isHLS = videoUrl.includes('.m3u8');

        if (isMP4) {
            videoElement.src = videoUrl;
            videoElement.load();
        } else if (isHLS && Hls.isSupported()) {
            const hls = new Hls({ enableWorker: true, startPosition: initialStartTime ?? -1 });
            hls.loadSource(videoUrl);
            hls.attachMedia(videoElement);
            hlsRef.current = hls;

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                if (typeof initialStartTime === 'number' && initialStartTime > 0) {
                    videoElement.currentTime = initialStartTime;
                }
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    console.error('[ClipEditor] HLS error:', data);
                    if (video.file_url && video.file_url !== videoUrl && data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.destroy();
                        videoElement.src = video.file_url;
                        videoElement.load();
                        return;
                    }
                    setError('Erreur de lecture vidéo');
                }
            });
        } else if (isHLS && videoElement.canPlayType('application/vnd.apple.mpegurl')) {
            videoElement.src = videoUrl;
            videoElement.load();
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [video, isOpen, videoElement]);

    // Update duration when video loads
    const handleVideoLoaded = () => {
        if (videoRef.current) {
            const videoDuration = videoRef.current.duration || video?.duration || 0;
            setDuration(videoDuration);
            if (videoRef.current.currentTime !== startTime) {
                videoRef.current.currentTime = startTime;
            }
        }
    };

    const endTime = Number((startTime + clipDuration).toFixed(1));

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const time = videoRef.current.currentTime;
            setCurrentTime(time);

            // Loop smoothly during preview mode
            if (isPreviewing && time >= endTime) {
                videoRef.current.currentTime = startTime;
            }
        }
    };

    const formatTimeWithTenths = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const tenths = Math.floor((seconds % 1) * 10);
        return `${mins}:${secs.toString().padStart(2, '0')}.${tenths}`;
    };

    const formatMatchTime = (seconds: number): string => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Preview Toggle (Loop between startTime and endTime)
    const handleTogglePreview = () => {
        if (!videoRef.current) return;
        if (isPreviewing) {
            videoRef.current.pause();
            setIsPlaying(false);
            setIsPreviewing(false);
        } else {
            videoRef.current.currentTime = startTime;
            videoRef.current.play();
            setIsPlaying(true);
            setIsPreviewing(true);
        }
    };

    // Quick presets (Change width to 15s, 30s, 45s, 60s)
    const handleSetPresetDuration = (presetSec: number) => {
        const totalDur = duration || video?.duration || 0;
        const newDur = Math.max(MIN_DURATION, Math.min(MAX_DURATION, presetSec));
        let newStart = startTime;

        if (totalDur > 0 && newStart + newDur > totalDur) {
            newStart = Math.max(0, totalDur - newDur);
        }

        setStartTime(Number(newStart.toFixed(1)));
        setClipDuration(Number(newDur.toFixed(1)));
        smoothSeekVideo(newStart);
    };

    // Nudge entire selection by +/- seconds
    const handleNudge = (deltaSeconds: number) => {
        const totalDur = duration || video?.duration || 0;
        let newStart = startTime + deltaSeconds;

        if (newStart < 0) newStart = 0;
        if (totalDur > 0 && newStart + clipDuration > totalDur) {
            newStart = Math.max(0, totalDur - clipDuration);
        }

        newStart = Number(newStart.toFixed(1));
        setStartTime(newStart);
        smoothSeekVideo(newStart);
    };

    // Total effective match duration
    const totalVideoDuration = duration || video?.duration || 0;

    // --- RESPONSIVE REEL GEOMETRY & MOVING BACKLINE CALCULATION ---
    // Fallback safely to 320 on mobile until ResizeObserver provides exact DOM clientWidth
    const effectiveTrackWidth = trackWidth > 0 ? trackWidth : 320;

    // Responsive pixels per second:
    // On desktop, 5 px/s gives optimal tactile scrub resolution (60s = 300px).
    // On mobile (< 450px), dynamically scale down so MAX_DURATION (60s) fits inside the viewport with comfortable margins.
    const pixelsPerSec = useMemo(() => {
        return Math.min(5, Math.max(2.5, (effectiveTrackWidth - 40) / MAX_DURATION));
    }, [effectiveTrackWidth]);

    // Selection box width & position strictly bounded to never overflow the track
    const boxWidth = Math.max(24, Math.min(effectiveTrackWidth - 16, clipDuration * pixelsPerSec));
    const boxLeft = Math.max(0, Math.min(effectiveTrackWidth - boxWidth, (effectiveTrackWidth - boxWidth) / 2));

    // The center point in seconds of the current selection:
    const centerSec = startTime + clipDuration / 2;

    // Build the dynamic moving ruler tape around the current center point:
    // We generate ticks every 2 seconds. Absolutely positioned so there is ZERO modulo jump, ZERO flexbox jumping.
    const rulerTicks = useMemo(() => {
        const ticks: { sec: number; isMajor: boolean; isMid: boolean; label?: string }[] = [];
        const TICK_INTERVAL = 2;
        const halfSpanSec = Math.ceil((effectiveTrackWidth / 2) / pixelsPerSec) + 20;
        const minSec = Math.max(0, Math.floor((centerSec - halfSpanSec) / TICK_INTERVAL) * TICK_INTERVAL);
        const maxSec = Math.min(
            totalVideoDuration > 0 ? totalVideoDuration : centerSec + halfSpanSec,
            Math.ceil((centerSec + halfSpanSec) / TICK_INTERVAL) * TICK_INTERVAL
        );

        for (let s = minSec; s <= maxSec; s += TICK_INTERVAL) {
            const isMid = s % 30 === 0;
            const isMajor = s % 10 === 0;
            let label: string | undefined;
            if (isMajor) {
                const m = Math.floor(s / 60);
                const sec = s % 60;
                label = `${m}:${String(sec).padStart(2, '0')}`;
            }
            ticks.push({ sec: s, isMajor, isMid, label });
        }
        return ticks;
    }, [centerSec, totalVideoDuration, effectiveTrackWidth, pixelsPerSec]);

    // Drag Handlers (Left Handle = Resize Start, Right Handle = Resize End, Center = Slide Match)
    const handleStartDrag = (type: 'box' | 'left' | 'right', clientX: number) => {
        setActiveDrag(type);
        dragDataRef.current = {
            clientX,
            initialStart: startTime,
            initialDuration: clipDuration,
        };
    };

    useEffect(() => {
        if (!activeDrag) return;

        const handlePointerMove = (e: MouseEvent | TouchEvent) => {
            if (!activeDrag || !dragDataRef.current) return;
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const deltaPx = clientX - dragDataRef.current.clientX;
            const deltaSec = deltaPx / pixelsPerSec;

            const { initialStart, initialDuration } = dragDataRef.current;
            const totalDur = duration || video?.duration || Infinity;

            if (activeDrag === 'box') {
                // Dragging the filmstrip moves the match under the frame (natural touch inertia)
                let newStart = initialStart - deltaSec;
                if (newStart < 0) newStart = 0;
                if (totalDur > 0 && newStart + initialDuration > totalDur) {
                    newStart = Math.max(0, totalDur - initialDuration);
                }
                newStart = Number(newStart.toFixed(1));
                setStartTime(newStart);
                smoothSeekVideo(newStart);
            } else if (activeDrag === 'right') {
                // Dragging Right Handle directly changes width / duration
                const newDuration = Math.max(MIN_DURATION, Math.min(MAX_DURATION, initialDuration + deltaSec));
                const cleanDur = Number(newDuration.toFixed(1));
                if (totalDur > 0 && initialStart + cleanDur > totalDur) {
                    return;
                }
                setClipDuration(cleanDur);
                smoothSeekVideo(initialStart + cleanDur);
            } else if (activeDrag === 'left') {
                // Dragging Left Handle directly changes width and start time
                const newDuration = Math.max(MIN_DURATION, Math.min(MAX_DURATION, initialDuration - deltaSec));
                const actualDelta = initialDuration - newDuration;
                let newStart = initialStart + actualDelta;
                if (newStart < 0) {
                    newStart = 0;
                }
                const cleanStart = Number(newStart.toFixed(1));
                const cleanDur = Number(newDuration.toFixed(1));
                setStartTime(cleanStart);
                setClipDuration(cleanDur);
                smoothSeekVideo(cleanStart);
            }
        };

        const handlePointerEnd = () => {
            setActiveDrag(null);
            dragDataRef.current = null;
        };

        window.addEventListener('mousemove', handlePointerMove);
        window.addEventListener('mouseup', handlePointerEnd);
        window.addEventListener('touchmove', handlePointerMove, { passive: false });
        window.addEventListener('touchend', handlePointerEnd);

        return () => {
            window.removeEventListener('mousemove', handlePointerMove);
            window.removeEventListener('mouseup', handlePointerEnd);
            window.removeEventListener('touchmove', handlePointerMove);
            window.removeEventListener('touchend', handlePointerEnd);
        };
    }, [activeDrag, duration, video?.duration, smoothSeekVideo, pixelsPerSec]);

    const isMaxReached = clipDuration >= MAX_DURATION - 0.2;

    /**
     * Submit clip creation
     */
    const handleCreateClip = async () => {
        if (!title.trim()) {
            setError(t('components.clipEditor.errors.titleRequired'));
            return;
        }

        if (clipDuration < MIN_DURATION) {
            setError(t('components.clipEditor.errors.minDuration'));
            return;
        }

        if (clipDuration > MAX_DURATION) {
            setError(t('components.clipEditor.errors.maxDuration'));
            return;
        }

        if (!video) {
            setError(t('components.clipEditor.errors.noVideo'));
            return;
        }

        setLoading(true);
        setError('');
        setProgress(0);

        try {
            setProcessingStep('upload');
            toast.info(t('components.clipEditor.processing'));

            const response = await clipService.createClip({
                video_id: video.id,
                start_time: startTime,
                end_time: endTime,
                title: title.trim(),
                description: description.trim()
            });

            setProgress(100);
            setSuccess(true);
            toast.success(t('components.clipEditor.success'));

            if (onClipCreated) {
                onClipCreated(response.data.clip);
            }

            onClose();
            setSuccess(false);
            setTitle('');
            setDescription('');
            setProcessingStep('');

        } catch (err: any) {
            console.error('[Clip] Creation error:', err);
            const errorMessage = err.response?.data?.error || err.message || t('components.clipEditor.error');
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getStepLabel = (): string => {
        switch (processingStep) {
            case 'upload': return t('components.clipEditor.uploading');
            default: return t('components.clipEditor.processing');
        }
    };

    const getStepIcon = () => {
        return <Loader2 className="h-4 w-4 mr-2 animate-spin" />;
    };

    if (!video) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="p-0 gap-0 sm:max-w-3xl md:max-w-4xl max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden bg-card text-card-foreground border-border rounded-xl sm:rounded-2xl shadow-2xl">
                {/* Pinned Modal Header (Never clips, never scrolls away) */}
                <div className="px-5 py-3.5 sm:py-4 border-b border-border bg-card shrink-0 pr-12">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-foreground font-semibold text-base sm:text-lg">
                            <Scissors className="h-4.5 w-4.5 text-primary" />
                            {t('components.clipEditor.title')}
                            {video.camera_index && (
                                <span className="text-xs px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground border border-border font-medium">
                                    Angle {video.camera_index}
                                </span>
                            )}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-xs sm:text-sm mt-0.5">
                            {t('components.clipEditor.subtitle')}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Scrollable Content Body */}
                <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-5">
                    {/* Video Player */}
                    <div className="space-y-1.5">
                        <div className="relative bg-black rounded-xl overflow-hidden shadow-md border border-border">
                            <video
                                ref={videoCallbackRef}
                                className="w-full aspect-video"
                                controls
                                playsInline
                                onLoadedMetadata={handleVideoLoaded}
                                onTimeUpdate={handleTimeUpdate}
                            >
                                {t('components.clipEditor.unsupported')}
                            </video>

                            {/* Macro match progress badge */}
                            {totalVideoDuration > 0 && (
                                <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-sm border border-white/10 text-xs font-mono text-white shadow-xs">
                                    <Clock className="w-3.5 h-3.5 text-primary" />
                                    <span>{formatMatchTime(currentTime)}</span>
                                    <span className="text-white/40">/</span>
                                    <span className="text-white/70">{formatMatchTime(totalVideoDuration)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pro Reel Trimmer Section */}
                    <div className="p-4 rounded-xl bg-card border border-border space-y-3.5">
                        {/* Header: Title & Dynamic Live Duration Badge */}
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <Label className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
                                    <SlidersHorizontal className="w-4 h-4 text-primary" />
                                    {t('components.clipEditor.selection', 'Plage du clip')}
                                </Label>
                                <span className="text-xs text-muted-foreground hidden sm:inline">
                                    {t('components.clipEditor.dragTip', 'Ajustez la durée et faites défiler pour choisir le moment')}
                                </span>
                            </div>

                            {/* Live Duration Badge */}
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground border border-border">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                <span className="text-xs font-mono font-semibold">{clipDuration}s</span>
                                <span className="text-[11px] text-muted-foreground font-normal">/ {MAX_DURATION}s max</span>
                            </div>
                        </div>

                        {/* Start & End Timestamps */}
                        <div className="flex justify-between items-center text-xs font-mono px-1">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <span className="font-sans text-xs">{t('components.clipEditor.startTime', 'Début')} :</span>
                                <span className="text-foreground font-semibold font-mono">{formatTimeWithTenths(startTime)}</span>
                            </div>
                            <div className="text-xs font-mono font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                                {clipDuration}s
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <span className="font-sans text-xs">{t('components.clipEditor.endTime', 'Fin')} :</span>
                                <span className="text-foreground font-semibold font-mono">{formatTimeWithTenths(endTime)}</span>
                            </div>
                        </div>

                        {/* Interactive Reel Track Container */}
                        <div
                            ref={trackCallbackRef}
                            className="relative h-20 bg-slate-100 dark:bg-slate-900/90 rounded-xl border border-border overflow-hidden select-none touch-none shadow-inner"
                        >
                            {/* THE MOVING BACKLINE TAPE: Physical ruler with ticks and labels translating smoothly at 60fps */}
                            <div
                                className="absolute top-0 bottom-0 pointer-events-none will-change-transform"
                                style={{
                                    left: `${effectiveTrackWidth / 2}px`,
                                    transform: `translate3d(${-centerSec * pixelsPerSec}px, 0, 0)`,
                                }}
                            >
                                {rulerTicks.map((t) => (
                                    <div
                                        key={`tick-${t.sec}`}
                                        className="absolute top-0 bottom-0 flex flex-col items-center justify-end pb-1 select-none pointer-events-none"
                                        style={{
                                            left: `${t.sec * pixelsPerSec}px`,
                                            transform: 'translateX(-50%)',
                                            width: '24px',
                                        }}
                                    >
                                        <div
                                            className={`transition-all ${t.isMid
                                                ? 'w-1 bg-primary/80 h-7 rounded-sm'
                                                : t.isMajor
                                                    ? 'w-0.5 bg-muted-foreground/60 h-5'
                                                    : 'w-0.5 bg-border h-3'
                                                }`}
                                        />
                                        {t.label && (
                                            <span className="text-[10px] font-mono text-muted-foreground select-none pt-0.5">
                                                {t.label}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Left Dimmed Overlay Curtain */}
                            <div
                                className="absolute top-0 bottom-0 left-0 bg-slate-900/35 dark:bg-black/60 pointer-events-none z-10"
                                style={{ width: `${boxLeft}px` }}
                            />

                            {/* Right Dimmed Overlay Curtain */}
                            <div
                                className="absolute top-0 bottom-0 right-0 bg-slate-900/35 dark:bg-black/60 pointer-events-none z-10"
                                style={{ left: `${boxLeft + boxWidth}px` }}
                            />

                            {/* Active Resizable Selection Frame (Pro Solid Theme) */}
                            <div
                                className="absolute top-1.5 bottom-1.5 rounded-lg border-2 border-primary bg-primary/10 dark:bg-primary/15 shadow-sm cursor-grab active:cursor-grabbing z-20"
                                style={{
                                    left: `${boxLeft}px`,
                                    width: `${boxWidth}px`,
                                }}
                                onMouseDown={(e) => handleStartDrag('box', e.clientX)}
                                onTouchStart={(e) => handleStartDrag('box', e.touches[0].clientX)}
                            >
                                {/* Center Duration Label */}
                                <div className="w-full h-full flex items-center justify-center pointer-events-none">
                                    <div className="z-10 flex items-center px-2 py-0.5 rounded-md bg-card/95 text-foreground border border-border shadow-xs">
                                        <span className="text-[11px] font-mono font-bold tracking-tight">
                                            {Math.round(clipDuration)}s
                                        </span>
                                    </div>
                                </div>

                                {/* Left Handle - Clean Bracket (Enhanced 40px Touch Target for Mobile) */}
                                <div
                                    className="absolute left-0 top-0 bottom-0 w-10 -ml-5 sm:w-8 sm:-ml-4 z-30 cursor-ew-resize flex items-center justify-center group touch-none"
                                    title="Ajuster le début"
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        handleStartDrag('left', e.clientX);
                                    }}
                                    onTouchStart={(e) => {
                                        e.stopPropagation();
                                        handleStartDrag('left', e.touches[0].clientX);
                                    }}
                                >
                                    <div className="w-3.5 h-10 bg-primary text-primary-foreground rounded-l-md shadow-xs border-y border-l border-primary-foreground/20 flex flex-col items-center justify-center gap-0.5 group-hover:bg-primary/90 transition-colors">
                                        <div className="w-1 h-[2px] bg-primary-foreground/80 rounded-full" />
                                        <div className="w-1 h-[2px] bg-primary-foreground/80 rounded-full" />
                                        <div className="w-1 h-[2px] bg-primary-foreground/80 rounded-full" />
                                    </div>
                                </div>

                                {/* Right Handle - Clean Bracket (Enhanced 40px Touch Target for Mobile) */}
                                <div
                                    className="absolute right-0 top-0 bottom-0 w-10 -mr-5 sm:w-8 sm:-mr-4 z-30 cursor-ew-resize flex items-center justify-center group touch-none"
                                    title="Ajuster la fin"
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        handleStartDrag('right', e.clientX);
                                    }}
                                    onTouchStart={(e) => {
                                        e.stopPropagation();
                                        handleStartDrag('right', e.touches[0].clientX);
                                    }}
                                >
                                    <div className="w-3.5 h-10 bg-primary text-primary-foreground rounded-r-md shadow-xs border-y border-r border-primary-foreground/20 flex flex-col items-center justify-center gap-0.5 group-hover:bg-primary/90 transition-colors">
                                        <div className="w-1 h-[2px] bg-primary-foreground/80 rounded-full" />
                                        <div className="w-1 h-[2px] bg-primary-foreground/80 rounded-full" />
                                        <div className="w-1 h-[2px] bg-primary-foreground/80 rounded-full" />
                                    </div>
                                </div>
                            </div>

                            {/* Center Hairline Needle */}
                            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-primary/70 z-30 pointer-events-none"></div>
                        </div>

                        {/* Faire défiler le match : Slider (Full Match Macro Navigation) */}
                        {totalVideoDuration > 0 && (
                            <div className="flex items-center gap-3 pt-1 px-1">
                                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                                    {t('components.clipEditor.scrollMatch', 'Faire défiler le match :')}
                                </span>
                                <input
                                    type="range"
                                    min={0}
                                    max={Math.max(0, totalVideoDuration - clipDuration)}
                                    step={0.5}
                                    value={Math.min(startTime, Math.max(0, totalVideoDuration - clipDuration))}
                                    onChange={(e) => {
                                        const newStart = parseFloat(e.target.value);
                                        const cleanStart = Number(newStart.toFixed(1));
                                        setStartTime(cleanStart);
                                        smoothSeekVideo(cleanStart);
                                    }}
                                    className="w-full h-2 bg-secondary rounded-md appearance-none cursor-pointer accent-primary"
                                />
                                <span className="text-xs font-mono font-semibold text-foreground whitespace-nowrap">
                                    {formatMatchTime(startTime)}
                                </span>
                            </div>
                        )}

                        {/* Bottom Row: Quick Preset Width Buttons & Controls */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border">
                            {/* Width Presets (Standard Segmented Controls) */}
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs text-muted-foreground font-medium mr-1">
                                    {t('components.clipEditor.presets', 'Durée :')}
                                </span>
                                {[15, 30, 45].map((sec) => (
                                    <Button
                                        key={sec}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleSetPresetDuration(sec)}
                                        className={`h-7 px-2.5 text-xs rounded-md font-mono transition ${Math.round(clipDuration) === sec
                                            ? 'bg-primary text-primary-foreground font-semibold border-primary shadow-xs'
                                            : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground border-border'
                                            }`}
                                    >
                                        {sec}s
                                    </Button>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSetPresetDuration(60)}
                                    className={`h-7 px-2.5 text-xs rounded-md font-mono transition ${isMaxReached
                                        ? 'bg-primary text-primary-foreground font-semibold border-primary shadow-xs'
                                        : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground border-border'
                                        }`}
                                >
                                    60s (Max)
                                </Button>
                            </div>

                            {/* Micro-nudgers & Preview Loop */}
                            <div className="flex items-center gap-1.5">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleNudge(-1)}
                                    title="Reculer de 1s"
                                    className="h-7 px-2 text-xs font-mono rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground border-border"
                                >
                                    -1s
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleNudge(1)}
                                    title="Avancer de 1s"
                                    className="h-7 px-2 text-xs font-mono rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground border-border"
                                >
                                    +1s
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleTogglePreview}
                                    className="h-7 px-3 text-xs gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-xs"
                                >
                                    {isPreviewing ? (
                                        <>
                                            <Pause className="h-3.5 w-3.5 fill-current" />
                                            {t('components.clipEditor.pausePreview', 'Pause')}
                                        </>
                                    ) : (
                                        <>
                                            <Play className="h-3.5 w-3.5 fill-current" />
                                            {t('components.clipEditor.preview', 'Aperçu')}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Metadata: Title & Description */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="clip-title" className="text-xs sm:text-sm font-semibold text-foreground">
                                {t('components.clipEditor.titleLabel')} *
                            </Label>
                            <Input
                                id="clip-title"
                                placeholder={t('components.clipEditor.titlePlaceholder')}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={loading}
                                className="bg-background text-foreground border-input"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="clip-description" className="text-xs sm:text-sm font-semibold text-foreground">
                                {t('components.clipEditor.descriptionLabel')}
                            </Label>
                            <Textarea
                                id="clip-description"
                                placeholder={t('components.clipEditor.descriptionPlaceholder')}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={loading}
                                rows={2}
                                className="bg-background text-foreground border-input"
                            />
                        </div>
                    </div>

                    {/* Processing Progress */}
                    {loading && (
                        <div className="space-y-2">
                            <div className="flex items-center text-sm text-foreground">
                                {getStepIcon()}
                                <span>{getStepLabel()}</span>
                            </div>
                            <Progress value={progress} className="w-full" />
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Success Message */}
                    {success && (
                        <Alert className="border-green-500 bg-green-50 dark:bg-green-950/30">
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <AlertDescription className="text-green-600 dark:text-green-400">
                                {t('components.clipEditor.success')}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                {/* Pinned Modal Footer (Always visible, clean and ergonomic) */}
                <div className="px-5 py-3.5 border-t border-border bg-card shrink-0 flex items-center justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                        className="text-xs sm:text-sm h-9 rounded-md"
                    >
                        {t('components.clipEditor.cancel')}
                    </Button>
                    <Button
                        onClick={handleCreateClip}
                        disabled={loading || !title.trim()}
                        className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm h-9 rounded-md shadow-xs"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {t('components.clipEditor.processing')}
                            </>
                        ) : (
                            <>
                                <Scissors className="h-4 w-4" />
                                {t('components.clipEditor.create')}
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
