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
  Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface VideoCardModernProps {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  date: string;
  shared?: boolean;
  court?: string;
  isExpired?: boolean;  // ✅ NOUVEAU: Indique si la vidéo est expirée (cloud supprimé)
  processingStatus?: string; // ✅ NOUVEAU: Statut de traitement
  onPlay?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  onCreateClip?: () => void;
  onEdit?: () => void;
  onDownload?: () => void;
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
  onPlay,
  onShare,
  onDelete,
  onCreateClip,
  onEdit,
  onDownload,
}: VideoCardModernProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (dateString: string) => {
    const dateStr = dateString.endsWith('Z') ? dateString : dateString + 'Z';
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  const isFailed = processingStatus === 'failed';
  const isProcessing = processingStatus === 'processing' || processingStatus === 'uploading';

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative rounded-2xl overflow-hidden glass border border-border/50 hover:border-primary/50 transition-all duration-300 card-glow"
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
            variant="neon"
            size="icon"
            onClick={onPlay}
            className="h-14 w-14 rounded-full animate-pulse-glow"
          >
            <Play className="h-6 w-6 fill-current" />
          </Button>
        </motion.div>

        {/* Duration Badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm">
          <Clock className="h-3 w-3 text-white/80" />
          <span className="text-xs font-medium text-white">{duration}</span>
        </div>

        {/* Shared Badge */}
        {shared && !isExpired && (
          <Badge className="absolute top-3 left-3 bg-accent/80 hover:bg-accent text-accent-foreground">
            <Share2 className="h-3 w-3 mr-1" />
            Partagée
          </Badge>
        )}

        {/* Expired Badge */}
        {isExpired && !isFailed && !isProcessing && (
          <Badge className="absolute top-3 left-3 bg-destructive/90 hover:bg-destructive text-destructive-foreground">
            🔒 Expirée
          </Badge>
        )}

        {/* Failed Badge */}
        {isFailed && (
          <Badge className="absolute top-3 left-3 bg-red-600 hover:bg-red-700 text-white border-red-800">
            ⚠️ Échec
          </Badge>
        )}

        {/* Processing Badge */}
        {isProcessing && (
          <Badge className="absolute top-3 left-3 bg-blue-500/90 hover:bg-blue-600 text-white animate-pulse">
            ⚙️ Traitement...
          </Badge>
        )}

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
            <DropdownMenuItem onClick={onPlay} disabled={isExpired}>
              <Play className="h-4 w-4 mr-2" />
              {isExpired ? "Vidéo expirée" : "Lire"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onCreateClip} disabled={isExpired}>
              <Scissors className="h-4 w-4 mr-2" />
              {isExpired ? "Clip non disponible" : "Créer un clip"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier le titre
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Partager
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
        <h3 className="font-semibold text-foreground line-clamp-1 mb-2 group-hover:text-primary transition-colors">
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
      </div>
    </motion.div>
  );
}
