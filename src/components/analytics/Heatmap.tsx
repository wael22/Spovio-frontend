import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crosshair, BarChart3, Activity, Layers, RotateCw } from 'lucide-react';
import type { AnalyticsPlayer } from './PlayerSelector';

interface HeatmapProps {
  player?: AnalyticsPlayer;
}

// ─── Court SVG geometry ──────────────────────────────────────────────────────
const VBW = 250;
const VBH = 476;
const M = 18;
const CW = VBW - M * 2;   // 214 — court width
const CH = VBH - M * 2;   // 440 — court height

const NET_Y = M + CH / 2;     // 238 — net center
const SVC_T = M + CH * 0.152; // ~85 — top service line
const SVC_B = M + CH * 0.848; // ~391 — bottom service line
const MID_X = VBW / 2;        // 125 — centerline X

type Blob = { x: number; y: number; r: number; i: number };

function C(pct: number): number {
  return M + CH * pct;
}

function heatColor(i: number): string {
  if (i >= 0.82) return "#EF4444"; // Vivid Red - Peak Hotspot
  if (i >= 0.62) return "#F97316"; // Bright Orange - High Intensity
  if (i >= 0.42) return "#FBBF24"; // Warm Amber/Gold
  if (i >= 0.25) return "#10B981"; // Emerald
  if (i >= 0.12) return "#06B6D4"; // Cyan
  return "#38BDF8"; // Sky Blue
}

function heatAlpha(i: number): number {
  return Math.min(0.98, 0.38 + i * 0.62);
}

type BallLanding = {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
};

