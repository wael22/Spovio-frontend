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
import { Scissors, Play, Pause, Loader2, CheckCircle2, Download, Upload, AlertCircle } from 'lucide-react';
import { ffmpegService } from '@/services/ffmpegService';
import { clipService } from '@/lib/api';
import { toast } from 'sonner';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

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

type ProcessingStep = 'ffmpeg-load' | 'download' | 'cut' | 'upload' | '';

export function VideoClipEditor({ isOpen, onClose, video, onClipCreated }: VideoClipEditorProps) {
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
            setCurrentTime(videoRef.current.currentTime);
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
     * Download video segment using MediaRecorder
     */
    const downloadVideoSegment = async (videoUrl: string, start: number, end: number): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const tempVideo = document.createElement('video');
            tempVideo.crossOrigin = 'anonymous';
            tempVideo.src = videoUrl;

            const chunks: Blob[] = [];
            let mediaRecorder: MediaRecorder;

            tempVideo.onloadedmetadata = () => {
                tempVideo.currentTime = start;
            };

            tempVideo.onseeked = () => {
                const stream = tempVideo.captureStream();
                mediaRecorder = new MediaRecorder(stream, {
                    mimeType: 'video/webm;codecs=vp8,opus'
                });

                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        chunks.push(e.data);
                    }
                };

                mediaRecorder.onstop = () => {
                    const blob = new Blob(chunks, { type: 'video/webm' });
                    resolve(blob);
                };

                mediaRecorder.start();
                tempVideo.play();

                setTimeout(() => {
                    mediaRecorder.stop();
                    tempVideo.pause();
                }, (end - start) * 1000);
            };

            tempVideo.onerror = () => reject(new Error('Video download failed'));
        });
    };

    /**
     * Create clip with FFmpeg.wasm processing
     */
    const handleCreateClip = async () => {
        // Validation
        if (!title.trim()) {
            setError('Veuillez entrer un titre');
            return;
        }

        if (endTime - startTime < 1) {
            setError('Le clip doit durer au moins 1 seconde');
            return;
        }

        if (endTime - startTime > 60) {
            setError('Le clip ne peut pas durer plus de 60 secondes');
            return;
        }

        if (!video) {
            setError('Aucune vidéo sélectionnée');
            return;
        }

        setLoading(true);
        setError('');
        setProgress(0);

        try {
            // Step 1: Load FFmpeg
            setProcessingStep('ffmpeg-load');
            if (!ffmpegService.isLoaded()) {
                toast.info('Chargement de FFmpeg...');
                await ffmpegService.load((p) => setProgress(p * 25));
            } else {
                setProgress(25);
            }

            // Step 2: Download video segment
            setProcessingStep('download');
            setProgress(30);
            toast.info('Téléchargement du segment vidéo...');

            const videoUrl = video.file_url || '';
            const videoBlob = await downloadVideoSegment(videoUrl, startTime, endTime);
            setProgress(50);

            // Step 3: Cut with FFmpeg
            setProcessingStep('cut');
            toast.info('Découpage avec FFmpeg...');
            const clipBlob = await ffmpegService.cutVideo(
                videoBlob,
                0, // Start from 0 since we already downloaded the segment
                endTime - startTime,
                (p) => setProgress(50 + p * 25)
            );
            setProgress(75);

            // Step 4: Upload to backend
            setProcessingStep('upload');
            toast.info('Upload vers le serveur...');
            const formData = new FormData();
            formData.append('file', clipBlob, `clip_${Date.now()}.mp4`);
            formData.append('video_id', video.id);
            formData.append('title', title.trim());
            formData.append('description', description.trim());
            formData.append('start_time', startTime.toString());
            formData.append('end_time', endTime.toString());

            const response = await clipService.uploadDirectClip(formData);

            setProgress(100);
            setSuccess(true);
            toast.success('Clip créé avec succès !');

            if (onClipCreated) {
                onClipCreated(response.data.clip);
            }

            setTimeout(() => {
                onClose();
                setSuccess(false);
                setTitle('');
                setDescription('');
                setProcessingStep('');
            }, 2000);

        } catch (err: any) {
            console.error('[Clip] Creation error:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Erreur lors de la création du clip';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getStepLabel = (): string => {
        switch (processingStep) {
            case 'ffmpeg-load': return 'Chargement FFmpeg...';
            case 'download': return 'Téléchargement vidéo...';
            case 'cut': return 'Découpage...';
            case 'upload': return 'Upload...';
            default: return 'Traitement...';
        }
    };

    const getStepIcon = () => {
        switch (processingStep) {
            case 'ffmpeg-load': return <Download className="h-4 w-4 mr-2" />;
            case 'download': return <Download className="h-4 w-4 mr-2" />;
            case 'cut': return <Scissors className="h-4 w-4 mr-2" />;
            case 'upload': return <Upload className="h-4 w-4 mr-2" />;
            default: return <Loader2 className="h-4 w-4 mr-2 animate-spin" />;
        }
    };

    if (!video) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Scissors className="h-5 w-5" />
                        Créer un Clip
                    </DialogTitle>
                    <DialogDescription>
                        Sélectionnez un segment et créez votre meilleur moment
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Video Player */}
                    <div className="space-y-2">
                        <Label>Vidéo</Label>
                        <div className="relative bg-black rounded-lg overflow-hidden">
                            <video
                                ref={videoCallbackRef}
                                className="w-full aspect-video"
                                controls
                                playsInline
                                onLoadedMetadata={handleVideoLoaded}
                                onTimeUpdate={handleTimeUpdate}
                            >
                                Votre navigateur ne supporte pas la lecture vidéo.
                            </video>
                        </div>
                    </div>

                    {/* Time Selection */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Sélection ({formatTime(endTime - startTime)})</Label>
                            <span className="text-sm text-muted-foreground">
                                {formatTime(startTime)} - {formatTime(endTime)}
                            </span>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm">Début</Label>
                            <Slider
                                value={[startTime]}
                                onValueChange={(value) => setStartTime(Math.min(value[0], endTime - 1))}
                                max={duration}
                                step={0.1}
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm">Fin</Label>
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
                            <Label htmlFor="clip-title">Titre *</Label>
                            <Input
                                id="clip-title"
                                placeholder="Mon meilleur point"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="clip-description">Description</Label>
                            <Textarea
                                id="clip-description"
                                placeholder="Description optionnelle..."
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
                                Clip créé avec succès !
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
                            Annuler
                        </Button>
                        <Button
                            onClick={handleCreateClip}
                            disabled={loading || !title.trim()}
                            className="gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Traitement...
                                </>
                            ) : (
                                <>
                                    <Scissors className="h-4 w-4" />
                                    Créer le Clip
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
