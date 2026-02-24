import { useState, useEffect } from 'react';
import { videoService } from '@/lib/api';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Edit2, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface EditVideoTitleModalProps {
    isOpen: boolean;
    onClose: () => void;
    video: {
        id: string;
        title?: string;
        description?: string;
    } | null;
    onSuccess?: () => void;
}

export function EditVideoTitleModal({
    isOpen,
    onClose,
    video,
    onSuccess
}: EditVideoTitleModalProps) {
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (video) {
            setTitle(video.title || '');
            setDescription(video.description || '');
            setError('');
        }
    }, [video]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            setError(t('modals.editVideo.titleRequired'));
            return;
        }

        if (!video) return;

        setIsLoading(true);
        setError('');

        try {
            await videoService.updateVideo(video.id, {
                title: title.trim(),
                description: description.trim()
            });

            toast.success(t('modals.editVideo.success'));

            if (onSuccess) {
                onSuccess();
            }

            handleClose();
        } catch (err: any) {
            console.error('Erreur mise à jour vidéo:', err);
            const errorMsg = err.response?.data?.error || t('modals.editVideo.error');
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setTitle('');
            setDescription('');
            setError('');
            onClose();
        }
    };

    if (!video) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Edit2 className="h-5 w-5 text-primary" />
                        {t('modals.editVideo.title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('modals.editVideo.description')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Titre */}
                    <div className="space-y-2">
                        <Label htmlFor="title">
                            {t('modals.editVideo.titleLabel')} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t('modals.editVideo.titlePlaceholder')}
                            maxLength={200}
                            required
                            disabled={isLoading}
                            className="bg-background/50 border-border/50 focus:border-primary/50"
                        />
                        <p className="text-xs text-muted-foreground">
                            {title.length}/200 caractères
                        </p>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">{t('modals.editVideo.descriptionLabel')}</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('modals.editVideo.descriptionPlaceholder')}
                            rows={3}
                            maxLength={500}
                            disabled={isLoading}
                            className="bg-background/50 border-border/50 focus:border-primary/50"
                        />
                        <p className="text-xs text-muted-foreground">
                            {description.length}/500 caractères
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            {t('modals.common.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || !title.trim()}
                            variant="neon"
                            className="gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>{t('modals.editVideo.saving')}</span>
                                </>
                            ) : (
                                <>
                                    <Edit2 className="h-4 w-4" />
                                    <span>{t('modals.editVideo.save')}</span>
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
