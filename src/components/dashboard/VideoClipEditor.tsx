/**
 * Video Clip Editor Component
 * Instagram-style ergonomic clip trimmer with a 2-minute local focus window (for 120min+ matches),
 * draggable selection frame, resize handles, max 60s constraint, and quick presets.
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
    Sparkles,
    ChevronLeft,
    ChevronRight,
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

const WINDOW_DURATION = 120; // 2 minutes local focus window for long matches (e.g. 120 min)
const MIN_DURATION = 3;      // Minimum clip duration in seconds
const MAX_DURATION = 60;     // Maximum clip duration in seconds

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

    // Selection states (in absolute seconds from match start)
    const hasInitialRange =
        typeof initialStartTime === 'number' &&
        typeof initialEndTime === 'number' &&
        initialEndTime > initialStartTime;

    const [startTime, setStartTime] = useState(initialStartTime ?? 0);
    const [endTime, setEndTime] = useState(initialEndTime ?? 25);

    // 2-minute local focus window start (in absolute seconds)
    const [windowStart, setWindowStart] = useState(0);

    // Clip metadata
    const [title, setTitle] = useState(initialTitle ?? '');
    const [description, setDescription] = useState(initialDescription ?? '');

    // Scrubber interaction refs & state
    const trackRef = useRef<HTMLDivElement>(null);
    const [activeDrag, setActiveDrag] = useState<'box' | 'left' | 'right' | null>(null);
    const dragDataRef = useRef<{ clientX: number; initialStart: number; initialEnd: number } | null>(null);

    // Sync initial values whenever editor opens with a new preset segment
    useEffect(() => {
        if (!isOpen) return;
        setError('');
        setSuccess(false);
        setProcessingStep('');
        const s = typeof initialStartTime === 'number' ? Math.max(0, initialStartTime) : 0;
        const dur = video?.duration || 120;
        const e =
            typeof initialEndTime === 'number' && initialEndTime > s
                ? Math.min(s + MAX_DURATION, initialEndTime)
                : Math.min(s + 25, dur);

        const cleanStart = Number(s.toFixed(1));
        const cleanEnd = Number(e.toFixed(1));
        setStartTime(cleanStart);
        setEndTime(cleanEnd);
        setTitle(initialTitle ?? '');
        setDescription(initialDescription ?? '');

        // Initialize local 2-minute focus window
        const totalDur = dur;
        if (totalDur <= WINDOW_DURATION) {
            setWindowStart(0);
        } else {
            const idealStart = Math.max(0, cleanStart - 15);
            const maxStart = Math.max(0, totalDur - WINDOW_DURATION);
            setWindowStart(Math.min(idealStart, maxStart));
        }
    }, [isOpen, initialStartTime, initialEndTime, initialTitle, initialDescription, video?.id, video?.duration]);

    // Keep windowStart encompassing the current selection
    useEffect(() => {
        const totalDur = duration || video?.duration || 0;
        if (totalDur <= WINDOW_DURATION) return;

        if (startTime < windowStart) {
            setWindowStart(Math.max(0, startTime - 10));
        } else if (endTime > windowStart + WINDOW_DURATION) {
            const maxStart = Math.max(0, totalDur - WINDOW_DURATION);
            setWindowStart(Math.min(maxStart, endTime - WINDOW_DURATION + 10));
        }
    }, [startTime, endTime, duration, video?.duration, windowStart]);

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
            if (hasInitialRange && typeof initialStartTime === 'number' && typeof initialEndTime === 'number') {
                const clampedStart = Math.max(0, Math.min(initialStartTime, Math.max(0, videoDuration - 1)));
                const clampedEnd = Math.min(videoDuration, Math.max(clampedStart + 1, Math.min(clampedStart + MAX_DURATION, initialEndTime)));
                setStartTime(Number(clampedStart.toFixed(1)));
                setEndTime(Number(clampedEnd.toFixed(1)));
                videoRef.current.currentTime = clampedStart;
            } else {
                setEndTime(Number(Math.min(25, videoDuration).toFixed(1)));
            }
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const time = videoRef.current.currentTime;
            setCurrentTime(time);

            // Auto-loop during preview mode
            if (isPreviewing && time >= endTime) {
                videoRef.current.currentTime = startTime;
            }
        }
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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

    // Quick presets (15s, 30s, 45s, 60s)
    const handleSetPreset = (presetSeconds: number) => {
        const totalDur = duration || video?.duration || 0;
        const dur = Math.min(MAX_DURATION, presetSeconds);
        let newEnd = startTime + dur;
        let newStart = startTime;

        if (totalDur > 0 && newEnd > totalDur) {
            newEnd = totalDur;
            newStart = Math.max(0, totalDur - dur);
        }

        const cleanStart = Number(newStart.toFixed(1));
        const cleanEnd = Number(newEnd.toFixed(1));
        setStartTime(cleanStart);
        setEndTime(cleanEnd);

        if (videoRef.current) {
            videoRef.current.currentTime = cleanStart;
        }
    };

    // Nudge selection by +/- seconds
    const handleNudge = (deltaSeconds: number) => {
        const totalDur = duration || video?.duration || 0;
        const clipDur = endTime - startTime;
        let newStart = startTime + deltaSeconds;
        let newEnd = endTime + deltaSeconds;

        if (newStart < 0) {
            newStart = 0;
            newEnd = clipDur;
        }
        if (totalDur > 0 && newEnd > totalDur) {
            newEnd = totalDur;
            newStart = Math.max(0, totalDur - clipDur);
        }

        const cleanStart = Number(newStart.toFixed(1));
        const cleanEnd = Number(newEnd.toFixed(1));
        setStartTime(cleanStart);
        setEndTime(cleanEnd);

        if (videoRef.current) {
            videoRef.current.currentTime = cleanStart;
        }
    };

    // Shift 2-minute window along the match
    const handleShiftWindow = (deltaSeconds: number) => {
        const totalDur = duration || video?.duration || 0;
        if (totalDur <= WINDOW_DURATION) return;
        const maxStart = Math.max(0, totalDur - WINDOW_DURATION);
        setWindowStart(prev => Math.max(0, Math.min(maxStart, prev + deltaSeconds)));
    };

    // Total effective window bounds
    const totalVideoDuration = duration || video?.duration || 0;
    const windowSpan = totalVideoDuration > 0 ? Math.min(WINDOW_DURATION, totalVideoDuration) : WINDOW_DURATION;
    const windowEnd = Math.min(totalVideoDuration || windowStart + windowSpan, windowStart + windowSpan);

    // Scrubber Drag Handlers (Touch + Mouse unified)
    const startDrag = (type: 'box' | 'left' | 'right', clientX: number) => {
        setActiveDrag(type);
        dragDataRef.current = {
            clientX,
            initialStart: startTime,
            initialEnd: endTime,
        };
    };

    useEffect(() => {
        if (!activeDrag) return;

        const handlePointerMove = (e: MouseEvent | TouchEvent) => {
            if (!activeDrag || !dragDataRef.current || !trackRef.current) return;
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const rect = trackRef.current.getBoundingClientRect();
            if (rect.width <= 0) return;

            const totalDur = duration || video?.duration || 0;
            const effectiveWindowSpan = totalDur > 0 ? Math.min(WINDOW_DURATION, totalDur) : WINDOW_DURATION;
            const deltaX = clientX - dragDataRef.current.clientX;
            const deltaSec = (deltaX / rect.width) * effectiveWindowSpan;

            const { initialStart, initialEnd } = dragDataRef.current;
            const clipDur = initialEnd - initialStart;

            if (activeDrag === 'box') {
                let newStart = initialStart + deltaSec;
                let newEnd = initialEnd + deltaSec;

                if (newStart < 0) {
                    newStart = 0;
                    newEnd = clipDur;
                }
                if (totalDur > 0 && newEnd > totalDur) {
                    newEnd = totalDur;
                    newStart = Math.max(0, totalDur - clipDur);
                }

                newStart = Number(newStart.toFixed(1));
                newEnd = Number(newEnd.toFixed(1));
                setStartTime(newStart);
                setEndTime(newEnd);

                if (videoRef.current) {
                    videoRef.current.currentTime = newStart;
                }
            } else if (activeDrag === 'left') {
                const timeAtCursor = windowStart + ((clientX - rect.left) / rect.width) * effectiveWindowSpan;
                const minPossibleStart = Math.max(0, endTime - MAX_DURATION);
                const maxPossibleStart = Math.max(0, endTime - MIN_DURATION);

                const newStart = Number(Math.max(minPossibleStart, Math.min(maxPossibleStart, timeAtCursor)).toFixed(1));
                setStartTime(newStart);

                if (videoRef.current) {
                    videoRef.current.currentTime = newStart;
                }
            } else if (activeDrag === 'right') {
                const timeAtCursor = windowStart + ((clientX - rect.left) / rect.width) * effectiveWindowSpan;
                const minPossibleEnd = startTime + MIN_DURATION;
                const maxPossibleEnd = Math.min(totalDur || Infinity, startTime + MAX_DURATION);

                const newEnd = Number(Math.max(minPossibleEnd, Math.min(maxPossibleEnd, timeAtCursor)).toFixed(1));
                setEndTime(newEnd);

                if (videoRef.current) {
                    videoRef.current.currentTime = newEnd;
                }
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
    }, [activeDrag, duration, video?.duration, windowStart, startTime, endTime]);

    // Relative percentages within the 2-minute window
    const relStart = Math.max(0, startTime - windowStart);
    const relEnd = Math.max(relStart + 0.5, endTime - windowStart);
    const leftPercent = Math.max(0, Math.min(100, (relStart / windowSpan) * 100));
    const widthPercent = Math.max(2, Math.min(100 - leftPercent, ((relEnd - relStart) / windowSpan) * 100));

    const playheadRel = currentTime - windowStart;
    const playheadPercent = Math.max(0, Math.min(100, (playheadRel / windowSpan) * 100));
    const isPlayheadVisible = currentTime >= windowStart && currentTime <= windowEnd;

    const clipDuration = Number((endTime - startTime).toFixed(1));
    const isMaxReached = clipDuration >= MAX_DURATION - 0.2;

    // Fixed realistic audio/video waveform bars simulation
    const waveformBars = useMemo(() => {
        return Array.from({ length: 48 }, (_, i) => {
            const h = Math.sin(i * 0.42) * 35 + Math.cos(i * 0.85) * 20 + 45;
            return Math.max(18, Math.min(90, Math.round(h)));
        });
    }, []);

    /**
     * Create clip by sending request to backend (Server-Side Processing)
     */
    const handleCreateClip = async () => {
        if (!title.trim()) {
            setError(t('components.clipEditor.errors.titleRequired'));
            return;
        }

        if (endTime - startTime < MIN_DURATION) {
            setError(t('components.clipEditor.errors.minDuration'));
            return;
        }

        if (endTime - startTime > MAX_DURATION) {
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
            <DialogContent className="sm:max-w-3xl md:max-w-4xl max-h-[92vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Scissors className="h-5 w-5 text-primary" />
                        {t('components.clipEditor.title')}
                        {video.camera_index && (
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                                Angle {video.camera_index}
                            </span>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {t('components.clipEditor.subtitle')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5">
                    {/* Video Player */}
                    <div className="space-y-1.5">
                        <div className="relative bg-black rounded-xl overflow-hidden shadow-md">
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

                            {/* Full Video Mini-Timeline bar (gives macro awareness on long 120min matches) */}
                            {totalVideoDuration > 0 && (
                                <div className="absolute top-2 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-[11px] font-mono text-white/90 shadow">
                                        <Clock className="w-3 h-3 text-cyan-400" />
                                        <span>{formatMatchTime(currentTime)}</span>
                                        <span className="text-white/40">/</span>
                                        <span className="text-white/60">{formatMatchTime(totalVideoDuration)}</span>
                                    </div>
                                    {totalVideoDuration > WINDOW_DURATION && (
                                        <div className="text-[11px] px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium backdrop-blur-md">
                                            {t('components.clipEditor.trimWindow', 'Fenêtre :')} {formatMatchTime(windowStart)} - {formatMatchTime(windowEnd)}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Instagram-Style Zoomed 2-Minute Scrubber */}
                    <div className="p-4 rounded-2xl bg-card border border-border shadow-sm space-y-3">
                        {/* Header Row: Window Context & Duration Pill */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <Label className="text-sm font-semibold flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 text-cyan-400" />
                                    {t('components.clipEditor.selection', 'Sélection')}
                                </Label>
                                {totalVideoDuration > WINDOW_DURATION && (
                                    <div className="flex items-center gap-1">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleShiftWindow(-30)}
                                            className="h-6 px-1.5 text-[11px] gap-0.5"
                                            title="Reculer la fenêtre de 30s"
                                        >
                                            <ChevronLeft className="w-3 h-3" />
                                            -30s
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleShiftWindow(30)}
                                            className="h-6 px-1.5 text-[11px] gap-0.5"
                                            title="Avancer la fenêtre de 30s"
                                        >
                                            +30s
                                            <ChevronRight className="w-3 h-3" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Live Duration Badge */}
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors ${
                                isMaxReached
                                    ? 'bg-purple-500/15 border-purple-500/50 text-purple-300 font-bold'
                                    : 'bg-primary/10 border-primary/30 text-primary font-semibold'
                            }`}>
                                <span className={`w-2 h-2 rounded-full ${isMaxReached ? 'bg-purple-400 animate-pulse' : 'bg-cyan-400'}`}></span>
                                <span className="text-xs font-mono">{clipDuration}s</span>
                                <span className="text-[10px] text-muted-foreground font-normal">/ {MAX_DURATION}s max</span>
                            </div>
                        </div>

                        {/* Timestamps Row */}
                        <div className="flex justify-between items-center text-xs font-mono px-1">
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <span className="font-sans text-[11px]">{t('components.clipEditor.startTime', 'Début')} :</span>
                                <span className="text-cyan-400 font-bold">{formatTimeWithTenths(startTime)}</span>
                            </div>
                            <div className="text-[11px] font-sans text-muted-foreground hidden sm:block">
                                {t('components.clipEditor.dragTip', 'Glissez le cadre ou étirez les poignées (max 60s)')}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <span className="font-sans text-[11px]">{t('components.clipEditor.endTime', 'Fin')} :</span>
                                <span className="text-purple-400 font-bold">{formatTimeWithTenths(endTime)}</span>
                            </div>
                        </div>

                        {/* Interactive Track Container */}
                        <div
                            ref={trackRef}
                            className="relative h-14 bg-neutral-950/90 rounded-xl border border-neutral-800 overflow-hidden cursor-pointer select-none touch-none shadow-inner"
                        >
                            {/* Background Waveform Simulation (Dimmed) */}
                            <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none opacity-20">
                                {waveformBars.map((h, i) => (
                                    <div
                                        key={`bg-tick-${i}`}
                                        className="w-1 bg-white rounded-full transition-all"
                                        style={{ height: `${h}%` }}
                                    />
                                ))}
                            </div>

                            {/* Active Instagram-Style Selection Box */}
                            <div
                                className="absolute top-0 bottom-0 rounded-xl p-[2px] bg-gradient-to-r from-cyan-400 via-sky-500 to-purple-600 shadow-xl shadow-cyan-500/25 cursor-grab active:cursor-grabbing z-20"
                                style={{
                                    left: `${leftPercent}%`,
                                    width: `${widthPercent}%`,
                                }}
                                onMouseDown={(e) => startDrag('box', e.clientX)}
                                onTouchStart={(e) => startDrag('box', e.touches[0].clientX)}
                            >
                                {/* Inner illuminated window */}
                                <div className="w-full h-full bg-neutral-950/85 rounded-[10px] relative overflow-hidden flex items-center justify-center">
                                    {/* Active Highlighted Ticks Inside Selection */}
                                    <div className="absolute inset-0 flex items-center justify-between px-1 pointer-events-none opacity-80">
                                        {waveformBars.slice(0, 16).map((h, i) => (
                                            <div
                                                key={`fg-tick-${i}`}
                                                className="w-1 bg-gradient-to-t from-cyan-400 to-purple-400 rounded-full"
                                                style={{ height: `${Math.max(25, h)}%` }}
                                            />
                                        ))}
                                    </div>

                                    {/* Center Duration Grip Pill */}
                                    <div className="z-10 flex items-center gap-1 pointer-events-none bg-black/80 px-2 py-0.5 rounded-full border border-white/10 shadow">
                                        <span className="text-[11px] font-mono font-bold text-white tracking-wider">
                                            {Math.round(clipDuration)}s
                                        </span>
                                    </div>
                                </div>

                                {/* Left Resize Handle */}
                                <div
                                    className="absolute left-0 top-0 bottom-0 w-8 -ml-4 z-30 cursor-ew-resize flex items-center justify-center group touch-none"
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        startDrag('left', e.clientX);
                                    }}
                                    onTouchStart={(e) => {
                                        e.stopPropagation();
                                        startDrag('left', e.touches[0].clientX);
                                    }}
                                >
                                    <div className="w-2.5 h-8 bg-gradient-to-b from-cyan-300 to-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.7)] group-hover:scale-110 group-active:scale-95 transition-transform flex items-center justify-center gap-[1px]">
                                        <div className="w-[1.5px] h-3 bg-white/80 rounded-full"></div>
                                    </div>
                                </div>

                                {/* Right Resize Handle */}
                                <div
                                    className="absolute right-0 top-0 bottom-0 w-8 -mr-4 z-30 cursor-ew-resize flex items-center justify-center group touch-none"
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        startDrag('right', e.clientX);
                                    }}
                                    onTouchStart={(e) => {
                                        e.stopPropagation();
                                        startDrag('right', e.touches[0].clientX);
                                    }}
                                >
                                    <div className="w-2.5 h-8 bg-gradient-to-b from-purple-300 to-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.7)] group-hover:scale-110 group-active:scale-95 transition-transform flex items-center justify-center gap-[1px]">
                                        <div className="w-[1.5px] h-3 bg-white/80 rounded-full"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Playhead Indicator (when visible in current window) */}
                            {isPlayheadVisible && (
                                <div
                                    className="absolute top-0 bottom-0 w-[2px] bg-white z-30 pointer-events-none shadow-[0_0_8px_white]"
                                    style={{ left: `${playheadPercent}%` }}
                                >
                                    <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white rounded-full"></div>
                                </div>
                            )}
                        </div>

                        {/* Bottom Actions Row: Presets, Fine-tune & Preview */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/50">
                            {/* Quick Presets */}
                            <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-muted-foreground font-medium">
                                    {t('components.clipEditor.presets', 'Raccourcis :')}
                                </span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSetPreset(15)}
                                    className="h-7 px-2.5 text-xs rounded-md"
                                >
                                    15s
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSetPreset(30)}
                                    className="h-7 px-2.5 text-xs rounded-md"
                                >
                                    30s
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSetPreset(45)}
                                    className="h-7 px-2.5 text-xs rounded-md"
                                >
                                    45s
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSetPreset(60)}
                                    className="h-7 px-2.5 text-xs rounded-md border-cyan-500/40 text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 font-semibold"
                                >
                                    {t('components.clipEditor.max60s', 'Max 60s')}
                                </Button>
                            </div>

                            {/* Micro-nudgers & Preview Loop Button */}
                            <div className="flex items-center gap-1.5">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleNudge(-1)}
                                    title="Reculer de 1s"
                                    className="h-7 px-2 text-xs"
                                >
                                    -1s
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleNudge(1)}
                                    title="Avancer de 1s"
                                    className="h-7 px-2 text-xs"
                                >
                                    +1s
                                </Button>
                                <Button
                                    type="button"
                                    variant="default"
                                    size="sm"
                                    onClick={handleTogglePreview}
                                    className="h-7 px-3 text-xs gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium shadow-md shadow-cyan-500/20"
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
                            <Label htmlFor="clip-title">{t('components.clipEditor.titleLabel')} *</Label>
                            <Input
                                id="clip-title"
                                placeholder={t('components.clipEditor.titlePlaceholder')}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="clip-description">{t('components.clipEditor.descriptionLabel')}</Label>
                            <Textarea
                                id="clip-description"
                                placeholder={t('components.clipEditor.descriptionPlaceholder')}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={loading}
                                rows={2}
                            />
                        </div>
                    </div>

                    {/* Processing Progress */}
                    {loading && (
                        <div className="space-y-2">
                            <div className="flex items-center text-sm">
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
                        <Alert className="border-green-500 bg-green-50">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-600">
                                {t('components.clipEditor.success')}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 justify-end pt-2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            {t('components.clipEditor.cancel')}
                        </Button>
                        <Button
                            onClick={handleCreateClip}
                            disabled={loading || !title.trim()}
                            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md"
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
                </div>
            </DialogContent>
        </Dialog>
    );
}
