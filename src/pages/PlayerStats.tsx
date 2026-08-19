import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Target,
  BarChart3,
  CheckCircle2,
  Clock,
  MapPin,
  Play,
  Sparkles,
  Zap,
  Search,
  X,
  Video,
  ChevronDown,
  Check,
  MoreVertical
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { videoService, matchAnalyticsService, getAssetUrl, getVideoThumbnailUrl } from '@/lib/api';
import { VideoPlayerModal } from '@/components/dashboard/VideoPlayerModal';
import heroCourtImg from '@/assets/hero-padel-court.jpg';

// ─── 10 Last Matches Progression Dataset ────────────────────────────────────
type MetricKey = 'score' | 'maxSpeed' | 'netPresence' | 'shots' | 'coverage';

interface MetricConfig {
  id: MetricKey;
  label: string;
  unit: string;
  yDomain: [number, number];
  ticks: number[];
  trendText: string;
}

const EVOLUTION_DATA = [
  { match: 'M1', score: 45, maxSpeed: 15.8, netPresence: 25, shots: 110, coverage: 58 },
  { match: 'M2', score: 52, maxSpeed: 16.2, netPresence: 28, shots: 125, coverage: 60 },
  { match: 'M3', score: 58, maxSpeed: 16.8, netPresence: 32, shots: 132, coverage: 62 },
  { match: 'M4', score: 63, maxSpeed: 17.1, netPresence: 36, shots: 140, coverage: 65 },
  { match: 'M5', score: 61, maxSpeed: 17.0, netPresence: 34, shots: 135, coverage: 64 },
  { match: 'M6', score: 68, maxSpeed: 17.5, netPresence: 40, shots: 148, coverage: 66 },
  { match: 'M7', score: 72, maxSpeed: 17.8, netPresence: 42, shots: 152, coverage: 68 },
  { match: 'M8', score: 75, maxSpeed: 18.0, netPresence: 44, shots: 156, coverage: 69 },
  { match: 'M9', score: 78, maxSpeed: 18.2, netPresence: 46, shots: 160, coverage: 70 },
  { match: 'M10', score: 82, maxSpeed: 18.5, netPresence: 48, shots: 165, coverage: 72 },
];

interface MatchItem {
  id: string;
  title: string;
  court_name: string;
  dateStr: string;
  durationStr: string;
  scorePct: number;
  isLatest?: boolean;
  thumbnail_url?: string;
}

const DEMO_MATCHES: MatchItem[] = [
  {
    id: '600',
    title: 'Padel Match',
    court_name: 'COURT 1',
    dateStr: 'Aug 13',
    durationStr: '22:42',
    scorePct: 78,
    isLatest: true,
    thumbnail_url: heroCourtImg,
  },
  {
    id: '109',
    title: 'Match Demi-Finale',
    court_name: 'Court A2 • Club Padel Elite',
    dateStr: '02 Fév',
    durationStr: '1h 18min',
    scorePct: 74,
    thumbnail_url: heroCourtImg,
  },
  {
    id: '108',
    title: 'Padel Elite Cup - T3',
    court_name: 'Court B1 • Padel Club',
    dateStr: '30 Jan',
    durationStr: '1h 24min',
    scorePct: 75,
    thumbnail_url: heroCourtImg,
  },
  {
    id: '107',
    title: 'Match Amical Double',
    court_name: 'Court Central',
    dateStr: '27 Jan',
    durationStr: '58min',
    scorePct: 71,
    thumbnail_url: heroCourtImg,
  },
  {
    id: '106',
    title: 'Tournoi Open Hiver',
    court_name: 'Court 3 • Club Elite',
    dateStr: '24 Jan',
    durationStr: '1h 32min',
    scorePct: 72,
    thumbnail_url: heroCourtImg,
  },
];