// Seeded PRNG for consistent, realistic match & player generation
function createSeededRandom(seedStr: string) {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = Math.imul(31, hash) + seedStr.charCodeAt(i) | 0;
  }
  let s = hash >>> 0;
  return function random() {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Generate dynamic Heatmap blobs based on matchId, playerId, and player profile
function generatePlayerHeatmap(seed: string, position?: string): {
  blobs: Blob[];
  ballLandings: BallLanding[];
  zones: { label: string; pct: number; color: string; delta: string }[];
  coveragePct: number;
  netRatio: number;
  baselineRatio: number;
} {
  const rng = createSeededRandom(seed);
  const posUpper = (position || 'DROITE').toUpperCase();
  const isNetPlayer = posUpper.includes('FILET') || posUpper.includes('NET');
  const isMidPlayer = posUpper.includes('MI-COURT') || posUpper.includes('MID');
  const isLeftPlayer = posUpper.includes('GAUCHE') || posUpper.includes('LEFT');

  // Realistic padel anchor: right-side player (Joueur de droite) centered at +46px from midline
  const sideX = isLeftPlayer ? (MID_X - 46 + (rng() - 0.5) * 8) : (MID_X + 46 + (rng() - 0.5) * 8);

  const blobs: Blob[] = [];

  if (isNetPlayer) {
    blobs.push(
      // Primary net attacking core on player's side
      { x: sideX, y: C(0.58 + rng() * 0.04), r: 42 + rng() * 6, i: 1.0 },
      { x: sideX + 15, y: C(0.57 + rng() * 0.04), r: 36, i: 0.92 },
      { x: sideX - 15, y: C(0.60 + rng() * 0.04), r: 34, i: 0.88 },
      { x: sideX, y: C(0.62), r: 52, i: 0.82 },
      // Mid court transition
      { x: sideX - 8, y: C(0.72 + rng() * 0.04), r: 42, i: 0.65 },
      { x: sideX, y: C(0.76), r: 36, i: 0.48 },
      // Baseline recovery
      { x: sideX, y: C(0.88 + rng() * 0.03), r: 32, i: 0.35 },
    );
  } else if (isMidPlayer) {
    blobs.push(
      // Dominant mid-court anchor
      { x: sideX, y: C(0.74 + rng() * 0.04), r: 46 + rng() * 6, i: 1.0 },
      { x: sideX + 16, y: C(0.76 + rng() * 0.04), r: 38, i: 0.92 },
      { x: sideX - 14, y: C(0.72 + rng() * 0.04), r: 36, i: 0.86 },
      { x: sideX, y: C(0.75), r: 58, i: 0.82 },
      // Net rushes
      { x: sideX, y: C(0.60 + rng() * 0.04), r: 38, i: 0.65 },
      // Baseline
      { x: sideX, y: C(0.88 + rng() * 0.03), r: 38, i: 0.58 },
    );
  } else {
    // Dominant baseline player (Right backcourt / Joueur de droite)
    blobs.push(
      // Intense core hotspot in right backcourt (corner & glass defense)
      { x: sideX + 6, y: C(0.86 + rng() * 0.02), r: 44 + rng() * 5, i: 1.0 },
      { x: sideX + 18, y: C(0.85 + rng() * 0.02), r: 36 + rng() * 4, i: 0.95 },
      { x: sideX - 12, y: C(0.87 + rng() * 0.02), r: 34 + rng() * 4, i: 0.90 },
      { x: sideX + 4, y: C(0.84), r: 58 + rng() * 6, i: 0.85 },
      { x: sideX + 26, y: C(0.88), r: 32, i: 0.80 },
      // Mid-court bandejas & transitions
      { x: sideX - 6, y: C(0.74 + rng() * 0.03), r: 45, i: 0.68 },
      { x: sideX + 14, y: C(0.72 + rng() * 0.03), r: 38, i: 0.62 },
      { x: sideX - 22, y: C(0.76), r: 32, i: 0.52 },
      // Net volley presence on right side
      { x: sideX - 4, y: C(0.59 + rng() * 0.03), r: 36, i: 0.42 },
      { x: sideX + 16, y: C(0.58), r: 28, i: 0.35 },
    );
  }

  // Generate well-distributed opponent ball landings with minimum distance separation
  // Generate exactly 138 ball landings distributed realistically across opponent court
  const ballLandings: BallLanding[] = [];

  // Exact 138 hits breakdown matching beginner match performance:
  // 1. Rebond au sol (Service boxes & deep backcourt): 68 hits (~49%)
  // 2. Retour direct (Mid-court & net transition zone): 48 hits (~35%)
  // 3. Balle au filet (Struck net tape): 14 hits (~10%)
  // 4. Directe vitre (Glass perimeter impacts): 8 hits (~6%)
  // Total = 68 + 48 + 14 + 8 = 138 impacts
  const zoneAllocations = [
    { type: 'vitre', minY: M + 2, maxY: M + 8, baseColor: '#F59E0B', targetCount: 8, minSep: 5.5 },
    { type: 'rebond', minY: M + 24, maxY: M + 130, baseColor: '#38BDF8', targetCount: 68, minSep: 4.5 },
    { type: 'direct', minY: M + 128, maxY: M + 215, baseColor: '#10B981', targetCount: 48, minSep: 4.5 },
    { type: 'filet', minY: NET_Y - 4, maxY: NET_Y + 2, baseColor: '#EF4444', targetCount: 14, minSep: 5.5 },
  ];

  let idCounter = 1;
  for (const zone of zoneAllocations) {
    let placed = 0;
    let attempts = 0;
    let currentSep = zone.minSep;

    while (placed < zone.targetCount) {
      attempts++;
      if (attempts > 300 && currentSep > 2.0) {
        currentSep -= 0.5; // Relax separation if dense
        attempts = 0;
      }

      let xVal: number;
      let yVal: number;

      if (zone.type === 'vitre') {
        // Place along back glass or side glass
        if (rng() > 0.4) {
          yVal = zone.minY + rng() * (zone.maxY - zone.minY);
          xVal = M + 10 + rng() * (CW - 20);
        } else {
          yVal = M + 8 + rng() * 60;
          xVal = rng() > 0.5 ? M + 2 + rng() * 5 : M + CW - 7 + rng() * 5;
        }
      } else if (zone.type === 'filet') {
        yVal = zone.minY + rng() * (zone.maxY - zone.minY);
        xVal = M + 12 + rng() * (CW - 24);
      } else {
        yVal = zone.minY + rng() * (zone.maxY - zone.minY);
        xVal = M + 14 + rng() * (CW - 28);
      }

      // Check distance
      const tooClose = ballLandings.some((b) => {
        const dx = b.x - xVal;
        const dy = b.y - yVal;
        return Math.sqrt(dx * dx + dy * dy) < currentSep;
      });

      if (!tooClose || attempts > 250) {
        const color = zone.baseColor;
        const size = 1.6 + rng() * 0.7; // Compact radius so 138 points remain crisp & readable
        ballLandings.push({
          id: idCounter++,
          x: Math.round(xVal),
          y: Math.round(yVal),
          color,
          size: Number(size.toFixed(1)),
        });
        placed++;
      }
    }
  }

  // Exact percentages for 138 hits
  const rebondPct = 49;
  const directPct = 35;
  const filetPct = 10;
  const vitrePct = 6;

  const d1 = (rng() * 4 - 2).toFixed(1);
  const d2 = (rng() * 4 - 2).toFixed(1);
  const d3 = (rng() * 4 - 2).toFixed(1);
  const d4 = (rng() * 4 - 2).toFixed(1);

  const zones = [
    { label: "Rebond au sol", pct: rebondPct, color: "#38BDF8", delta: `${Number(d1) >= 0 ? '+' : ''}${d1}%` },
    { label: "Retour direct", pct: directPct, color: "#10B981", delta: `${Number(d2) >= 0 ? '+' : ''}${d2}%` },
    { label: "Balle au filet", pct: filetPct, color: "#EF4444", delta: `${Number(d3) >= 0 ? '+' : ''}${d3}%` },
    { label: "Directe vitre", pct: vitrePct, color: "#F59E0B", delta: `${Number(d4) >= 0 ? '+' : ''}${d4}%` },
  ];

  const inPlayRatio = rebondPct + directPct;
  const faultRatio = 100 - inPlayRatio;
  const coveragePct = Number((62 + rng() * 18).toFixed(1));

  return {
    blobs,
    ballLandings,
    zones,
    coveragePct,
    netRatio: faultRatio,
    baselineRatio: inPlayRatio,
  };
}

interface CourtSVGProps {
  orientation: 'vertical' | 'horizontal';
  blobs: Blob[];
  ballLandings: BallLanding[];
}

// ─── Court SVG ───────────────────────────────────────────────────────────────
function CourtSVG({ orientation, blobs, ballLandings }: CourtSVGProps) {
  const isHorizontal = orientation === 'horizontal';

  return (
    <svg
      viewBox={isHorizontal ? "0 0 476 250" : "0 0 250 476"}
      preserveAspectRatio="xMidYMid meet"
      className={
        isHorizontal
          ? "w-full max-w-[560px] md:max-w-[620px] lg:max-w-[680px] h-auto drop-shadow-xl select-none"
          : "w-full max-w-[300px] xs:max-w-[340px] sm:max-w-[400px] h-auto max-h-[520px] drop-shadow-xl select-none"
      }
      aria-label="Padel court position heatmap and opponent ball landing impacts"
    >
      <defs>
        <filter id="hblur" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="10" />
        </filter>

        <linearGradient id="padelturf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>

        <pattern id="cgrid" x={M} y={M} width="21.4" height="22" patternUnits="userSpaceOnUse">
          <path d="M 21.4 0 L 0 0 0 22" fill="none" stroke="#FFFFFF" strokeWidth="0.3" strokeOpacity="0.15" />
        </pattern>

        <clipPath id="courtClip">
          <rect x={M} y={M} width={CW} height={CH} rx="4" />
        </clipPath>

        <linearGradient id="netglow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="25%" stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="75%" stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {blobs.map((b, i) => (
          <radialGradient key={i} id={`rg${i}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={heatColor(b.i)} stopOpacity={heatAlpha(b.i)} />
            <stop offset="42%" stopColor={heatColor(b.i)} stopOpacity={heatAlpha(b.i) * 0.68} />
            <stop offset="78%" stopColor={heatColor(b.i)} stopOpacity={heatAlpha(b.i) * 0.20} />
            <stop offset="100%" stopColor={heatColor(b.i)} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>

      <g transform={isHorizontal ? "translate(238, 125) rotate(-90) translate(-125, -238)" : undefined}>
        {/* Vibrant Blue Padel Turf Surface */}
        <rect x={M} y={M} width={CW} height={CH} fill="url(#padelturf)" rx="4" />
        <rect x={M} y={M} width={CW} height={CH} fill="url(#cgrid)" rx="4" />

        {/* Heatmap Blobs (Strictly clipped inside Court Turf Boundaries) */}
        <g clipPath="url(#courtClip)" filter="url(#hblur)">
          {blobs.map((b, i) => (
            <ellipse key={i} cx={b.x} cy={b.y} rx={b.r} ry={b.r * 0.85} fill={`url(#rg${i})`} />
          ))}
        </g>

        {/* Crisp White Court Lines */}
        <rect x={M} y={M} width={CW} height={CH} fill="none" stroke="#FFFFFF" strokeWidth="2.2" rx="4" />
        <rect x={M + 4} y={M + 4} width={CW - 8} height={CH - 8} fill="none" stroke="#FFFFFF" strokeWidth="0.7" strokeOpacity="0.30" />

        {/* Service lines */}
        <line x1={M} y1={SVC_T} x2={M + CW} y2={SVC_T} stroke="#FFFFFF" strokeWidth="1.6" strokeOpacity="0.9" />
        <line x1={M} y1={SVC_B} x2={M + CW} y2={SVC_B} stroke="#FFFFFF" strokeWidth="1.6" strokeOpacity="0.9" />

        {/* Center line */}
        <line x1={MID_X} y1={SVC_T} x2={MID_X} y2={SVC_B} stroke="#FFFFFF" strokeWidth="1.6" strokeOpacity="0.9" />

        {/* Net */}
        <rect x={M} y={NET_Y - 4} width={CW} height={8} fill="url(#netglow)" />
        <line x1={M} y1={NET_Y} x2={M + CW} y2={NET_Y} stroke="#FFFFFF" strokeWidth="2.6" />
        <rect x={M - 2.5} y={NET_Y - 6} width={5.5} height={12} rx="1.5" fill="#FFFFFF" />
        <rect x={M + CW - 3} y={NET_Y - 6} width={5.5} height={12} rx="1.5" fill="#FFFFFF" />

        {/* ── Layer: Ball Landing Points (OPPONENT SIDE ONLY) ────────────────── */}
        <g id="ball-landings-opponent-side">
          {ballLandings.map((b) => (
            <g key={`ball-${b.id}`}>
              {/* Outer ring */}
              <circle
                cx={b.x}
                cy={b.y}
                r={b.size * 2}
                fill="none"
                stroke={b.color}
                strokeWidth="0.8"
                opacity="0.7"
              />
              {/* Inner solid landing point */}
              <circle
                cx={b.x}
                cy={b.y}
                r={b.size}
                fill={b.color}
              />
              {/* Center bright core */}
              <circle
                cx={b.x}
                cy={b.y}
                r={b.size * 0.4}
                fill="#FFFFFF"
              />
            </g>
          ))}
        </g>

        {/* Vignette */}
        <rect x={M} y={M} width={CW} height={CH} fill="url(#vig)" rx="4" />
      </g>
    </svg>
  );
}

