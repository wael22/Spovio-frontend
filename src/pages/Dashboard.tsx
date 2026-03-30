import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTutorialContext } from "@/contexts/TutorialContext";
import { videoService, recordingService, getAssetUrl, getVideoThumbnailUrl } from "@/lib/api";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { StatCardModern } from "@/components/dashboard/StatCardModern";
import { VideoCardModern } from "@/components/dashboard/VideoCardModern";
import { ActiveRecordingBanner } from "@/components/dashboard/ActiveRecordingBanner";
import { StartRecordingModal } from "@/components/dashboard/StartRecordingModal";
import DirectRecordingModal from "@/components/dashboard/DirectRecordingModal";
import QRScannerModal from "@/components/dashboard/QRScannerModal";
import { ShareVideoModal } from "@/components/dashboard/ShareVideoModal";
import { VideoClipEditor } from "@/components/dashboard/VideoClipEditor";
import { VideoPlayerModal } from "@/components/dashboard/VideoPlayerModal";
import { EditVideoTitleModal } from "@/components/dashboard/EditVideoTitleModal";
import { ReportIssueModal } from "@/components/dashboard/ReportIssueModal";
import { toast } from "sonner"; // Assuming toast is from sonner
import {
  Video,
  Scissors,
  CreditCard,
  Share2,
  Play,
  QrCode,
  Plus,
  GraduationCap,
  Search,
  Filter,
  Loader2,
  AlertTriangle,
} from "lucide-react"; // Assuming these icons are from lucide-react
import { Button } from "@/components/ui/button"; // Assuming Button is from ui/button
import { Input } from "@/components/ui/input"; // Assuming Input is from ui/input
import { useTranslation } from "react-i18next";

