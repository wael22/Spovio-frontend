import { useState } from "react";
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
  Music
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Generate real share link using backend URL or CDN MP4 if available
  // Using 480p instead of 720p as it's more universally available across all video sizes
  const shareLink = bunnyVideoId
    ? `https://vz-9b857324-07d.b-cdn.net/${bunnyVideoId}/play_480p.mp4`
    : `${window.location.protocol}//${window.location.host}/clip/${clipId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast({
        title: "Lien copié",
        description: "Le lien direct MP4 a été copié.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien.",
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
          title: "Partage TikTok",
          description: "Copiez le lien MP4 pour le poster sur TikTok.",
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
          title: "Partage Instagram",
          description: "Copiez le lien MP4 pour le poster sur Instagram.",
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
            Partager le clip
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Partagez "{clipTitle}" sur vos réseaux sociaux ou copiez le lien.
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
            <Label className="text-sm font-medium">Partager sur les réseaux</Label>
            <div className="grid grid-cols-3 gap-3">
              {socialPlatforms.map((platform) => (
                <motion.button
                  key={platform.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleShareSocial(platform.name)}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl ${platform.color} ${platform.hoverColor} text-white transition-all`}
                >
                  <platform.icon className="h-6 w-6" />
                  <span className="text-xs font-medium">{platform.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Copy Link */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Link2 className="h-4 w-4 text-muted-foreground" />
              Ou copier le lien
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
              Fermer
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
