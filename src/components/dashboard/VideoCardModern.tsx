import { useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  MoreVertical,
  Share2,
  Trash2,
  Scissors,
  Clock,
  MapPin,
  Edit,
  Download,
  Lock,
  AlertTriangle,
  Loader2,
  Sparkles,
  Users,
  UserCheck,
  BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface VideoCardModernProps {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  date: string;
  shared?: boolean;
  court?: string;
  isExpired?: boolean;
  processingStatus?: string;
  aiStatus?: string;
  aiAnalyticsCompleted?: boolean;
  matchPlayers?: any;
  fileUrl?: string;
  aiDetectedFrames?: string[];
  onPlay?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  onCreateClip?: () => void;
  onEdit?: () => void;
  onDownload?: () => void;
  onSetupMatchPlayers?: () => void;
}

export function VideoCardModern({
  id,
  title,
  thumbnail,
  duration,
  date,
  shared = false,
  court,
  isExpired = false,
  processingStatus,
  aiStatus,
  aiAnalyticsCompleted,
  matchPlayers,
  fileUrl,
  aiDetectedFrames,
  onPlay,
  onShare,
  onDelete,
  onCreateClip,
  onEdit,
  onDownload,
  onSetupMatchPlayers,
}: VideoCardModernProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);

  const formatDate = (dateString: string) => {
    const dateStr = dateString.endsWith('Z') ? dateString : dateString + 'Z';
    return new Date(dateStr).toLocaleDateString(i18n.language, {
      day: "numeric",
      month: "short",
    });
  };

  const isFailed = processingStatus === 'failed';
  const isProcessing = processingStatus === 'processing' || processingStatus === 'uploading';
  const isAiCompleted = aiAnalyticsCompleted || aiStatus === 'completed' || processingStatus === 'ready' || (!processingStatus && !isExpired);

  const isRosterConfigured = (() => {
    if (!matchPlayers) return false;
    try {
      const parsed = typeof matchPlayers === 'string' ? JSON.parse(matchPlayers) : matchPlayers;
      if (parsed.players && Array.isArray(parsed.players)) {
        return parsed.players.some((p: any) =>
          p.is_claimed || p.isClaimed || (p.player_name && !p.player_name.startsWith('Player ') && p.player_name !== 'Partner') || p.user_id || p.userId
        );
      }
    } catch (e) {
      return false;
    }
    return false;
  })();

  return (
    <motion.div
      whileHover={{ y: isExpired ? 0 : -8 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative rounded-2xl overflow-hidden glass border transition-all duration-300",
        isExpired
          ? "border-neutral-800 bg-neutral-950/40 opacity-75 grayscale-[20%]"
          : "border-border/50 hover:border-primary/50 card-glow"
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-neutral-900">
        <img
          src={thumbnail || 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&auto=format&fit=crop&q=80'}
          alt={title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&auto=format&fit=crop&q=80';
          }}
          className={cn(
            "w-full h-full object-cover transition-transform duration-500",
            isExpired ? "brightness-75 contrast-90" : "group-hover:scale-110"
          )}
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Center Lock Overlay when Expired */}
        {isExpired && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] pointer-events-none">
            <div className="p-3 rounded-full bg-neutral-900/80 border border-neutral-700/60 text-neutral-400 shadow-inner">
              <Lock className="h-5 w-5" />
            </div>
          </div>
        )}

        {/* Play Button */}
        {!isExpired && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Button
              variant="neon"
              size="icon"
              onClick={onPlay}
              className="h-14 w-14 rounded-full animate-pulse-glow"
            >
              <Play className="h-6 w-6 fill-current" />
            </Button>
          </motion.div>
        )}

        {/* Duration Badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm">
          <Clock className="h-3 w-3 text-white/80" />
          <span className="text-xs font-medium text-white">{duration}</span>
        </div>

        {/* Top-Left Badges Container */}
        <div className="absolute top-3 left-3 right-12 flex flex-wrap items-center gap-1.5 z-10 pointer-events-none">
          {/* Status Badges */}
          {isExpired && !isFailed && !isProcessing && (
            <Badge className="bg-neutral-900/90 text-neutral-300 border border-neutral-700/60 shadow-sm font-medium tracking-wide flex items-center px-2.5 py-1 backdrop-blur-md pointer-events-auto">
              <Lock className="h-3 w-3 mr-1.5 text-neutral-400" />
              <span>{t('components.videoCard.badges.expired')}</span>
            </Badge>
          )}

          {isFailed && (
            <Badge className="bg-red-600 hover:bg-red-700 text-white border-red-800 pointer-events-auto">
              {t('components.videoCard.badges.failed')}
            </Badge>
          )}

          {isProcessing && (
            <Badge className="bg-blue-500/90 hover:bg-blue-600 text-white animate-pulse pointer-events-auto">
              {t('components.videoCard.badges.processing')}
            </Badge>
          )}

          {processingStatus === 'pending' && !isProcessing && (
            <Badge className="bg-yellow-500/90 hover:bg-yellow-600 text-white pointer-events-auto">
              {t('components.videoCard.badges.pending')}
            </Badge>
          )}

          {/* Shared Badge */}
          {shared && !isExpired && (
            <Badge className="bg-accent/80 hover:bg-accent text-accent-foreground pointer-events-auto">
              <Share2 className="h-3 w-3 mr-1" />
              {t('components.videoCard.badges.shared')}
            </Badge>
          )}

          {/* AI Analytics Completed Badge */}
          {isAiCompleted && !isExpired && (
            <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md border border-emerald-400/30 flex items-center gap-1 text-[11px] font-semibold pointer-events-auto">
              <Sparkles className="h-3 w-3 animate-pulse" />
              <span>{t('components.videoCard.badges.aiReady', 'AI Ready')}</span>
            </Badge>
          )}
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-medium">
          <Clock className="h-3 w-3 text-primary" />
          <span>{duration}</span>
        </div>

        {/* Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 h-8 w-8 bg-black/40 hover:bg-black/60 text-white"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={onPlay} disabled={isExpired}>
              <Play className="h-4 w-4 mr-2" />
              {isExpired ? t('components.videoCard.menu.playExpired') : t('components.videoCard.menu.play')}
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate(`/analytics/${id}`)} disabled={isExpired || !isRosterConfigured} className="text-cyan-600 dark:text-cyan-400 font-medium">
              <BarChart3 className="h-4 w-4 mr-2 text-cyan-600 dark:text-cyan-400" />
              {t('components.videoCard.menu.viewAnalytics', 'View AI Match Analytics')}
            </DropdownMenuItem>

            {isAiCompleted && (
              <DropdownMenuItem onClick={onSetupMatchPlayers} disabled={isExpired} className="text-emerald-400 font-medium">
                <UserCheck className="h-4 w-4 mr-2 text-emerald-400" />
                {t('components.videoCard.menu.setupMatchPlayers', 'Player Roster & Setup')}
              </DropdownMenuItem>
            )}

            <DropdownMenuItem onClick={onCreateClip} disabled={isExpired}>
              <Scissors className="h-4 w-4 mr-2" />
              {isExpired ? t('components.videoCard.menu.createClipUnavailable') : t('components.videoCard.menu.createClip')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit} disabled={isExpired}>
              <Edit className="h-4 w-4 mr-2" />
              {t('components.videoCard.menu.editTitle')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onShare} disabled={isExpired}>
              <Share2 className="h-4 w-4 mr-2" />
              {t('components.videoCard.menu.share')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDownload} disabled={isExpired}>
              <Download className="h-4 w-4 mr-2" />
              {isExpired ? t('components.videoCard.menu.downloadUnavailable') : t('components.videoCard.menu.download')}
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('components.videoCard.menu.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className={cn("font-semibold text-foreground line-clamp-1 mb-2 transition-colors", !isExpired && "group-hover:text-primary")}>
          {title}
        </h3>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatDate(date)}</span>
          {court && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{court}</span>
            </div>
          )}
        </div>

        {/* Dynamic Action Button: View Match Analytics if Roster is Configured, else Player Roster & Setup */}
        {isAiCompleted && !isExpired && (
          isRosterConfigured ? (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/analytics/${id}`);
              }}
              className="w-full mt-3 gap-2 bg-gradient-to-r from-cyan-500/15 via-blue-500/15 to-indigo-500/15 hover:from-cyan-500/25 hover:via-blue-500/25 hover:to-indigo-500/25 border-cyan-500/40 text-cyan-600 dark:text-cyan-400 font-semibold text-xs rounded-xl shadow-sm transition-all duration-200 hover:scale-[1.01]"
            >
              <BarChart3 className="h-3.5 w-3.5 text-cyan-500 animate-pulse" />
              <span>{t('components.videoCard.menu.viewAnalytics', 'View AI Match Analytics')}</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSetupMatchPlayers?.();
              }}
              className="w-full mt-3 gap-2 bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-cyan-500/15 hover:from-emerald-500/25 hover:via-teal-500/25 hover:to-cyan-500/25 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-semibold text-xs rounded-xl shadow-sm transition-all duration-200 hover:scale-[1.01]"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
              <span>{t('components.videoCard.menu.setupMatchPlayers', 'Player Roster & Setup')}</span>
            </Button>
          )
        )}
      </div>
    </motion.div>
  );
}