// Framer Motion variants for animations
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
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { startTutorial } = useTutorialContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDirectRecordingModalOpen, setIsDirectRecordingModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [activeRecording, setActiveRecording] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [clipsCount, setClipsCount] = useState(0);
  const [isClipEditorOpen, setIsClipEditorOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [initialQrCode, setInitialQrCode] = useState<string | undefined>(undefined);

  useEffect(() => {
    const pendingQr = localStorage.getItem('pending_court_qr');
    if (pendingQr) {
      localStorage.removeItem('pending_court_qr');
      setInitialQrCode(pendingQr);
      setIsDirectRecordingModalOpen(true);
    }
  }, []);
  // scannedQrCode removed as it's now handled internally by DirectRecordingModal

  // Fonction pour démarrer le tutoriel manuellement
  const handleStartTutorial = () => {
    // Effacer localStorage pour forcer le redémarrage
    localStorage.removeItem('mysmash_tutorial_completed');
    localStorage.removeItem('mysmash_tutorial_status');
    startTutorial();
    toast.success(t("toasts.tutorialStarted"));
  };

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
          toast.error(t("toasts.videosLoadError"));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [t]);

  // Fetch clips count
  useEffect(() => {
    const fetchClipsCount = async () => {
      try {
        const { clipService } = await import('@/lib/api');
        const response = await clipService.getMyClips();
        setClipsCount(response.data.clips?.length || 0);
      } catch (error) {
        console.error('Failed to fetch clips count:', error);
      }
    };

    fetchClipsCount();
  }, []);


  // Fetch active recording - extracted so it can be called from callbacks
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

  // Poll active recording status
  useEffect(() => {
    fetchActiveRecording();
    const interval = setInterval(fetchActiveRecording, 5000); // Check every 5s (faster sync)
    return () => clearInterval(interval);
  }, []);

  // Handle stop recording
  const handleStopRecording = async () => {
    if (!activeRecording) return;

    if (!confirm(t("toasts.confirmStop"))) {
      return;
    }

    try {
      await recordingService.stopRecording(activeRecording.recording_id);
      toast.success(t("toasts.recordingStopped"));
      setActiveRecording(null);

      // Refresh videos after stopping
      const response = await videoService.getMyVideos();
      setVideos(response.data.videos || []);
    } catch (error: any) {
      console.error('Failed to stop recording:', error);
      toast.error(error.response?.data?.error || t("toasts.recordingStopError"));
    }
  };

  // Poll for video status updates
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkVideoStatus = async () => {
      // Only poll if we have videos that are processing, uploading, OR PENDING
      const hasProcessingVideos = videos.some(
        v => ['processing', 'uploading', 'pending'].includes(v.processing_status)
      );

      if (!hasProcessingVideos) return;

      try {
        const response = await videoService.getMyVideos();
        const newVideos = response.data.videos || [];

        // Check for completions
        newVideos.forEach((newVideo: any) => {
          const oldVideo = videos.find(v => v.id === newVideo.id);
          if (oldVideo && ['processing', 'uploading', 'pending'].includes(oldVideo.processing_status) && newVideo.processing_status === 'ready') {
            toast.success(t("toasts.videoReady", { title: newVideo.title }));
          }
        });

        setVideos(newVideos);
      } catch (error) {
        console.error('Error polling videos:', error);
      }
    };

    if (videos.some(v => ['processing', 'uploading', 'pending'].includes(v.processing_status))) {
      interval = setInterval(checkVideoStatus, 5000);
    }

    return () => clearInterval(interval);
  }, [videos, t]);

  // Filter videos by search query
  const filteredVideos = videos.filter((video) => {
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = video.title?.toLowerCase().includes(query);
      const matchesCourt = video.court_name?.toLowerCase().includes(query);
      return matchesTitle || matchesCourt;
    }

    return true;
  });

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
    // Super admin gets advanced deletion options
    if (user?.role === 'super_admin') {
      const deleteMode = window.prompt(
        `🗑️ MODE DE SUPPRESSION (Super Admin)\n\nChoisissez le mode de suppression pour "${video.title}":\n\n1️⃣  "database" - Supprimer seulement de la base de données\n2️⃣  "bunny" - Supprimer seulement de Bunny CDN\n3️⃣  "both" - Suppression complète (recommandé)\n\nEntrez: database, bunny, ou both`,
        'both'
      );

      if (!deleteMode) return; // User cancelled

      const validModes = ['database', 'bunny', 'both'];
      const selectedMode = deleteMode.toLowerCase().trim();

      if (!validModes.includes(selectedMode)) {
        toast.error('Mode invalide. Utilisez: database, bunny, ou both');
        return;
      }

      if (!confirm(`Confirmer la suppression (${selectedMode}) de "${video.title}" ?`)) {
        return;
      }

      try {
        const { adminService } = await import('@/lib/api');

        // Map UI modes to API modes
        const modeMap: Record<string, 'local_only' | 'cloud_only' | 'local_and_cloud'> = {
          'database': 'local_only',
          'bunny': 'cloud_only',
          'both': 'local_and_cloud'
        };

        const apiMode = modeMap[selectedMode] || 'local_and_cloud';
        const response = await adminService.deleteVideo(video.id, apiMode);

        // Remove from UI if deleted from database
        if (selectedMode === 'database' || selectedMode === 'both') {
          setVideos(videos.filter(v => v.id !== video.id));
        }

        toast.success(response.data.message || `Vidéo supprimée (${selectedMode})`);
      } catch (error: any) {
        console.error('Failed to delete video:', error);
        const errorMsg = error.response?.data?.error || t("toasts.deleteError");
        toast.error(errorMsg);
      }
    } else {
      // Regular user: simple deletion
      if (!confirm(t("toasts.confirmDelete"))) {
        return;
      }

      try {
        await videoService.deleteVideo(video.id);
        setVideos(videos.filter(v => v.id !== video.id));
        toast.success(t("toasts.videoDeleted"));
      } catch (error: any) {
        console.error('Failed to delete video:', error);
        toast.error(t("toasts.deleteError"));
      }
    }
  };

  const handleDownloadVideo = async (video: any) => {
    // Check if video is expired or deleted
    if (video.is_expired || video.processing_status !== 'ready') {
      toast.error(t("toasts.downloadUnavailable"));
      return;
    }

    // Check if video has bunny_video_id
    if (!video.bunny_video_id) {
      toast.error(t("toasts.bunnyMissing"));
      return;
    }

    try {
      toast.loading(t("toasts.findingQuality"), { id: 'download-toast' });

      // Importer le helper
      const { getWorkingVideoUrl } = await import('@/lib/bunnyVideoHelper');

      // Trouver l'URL qui fonctionne avec fallback automatique
      const finalUrl = await getWorkingVideoUrl(video.bunny_video_id, '720p');

      toast.loading(t("toasts.downloading"), { id: 'download-toast' });

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
      link.download = `${video.title || 'video'}.mp4`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast.dismiss('download-toast');
      toast.success(t("toasts.downloadComplete"));
    } catch (error) {
      console.error('Download error:', error);
      toast.dismiss('download-toast');

      // Fallback: Open in new tab with default resolution
      window.open(`https://vz-9b857324-07d.b-cdn.net/${video.bunny_video_id}/play_720p.mp4`, '_blank');
      toast.error(t("toasts.downloadFailed"));
    }
  };

  const handleCreateClip = (video: any) => {
    setSelectedVideo(video);
    setIsClipEditorOpen(true);
  };

  // Calculate stats
  const ownedVideos = videos.filter(v => !v.is_shared);  // Mes vidéos possédées
  const sharedVideos = videos.filter(v => v.is_shared);   // Vidéos reçues/partagées avec moi

  const stats = [
    { icon: Video, label: t('dashboard.stats.videos'), value: ownedVideos.length.toString(), color: "primary" as const },
    { icon: Scissors, label: t('dashboard.stats.clips'), value: clipsCount.toString(), color: "accent" as const },
    { icon: CreditCard, label: t('dashboard.stats.credits'), value: (user?.credits_balance || user?.credits)?.toString() || "0", color: "cyan" as const },
    { icon: Share2, label: t('dashboard.stats.shared'), value: sharedVideos.length.toString(), color: "purple" as const },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Active Recording Banner */}
      {activeRecording && (
        <ActiveRecordingBanner
          court={activeRecording.court?.name || "Court"}
          club={activeRecording.club?.name || "Club"}
          startTime={new Date(activeRecording.start_time.endsWith('Z') ? activeRecording.start_time : activeRecording.start_time + 'Z')}
          duration={activeRecording.planned_duration}
          onStop={handleStopRecording}
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
            {t('dashboard.welcome', { name: user?.name || 'Joueur' })}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('dashboard.readyToAnalyze')}
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
            {t('dashboard.startRecording')}
          </Button>
          <Button
            variant="neonOutline"
            className="gap-2"
            onClick={() => {
              setInitialQrCode(undefined);
              setIsDirectRecordingModalOpen(true);
            }}
            disabled={!!activeRecording}
          >
            <QrCode className="h-4 w-4" />
            {t('dashboard.scanQr')}
          </Button>
          <Button variant="neonOutline" className="gap-2" onClick={() => navigate('/credits')}>
            <Plus className="h-4 w-4" />
            {t('dashboard.buyCredits')}
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleStartTutorial}>
            <GraduationCap className="h-4 w-4" />
            {t('dashboard.restartTutorial')}
          </Button>
          {/* <Button
              variant="outline"
              className="gap-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:text-yellow-400 dark:border-yellow-500 dark:hover:bg-yellow-900/20"
              onClick={() => setIsReportModalOpen(true)}
            >
              <AlertTriangle className="h-4 w-4" />
              {t('dashboard.reportIssue')}
            </Button> */}
        </motion.div>

        {/* Videos Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold font-orbitron">{t('dashboard.myVideos')}</h2>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('dashboard.searchPlaceholder')}
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
                  thumbnail={getVideoThumbnailUrl(video)}
                  duration={formatDuration(video.duration || 0)}
                  date={video.created_at || new Date().toISOString()}
                  shared={video.is_shared || false}
                  court={video.court_name || 'Court'}
                  isExpired={video.is_expired || false}
                  processingStatus={video.processing_status}
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
                {videos.length === 0 ? t('dashboard.noVideos') : t('dashboard.noVideosFound')}
              </p>
              {videos.length === 0 && (
                <Button
                  variant="neon"
                  className="mt-4"
                  onClick={() => setIsRecordingModalOpen(true)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {t('dashboard.createFirstVideo')}
                </Button>
              )}
            </motion.div>
          )}
        </motion.section>
      </div>

      {/* Modals */}
      <StartRecordingModal
        open={isRecordingModalOpen}
        onOpenChange={(open) => {
          setIsRecordingModalOpen(open);
          if (!open) {
            setInitialQrCode(undefined);
          }
        }}
        onRecordingStarted={async (session) => {
          // Set immediately for instant UI feedback
          setActiveRecording(session);
          // Also fetch to get full recording details from server
          setTimeout(fetchActiveRecording, 1000);
        }}
        initialQrCode={initialQrCode}
      />

      <DirectRecordingModal
        isOpen={isDirectRecordingModalOpen}
        onClose={() => {
          setIsDirectRecordingModalOpen(false);
          setInitialQrCode(undefined);
        }}
        initialQrCode={initialQrCode}
        onRecordingStarted={async (session) => {
          setActiveRecording(session);
          setTimeout(fetchActiveRecording, 1000);
        }}
      />

      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onCodeScanned={(code) => {
          setIsQRScannerOpen(false);
          setInitialQrCode(code);
          setIsDirectRecordingModalOpen(true);
        }}
      />

      <ShareVideoModal
        open={isShareModalOpen}
        onOpenChange={setIsShareModalOpen}
        videoId={selectedVideo?.id}
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

      <VideoClipEditor
        isOpen={isClipEditorOpen}
        onClose={() => {
          setIsClipEditorOpen(false);
          setSelectedVideo(null);
        }}
        video={selectedVideo}
        onClipCreated={async (clip) => {
          toast.success(t("toasts.clipCreated"));
          // Refresh clip count
          const { clipService } = await import('@/lib/api');
          const response = await clipService.getMyClips();
          setClipsCount(response.data.clips?.length || 0);
        }}
      />



      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </>
  );
};


export default Dashboard;
