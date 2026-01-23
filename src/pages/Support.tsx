import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Send,
  HelpCircle,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { supportService } from "@/lib/api";
import { ImageUpload } from "@/components/support/ImageUpload";

interface SupportMessage {
  id: number;
  subject: string;
  message: string;
  priority: string;
  status: "pending" | "in_progress" | "resolved" | "closed";
  created_at: string;
  admin_response?: string;
  admin_name?: string;
}

const priorities = [
  { value: "low", label: "Basse" },
  { value: "medium", label: "Moyenne" },
  { value: "high", label: "Haute" },
];

const Support = () => {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState("medium");
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await supportService.getMyMessages();
      setMessages(response.data.messages || []);
    } catch (error: any) {
      console.error('Failed to load messages:', error);
      if (error.response?.status !== 401) {
        toast.error('Impossible de charger les messages');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject || !message) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('subject', subject);
      formData.append('message', message);
      formData.append('priority', priority);

      // Add images if any
      images.forEach((image, index) => {
        formData.append(`images`, image);
      });

      await supportService.createMessage(formData);

      toast.success("Message envoyé avec succès !");

      // Reset form
      setSubject("");
      setMessage("");
      setPriority("medium");
      setImages([]);

      // Reload messages
      setTimeout(() => {
        loadMessages();
      }, 1000);

    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast.error(error.response?.data?.error || "Erreur lors de l'envoi du message");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: SupportMessage["status"]) => {
    switch (status) {
      case "pending":
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500">
            <Clock className="h-3 w-3" />
            En attente
          </span>
        );
      case "in_progress":
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
            <AlertCircle className="h-3 w-3" />
            En cours
          </span>
        );
      case "resolved":
      case "closed":
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-neon-green/10 text-neon-green">
            <CheckCircle className="h-3 w-3" />
            Résolu
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar credits={user?.credits_balance || user?.credits || 0} />

      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl lg:text-4xl font-bold font-orbitron mb-2">
              <span className="gradient-text">Support</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Besoin d'aide ? Contactez notre équipe
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl bg-card border border-border/50"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Nouveau message</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Sujet *</Label>
                  <Input
                    id="subject"
                    placeholder="Résumez votre demande"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="bg-background/50 border-border/50"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priorité</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Décrivez votre problème ou question en détail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="bg-background/50 border-border/50 min-h-[150px] resize-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Images (optionnel)</Label>
                  <ImageUpload
                    onImagesChange={setImages}
                    maxFiles={3}
                    maxSizeMB={5}
                  />
                </div>

                <Button
                  type="submit"
                  variant="neon"
                  className="w-full gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Envoyer le message
                    </>
                  )}
                </Button>
              </form>
            </motion.div>

            {/* Previous Messages */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-2xl bg-card border border-border/50"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <HelpCircle className="h-5 w-5 text-accent" />
                </div>
                <h2 className="text-xl font-semibold">Mes demandes</h2>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : messages.length > 0 ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-background/50 border border-border/30 hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium">{msg.subject}</h3>
                        {getStatusBadge(msg.status)}
                      </div>

                      <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">
                        {msg.message}
                      </p>

                      {msg.admin_response && (
                        <div className="mt-3 p-3 rounded-lg bg-primary/5 border-l-4 border-primary">
                          <p className="text-sm font-medium text-primary mb-1">
                            Réponse du support :
                          </p>
                          <p className="text-sm whitespace-pre-wrap">
                            {msg.admin_response}
                          </p>
                          {msg.admin_name && (
                            <p className="text-xs text-muted-foreground mt-2">
                              - {msg.admin_name}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                        <span className="capitalize">{priority}</span>
                        <span>•</span>
                        <span>
                          {new Date(msg.created_at).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">Aucune demande précédente</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Support;