export function Heatmap({ player }: HeatmapProps) {
  const { matchId } = useParams<{ matchId?: string }>();
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      return 'horizontal';
    }
    return 'vertical';
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setOrientation('horizontal');
      } else {
        setOrientation('vertical');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute seeded dynamic heatmap & stats for this player & match
  const heatmapData = useMemo(() => {
    const seed = `${matchId || 'demo-match'}_${player?.id || 1}_${player?.name || 'player'}_${player?.position || ''}`;
    return generatePlayerHeatmap(seed, player?.position);
  }, [matchId, player?.id, player?.name, player?.position]);

  const speedVal = player?.maxSpeed ? `${player.maxSpeed}` : "18.5";
  const shotsVal = player?.shots ? `${player.shots}` : "156";
  const perfVal = player?.performanceScore ? `${player.performanceScore}` : "72";

  const quickStats = [
    { label: "Frappes", value: shotsVal, unit: "" },
    { label: "Couverture", value: `${heatmapData.coveragePct}`, unit: "%" },
    { label: "Vitesse Max", value: speedVal, unit: "km/h" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Court Heatmap & Metrics Layout */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left: Seamless Court Heatmap Card & Quick Stats */}
        <section className="flex-1 flex flex-col justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crosshair size={14} className="text-primary" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono font-semibold">
                Heatmap Terrain
              </span>
            </div>

            {/* Orientation Toggle Button */}
            <button
              onClick={() => setOrientation(prev => prev === 'vertical' ? 'horizontal' : 'vertical')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50 hover:bg-muted text-xs font-mono font-medium border border-border/60 text-foreground transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <RotateCw size={13} className="text-primary" />
              <span>{orientation === 'vertical' ? 'Vertical ↕' : 'Horizontal ↔'}</span>
            </button>
          </div>

          {/* Court SVG - Scalable Mobile Size */}
          <div className="flex flex-col items-center justify-center flex-1 py-1 gap-3 w-full">
            <CourtSVG
              orientation={orientation}
              blobs={heatmapData.blobs}
              ballLandings={heatmapData.ballLandings}
            />

            {/* Ball Impacts Legend */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 py-2 px-3 sm:px-4 rounded-xl text-[11px] sm:text-xs font-mono text-muted-foreground bg-muted/20 border border-border/30 w-full max-w-xl">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981]" />
                <span className="font-medium text-foreground">Retour direct (48)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] shadow-[0_0_6px_#38BDF8]" />
                <span className="font-medium text-foreground">Rebond au sol (68)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shadow-[0_0_6px_#EF4444]" />
                <span className="font-medium text-foreground">Balle au filet (14)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shadow-[0_0_6px_#F59E0B]" />
                <span className="font-medium text-foreground">Directe vitre (8)</span>
              </div>
            </div>
          </div>


          {/* Quick Stat Tiles */}
          <div className="grid grid-cols-3 gap-2.5">
            {quickStats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-3 bg-card/60 border border-border/60 text-center shadow-sm"
              >
                <div className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 truncate">
                  {s.label}
                </div>
                <div className="text-sm sm:text-base font-extrabold text-foreground font-mono">
                  {s.value}
                  {s.unit && (
                    <span className="text-[9px] font-normal text-muted-foreground ml-0.5">
                      {s.unit}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right: Metrics Panel */}
        <aside className="lg:w-80 p-4 sm:p-5 flex flex-col gap-4 rounded-2xl bg-card/60 border border-border/60 shadow-sm">
          {/* 4 Impact States Breakdown */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <BarChart3 size={14} className="text-primary" />
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono font-semibold">
                Statut des Frappes %
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {heatmapData.zones.map((z) => (
                <div key={z.label} className="flex flex-col gap-1">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-muted-foreground text-[11px]">{z.label}</span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold font-mono text-xs" style={{ color: z.color }}>
                        {z.pct}%
                      </span>
                      <span className="text-[10px] text-muted-foreground/70">{z.delta}</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${z.pct}%`,
                        backgroundColor: z.color,
                        boxShadow: `0 0 8px ${z.color}88`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px w-full bg-border/50" />

          {/* Valid Shots vs Direct Faults Ratio */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono font-semibold">
                Balles Valides vs Fautes
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                {heatmapData.baselineRatio}% valides
              </span>
            </div>
            <div className="flex h-2.5 w-full rounded-full overflow-hidden gap-0.5">
              <div
                style={{
                  width: `${heatmapData.baselineRatio}%`,
                  backgroundColor: "#10B981",
                  boxShadow: "0 0 8px #10B98166",
                  borderRadius: "4px 0 0 4px",
                }}
              />
              <div
                style={{
                  width: `${heatmapData.netRatio}%`,
                  backgroundColor: "#EF4444",
                  boxShadow: "0 0 8px #EF444466",
                  borderRadius: "0 4px 4px 0",
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono">
              <div className="flex flex-col">
                <span className="font-bold text-emerald-500">{heatmapData.baselineRatio}%</span>
                <span className="text-muted-foreground">Balles en jeu</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-bold text-red-500">{heatmapData.netRatio}%</span>
                <span className="text-muted-foreground">Fautes directes</span>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-border/50" />

          {/* Color Density Legend */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Layers size={13} className="text-primary" />
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono font-semibold">
                Échelle d'Intensité
              </span>
            </div>
            <div
              className="h-2.5 w-full rounded-full"
              style={{
                background: "linear-gradient(to right, rgba(56,189,248,0.3) 0%, #38BDF8 20%, #10B981 45%, #84CC16 70%, #F97316 85%, #EF4444 100%)",
              }}
            />
            <div className="flex justify-between text-[10px] font-mono">
              <div className="flex flex-col items-start">
                <span className="text-[#38BDF8] font-bold">Faible</span>
                <span className="text-muted-foreground/70">&lt;20%</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-emerald-500 font-bold">Moyen</span>
                <span className="text-muted-foreground/70">20–60%</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-red-500 font-bold">Max</span>
                <span className="text-muted-foreground/70">&gt;60%</span>
              </div>
            </div>

          </div>

          <div className="h-px w-full bg-border/50" />

          {/* Performance Index Callout */}
          <div className="rounded-xl p-3.5 bg-primary/5 border border-primary/20 flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-0.5">
              <Activity size={13} className="text-primary" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono font-semibold">
                Score de Performance
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-primary drop-shadow-[0_0_12px_hsl(var(--primary)/0.5)]">
                {perfVal}%
              </span>
              <span className="text-xs text-muted-foreground">/ 100%</span>
            </div>
            <div className="text-[10px] text-muted-foreground">
              ↑ 4.2 pts supérieur à la moyenne
            </div>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}




