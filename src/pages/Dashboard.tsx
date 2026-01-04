import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { videoService, recordingService } from "@/lib/api";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { StatCardModern } from "@/components/dashboard/StatCardModern";
import { VideoCardModern } from "@/components/dashboard/VideoCardModern";
import { ActiveRecordingBanner } from "@/components/dashboard/ActiveRecordingBanner";
import { StartRecordingModal } from "@/components/dashboard/StartRecordingModal";
import { ShareVideoModal } from "@/components/dashboard/ShareVideoModal";

import { VideoPlayerModal } from "@/components/dashboard/VideoPlayerModal";
import { EditVideoTitleModal } from "@/components/dashboard/EditVideoTitleModal";
import { Button } from "@/components/ui/button";
import {
  Video,
  Scissors,
  CreditCard,
  Share2,
  Play,
  Plus,
  Filter,
  Search,
  QrCode,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
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

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [activeRecording, setActiveRecording] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [clipsCount, setClipsCount] = useState(0);

  // Format duration from seconds to mm:ss
  const formatDuration = (seconds: number | string): string => {
    const numSeconds = typeof seconds === 'string' ? parseFloat(seconds) : seconds;
    if (isNaN(numSeconds)) return '00:00';
    const mins = Math.floor(numSeconds / 60);
    const secs = Math.floor(numSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Fetch user videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await videoService.getMyVideos();
        setVideos(response.data.videos || []);
      } catch (error: any) {
        console.error('Failed to fetch videos:', error);
        if (error.response?.status !== 401) {
          toast.error('Impossible de charger les vidéos');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // Fetch active recording
  useEffect(() => {
    const fetchActiveRecording = async () => {
      try {
        const response = await recordingService.getMyActiveRecording();
        if (response.data.active_recording) {
          setActiveRecording(response.data.active_recording);
        } else {
          setActiveRecording(null);
        }
      } catch (error) {
        console.error('Failed to fetch active recording:', error);
      }
    };

    fetchActiveRecording();
    const interval = setInterval(fetchActiveRecording, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const filteredVideos = videos.filter((video) =>
    video.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlayVideo = (video: any) => {
    setSelectedVideo(video);
    setIsPlayerOpen(true);
  };

  const handleShareVideo = (video: any) => {
    setSelectedVideo(video);
    setIsShareModalOpen(true);
  };

  const handleEditVideo = (video: any) => {
    setSelectedVideo(video);
    setIsEditModalOpen(true);
  };

  const handleDeleteVideo = async (video: any) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette vidéo ?')) {
      return;
    }

    try {
      await videoService.deleteVideo(video.id);
      setVideos(videos.filter(v => v.id !== video.id));
      toast.success('vidéo supprimée avec succès');
    } catch (error: any) {
      console.error('Failed to delete video:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDownloadVideo = (video: any) => {
    if (video.file_url) {
      window.open(video.file_url, '_blank');
    } else {
      toast.error('URL de téléchargement non disponible');
    }
  };

  const handleCreateClip = (video: any) => {
    navigate('/my-clips');
    toast.info('FonctionnalitÃ© de crÃ©ation de clips bientÃ´t disponible');
  };

  // Calculate stats
  const stats = [
    { icon: Video, label: "Vidéos", value: videos.length.toString(), color: "primary" as const },
    { icon: Scissors, label: "Clips", value: clipsCount.toString(), color: "accent" as const },
    { icon: CreditCard, label: "Crédits", value: (user?.credits_balance || user?.credits)?.toString() || "0", color: "cyan" as const },
    { icon: Share2, label: "Partagées", value: videos.filter(v => v.shared).length.toString(), color: "purple" as const },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar credits={user?.credits_balance || user?.credits || 0} />

      <main className="pt-20 pb-12">
        {/* Active Recording Banner */}
        {activeRecording && (
          <ActiveRecordingBanner
            court={activeRecording.court_name || "Court"}
            club={activeRecording.club_name || "Club"}
            startTime={new Date(activeRecording.start_time)}
          />
        )}

        <div className="container mx-auto px-4 lg:px-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-3xl lg:text-4xl font-bold font-orbitron mb-2">
              Bonjour, <span className="gradient-text">{user?.name || 'Joueur'}</span> 👋
            </h1>
            <p className="text-muted-foreground text-lg">
              Prêt à analyser tes performances ?
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8"
          >
            {stats.map((stat, index) => (
              <motion.div key={stat.label} variants={itemVariants}>
                <StatCardModern
                  icon={stat.icon}
                  label={stat.label}
                  value={stat.value}
                  color={stat.color}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-wrap gap-3 mb-8"
          >
            <Button
              variant="neon"
              className="gap-2"
              onClick={() => setIsRecordingModalOpen(true)}
              disabled={!!activeRecording}
            >
              <Play className="h-4 w-4" />
              Démarrer un enregistrement
            </Button>
            <Button variant="neonOutline" className="gap-2" onClick={() => setIsQRScannerOpen(true)}>
              <QrCode className="h-4 w-4" />
              Scanner QR
            </Button>
            <Button variant="neonOutline" className="gap-2" onClick={() => navigate('/credits')}>
              <Plus className="h-4 w-4" />
              Acheter des crédits
            </Button>
          </motion.div>

          {/* Videos Section */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold font-orbitron">Mes Vidéos</h2>

              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-card/50 border-border/50 focus:border-primary/50"
                  />
                </div>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Videos Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  variants={itemVariants}
                  custom={index}
                >
                  <VideoCardModern
                    id={video.id}
                    title={video.title || 'Sans titre'}
                    thumbnail={video.thumbnail || 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400'}
                    duration={formatDuration(video.duration || 0)}
                    date={video.created_at || new Date().toISOString()}
                    shared={video.shared || false}
                    court={video.court_name || 'Court'}
                    onPlay={() => handlePlayVideo(video)}
                    onShare={() => handleShareVideo(video)}
                    onEdit={() => handleEditVideo(video)}
                    onDelete={() => handleDeleteVideo(video)}
                    onDownload={() => handleDownloadVideo(video)}
                    onCreateClip={() => handleCreateClip(video)}
                  />
                </motion.div>
              ))}
            </motion.div>

            {filteredVideos.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <Video className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-lg">
                  {videos.length === 0 ? "Aucune vidéo enregistrée" : "Aucune vidéo trouvée"}
                </p>
                {videos.length === 0 && (
                  <Button
                    variant="neon"
                    className="mt-4"
                    onClick={() => setIsRecordingModalOpen(true)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Créer votre première vidéo
                  </Button>
                )}
              </motion.div>
            )}
          </motion.section>
        </div>
      </main>

      {/* Modals */}
      <StartRecordingModal
        open={isRecordingModalOpen}
        onOpenChange={setIsRecordingModalOpen}
      />

      <ShareVideoModal
        open={isShareModalOpen}
        onOpenChange={setIsShareModalOpen}
        videoTitle={selectedVideo?.title || ""}
      />



      <VideoPlayerModal
        isOpen={isPlayerOpen}
        onClose={() => {
          setIsPlayerOpen(false);
          setSelectedVideo(null);
        }}
        video={selectedVideo}
      />

      <EditVideoTitleModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedVideo(null);
        }}
        video={selectedVideo}
        onSuccess={async () => {
          // Refresh videos after editing
          const response = await videoService.getMyVideos();
          setVideos(response.data.videos || []);
          setIsEditModalOpen(false);
          setSelectedVideo(null);
        }}
      />
    </div>
  );
};

export default Dashboard;



