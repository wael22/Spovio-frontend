import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Play,
  Pause,
  Flame,
  Zap,
  Target,
  Wind,
  Activity,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart,
  X,
  Volume2,
  VolumeX,
  Check,
  TrendingUp,
  LayoutGrid,
  List,
  RotateCcw
} from 'lucide-react';
import type { AnalyticsPlayer } from './PlayerSelector';

const BUNNY_VIDEO_ID = '3daf69bf-9395-4ed3-a3b9-5d2dceb74809';
// Use /bunny-stream proxy to bypass COEP/CORP restrictions in development
const VIDEO_MP4_URL = `/bunny-stream/${BUNNY_VIDEO_ID}/play_720p.mp4`;
const THUMBNAIL_URL = `/bunny-stream/${BUNNY_VIDEO_ID}/thumbnail.jpg`;
const PREVIEW_WEBP_URL = `/bunny-stream/${BUNNY_VIDEO_ID}/preview.webp`;

export interface HighlightShot {
  id: number;
  rank: number;
  type: string;
  category: 'smash' | 'volley' | 'passing' | 'bandeja' | 'forehand';
  speed: string;
  metricLabel: string;
  time: string;
  startSeconds: number;
  durationSeconds: number;
  score: number;
  aiInsight: string;
  courtZone: string;
  icon: any;
  iconColor: string;
  bgGradient: string;
  accentColor: string;
}

const DEFAULT_HIGHLIGHTS: HighlightShot[] = [
  {
    id: 1,
    rank: 1,
    type: 'Smash Placé au Centre T',
    category: 'smash',
    speed: '68 km/h',
    metricLabel: 'Frappe Gagnante',
    time: '00:15',
    startSeconds: 15,
    durationSeconds: 10,
    score: 8.2,
    aiInsight: 'Smash bien orienté vers le centre du terrain exploitant l’espace entre les deux joueurs adverses.',
    courtZone: 'Filet → Centre T',
    icon: Flame,
    iconColor: 'text-amber-400',
    bgGradient: 'from-amber-500/20 via-orange-600/10 to-transparent',
    accentColor: '#F59E0B',
  },
  {
    id: 2,
    rank: 2,
    type: 'Volée de Blocage Sécurisée',
    category: 'volley',
    speed: '52 km/h',
    metricLabel: 'Réactivité Réflexe',
    time: '01:05',
    startSeconds: 65,
    durationSeconds: 9,
    score: 7.9,
    aiInsight: 'Bonne préparation de tamis au filet. Blocage court qui empêche la contre-attaque rapide.',
    courtZone: 'Filet Central → Pieds Adversaire',
    icon: Zap,
    iconColor: 'text-cyan-400',
    bgGradient: 'from-cyan-500/20 via-blue-600/10 to-transparent',
    accentColor: '#06B6D4',
  },
  {
    id: 3,
    rank: 3,
    type: 'Passing Coup Droit Décroisé',
    category: 'passing',
    speed: '60 km/h',
    metricLabel: 'Précision 82%',
    time: '02:20',
    startSeconds: 140,
    durationSeconds: 11,
    score: 7.6,
    aiInsight: 'Coup droit régulier à 60 km/h profitant d’un espace ouvert sur le couloir droit.',
    courtZone: 'Fond Droit → Couloir Libre',
    icon: Target,
    iconColor: 'text-emerald-400',
    bgGradient: 'from-emerald-500/20 via-teal-600/10 to-transparent',
    accentColor: '#10B981',
  },
  {
    id: 4,
    rank: 4,
    type: 'Bandeja Haute de Sécurité',
    category: 'bandeja',
    speed: '54 km/h',
    metricLabel: 'Contrôle & Hauteur',
    time: '03:50',
    startSeconds: 230,
    durationSeconds: 10,
    score: 7.4,
    aiInsight: 'Frappe haute dosée à 54 km/h vers le fond de court, permettant de se replacer calmement.',
    courtZone: 'Milieu → Fond de Court',
    icon: Wind,
    iconColor: 'text-blue-400',
    bgGradient: 'from-blue-500/20 via-indigo-600/10 to-transparent',
    accentColor: '#3B82F6',
  },
  {
    id: 5,
    rank: 5,
    type: 'Coup Droit Après Vitre',
    category: 'forehand',
    speed: '50 km/h',
    metricLabel: 'Patience Rebord',
    time: '05:15',
    startSeconds: 315,
    durationSeconds: 10,
    score: 7.1,
    aiInsight: 'Excellente temporisation après rebond sur la vitre de fond, relance au centre pour prolonger le point.',
    courtZone: 'Vitre Fond → Centre Terrain',
    icon: Activity,
    iconColor: 'text-purple-400',
    bgGradient: 'from-purple-500/20 via-pink-600/10 to-transparent',
    accentColor: '#A855F7',
  },
];

