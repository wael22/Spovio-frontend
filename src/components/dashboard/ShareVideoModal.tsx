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
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareVideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoTitle: string;
}

export function ShareVideoModal({
  open,
  onOpenChange,
  videoTitle,
}: ShareVideoModalProps) {
  const { toast } = useToast();
  const [emails, setEmails] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleShare = async () => {
    if (!emails.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer au moins un email.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate sharing
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Vidéo partagée",
        description: "Les destinataires recevront un email avec le lien de la vidéo.",
      });
      setEmails("");
      setMessage("");
      onOpenChange(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Send className="h-5 w-5 text-primary" />
            </div>
            Partager la vidéo
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Partagez "{videoTitle}" avec d'autres joueurs. Vous pouvez entrer plusieurs emails séparés par des virgules.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-5 pt-4"
        >
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="emails" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email(s) des destinataires *
            </Label>
            <Input
              id="emails"
              placeholder="email1@exemple.com, email2@exemple.com"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              className="bg-card/50"
            />
            <p className="text-xs text-muted-foreground">
              Séparez plusieurs emails par des virgules (,) ou points-virgules (;)
            </p>
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              Message (optionnel)
            </Label>
            <Textarea
              id="message"
              placeholder="Ajouter un message personnel..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-card/50 min-h-[100px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/500 caractères
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button
              variant="neon"
              onClick={handleShare}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Partager
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
