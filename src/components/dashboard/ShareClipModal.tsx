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
import {
  Share2,
  Copy,
  Check,
  Facebook,
  Instagram,
  Link2,
  Music,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface ShareClipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clipId: number;
  clipTitle: string;
  bunnyVideoId?: string; // Added optional bunnyVideoId
}

const socialPlatforms = [
  { name: "TikTok", icon: Music, color: "bg-black", hoverColor: "hover:bg-gray-900" },
  { name: "Facebook", icon: Facebook, color: "bg-[#4267B2]", hoverColor: "hover:bg-[#375695]" },
  { name: "Instagram", icon: Instagram, color: "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737]", hoverColor: "" },
];

export function ShareClipModal({
  open,
  onOpenChange,
  clipId,
  clipTitle,
  bunnyVideoId,
}: ShareClipModalProps) {

  const { t } = useTranslation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resolutions, setResolutions] = useState<string[]>([]);
  const [selectedResolution, setSelectedResolution] = useState<string>("720p");

  // Fetch available resolutions when modal opens
  useEffect(() => {
    if (open && bunnyVideoId) {
      const fetchResolutions = async () => {
        setLoading(true);
        try {
          const { getAvailableResolutions } = await import('@/lib/bunnyVideoHelper');
          const available = await getAvailableResolutions(bunnyVideoId);

          if (available.length > 0) {
            setResolutions(available);
            // Select best resolution by default (first one usually, or 720p if available)
            if (available.includes('720p')) {
              setSelectedResolution('720p');
            } else {
              setSelectedResolution(available[0]);
            }
          } else {
            // Fallback if check fails
            setResolutions(['720p']);
          }
        } catch (error) {
          console.error("Failed to check resolutions", error);
          setResolutions(['720p']);
        } finally {
          setLoading(false);
        }
      };

      fetchResolutions();
    }
  }, [open, bunnyVideoId]);

  // Generate real share link using selected resolution
  const shareLink = bunnyVideoId
    ? `https://vz-9b857324-07d.b-cdn.net/${bunnyVideoId}/play_${selectedResolution}.mp4`
    : `${window.location.protocol}//${window.location.host}/clip/${clipId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast({
        title: t('modals.shareClip.linkCopied'),
        description: t('modals.shareClip.linkCopiedDesc'),
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: t('modals.common.error'),
        description: t('modals.shareClip.copyError'),
        variant: "destructive",
      });
    }
  };

  const handleShareSocial = (platform: string) => {
    let url = "";

    switch (platform) {
      case "TikTok":
        // TikTok doesn't handle web links well, suggest copy
        toast({
          title: t('modals.shareClip.tiktokShare'),
          description: t('modals.shareClip.tiktokShareDesc'),
        });
        handleCopyLink();
        return;
      case "Facebook":
        // Use Facebook Sharer with the MP4 URL
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`;
        break;
      case "Instagram":
        // Instagram doesn't handle web links, suggest copy
        toast({
          title: t('modals.shareClip.instagramShare'),
          description: t('modals.shareClip.instagramShareDesc'),
        });
        handleCopyLink();
        return;
    }

    if (url) {
      window.open(url, "_blank", "width=600,height=400");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Share2 className="h-5 w-5 text-accent" />
            </div>
            {t('modals.shareClip.title')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t('modals.shareClip.description', { title: clipTitle })}
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6 pt-4"
        >
          {/* Social Buttons */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('modals.shareClip.socialLabel')}</Label>
            <div className="grid grid-cols-3 gap-3">
              {socialPlatforms.map((platform) => (
                <motion.button
                  key={platform.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleShareSocial(platform.name)}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl ${platform.color} ${platform.hoverColor} text-white transition-all`}
                  disabled={loading}
                >
                  <platform.icon className="h-6 w-6" />
                  <span className="text-xs font-medium">{platform.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Resolution Selection */}
          {bunnyVideoId && (
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center justify-between">
                <span>{t('modals.shareClip.qualityLabel')}</span>
                {loading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
              </Label>
              <div className="flex flex-wrap gap-2">
                {resolutions.length > 0 ? (
                  resolutions.map((res) => (
                    <Button
                      key={res}
                      variant={selectedResolution === res ? "neonGreen" : "outline"}
                      size="sm"
                      onClick={() => setSelectedResolution(res)}
                      className="text-xs h-8"
                    >
                      {res}
                    </Button>
                  ))
                ) : (
                  !loading && <span className="text-xs text-muted-foreground">{t('modals.shareClip.noResolution')}</span>
                )}
              </div>
            </div>
          )}

          {/* Copy Link */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Link2 className="h-4 w-4 text-muted-foreground" />
              {t('modals.shareClip.copyLabel')}
            </Label>
            <div className="flex gap-2">
              <Input
                value={shareLink}
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

          {/* Close */}
          <div className="flex justify-end pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {t('modals.shareClip.close')}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
