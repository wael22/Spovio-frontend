/**
 * Video Clip Editor Component
 * Allows users to create clips from videos using FFmpeg.wasm client-side processing
 */

import { useState, useRef, useEffect, useCallback } from 'react';
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
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Scissors, Play, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { clipService } from '@/lib/api';
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
    } | null;
    onClipCreated?: (clip: any) => void;
}

type ProcessingStep = 'upload' | '';

export function VideoClipEditor({ isOpen, onClose, video, onClipCreated }: VideoClipEditorProps) {
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

    // Selection states
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(30);

    // Clip metadata
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

    // Callback ref for video element
    const videoCallbackRef = useCallback((node: HTMLVideoElement | null) => {
        if (node) {
            videoRef.current = node;
            setVideoElement(node);
            console.log('[VideoClipEditor] Video element mounted');
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

        const videoUrl = video.file_url || '';
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
            const hls = new Hls({ enableWorker: true });
            hls.loadSource(videoUrl);
            hls.attachMedia(videoElement);
            hlsRef.current = hls;

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log('[ClipEditor] HLS Ready');
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    console.error('[ClipEditor] HLS error:', data);
                    setError('Erreur de lecture vidéo');
                }
            });
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
            const videoDuration = videoRef.current.duration;
            setDuration(videoDuration);
            setEndTime(Math.min(30, videoDuration));
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const time = videoRef.current.currentTime;
            setCurrentTime(time);

            // Auto-pause when reaching endTime during preview
            if (isPreviewing && time >= endTime) {
                videoRef.current.pause();
                setIsPlaying(false);
                setIsPreviewing(false);
            }
        }
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    /**
     * Preview the selected segment
     */
    const handlePreviewSelection = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = startTime;
            videoRef.current.play();
            setIsPreviewing(true);
            setIsPlaying(true);
        }
    };

    /**
     * Navigate to start of selection
     */
    const goToStart = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = startTime;
            setIsPreviewing(false);
        }
    };

    /**
     * Navigate to end of selection
     */
    const goToEnd = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = endTime;
            setIsPreviewing(false);
        }
    };

    /**
     * Create clip by sending request to backend (Server-Side Processing)
     * This ensures high quality output (Original Resolution) instead of low-quality client recording
     */
    const handleCreateClip = async () => {
        // Validation
        if (!title.trim()) {
            setError(t('components.clipEditor.errors.titleRequired'));
            return;
        }

        if (endTime - startTime < 1) {
            setError(t('components.clipEditor.errors.minDuration'));
            return;
        }

        if (endTime - startTime > 60) {
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
            setProcessingStep('upload'); // Reuse existing step for UI
            toast.info(t('components.clipEditor.processing'));

            // Server-side creation
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

            // Fermer immédiatement pour ne pas bloquer l'utilisateur
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
            <DialogContent className="sm:max-w-3xl md:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Scissors className="h-5 w-5" />
                        {t('components.clipEditor.title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('components.clipEditor.subtitle')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Video Player */}
                    <div className="space-y-2">
                        <Label>{t('components.clipEditor.videoLabel')}</Label>
                        <div className="relative bg-black rounded-lg overflow-hidden">
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

                            {/* Visual selection indicator */}
                            {duration > 0 && (
                                <div className="absolute bottom-16 left-2 right-2 h-1 bg-white/20 rounded-full overflow-hidden">
                                    {/* Full timeline background */}
                                    <div className="absolute inset-0" />

                                    {/* Selected region highlight */}
                                    <div
                                        className="absolute h-full bg-blue-500/60"
                                        style={{
                                            left: `${(startTime / duration) * 100}%`,
                                            width: `${((endTime - startTime) / duration) * 100}%`
                                        }}
                                    />

                                    {/* Start marker */}
                                    <div
                                        className="absolute top-0 bottom-0 w-0.5 bg-green-500"
                                        style={{ left: `${(startTime / duration) * 100}%` }}
                                    >
                                        <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-green-500" />
                                    </div>

                                    {/* End marker */}
                                    <div
                                        className="absolute top-0 bottom-0 w-0.5 bg-red-500"
                                        style={{ left: `${(endTime / duration) * 100}%` }}
                                    >
                                        <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-red-500" />
                                    </div>

                                    {/* Current time indicator */}
                                    <div
                                        className="absolute top-0 bottom-0 w-0.5 bg-white"
                                        style={{ left: `${(currentTime / duration) * 100}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Time Selection */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>{t('components.clipEditor.selection')} ({formatTime(endTime - startTime)})</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                    {formatTime(startTime)} - {formatTime(endTime)}
                                </span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePreviewSelection}
                                    disabled={loading || endTime - startTime < 1}
                                    className="gap-1.5"
                                >
                                    <Play className="h-3.5 w-3.5" />
                                    {t('components.clipEditor.preview')}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm">{t('components.clipEditor.startTime') || "Début"}</Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={goToStart}
                                    className="h-6 px-2 text-xs"
                                >
                                    {t('components.clipEditor.goToStart')}
                                </Button>
                            </div>
                            <Slider
                                value={[startTime]}
                                onValueChange={(value) => setStartTime(Math.min(value[0], endTime - 1))}
                                max={duration}
                                step={0.1}
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm">{t('components.clipEditor.endTime') || "Fin"}</Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={goToEnd}
                                    className="h-6 px-2 text-xs"
                                >
                                    {t('components.clipEditor.goToEnd')}
                                </Button>
                            </div>
                            <Slider
                                value={[endTime]}
                                onValueChange={(value) => setEndTime(Math.max(value[0], startTime + 1))}
                                max={duration}
                                step={0.1}
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Metadata */}
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
                                rows={3}
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
                    <div className="flex gap-3 justify-end">
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
                            className="gap-2"
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
