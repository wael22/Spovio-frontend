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
  clipId: number;  // Changed from clipTitle to clipId
  clipTitle: string;
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
}: ShareClipModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Generate real share link using backend URL
  const shareLink = `${window.location.protocol}//${window.location.host}/clip/${clipId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast({
        title: "Lien copié",
        description: "Le lien a été copié dans le presse-papiers.",
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
    const text = `Regardez mon clip "${clipTitle}" sur MySmash !`;

    switch (platform) {
      case "TikTok":
        // TikTok doesn't have a direct share URL, show toast instead
        toast({
          title: "Partage TikTok",
          description: "Copiez le lien et partagez-le sur TikTok.",
        });
        handleCopyLink();
        return;
      case "Facebook":
        // Open the clip page directly, Facebook will auto-preview with Open Graph
        url = shareLink;
        break;
      case "Instagram":
        // Instagram doesn't have a direct share URL, show toast instead
        toast({
          title: "Partage Instagram",
          description: "Copiez le lien et partagez-le sur Instagram.",
        });
        handleCopyLink();
        return;
    }

    if (url) {
      window.open(url, "_blank", "width=600,height=400");
    }

    toast({
      title: `Partage sur ${platform}`,
      description: "Une nouvelle fenêtre s'est ouverte pour partager votre clip.",
    });
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
