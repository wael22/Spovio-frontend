import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, Send, Loader2, UserMinus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { videoService } from "@/lib/api";
import { useTranslation } from "react-i18next";

interface ShareVideoModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    videoId?: string | number;
    videoTitle: string;
}

export function ShareVideoModal({
    open,
    onOpenChange,
    videoId,
    videoTitle,
}: ShareVideoModalProps) {
    const { t, i18n } = useTranslation();
    const isFrench = i18n.language?.startsWith('fr');
    const { toast } = useToast();
    
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    // Shares list state
    const [currentShares, setCurrentShares] = useState<any[]>([]);
    const [loadingShares, setLoadingShares] = useState(false);

    const loadShares = async () => {
        if (!videoId) return;
        try {
            setLoadingShares(true);
            const response = await videoService.getMySharedVideos();
            const filtered = response.data.shared_videos.filter(
                (sv: any) => String(sv.video_id) === String(videoId)
            );
            setCurrentShares(filtered);
        } catch (error) {
            console.error("Failed to load current shares:", error);
        } finally {
            setLoadingShares(false);
        }
    };

    useEffect(() => {
        if (open && videoId) {
            loadShares();
        }
    }, [open, videoId]);

    const handleShare = async () => {
        if (!email.trim()) {
            toast({
                title: t('modals.common.error'),
                description: t('modals.shareVideo.errors.emailRequired'),
                variant: "destructive",
            });
            return;
        }

        if (!videoId) {
            toast({
                title: t('modals.common.error'),
                description: t('modals.shareVideo.errors.invalidVideoId'),
                variant: "destructive",
            });
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            toast({
                title: t('modals.common.error'),
                description: t('modals.shareVideo.errors.invalidEmail'),
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            await videoService.shareVideoWithUser(
                videoId.toString(),
                email.trim(),
                message.trim()
            );

            toast({
                title: `✅ ${t('modals.common.success')}`,
                description: t('modals.shareVideo.success', { email }),
            });

            setEmail("");
            setMessage("");
            loadShares();
        } catch (error: any) {
            console.error('Failed to share video:', error);

            const errorMessage = error.response?.data?.error ||
                error.message ||
                'Erreur lors du partage';

            toast({
                title: `❌ ${t('modals.common.error')}`,
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveShare = async (shareId: number) => {
        const confirmMsg = isFrench 
            ? "Êtes-vous sûr de vouloir annuler ce partage ? Le destinataire n'aura plus accès à cette vidéo."
            : "Are you sure you want to cancel this share? The recipient will no longer have access to this video.";
            
        if (!window.confirm(confirmMsg)) {
            return;
        }
        
        try {
            await videoService.removeSharedAccess(shareId);
            toast({
                title: `✅ ${t('modals.common.success')}`,
                description: isFrench ? "Le partage a été annulé avec succès." : "Share cancelled successfully.",
            });
            loadShares();
        } catch (error) {
            console.error("Failed to remove share access:", error);
            toast({
                title: `❌ ${t('modals.common.error')}`,
                description: isFrench ? "Impossible d'annuler le partage." : "Could not cancel share.",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="glass border-border/50 sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Send className="h-5 w-5 text-primary" />
                        </div>
                        {t('modals.shareVideo.title')}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {t('modals.shareVideo.description', { title: videoTitle })}
                    </DialogDescription>
                </DialogHeader>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4 pt-2"
                >
                    {/* Email Input */}
                    <div className="space-y-1">
                        <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {t('modals.shareVideo.emailLabel')} *
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder={t('modals.shareVideo.emailPlaceholder')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-card/50 h-9 text-sm"
                            disabled={isLoading}
                        />
                        <p className="text-[11px] text-muted-foreground">
                            {t('modals.shareVideo.helperText')}
                        </p>
                    </div>

                    {/* Message Input */}
                    <div className="space-y-1">
                        <Label htmlFor="message" className="flex items-center gap-2 text-sm font-medium">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            {t('modals.shareVideo.messageLabel')}
                        </Label>
                        <Textarea
                            id="message"
                            placeholder={t('modals.shareVideo.messagePlaceholder')}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="bg-card/50 min-h-[60px] resize-none text-sm py-1.5"
                            maxLength={500}
                            disabled={isLoading}
                        />
                        <p className="text-[10px] text-muted-foreground text-right">
                            {message.length}/500 {isFrench ? "caractères" : "characters"}
                        </p>
                    </div>

                    {/* Share list section */}
                    {loadingShares ? (
                        <div className="flex items-center justify-center py-2">
                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        </div>
                    ) : currentShares.length > 0 ? (
                        <div className="space-y-2 pt-3 border-t border-border/50">
                            <Label className="text-xs font-semibold flex items-center gap-2 text-foreground">
                                <UserMinus className="h-3.5 w-3.5 text-primary" />
                                {isFrench ? "Déjà partagé avec" : "Already shared with"} ({currentShares.length})
                            </Label>
                            <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1 scrollbar-thin">
                                {currentShares.map((sv) => (
                                    <div 
                                        key={sv.id}
                                        className="flex items-center justify-between p-2 rounded-lg bg-card/30 border border-border/30 hover:border-border/60 transition-all text-xs"
                                    >
                                        <div className="space-y-0.5 min-w-0 flex-1">
                                            <div className="font-semibold text-foreground truncate max-w-[220px]">
                                                {sv.shared_with?.name || "Joueur"}
                                            </div>
                                            <div className="text-muted-foreground text-[10px] truncate max-w-[220px]">
                                                {sv.shared_with?.email || ""}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-500/10 rounded-md flex-shrink-0"
                                            onClick={() => handleRemoveShare(sv.id)}
                                            title={isFrench ? "Annuler le partage" : "Cancel share"}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                            className="h-9 text-sm"
                        >
                            {isFrench ? "Fermer" : "Close"}
                        </Button>
                        <Button
                            variant="neon"
                            onClick={handleShare}
                            disabled={isLoading}
                            className="gap-2 h-9 text-sm"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                            {t('modals.shareVideo.send')}
                        </Button>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}
