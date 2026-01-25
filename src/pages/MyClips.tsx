import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { clipService } from "@/lib/api";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { ClipCard } from "@/components/dashboard/ClipCard";
import { ShareClipModal } from "@/components/dashboard/ShareClipModal";
import { VideoPlayerModal } from "@/components/dashboard/VideoPlayerModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Scissors,
  Search,
  Filter,
  Plus,
  Video,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

const MyClips = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [selectedClip, setSelectedClip] = useState<{ id: number; title: string; file_url?: string; bunny_video_id?: string } | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{ id: string; title: string; file_url?: string } | null>(null);
  const [clips, setClips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load clips from API
  useEffect(() => {
    const loadClips = async () => {
      try {
        const response = await clipService.getMyClips();
        setClips(response.data.clips || []);
      } catch (error: any) {
        console.error('Failed to load clips:', error);
        if (error.response?.status !== 401) {
          toast.error('Impossible de charger les clips');
        }
      } finally {
        setLoading(false);
      }
    };

    loadClips();
  }, []);

  const handleDeleteClip = async (clipId: string) => {
    if (!confirm('ÃŠtes-vous sÃ»r de vouloir supprimer ce clip ?')) {
      return;
    }

    try {
      await clipService.deleteClip(clipId);
      setClips(clips.filter(c => c.id !== clipId));
      toast.success('Clip supprimé avec succès');
    } catch (error) {
      console.error('Failed to delete clip:', error);
      toast.error('Erreur lors de la suppression du clip');
    }
  };

  const filteredClips = clips.filter((clip) =>
    clip.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleShareClip = (clip: { id: number; title: string; bunny_video_id?: string }) => {
    setSelectedClip(clip);
    setIsShareModalOpen(true);
  };

  const handlePlayClip = (clip: any) => {
    setSelectedVideo({
      id: clip.id,
      title: clip.title,
      file_url: clip.file_url
    });
    setIsPlayerModalOpen(true);
  };

  const handleDownloadClip = async (clip: any) => {
    // Check if clip  is ready
    if (clip.status !== 'completed') {
      toast.error('Ce clip n\'est pas encore prêt pour téléchargement');
      return;
    }

    // Check if clip has bunny_video_id (required for MP4 download)
    if (!clip.bunny_video_id) {
      toast.error('Ce clip n\'a pas été uploadé sur Bunny Stream');
      return;
    }

    try {
      // Build direct MP4 URL from bunny_video_id
      const bunnyHostname = 'vz-cc4565cd-4e9.b-cdn.net';
      const finalUrl = `https://${bunnyHostname}/${clip.bunny_video_id}/play_720p.mp4`;

      toast.loading('Téléchargement en cours...', { id: 'download-toast' });

      // Fetch the file as a blob to force download
      const response = await fetch(finalUrl);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `${clip.title || 'clip'}.mp4`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast.dismiss('download-toast');
      toast.success('Téléchargement terminé !');
    } catch (error) {
      console.error('Download error:', error);
      toast.dismiss('download-toast');

      // Fallback: If fetch fails (e.g. CORS), open in new tab
      const bunnyHostname = 'vz-cc4565cd-4e9.b-cdn.net';
      const finalUrl = `https://${bunnyHostname}/${clip.bunny_video_id}/play_720p.mp4`;
      window.open(finalUrl, '_blank');
      toast.error('Téléchargement direct échoué, ouverture du lien...');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Chargement des clips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar credits={user?.credits_balance || user?.credits || 0} />

      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-accent/10">
                <Scissors className="h-6 w-6 text-accent" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold font-orbitron">
                Mes <span className="gradient-text-accent">Clips</span>
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Tes meilleurs moments en un clic
            </p>
          </motion.div>

          {/* Search & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un clip..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card/50 border-border/50 focus:border-primary/50"
                />
              </div>
              <Button variant="ghost" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="neonGreen"
              className="gap-2"
              onClick={() => navigate('/dashboard')}
            >
              <Plus className="h-4 w-4" />
              Créer un clip
            </Button>
          </motion.div>

          {/* Clips Grid */}
          {filteredClips.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredClips.map((clip, index) => (
                <motion.div
                  key={clip.id}
                  variants={itemVariants}
                  custom={index}
                >
                  <ClipCard
                    id={clip.id}
                    title={clip.title || 'Sans titre'}
                    thumbnail={clip.thumbnail_url || 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400'}
                    duration={clip.duration ? `${Math.floor(clip.duration / 60)}:${(clip.duration % 60).toString().padStart(2, '0')}` : '0:00'}
                    date={clip.created_at || new Date().toISOString()}
                    videoTitle={clip.video_title || 'Vidéo'}
                    status={clip.status}
                    onPlay={() => handlePlayClip(clip)}
                    onShare={() => handleShareClip({
                      id: clip.id,
                      title: clip.title,
                      bunny_video_id: clip.bunny_video_id
                    })}
                    onDownload={() => handleDownloadClip(clip)}
                    onDelete={() => handleDeleteClip(clip.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="inline-flex p-4 rounded-full bg-accent/10 mb-4">
                <Scissors className="h-12 w-12 text-accent/50" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Aucun clip trouvé</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? "Aucun clip ne correspond Ã  ta recherche"
                  : "Crée ton premier clip Ã  partir d'une Vidéo"}
              </p>
              <Button
                variant="neonGreen"
                className="gap-2"
                onClick={() => navigate('/dashboard')}
              >
                <Video className="h-4 w-4" />
                Voir mes Vidéos
              </Button>
            </motion.div>
          )}
        </div>
      </main>

      {/* Share Modal */}
      <ShareClipModal
        open={isShareModalOpen}
        onOpenChange={setIsShareModalOpen}
        clipId={selectedClip?.id || 0}
        clipTitle={selectedClip?.title || ""}
        bunnyVideoId={selectedClip?.bunny_video_id}
      />

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={isPlayerModalOpen}
        onClose={() => setIsPlayerModalOpen(false)}
        video={selectedVideo}
      />
    </div>
  );
};

export default MyClips;