export default function PlayerStats() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const METRICS: MetricConfig[] = [
    {
      id: 'score',
      label: t('components.playerStats.metricScore', 'Overall Score'),
      unit: '/100',
      yDomain: [0, 100],
      ticks: [0, 25, 50, 75, 100],
      trendText: t('components.playerStats.trendScore', 'Trend: +18% over the last month'),
    },
    {
      id: 'maxSpeed',
      label: t('components.playerStats.metricMaxSpeed', 'Top Speed'),
      unit: 'km/h',
      yDomain: [10, 25],
      ticks: [10, 15, 20, 25],
      trendText: t('components.playerStats.trendMaxSpeed', 'Trend: +2.7 km/h top speed'),
    },
    {
      id: 'netPresence',
      label: t('components.playerStats.metricNetPresence', 'Net Play'),
      unit: '%',
      yDomain: [0, 100],
      ticks: [0, 25, 50, 75, 100],
      trendText: t('components.playerStats.trendNetPresence', 'Trend: +23% offensive net presence'),
    },
    {
      id: 'shots',
      label: t('components.playerStats.metricShots', 'Shot Volume'),
      unit: t('components.playerStats.unitCoups', 'shots'),
      yDomain: [80, 200],
      ticks: [80, 110, 140, 170, 200],
      trendText: t('components.playerStats.trendShots', 'Trend: +55 shots / match on average'),
    },
    {
      id: 'coverage',
      label: t('components.playerStats.metricCoverage', 'Court Coverage'),
      unit: '%',
      yDomain: [0, 100],
      ticks: [0, 25, 50, 75, 100],
      trendText: t('components.playerStats.trendCoverage', 'Trend: +14% court surface covered'),
    },
  ];

  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('score');
  const currentMetric = METRICS.find(m => m.id === selectedMetric) || METRICS[0];

  const [searchQuery, setSearchQuery] = useState('');
  const [matchesList, setMatchesList] = useState<MatchItem[]>(DEMO_MATCHES);
  const [selectedMatch, setSelectedMatch] = useState<MatchItem>(DEMO_MATCHES[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [evolutionData, setEvolutionData] = useState<any[]>(EVOLUTION_DATA);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch dynamic evolution data
    matchAnalyticsService.getPlayerEvolution()
      .then((res) => {
        if (res.data?.evolution && Array.isArray(res.data.evolution) && res.data.evolution.length > 0) {
          setEvolutionData(res.data.evolution);
        }
      })
      .catch((err) => {
        console.error("Failed to load player evolution:", err);
      });
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  const [videoData, setVideoData] = useState<any | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  useEffect(() => {
    videoService.getMyVideos()
      .then((res) => {
        if (res.data?.videos && Array.isArray(res.data.videos) && res.data.videos.length > 0) {
          const apiMatches: MatchItem[] = res.data.videos.map((v: any, idx: number) => ({
            id: String(v.id),
            title: v.title || `Match #${v.id}`,
            court_name: v.court_name || v.court?.name || 'Court 1',
            dateStr: v.recorded_at || v.created_at
              ? new Date(v.recorded_at || v.created_at).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' })
              : (i18n.language === 'fr' ? '13 août' : 'Aug 13'),
            durationStr: v.duration ? `${Math.floor(v.duration / 60)}:${(v.duration % 60).toString().padStart(2, '0')}` : '22:42',
            scorePct: 70 + (idx * 3) % 15,
            isLatest: idx === 0,
            thumbnail_url: getVideoThumbnailUrl(v, heroCourtImg),
          }));

          setMatchesList(apiMatches);
          setSelectedMatch(apiMatches[0]);
        }
      })
      .catch(() => {});

    videoService.getVideo('600')
      .then((res) => {
        if (res.data) {
          const v = res.data.video || res.data;
          setVideoData(v);
          const thumb = getVideoThumbnailUrl(v, heroCourtImg);
          setMatchesList((prev) =>
            prev.map((m) => (m.id === '600' ? { ...m, thumbnail_url: thumb, court_name: v.court_name || v.court?.name || m.court_name } : m))
          );
          setSelectedMatch((prev) => (prev.id === '600' ? { ...prev, thumbnail_url: thumb } : prev));
        }
      })
      .catch(() => {
        setVideoData({
          id: '600',
          title: 'Padel Match',
          court_name: 'COURT 1',
          created_at: '2026-08-13T10:00:00Z',
          duration: 1362,
          thumbnail_url: heroCourtImg,
        });
      });
  }, []);

  const filteredMatches = matchesList.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      m.id.toLowerCase().includes(q) ||
      m.title.toLowerCase().includes(q) ||
      m.court_name.toLowerCase().includes(q) ||
      m.dateStr.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6">
      <div ref={searchRef} className="relative z-30">
        <div className="rounded-2xl p-3.5 sm:p-4 bg-card border border-border/80 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                placeholder={t('components.playerStats.searchPlaceholder', 'Search a match (e.g. #600, Court 1)...')}
                className="w-full h-11 pl-10 pr-20 rounded-xl bg-muted/40 border border-border/70 text-foreground placeholder:text-muted-foreground text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <Search size={16} />
              </div>

              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/70 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/70 transition-colors cursor-pointer"
                >
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-primary' : ''}`}
                  />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
                {t('components.playerStats.selectedMatch', 'Selected match:')}
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/25 text-primary text-xs font-mono font-bold">
                <Video size={13} />
                <span>#{selectedMatch.id} • {selectedMatch.title}</span>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute top-full left-0 right-0 mt-1.5 bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-lg max-h-56 overflow-y-auto p-1 z-40"
            >
              {filteredMatches.map((m) => {
                const isSelected = selectedMatch.id === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedMatch(m);
                      setIsDropdownOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-muted-foreground font-semibold">#{m.id}</span>
                      <span className="font-medium text-foreground truncate">{m.title}</span>
                      <span className="text-[11px] text-muted-foreground font-mono truncate">
                        • {m.court_name} ({m.dateStr})
                      </span>
                      {m.isLatest && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-500 shrink-0">
                          {t('components.playerStats.latest', 'Latest')}
                        </span>
                      )}
                    </div>
                    {isSelected && <Check size={14} className="text-primary shrink-0 ml-2" />}
                  </button>
                );
              })}

              {filteredMatches.length === 0 && (
                <div className="py-3 text-center text-xs text-muted-foreground font-mono">
                  {t('components.playerStats.noMatchFound', 'No match found')}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-6 flex flex-col">
          <div className="rounded-2xl overflow-hidden bg-card border border-border/80 shadow-sm flex flex-col h-full group">
            <div className="px-4 py-2.5 bg-muted/30 border-b border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-primary" />
                <span className="text-xs uppercase font-mono font-bold tracking-wider text-foreground">
                  {selectedMatch.isLatest
                    ? t('components.playerStats.latestRecordedMatch', 'LATEST RECORDED MATCH')
                    : t('components.playerStats.selectedMatchBadge', 'SELECTED MATCH')}
                </span>
              </div>
              <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500 border border-emerald-500/25">
                Match #{selectedMatch.id}
              </span>
            </div>

            <div className="relative aspect-video w-full overflow-hidden bg-muted">
              <img
                src={selectedMatch.thumbnail_url || (videoData ? getVideoThumbnailUrl(videoData, heroCourtImg) : heroCourtImg)}
                alt={selectedMatch.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = heroCourtImg;
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent pointer-events-none" />

              <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                {selectedMatch.isLatest && (
                  <Badge className="bg-primary text-primary-foreground text-[10px] font-mono font-extrabold uppercase tracking-wide shadow-md">
                    {t('components.playerStats.latestMatchBadge', 'Latest Match')}
                  </Badge>
                )}
                <Badge className="bg-emerald-600/90 text-white text-[11px] font-semibold flex items-center gap-1 shadow-md border border-emerald-400/30">
                  <Sparkles size={12} className="animate-pulse" />
                  <span>{t('components.playerStats.aiReady', 'AI Ready')}</span>
                </Badge>
              </div>

              <button
                onClick={() => setIsPlayerOpen(true)}
                className="absolute inset-0 flex items-center justify-center cursor-pointer group/btn"
                aria-label="Play video"
              >
                <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-transform duration-200 group-hover/btn:scale-110 shadow-lg">
                  <Play size={20} className="fill-current ml-0.5 text-primary" />
                </div>
              </button>

              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-white text-xs font-mono font-medium">
                <Clock size={12} className="text-white/80" />
                <span>{selectedMatch.durationStr || '22:42'}</span>
              </div>
            </div>

            <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 gap-4">
              <div>
                <h3 className="font-bold text-base sm:text-lg text-foreground">
                  {selectedMatch.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-muted-foreground font-mono mt-1">
                  <span>{selectedMatch.dateStr}</span>
                  <div className="flex items-center gap-1">
                    <MapPin size={13} className="text-primary" />
                    <span>{selectedMatch.court_name}</span>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => navigate(`/analytics/${selectedMatch.id}`)}
                className="w-full gap-2 bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-cyan-500/15 hover:from-emerald-500/25 hover:via-teal-500/25 hover:to-cyan-500/25 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-semibold text-xs rounded-xl shadow-xs transition-all duration-200 hover:scale-[1.01] h-10 cursor-pointer"
              >
                <BarChart3 className="h-4 w-4" />
                <span>{t('components.playerStats.viewAiAnalytics', 'View AI Match Analytics')}</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="md:col-span-6 flex flex-col">
          <div className="rounded-2xl p-5 sm:p-6 bg-card border border-border/80 shadow-sm flex flex-col justify-between h-full gap-4">
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-primary" />
                  <span className="text-xs uppercase font-mono font-bold tracking-widest text-muted-foreground">
                    {t('components.playerStats.nextMatchObjectives', 'NEXT MATCH OBJECTIVES')}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-primary font-semibold">
                  {t('components.playerStats.targetedGamePlan', 'Targeted Game Plan')}
                </span>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl p-3 bg-muted/20 border border-border/60 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-foreground">
                      {t('components.playerStats.obj1Title', 'Increase top speed (+2 km/h)')}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/15 text-amber-500 shrink-0">
                      {t('components.playerStats.obj1Tag', 'Physical')}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div className="bg-primary h-full rounded-full w-[65%]" />
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono flex justify-between">
                    <span>{t('components.playerStats.obj1Current', 'Current: 18.5 km/h')}</span>
                    <span>{t('components.playerStats.obj1Target', 'Target: 20.5 km/h')}</span>
                  </div>
                </div>

                <div className="rounded-xl p-3 bg-muted/20 border border-border/60 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-foreground">
                      {t('components.playerStats.obj2Title', 'Consistency on Bandejas & Viboras')}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-500/15 text-blue-500 shrink-0">
                      {t('components.playerStats.obj2Tag', 'Maintain')}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full w-[80%]" />
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono flex justify-between">
                    <span>{t('components.playerStats.obj2Current', 'Current: 80%')}</span>
                    <span>{t('components.playerStats.obj2Target', 'Target: 85%')}</span>
                  </div>
                </div>

                <div className="rounded-xl p-3 bg-muted/20 border border-border/60 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-foreground">
                      {t('components.playerStats.obj3Title', 'Service return consistency (<3 errors)')}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-500 shrink-0">
                      {t('components.playerStats.obj3Tag', 'Tactical')}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full w-[50%]" />
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono flex justify-between">
                    <span>{t('components.playerStats.obj3Current', 'Current: 4 errors/set')}</span>
                    <span>{t('components.playerStats.obj3Target', 'Target: <3')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5 pt-1">
              <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
              <span>{t('components.playerStats.objectivesSummary', '2/3 objectives validated during last match')}</span>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="bg-card text-card-foreground border border-border rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold tracking-wide text-foreground text-sm sm:text-base" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {t('components.playerStats.progressionTitle', 'PROGRESSION OVER LAST 10 MATCHES')}
          </h3>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-1 sm:pb-0">
            {METRICS.map((m) => {
              const isActive = selectedMetric === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMetric(m.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70'
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full h-60 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evolutionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="match" style={{ fontSize: '12px' }} />
              <YAxis
                domain={currentMetric.yDomain}
                ticks={currentMetric.ticks}
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                formatter={(value: any) => [`${value} ${currentMetric.unit}`, currentMetric.label]}
                labelFormatter={(label) => `${t('components.playerStats.match', 'Match')} ${label}`}
              />
              <Line
                type="monotone"
                dataKey={selectedMetric}
                stroke="#0066FF"
                strokeWidth={3}
                dot={{ fill: '#0066FF', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500 shrink-0" />
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {currentMetric.trendText}
            </p>
          </div>
        </div>
      </motion.div>

      {videoData && (
        <VideoPlayerModal
          isOpen={isPlayerOpen}
          onClose={() => setIsPlayerOpen(false)}
          video={videoData}
        />
      )}
    </div>
  );
}
