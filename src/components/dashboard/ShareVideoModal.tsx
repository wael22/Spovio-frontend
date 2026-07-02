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
import { QRCodeSVG } from "qrcode.react";
import { Mail, MessageSquare, Send, Loader2, UserMinus, Trash2, Link2, Copy, Check, QrCode, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { videoService } from "@/lib/api";
import { useTranslation } from "react-i18next";

interface ShareVideoModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    videoId?: string | number;
    videoTitle: string;
}

type ShareTab = "email" | "link";

export function ShareVideoModal({
    open,
    onOpenChange,
    videoId,
    videoTitle,
}: ShareVideoModalProps) {
    const { t, i18n } = useTranslation();
    const isFrench = i18n.language?.startsWith('fr');
    const { toast } = useToast();

    const [activeTab, setActiveTab] = useState<ShareTab>("email");

    // Email share state
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentShares, setCurrentShares] = useState<any[]>([]);
    const [loadingShares, setLoadingShares] = useState(false);

    // Link share state
    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const [loadingLink, setLoadingLink] = useState(false);
    const [copied, setCopied] = useState(false);

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

    const loadShareLink = async () => {
        if (!videoId || shareUrl) return;
        try {
            setLoadingLink(true);
            const response = await videoService.getShareLink(videoId.toString());
            setShareUrl(response.data.share_url);
        } catch (error) {
            console.error("Failed to load share link:", error);
        } finally {
            setLoadingLink(false);
        }
    };

    useEffect(() => {
        if (open && videoId) {
            loadShares();
            if (activeTab === "link") {
                loadShareLink();
            }
        }
    }, [open, videoId, activeTab]);

    useEffect(() => {
        if (open && activeTab === "link" && !shareUrl && videoId) {
            loadShareLink();
        }
    }, [open, activeTab]);

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

    const handleCopyLink = async () => {
        if (!shareUrl) return;
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast({
                title: "✅ Lien copié",
                description: isFrench ? "Le lien de partage a été copié dans le presse-papier." : "Share link copied to clipboard.",
            });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast({
                title: `❌ ${t('modals.common.error')}`,
                description: isFrench ? "Impossible de copier le lien." : "Could not copy link.",
                variant: "destructive",
            });
        }
    };

    const handleNativeShare = async () => {
        if (!shareUrl) return;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: videoTitle,
                    text: isFrench ? `Regarde ma vidéo sur Spovio : ${videoTitle}` : `Check out my video on Spovio: ${videoTitle}`,
                    url: shareUrl,
                });
            } catch {
                // User cancelled
            }
        } else {
            handleCopyLink();
        }
    };

    const tabs: { key: ShareTab; label: string; icon: typeof Mail }[] = [
        { key: "email", label: isFrench ? "Email" : "Email", icon: Mail },
        { key: "link", label: isFrench ? "Lien & QR Code" : "Link & QR Code", icon: QrCode },
    ];

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

                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium transition-all ${
                                    activeTab === tab.key
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {activeTab === "email" ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-4 pt-2"
                    >
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

                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                                className="h-9 text-sm"
                            >
                                {t('modals.shareVideo.close') || (isFrench ? "Fermer" : "Close")}
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
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-4 pt-2"
                    >
                        {loadingLink ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : shareUrl ? (
                            <>
                                {/* QR Code */}
                                <div className="flex justify-center py-2">
                                    <div className="bg-white p-3 rounded-xl">
                                        <QRCodeSVG value={shareUrl} size={180} level="M" />
                                    </div>
                                </div>
                                <p className="text-xs text-center text-muted-foreground">
                                    {isFrench
                                        ? "Scannez ce QR code pour accéder à la vidéo"
                                        : "Scan this QR code to access the video"}
                                </p>

                                {/* Share Link */}
                                <div className="space-y-1">
                                    <Label className="text-sm font-medium flex items-center gap-2">
                                        <Link2 className="h-4 w-4 text-muted-foreground" />
                                        {isFrench ? "Lien de partage" : "Share link"}
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={shareUrl}
                                            readOnly
                                            className="bg-card/50 text-sm"
                                        />
                                        <Button
                                            variant={copied ? "neonGreen" : "neonOutline"}
                                            size="icon"
                                            onClick={handleCopyLink}
                                            className="shrink-0"
                                        >
                                            {copied ? (
                                                <Check className="h-4 w-4" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* Native Share */}
                                {navigator.share && (
                                    <Button
                                        variant="outline"
                                        className="w-full gap-2"
                                        onClick={handleNativeShare}
                                    >
                                        <Share2 className="h-4 w-4" />
                                        {isFrench ? "Partager via..." : "Share via..."}
                                    </Button>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                {isFrench
                                    ? "Impossible de générer le lien de partage"
                                    : "Could not generate share link"}
                            </div>
                        )}

                        <div className="flex justify-end pt-2">
                            <Button variant="ghost" onClick={() => onOpenChange(false)} className="h-9 text-sm">
                                {t('modals.shareVideo.close') || (isFrench ? "Fermer" : "Close")}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </DialogContent>
        </Dialog>
    );
}