interface MatchHighlightsReelProps {
  player?: AnalyticsPlayer;
}

/**
 * VideoMomentThumbnail extracts and displays the exact video frame at a given timestamp
 * using in-browser canvas frame capture with instant fallback.
 */
function VideoMomentThumbnail({
  videoUrl,
  timestamp,
  alt,
  className,
}: {
  videoUrl: string;
  timestamp: number;
  alt: string;
  className?: string;
}) {
  const [frameDataUrl, setFrameDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const video = document.createElement('video');
    video.src = videoUrl;
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    const handleLoadedMetadata = () => {
      video.currentTime = timestamp;
    };

    const handleSeeked = () => {
      if (!isMounted) return;
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 180;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setFrameDataUrl(dataUrl);
        }
      } catch (e) {
        // Cross-origin restriction or canvas error, will fallback to video element
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('seeked', handleSeeked);

    return () => {
      isMounted = false;
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('seeked', handleSeeked);
      video.removeAttribute('src');
      video.load();
    };
  }, [videoUrl, timestamp]);

  if (frameDataUrl) {
    return <img src={frameDataUrl} alt={alt} className={className} />;
  }

  return (
    <video
      src={`${videoUrl}#t=${timestamp}`}
      preload="auto"
      playsInline
      muted
      crossOrigin="anonymous"
      onLoadedData={(e) => {
        try {
          e.currentTarget.currentTime = timestamp;
        } catch (err) {}
      }}
      className={className}
    />
  );
}

