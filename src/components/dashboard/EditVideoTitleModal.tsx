import { useState, useEffect } from 'react';
import { videoService } from '@/lib/api';
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
            setError('Le titre est requis');
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

            toast.success('Vidéo mise à jour avec succès');

            if (onSuccess) {
                onSuccess();
            }

            handleClose();
        } catch (err: any) {
            console.error('Erreur mise à jour vidéo:', err);
            const errorMsg = err.response?.data?.error || 'Erreur lors de la mise à jour';
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
                        Modifier la vidéo
                    </DialogTitle>
                    <DialogDescription>
                        Modifiez le titre et la description de votre vidéo
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
                            Titre <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Titre de la vidéo"
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
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description optionnelle de la vidéo..."
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
                            Annuler
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
                                    <span>Enregistrement...</span>
                                </>
                            ) : (
                                <>
                                    <Edit2 className="h-4 w-4" />
                                    <span>Enregistrer</span>
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
