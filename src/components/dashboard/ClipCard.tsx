import { useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  MoreVertical,
  Share2,
  Download,
  Trash2,
  Clock,
  Film,
  CheckCircle2,
  Loader2,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ClipCardProps {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  date: string;
  videoTitle?: string;
  status?: 'completed' | 'processing' | 'pending' | 'failed';
  onPlay?: () => void;
  onShare?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
}

export function ClipCard({
  id,
  title,
  thumbnail,
  duration,
  date,
  videoTitle,
  status = 'completed',
  onPlay,
  onShare,
  onDownload,
  onDelete,
}: ClipCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (dateString: string) => {
    const dateStr = dateString.endsWith('Z') ? dateString : dateString + 'Z';
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative rounded-2xl overflow-hidden glass border border-accent/20 hover:border-accent/50 transition-all duration-300"
      style={{
        boxShadow: isHovered
          ? "0 0 30px hsl(var(--accent) / 0.2)"
          : "none",
      }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Play Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Button
            variant="neonGreen"
            size="icon"
            onClick={onPlay}
            className="h-14 w-14 rounded-full"
          >
            <Play className="h-6 w-6 fill-current" />
          </Button>
        </motion.div>

        {/* Duration Badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent/80 backdrop-blur-sm">
          <Clock className="h-3 w-3 text-accent-foreground" />
          <span className="text-xs font-medium text-accent-foreground">{duration}</span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          {status === 'completed' && (
            <Badge variant="default" className="bg-green-500/90 hover:bg-green-500">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Prêt
            </Badge>
          )}
          {status === 'processing' && (
            <Badge variant="secondary" className="bg-blue-500/90 hover:bg-blue-500">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Traitement...
            </Badge>
          )}
          {status === 'pending' && (
            <Badge variant="secondary" className="bg-yellow-500/90 hover:bg-yellow-500">
              <Clock className="h-3 w-3 mr-1" />
              En attente
            </Badge>
          )}
          {status === 'failed' && (
            <Badge variant="destructive">
              <XCircle className="h-3 w-3 mr-1" />
              Échec
            </Badge>
          )}
        </div>

        {/* Actions Menu */}
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
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onPlay}>
              <Play className="h-4 w-4 mr-2" />
              Lire
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Partager
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDownload}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-1 mb-2 group-hover:text-accent transition-colors">
          {title}
        </h3>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatDate(date)}</span>
          {videoTitle && (
            <div className="flex items-center gap-1 max-w-[120px]">
              <Film className="h-3 w-3 shrink-0" />
              <span className="truncate">{videoTitle}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