export function MatchHighlightsReel({ player }: MatchHighlightsReelProps) {
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'carousel' | 'list'>('carousel');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const openShortsPlayer = (index: number) => {
    setActiveModalIndex(index);
  };

  const closeShortsPlayer = () => {
    setActiveModalIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card/60 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black">
            <Trophy className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base sm:text-lg tracking-wide uppercase text-foreground" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Vos Meilleurs Coups
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Extraits et highlights du match pour <span className="font-semibold text-foreground">{player?.name || 'Lucas Martin'}</span>
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* View mode toggle */}
          <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/50 text-xs">
            <button
              onClick={() => setViewMode('carousel')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${viewMode === 'carousel'
                ? 'bg-background text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
              title="Vue Carrousel Shorts"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Shorts</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${viewMode === 'list'
                ? 'bg-background text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
              title="Vue Liste"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Liste</span>
            </button>
          </div>
        </div>
      </div>

      {/* CAROUSEL VIEW (YouTube Shorts / Reels Style) */}
      {viewMode === 'carousel' ? (
        <div className="relative group">
          {/* Scroll left/right buttons for desktop */}
          <button
            onClick={() => handleScroll('left')}
            className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-background/90 hover:bg-background border border-border shadow-lg items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-background/90 hover:bg-background border border-border shadow-lg items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Horizontal snap scroll track */}
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto snap-x snap-mandatory gap-3.5 pb-2 pt-1 -mx-2 px-2 sm:mx-0 sm:px-0 scrollbar-none touch-pan-x"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {DEFAULT_HIGHLIGHTS.map((shot, index) => {
              const IconComponent = shot.icon;

              return (
                <motion.div
                  key={shot.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  onClick={() => openShortsPlayer(index)}
                  className="snap-start shrink-0 w-[170px] sm:w-[190px] md:w-[200px] aspect-[9/15] rounded-2xl relative overflow-hidden cursor-pointer border border-border/60 hover:border-primary/50 shadow-md hover:shadow-xl transition-all duration-300 transform active:scale-95 group/card bg-slate-950"
                >
                  {/* Unique Moment Video Thumbnail from Bunny CDN */}
                  <VideoMomentThumbnail
                    videoUrl={VIDEO_MP4_URL}
                    timestamp={shot.startSeconds}
                    alt={shot.type}
                    className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover/card:scale-105 group-hover/card:opacity-90 transition-all duration-500 pointer-events-none"
                  />

                  {/* Gradient overlays for readability */}
                  <div className={`absolute inset-0 bg-gradient-to-b ${shot.bgGradient} opacity-40`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                  {/* Top Bar: Clean Rank + Time */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <span className="w-6 h-6 rounded-full bg-black/60 backdrop-blur-md text-white font-bold text-xs flex items-center justify-center border border-white/10 shadow-sm">
                      {shot.rank}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-medium text-zinc-300 font-mono border border-white/10">
                      {shot.time}
                    </span>
                  </div>

                  {/* Center Minimal Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white flex items-center justify-center shadow-lg border border-white/25 group-hover/card:scale-110 group-hover/card:bg-primary group-hover/card:border-primary transition-all duration-300">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Bottom Clean Info */}
                  <div className="absolute bottom-0 inset-x-0 p-3.5 z-10">
                    <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold mb-1">
                      <IconComponent className="w-3.5 h-3.5" />
                      <span>{shot.speed}</span>
                    </div>
                    <h4 className="font-semibold text-xs sm:text-sm text-white line-clamp-1 leading-snug">
                      {shot.type}
                    </h4>
                    <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                      {shot.courtZone}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Mobile Swipe Hint */}
          <div className="flex sm:hidden items-center justify-center gap-1.5 text-[11px] text-muted-foreground pt-1">
            <TrendingUp className="w-3 h-3 text-primary" />
            <span>Glissez pour voir tous les coups • Touchez pour lancer</span>
          </div>
        </div>
      ) : (
        /* LIST VIEW (Compact & Clean) */
        <div className="space-y-2.5">
          {DEFAULT_HIGHLIGHTS.map((shot, index) => {
            const IconComponent = shot.icon;
            return (
              <motion.div
                key={shot.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => openShortsPlayer(index)}
                className="flex items-center gap-3 p-3 sm:p-3.5 bg-card hover:bg-muted/60 rounded-xl border border-border/80 transition-all cursor-pointer group shadow-sm hover:shadow-md"
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-8 h-8 rounded-full font-black text-xs shadow-sm bg-muted text-foreground">
                  {shot.rank}
                </div>

                {/* Video thumbnail preview */}
                <div className="w-12 h-12 rounded-lg overflow-hidden relative shrink-0 bg-slate-900 border border-border/50">
                  <VideoMomentThumbnail
                    videoUrl={VIDEO_MP4_URL}
                    timestamp={shot.startSeconds}
                    alt={shot.type}
                    className="w-full h-full object-cover opacity-80 pointer-events-none"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="w-3.5 h-3.5 text-white fill-current" />
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs sm:text-sm text-foreground truncate">
                      {shot.type}
                    </span>
                    <span className="px-1.5 py-0.2 bg-primary/10 text-primary text-[10px] font-bold rounded">
                      {shot.speed}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {shot.courtZone} • [{shot.time}]
                  </div>
                </div>

                {/* Play icon */}
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center transition-colors">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* FULLSCREEN SHORTS / REELS MODAL PLAYER */}
      <AnimatePresence>
        {activeModalIndex !== null && (
          <ShortsModalPlayer
            highlights={DEFAULT_HIGHLIGHTS}
            initialIndex={activeModalIndex}
            player={player}
            onClose={closeShortsPlayer}
            onNavigate={(newIndex) => setActiveModalIndex(newIndex)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface ShortsModalPlayerProps {
  highlights: HighlightShot[];
  initialIndex: number;
  player?: AnalyticsPlayer;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

function ShortsModalPlayer({
  highlights,
  initialIndex,
  player,
  onClose,
  onNavigate,
}: ShortsModalPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentHighlight = highlights[currentIndex] || highlights[0];

  // Sync index if props change
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Jump to start timestamp when highlight changes
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = currentHighlight.startSeconds;
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [currentIndex, currentHighlight]);

  // Handle video time update to calculate progress and loop within highlight duration
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    const current = video.currentTime;
    const start = currentHighlight.startSeconds;
    const end = start + currentHighlight.durationSeconds;

    if (current < start) {
      video.currentTime = start;
      setProgress(0);
      return;
    }

    if (current >= end) {
      video.currentTime = start;
      setProgress(0);
      return;
    }

    const currentProgress = ((current - start) / currentHighlight.durationSeconds) * 100;
    setProgress(Math.min(Math.max(currentProgress, 0), 100));
  };

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentIndex < highlights.length - 1) {
      onNavigate(currentIndex + 1);
    } else {
      onNavigate(0);
    }
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    } else {
      onNavigate(highlights.length - 1);
    }
  };

  const IconComponent = currentHighlight.icon;

  if (typeof document === 'undefined') return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] bg-black flex items-center justify-center p-0 select-none overflow-hidden"
    >
      {/* Click backdrop to close */}
      <div className="absolute inset-0 bg-black" onClick={onClose} />

      {/* Main Player Container (Clean, Pure Black, Fullscreen on Mobile) */}
      <div
        className="relative z-10 w-full h-full sm:max-w-md sm:max-h-[92vh] sm:rounded-3xl bg-black overflow-hidden flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="p-4 z-30 flex items-center justify-between bg-black/90 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground shadow-sm">
              Top #{currentHighlight.rank}
            </span>
            <span className="text-xs font-mono text-white/90 bg-zinc-900 px-2 py-1 rounded-lg">
              {currentHighlight.time}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Area with side tap controls */}
        <div
          className="relative flex-1 bg-black overflow-hidden flex items-center justify-center cursor-pointer"
          onClick={togglePlayPause}
        >
          <video
            ref={videoRef}
            src={VIDEO_MP4_URL}
            poster={THUMBNAIL_URL}
            playsInline
            autoPlay
            preload="auto"
            crossOrigin="anonymous"
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            className="w-full h-full object-contain bg-black"
          />

          {/* Left / Right Quick Arrow Overlays */}
          <button
            onClick={handlePrev}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/80 text-white/80 hover:text-white flex items-center justify-center backdrop-blur-sm transition-all active:scale-90 cursor-pointer z-20"
            title="Précédent"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/80 text-white/80 hover:text-white flex items-center justify-center backdrop-blur-sm transition-all active:scale-90 cursor-pointer z-20"
            title="Suivant"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Pause Indicator overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] z-10 pointer-events-none">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-xl">
                <Play className="w-7 h-7 fill-current ml-0.5" />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Clean Info & Sound Bar */}
        <div className="p-4 bg-black/95 backdrop-blur-md z-30 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs shrink-0">
                {player?.name ? player.name[0] : 'J'}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm text-white truncate">
                  {player?.name || 'Joueur'}
                </div>
                <div className="text-[11px] text-cyan-300 font-medium flex items-center gap-1.5 truncate">
                  <IconComponent className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{currentHighlight.type}</span>
                  <span className="text-zinc-400 font-mono shrink-0">({currentHighlight.speed})</span>
                </div>
              </div>
            </div>

            {/* Sound Toggle & Counter */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={toggleMute}
                className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center transition-colors cursor-pointer"
                title={isMuted ? 'Activer le son' : 'Couper le son'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <span className="text-xs font-mono text-zinc-400 bg-zinc-900 px-2 py-1 rounded-lg">
                {currentIndex + 1} / {highlights.length}
              </span>
            </div>
          </div>

          {/* Real-time Progress Scrubber */}
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1 cursor-pointer">
            <div
              className="bg-primary h-full rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>,
    document.body
  );
}
