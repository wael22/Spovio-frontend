import React, { useState, useEffect, Fragment } from 'react';
import { motion } from 'framer-motion';
import { Target, Clock, Play, Flame, Zap, Wind, Activity, Trophy, Sparkles, RotateCw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { AnalyticsPlayer } from '../PlayerSelector';
import { MetricCard } from '../MetricCard';
import { MatchHighlightsReel } from '../MatchHighlightsReel';

const shotData = [
  { name: 'Coup droit', value: 58, color: '#0066FF' },
  { name: 'Revers', value: 38, color: '#8B5CF6' },
  { name: 'Volée', value: 22, color: '#00D98B' },
  { name: 'Smash', value: 12, color: '#00F2FE' },
  { name: 'Bandeja & Lob', value: 8, color: '#FBBF24' },
];

const topShots = [
  { id: 1, type: 'Smash Placé au Centre 76 km/h', time: '00:15', icon: Flame, iconColor: 'text-primary' },
  { id: 2, type: 'Volée de Blocage 0.50s', time: '01:05', icon: Zap, iconColor: 'text-cyan-500' },
  { id: 3, type: 'Coup Droit Décroisé 64 km/h', time: '02:20', icon: Target, iconColor: 'text-emerald-500' },
  { id: 4, type: 'Bandeja Profonde 62 km/h', time: '03:50', icon: Wind, iconColor: 'text-primary' },
  { id: 5, type: 'Revers Sortie de Vitre 54 km/h', time: '05:15', icon: Activity, iconColor: 'text-cyan-500' },
];

interface TrajectoryItem {
  id: string;
  name: string;
  category: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  curveOffset?: number;
  color: string;
  speed: string;
  target: string;
  pct: string;
  isDashed?: boolean;
}

interface CategoryMeta {
  id: string;
  label: string;
  trajectories: TrajectoryItem[];
  cards: { title: string; value: string; badge: string; badgeBg: string; badgeText: string }[];
  insight: string;
}

interface TrajectoryConfig {
  name: string;
  category: string;
  color: string;
  isDashed?: boolean;
  minSpeed: number;
  maxSpeed: number;
  target: string;
  sXMin: number;
  sXMax: number;
  sYMin: number;
  sYMax: number;
  eXMin: number;
  eXMax: number;
  eYMin: number;
  eYMax: number;
  cMin: number;
  cMax: number;
}

function generateDiverseShots(
  prefix: string,
  count: number,
  config: TrajectoryConfig,
  seedOffset: number = 1
): TrajectoryItem[] {
  return Array.from({ length: count }, (_, i) => {
    // High-entropy deterministic pseudo-random hash
    const idx = i + 1;
    const h1 = Math.abs((Math.sin(idx * 12.9898 + seedOffset * 17.23) * 43758.5453) % 1);
    const h2 = Math.abs((Math.sin(idx * 78.233 + seedOffset * 31.41) * 43758.5453) % 1);
    const h3 = Math.abs((Math.sin(idx * 45.164 + seedOffset * 53.67) * 43758.5453) % 1);
    const h4 = Math.abs((Math.sin(idx * 91.712 + seedOffset * 7.19) * 43758.5453) % 1);

    const startX = config.sXMin + h1 * (config.sXMax - config.sXMin);
    const startY = config.sYMin + h2 * (config.sYMax - config.sYMin);
    const endX = config.eXMin + h3 * (config.eXMax - config.eXMin);
    const endY = config.eYMin + h4 * (config.eYMax - config.eYMin);
    const curveOffset = config.cMin + h2 * (config.cMax - config.cMin);
    const speed = `${Math.round(config.minSpeed + h3 * (config.maxSpeed - config.minSpeed))} km/h`;

    return {
      id: `${prefix}-${idx}`,
      name: config.name,
      category: config.category,
      startX: Number(startX.toFixed(1)),
      startY: Number(startY.toFixed(1)),
      endX: Number(endX.toFixed(1)),
      endY: Number(endY.toFixed(1)),
      curveOffset: Number(curveOffset.toFixed(1)),
      color: config.color,
      speed,
      target: config.target,
      pct: `${count} coups`,
      isDashed: config.isDashed,
    };
  });
}

// 58 Coups Droits (Diverse Angles & Depths)
const CD_TRAJECTORIES: TrajectoryItem[] = [
  // 1. CD Croisé Fond & Angle Gauche (16)
  ...generateDiverseShots('cd-croise', 16, {
    name: 'Coup droit croisé fond',
    category: 'coup_droit',
    color: '#0066FF',
    minSpeed: 58,
    maxSpeed: 66,
    target: 'Diagonale gauche',
    sXMin: 150,
    sXMax: 218,
    sYMin: 395,
    sYMax: 440,
    eXMin: 30,
    eXMax: 88,
    eYMin: 35,
    eYMax: 135,
    cMin: -35,
    cMax: -10,
  }, 101),

  // 2. CD Centre T & Fixation Plein Axe (18)
  ...generateDiverseShots('cd-centre', 18, {
    name: 'Coup droit au centre T',
    category: 'coup_droit',
    color: '#0284C7',
    minSpeed: 56,
    maxSpeed: 64,
    target: 'Centre T adverse',
    sXMin: 120,
    sXMax: 198,
    sYMin: 385,
    sYMax: 435,
    eXMin: 95,
    eXMax: 155,
    eYMin: 75,
    eYMax: 165,
    cMin: -16,
    cMax: 14,
  }, 202),

  // 3. CD Long de Ligne Droit (10)
  ...generateDiverseShots('cd-ligne', 10, {
    name: 'Coup droit long de ligne',
    category: 'coup_droit',
    color: '#38BDF8',
    minSpeed: 62,
    maxSpeed: 70,
    target: 'Couloir droit profond',
    sXMin: 178,
    sXMax: 224,
    sYMin: 390,
    sYMax: 440,
    eXMin: 175,
    eXMax: 224,
    eYMin: 40,
    eYMax: 130,
    cMin: -6,
    cMax: 18,
  }, 303),

  // 4. CD Sortie de Vitre & Relance (8)
  ...generateDiverseShots('cd-vitre', 8, {
    name: 'Coup droit après vitre',
    category: 'coup_droit',
    color: '#60A5FA',
    minSpeed: 50,
    maxSpeed: 58,
    target: 'Relance sécurisée',
    sXMin: 140,
    sXMax: 215,
    sYMin: 432,
    sYMax: 454,
    eXMin: 70,
    eXMax: 175,
    eYMin: 110,
    eYMax: 185,
    cMin: -22,
    cMax: 22,
    isDashed: true,
  }, 404),

  // 5. CD Mi-Court & Chiquita / Attaque (6)
  ...generateDiverseShots('cd-court', 6, {
    name: 'Coup droit mi-court / Chiquita',
    category: 'coup_droit',
    color: '#818CF8',
    minSpeed: 48,
    maxSpeed: 56,
    target: 'Pieds & angles courts',
    sXMin: 125,
    sXMax: 190,
    sYMin: 320,
    sYMax: 385,
    eXMin: 40,
    eXMax: 145,
    eYMin: 165,
    eYMax: 225,
    cMin: -25,
    cMax: 15,
  }, 505),
];

// 38 Revers (Diverse Angles & Depths - Flipped to Right side)
const REVERS_TRAJECTORIES: TrajectoryItem[] = [
  // 1. Revers Croisé Gauche & Diagonale (14)
  ...generateDiverseShots('rev-croise', 14, {
    name: 'Revers croisé de fond',
    category: 'revers',
    color: '#8B5CF6',
    minSpeed: 52,
    maxSpeed: 60,
    target: 'Diagonale gauche',
    sXMin: 158,
    sXMax: 222,
    sYMin: 395,
    sYMax: 440,
    eXMin: 32,
    eXMax: 108,
    eYMin: 35,
    eYMax: 135,
    cMin: -38,
    cMax: -10,
  }, 606),

  // 2. Revers Centre T & Axe (10)
  ...generateDiverseShots('rev-centre', 10, {
    name: 'Revers au centre T',
    category: 'revers',
    color: '#A855F7',
    minSpeed: 50,
    maxSpeed: 56,
    target: 'Centre T sécurisé',
    sXMin: 130,
    sXMax: 210,
    sYMin: 385,
    sYMax: 435,
    eXMin: 98,
    eXMax: 162,
    eYMin: 80,
    eYMax: 160,
    cMin: -20,
    cMax: 12,
  }, 707),

  // 3. Revers Long de Ligne Droit (5)
  ...generateDiverseShots('rev-ligne', 5, {
    name: 'Revers long de ligne',
    category: 'revers',
    color: '#D8B4FE',
    minSpeed: 54,
    maxSpeed: 62,
    target: 'Couloir droit',
    sXMin: 182,
    sXMax: 226,
    sYMin: 390,
    sYMax: 440,
    eXMin: 182,
    eXMax: 226,
    eYMin: 40,
    eYMax: 130,
    cMin: -8,
    cMax: 15,
  }, 808),

  // 4. Revers Sortie de Vitre Fond (5)
  ...generateDiverseShots('rev-vitre', 5, {
    name: 'Revers après vitre',
    category: 'revers',
    color: '#C084FC',
    minSpeed: 46,
    maxSpeed: 54,
    target: 'Sortie de vitre haute',
    sXMin: 162,
    sXMax: 222,
    sYMin: 430,
    sYMax: 454,
    eXMin: 82,
    eXMax: 175,
    eYMin: 110,
    eYMax: 185,
    cMin: -26,
    cMax: 10,
    isDashed: true,
  }, 909),

  // 5. Revers Mi-Court & Passing (4)
  ...generateDiverseShots('rev-court', 4, {
    name: 'Revers mi-court / Passing',
    category: 'revers',
    color: '#E9D5FF',
    minSpeed: 50,
    maxSpeed: 58,
    target: 'Zone mi-court / grille',
    sXMin: 145,
    sXMax: 215,
    sYMin: 320,
    sYMax: 385,
    eXMin: 45,
    eXMax: 145,
    eYMin: 145,
    eYMax: 220,
    cMin: -32,
    cMax: -6,
  }, 1010),
];

// 22 Volées (Net & Mid-Court Diversity)
const VOLLEY_TRAJECTORIES: TrajectoryItem[] = [
  // 1. Volée Blocage Centre (8)
  ...generateDiverseShots('vol-centre', 8, {
    name: 'Volée de blocage au centre',
    category: 'volley',
    color: '#00D98B',
    minSpeed: 50,
    maxSpeed: 56,
    target: 'Pieds adverses',
    sXMin: 90,
    sXMax: 160,
    sYMin: 248,
    sYMax: 280,
    eXMin: 80,
    eXMax: 168,
    eYMin: 115,
    eYMax: 175,
    cMin: -15,
    cMax: 15,
  }, 1111),

  // 2. Volée Croisée Basse Gauche (5)
  ...generateDiverseShots('vol-gauche', 5, {
    name: 'Volée croisée gauche',
    category: 'volley',
    color: '#10B981',
    minSpeed: 46,
    maxSpeed: 54,
    target: 'Angle fond gauche',
    sXMin: 115,
    sXMax: 178,
    sYMin: 248,
    sYMax: 278,
    eXMin: 28,
    eXMax: 82,
    eYMin: 80,
    eYMax: 150,
    cMin: -30,
    cMax: -10,
  }, 1212),

  // 3. Volée Croisée Basse Droite (4)
  ...generateDiverseShots('vol-droite', 4, {
    name: 'Volée croisée droite',
    category: 'volley',
    color: '#34D399',
    minSpeed: 46,
    maxSpeed: 54,
    target: 'Angle fond droit',
    sXMin: 60,
    sXMax: 125,
    sYMin: 248,
    sYMax: 278,
    eXMin: 150,
    eXMax: 218,
    eYMin: 80,
    eYMax: 150,
    cMin: 10,
    cMax: 30,
  }, 1313),

  // 4. Volée Profonde Vitre Fond (3)
  ...generateDiverseShots('vol-prof', 3, {
    name: 'Volée d’attaque profonde',
    category: 'volley',
    color: '#6EE7B7',
    minSpeed: 54,
    maxSpeed: 62,
    target: 'Double vitre adverse',
    sXMin: 95,
    sXMax: 165,
    sYMin: 245,
    sYMax: 268,
    eXMin: 135,
    eXMax: 212,
    eYMin: 32,
    eYMax: 78,
    cMin: -10,
    cMax: 20,
  }, 1414),

  // 5. Amortie / Chiquita Filet Court (2)
  ...generateDiverseShots('vol-amortie', 2, {
    name: 'Amortie / Chiquita court',
    category: 'volley',
    color: '#A7F3D0',
    minSpeed: 38,
    maxSpeed: 44,
    target: 'Filet court adverse',
    sXMin: 80,
    sXMax: 155,
    sYMin: 248,
    sYMax: 272,
    eXMin: 55,
    eXMax: 185,
    eYMin: 195,
    eYMax: 228,
    cMin: -15,
    cMax: 15,
    isDashed: true,
  }, 1515),
];

// 12 Smashes (Center, Angles & Fences)
const SMASH_TRAJECTORIES: TrajectoryItem[] = [
  // 1. Smash Centre T (5)
  ...generateDiverseShots('smash-t', 5, {
    name: 'Smash placé au centre T',
    category: 'smash',
    color: '#00F2FE',
    minSpeed: 72,
    maxSpeed: 78,
    target: 'Rebond centre T',
    sXMin: 120,
    sXMax: 168,
    sYMin: 268,
    sYMax: 308,
    eXMin: 100,
    eXMax: 148,
    eYMin: 90,
    eYMax: 145,
    cMin: -12,
    cMax: 12,
  }, 1616),

  // 2. Smash Croisé Vitre Gauche (3)
  ...generateDiverseShots('smash-vgauche', 3, {
    name: 'Smash croisé vitre gauche',
    category: 'smash',
    color: '#38BDF8',
    minSpeed: 68,
    maxSpeed: 74,
    target: 'Vitre latérale gauche',
    sXMin: 130,
    sXMax: 178,
    sYMin: 268,
    sYMax: 302,
    eXMin: 24,
    eXMax: 68,
    eYMin: 115,
    eYMax: 175,
    cMin: -32,
    cMax: -10,
  }, 1717),

  // 3. Smash Croisé Vitre Droite (2)
  ...generateDiverseShots('smash-vdroite', 2, {
    name: 'Smash croisé vitre droite',
    category: 'smash',
    color: '#0284C7',
    minSpeed: 68,
    maxSpeed: 74,
    target: 'Vitre latérale droite',
    sXMin: 70,
    sXMax: 128,
    sYMin: 268,
    sYMax: 302,
    eXMin: 178,
    eXMax: 224,
    eYMin: 115,
    eYMax: 175,
    cMin: 10,
    cMax: 32,
  }, 1818),

  // 4. Smash Court Grille (2)
  ...generateDiverseShots('smash-grille', 2, {
    name: 'Smash court grille',
    category: 'smash',
    color: '#F97316',
    minSpeed: 62,
    maxSpeed: 68,
    target: 'Grille latérale courte',
    sXMin: 135,
    sXMax: 178,
    sYMin: 272,
    sYMax: 308,
    eXMin: 20,
    eXMax: 48,
    eYMin: 170,
    eYMax: 218,
    cMin: -36,
    cMax: -14,
  }, 1919),
];

// 8 Bandejas & Lobs (High Arcs & Variations)
const BANDEJA_TRAJECTORIES: TrajectoryItem[] = [
  // 1. Bandeja Haute Centre T (3)
  ...generateDiverseShots('band-t', 3, {
    name: 'Bandeja haute au centre T',
    category: 'bandeja',
    color: '#0ea5e9',
    minSpeed: 58,
    maxSpeed: 64,
    target: 'Fond de court T',
    sXMin: 135,
    sXMax: 185,
    sYMin: 315,
    sYMax: 362,
    eXMin: 100,
    eXMax: 148,
    eYMin: 60,
    eYMax: 115,
    cMin: -15,
    cMax: 15,
  }, 2020),

  // 2. Bandeja Croisée Vitre de Fond (2)
  ...generateDiverseShots('band-vitre', 2, {
    name: 'Bandeja vers vitre latérale',
    category: 'bandeja',
    color: '#38BDF8',
    minSpeed: 54,
    maxSpeed: 60,
    target: 'Vitre latérale gauche',
    sXMin: 145,
    sXMax: 188,
    sYMin: 325,
    sYMax: 368,
    eXMin: 30,
    eXMax: 82,
    eYMin: 42,
    eYMax: 98,
    cMin: -30,
    cMax: -10,
  }, 2121),

  // 3. Lob Défensif Haut Fond Gauche (2)
  ...generateDiverseShots('band-lobg', 2, {
    name: 'Lob haut fond gauche',
    category: 'bandeja',
    color: '#FBBF24',
    minSpeed: 45,
    maxSpeed: 50,
    target: 'Fond de court adverse',
    sXMin: 30,
    sXMax: 88,
    sYMin: 408,
    sYMax: 448,
    eXMin: 125,
    eXMax: 208,
    eYMin: 32,
    eYMax: 78,
    cMin: 20,
    cMax: 46,
    isDashed: true,
  }, 2222),

  // 4. Lob Défensif Haut Fond Droit (1)
  ...generateDiverseShots('band-lobd', 1, {
    name: 'Lob haut fond droit',
    category: 'bandeja',
    color: '#F59E0B',
    minSpeed: 45,
    maxSpeed: 50,
    target: 'Fond de court adverse',
    sXMin: 155,
    sXMax: 215,
    sYMin: 408,
    sYMax: 448,
    eXMin: 40,
    eXMax: 115,
    eYMin: 32,
    eYMax: 78,
    cMin: -46,
    cMax: -20,
    isDashed: true,
  }, 2323),
];

// Total 138 Trajectories
const ALL_MATCH_TRAJECTORIES: TrajectoryItem[] = [
  ...CD_TRAJECTORIES,
  ...REVERS_TRAJECTORIES,
  ...VOLLEY_TRAJECTORIES,
  ...SMASH_TRAJECTORIES,
  ...BANDEJA_TRAJECTORIES,
];

const CATEGORY_MAP: Record<string, CategoryMeta> = {
  all: {
    id: 'all',
    label: 'Toutes les trajectoires (138)',
    trajectories: ALL_MATCH_TRAJECTORIES,
    cards: [
      { title: 'Coups Droits & Revers', value: '96 frappes (70%)', badge: 'Fond de court', badgeBg: 'bg-blue-500/15', badgeText: 'text-blue-500' },
      { title: 'Volées & Filet', value: '22 frappes (16%)', badge: 'Avancée', badgeBg: 'bg-emerald-500/15', badgeText: 'text-emerald-500' },
      { title: 'Smashes & Lobs', value: '20 frappes (14%)', badge: 'Finition & Repli', badgeBg: 'bg-cyan-500/15', badgeText: 'text-cyan-500' },
    ],
    insight: 'Visualisation de l’intégralité des 138 frappes du match : Chaque flèche représente un tir réel avec sa trajectoire, zone d’impact et vitesse.',
  },

  coup_droit: {
    id: 'coup_droit',
    label: 'Coups Droits (58)',
    trajectories: CD_TRAJECTORIES,
    cards: [
      { title: 'Total Coups Droits', value: '58 frappes', badge: '42% du total', badgeBg: 'bg-blue-500/15', badgeText: 'text-blue-500' },
      { title: 'Sécurité Centre T', value: '26 frappes (45%)', badge: 'Régulier', badgeBg: 'bg-emerald-500/15', badgeText: 'text-emerald-500' },
      { title: 'Vitesse Moyenne', value: '62 km/h', badge: 'Contrôlé', badgeBg: 'bg-cyan-500/15', badgeText: 'text-cyan-500' },
    ],
    insight: '58 coups droits tracés : La majorité des tirs sécurisent le centre du terrain (26 frappes) avec 14 accélérations décroisées gagnantes.',
  },

  revers: {
    id: 'revers',
    label: 'Revers (38)',
    trajectories: REVERS_TRAJECTORIES,
    cards: [
      { title: 'Total Revers', value: '38 frappes', badge: '28% du total', badgeBg: 'bg-purple-500/15', badgeText: 'text-purple-500' },
      { title: 'Diagonale Croisée', value: '18 frappes (47%)', badge: 'Solide', badgeBg: 'bg-emerald-500/15', badgeText: 'text-emerald-500' },
      { title: 'Sorties de Vitre', value: '6 remises réussies', badge: 'Patience', badgeBg: 'bg-amber-500/15', badgeText: 'text-amber-500' },
    ],
    insight: '38 revers tracés : 18 diagonales croisées et 11 fixations au T permettant de neutraliser les attaques adverses avec fluidité.',
  },

  volley: {
    id: 'volley',
    label: 'Volées (22)',
    trajectories: VOLLEY_TRAJECTORIES,
    cards: [
      { title: 'Total Volées', value: '22 frappes au filet', badge: '16% du total', badgeBg: 'bg-emerald-500/15', badgeText: 'text-emerald-500' },
      { title: 'Taux de Réussite', value: '18 / 22 cadrées (82%)', badge: 'Précis', badgeBg: 'bg-cyan-500/15', badgeText: 'text-cyan-500' },
      { title: 'Blocage Centre', value: '12 volées au centre', badge: 'Sécurité', badgeBg: 'bg-amber-500/15', badgeText: 'text-amber-500' },
    ],
    insight: '22 volées tracées : 12 blocages au centre très efficaces pour couper les attaques adverses et dicter le rythme au filet.',
  },

  smash: {
    id: 'smash',
    label: 'Smashes (12)',
    trajectories: SMASH_TRAJECTORIES,
    cards: [
      { title: 'Total Smashes', value: '12 frappes', badge: '9% du total', badgeBg: 'bg-cyan-500/15', badgeText: 'text-cyan-500' },
      { title: 'Vitesse Max Smash', value: '76 km/h', badge: 'Efficace', badgeBg: 'bg-emerald-500/15', badgeText: 'text-emerald-500' },
      { title: 'Placement Centre', value: '7 / 12 au centre T', badge: 'Sécurité', badgeBg: 'bg-amber-500/15', badgeText: 'text-amber-500' },
    ],
    insight: '12 smashes tracés : 7 smashes placés au centre T et 3 vers la vitre latérale qui ont permis de conclure le point.',
  },

  bandeja: {
    id: 'bandeja',
    label: 'Bandejas & Lobs (8)',
    trajectories: BANDEJA_TRAJECTORIES,
    cards: [
      { title: 'Total Bandejas & Lobs', value: '8 frappes', badge: '5% du total', badgeBg: 'bg-amber-500/15', badgeText: 'text-amber-500' },
      { title: 'Repli Défensif', value: '100% de replacement', badge: 'Sécurité', badgeBg: 'bg-emerald-500/15', badgeText: 'text-emerald-500' },
      { title: 'Hauteur & Profondeur', value: 'Zone double vitre', badge: 'Contrôle', badgeBg: 'bg-sky-500/15', badgeText: 'text-sky-500' },
    ],
    insight: '8 bandejas et lobs tracés : Frappes hautes et profondes pour forcer les adversaires à reculer et reprendre la position.',
  },
};

interface ShotsTabProps {
  player: AnalyticsPlayer;
}

export function ShotsTab({ player }: ShotsTabProps) {
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

  const isHorizontal = orientation === 'horizontal';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const currentCategoryMeta = CATEGORY_MAP[selectedCategory] || CATEGORY_MAP.all;
  const activeTrajectories = currentCategoryMeta.trajectories;

  return (
    <div className="space-y-6">
      {/* Shot Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card text-card-foreground border border-border rounded-2xl p-4 sm:p-6 shadow-lg"
      >
        <h3 className="font-bold mb-4 text-center tracking-wide text-sm sm:text-base" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          RÉPARTITION DES FRAPPES ({player.shots} total)
        </h3>

        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={shotData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {shotData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        <div className="space-y-2 mt-4">
          {shotData.map((shot, index) => (
            <div key={index} className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: shot.color }} />
                <span>{shot.name}</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-20 sm:w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(shot.value / player.shots) * 100}%` }}
                    transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: shot.color }}
                  />
                </div>
                <span className="text-xs sm:text-sm font-bold min-w-[55px] sm:min-w-[60px] text-right font-mono">
                  {shot.value} ({((shot.value / player.shots) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Speed & Reaction Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <MetricCard
          icon={<Target className="w-5 h-5 text-primary" />}
          label="Vitesse"
          value="92 km/h"
          subValue="Moyenne"
          badge={{ text: '125 km/h', label: 'Max (Smash)' }}
          color="cyan"
        />
        <MetricCard
          icon={<Clock className="w-5 h-5 text-emerald-500" />}
          label="Réaction"
          value="0.68 s"
          subValue="Moyenne"
          badge={{ text: '0.42 s', label: 'Min' }}
          color="emerald"
        />
      </div>

      {/* Trajectories & Target Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card text-card-foreground border border-border rounded-2xl p-4 sm:p-6 shadow-lg space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary shrink-0" />
            <h3 className="font-bold tracking-wide text-foreground text-xs sm:text-base" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              TRAJECTOIRES & CIBLES ADVERSES
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setOrientation(prev => prev === 'horizontal' ? 'vertical' : 'horizontal')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/60 hover:bg-muted text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors border border-border/60 cursor-pointer"
              title="Changer l'orientation"
            >
              <RotateCw size={12} className="text-primary" />
              <span className="hidden sm:inline">{isHorizontal ? 'Vue Verticale' : 'Vue Horizontale'}</span>
            </button>
            <span className="text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Vecteurs de tir
            </span>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-1">
          {[
            { id: 'all', label: 'Toutes les trajectoires' },
            { id: 'coup_droit', label: 'Coups Droits (58)' },
            { id: 'revers', label: 'Revers (38)' },
            { id: 'volley', label: 'Volées (22)' },
            { id: 'smash', label: 'Smashes (12)' },
            { id: 'bandeja', label: 'Bandejas & Lobs (8)' },
          ].map((tab) => {
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Padel Court Directional Trajectory Map SVG */}
        <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-b from-card to-muted/20 border border-border/70 p-2.5 sm:p-4 flex flex-col items-center justify-center">
          <svg
            viewBox={isHorizontal ? "0 0 476 250" : "0 0 250 476"}
            preserveAspectRatio="xMidYMid meet"
            className={
              isHorizontal
                ? "w-full max-w-[620px] md:max-w-[700px] lg:max-w-[760px] h-auto drop-shadow-2xl select-none"
                : "w-full max-w-[320px] xs:max-w-[360px] sm:max-w-[420px] h-auto max-h-[540px] drop-shadow-2xl select-none"
            }
            style={{ willChange: 'transform', transform: 'translateZ(0)' }}
            aria-label="Padel Court Trajectory and Directional Target Map"
          >
            <defs>
              {/* Shared lightweight arrowheads (1 per color instead of 138 individual markers) */}
              {['#0066FF', '#8B5CF6', '#00D98B', '#00F2FE', '#FBBF24', '#EF4444', '#F59E0B', '#38BDF8'].map((c) => (
                <marker
                  key={`arrow-${c}`}
                  id={`arrow-${c.replace('#', '')}`}
                  viewBox="0 0 8 8"
                  refX="5"
                  refY="4"
                  markerWidth="4.5"
                  markerHeight="4.5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 6 4 L 0 6.5 z" fill={c} />
                </marker>
              ))}

              {/* Blue turf gradient */}
              <linearGradient id="trajTurf" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284C7" />
                <stop offset="100%" stopColor="#0369A1" />
              </linearGradient>

              {/* Court grid pattern */}
              <pattern id="trajGrid" x="18" y="18" width="21.4" height="22" patternUnits="userSpaceOnUse">
                <path d="M 21.4 0 L 0 0 0 22" fill="none" stroke="#FFFFFF" strokeWidth="0.3" strokeOpacity="0.15" />
              </pattern>

              {/* Court boundary clip */}
              <clipPath id="trajCourtClip">
                <rect x="18" y="18" width="214" height="440" rx="4" />
              </clipPath>

              {/* Vignette */}
              <radialGradient id="trajVig" cx="50%" cy="50%" r="65%">
                <stop offset="60%" stopColor="#000000" stopOpacity="0" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
              </radialGradient>
            </defs>

            {/* Transformation for horizontal mode */}
            <g transform={isHorizontal ? "translate(238, 125) rotate(-90) translate(-125, -238)" : undefined}>
              {/* Court Surface */}
              <rect x="18" y="18" width="214" height="440" fill="url(#trajTurf)" rx="4" />
              <rect x="18" y="18" width="214" height="440" fill="url(#trajGrid)" rx="4" />

              {/* Glass Wall Border */}
              <rect
                x="16"
                y="16"
                width="218"
                height="444"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="1.5"
                strokeOpacity="0.5"
                rx="6"
              />

              {/* ── Court Lines ─────────────────────────────────────── */}
              {/* Perimeter */}
              <rect x="18" y="18" width="214" height="440" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.85" rx="3" />

              {/* Top Service Line (Opponent) */}
              <line x1="18" y1="85" x2="232" y2="85" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.85" />

              {/* Top Center Service Divider */}
              <line x1="125" y1="85" x2="125" y2="238" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.85" />

              {/* Net Band */}
              <rect x="14" y="236" width="222" height="4" fill="#E2E8F0" rx="1.5" />
              <line x1="14" y1="238" x2="236" y2="238" stroke="#0284C7" strokeWidth="1" strokeDasharray="3 2" />

              {/* Bottom Service Line (Player) */}
              <line x1="18" y1="391" x2="232" y2="391" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.85" />

              {/* Bottom Center Service Divider */}
              <line x1="125" y1="238" x2="125" y2="391" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.85" />

              {/* ── Trajectory Vectors & Impact Target Rings with Clean Lightweight Vector Nodes ──────────────── */}
              <g clipPath="url(#trajCourtClip)">
                {activeTrajectories.map((traj) => {
                  const midX = (traj.startX + traj.endX) / 2 + (traj.curveOffset || 0);
                  const midY = (traj.startY + traj.endY) / 2;
                  const isDense = activeTrajectories.length > 30;
                  const colorKey = traj.color.replace('#', '');

                  if (isDense) {
                    // Optimized single-pass rendering for full 138-shot view
                    return (
                      <g key={traj.id}>
                        <path
                          d={`M ${traj.startX} ${traj.startY} Q ${midX} ${midY} ${traj.endX} ${traj.endY}`}
                          fill="none"
                          stroke={traj.color}
                          strokeWidth={1.2}
                          strokeDasharray={traj.isDashed ? '3 2' : 'none'}
                          markerEnd={`url(#arrow-${colorKey})`}
                          opacity={0.88}
                        />
                        <circle cx={traj.startX} cy={traj.startY} r={1.8} fill={traj.color} stroke="#FFFFFF" strokeWidth="0.5" />
                        <circle cx={traj.endX} cy={traj.endY} r={2.0} fill="#FFFFFF" stroke={traj.color} strokeWidth="0.8" />
                      </g>
                    );
                  }

                  // Rich multi-halo rendering for filtered categories (<= 38 shots)
                  return (
                    <g key={traj.id} className="transition-all duration-300">
                      {/* Delicate Halo Trail */}
                      <path
                        d={`M ${traj.startX} ${traj.startY} Q ${midX} ${midY} ${traj.endX} ${traj.endY}`}
                        fill="none"
                        stroke={traj.color}
                        strokeWidth={3.8}
                        strokeLinecap="round"
                        opacity={0.25}
                      />

                      {/* Foreground Vector */}
                      <path
                        d={`M ${traj.startX} ${traj.startY} Q ${midX} ${midY} ${traj.endX} ${traj.endY}`}
                        fill="none"
                        stroke={traj.color}
                        strokeWidth={1.65}
                        strokeDasharray={traj.isDashed ? '3 2' : 'none'}
                        markerEnd={`url(#arrow-${colorKey})`}
                        opacity={0.95}
                      />

                      {/* Origin Strike Point */}
                      <circle cx={traj.startX} cy={traj.startY} r={4.5} fill={traj.color} fillOpacity="0.22" />
                      <circle cx={traj.startX} cy={traj.startY} r={2.2} fill={traj.color} stroke="#FFFFFF" strokeWidth="0.7" />

                      {/* Target Landing Impact Ring */}
                      <circle cx={traj.endX} cy={traj.endY} r={5.2} fill={traj.color} fillOpacity="0.18" />
                      <circle cx={traj.endX} cy={traj.endY} r={3.4} fill="none" stroke={traj.color} strokeWidth="0.9" strokeDasharray="1.5 1" />
                      <circle cx={traj.endX} cy={traj.endY} r={1.6} fill="#FFFFFF" />
                    </g>
                  );
                })}
              </g>

              {/* Vignette */}
              <rect x="18" y="18" width="214" height="440" fill="url(#trajVig)" rx="4" />
            </g>
          </svg>

          {/* Active Trajectories Legend List (Grouped cleanly) */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-3 pt-3 border-t border-border/50 w-full">
            {selectedCategory === 'all' ? (
              [
                { name: 'Coups Droits (58)', count: '58 tirs', color: '#0066FF', speed: '62 km/h' },
                { name: 'Revers (38)', count: '38 tirs', color: '#8B5CF6', speed: '54 km/h' },
                { name: 'Volées (22)', count: '22 tirs', color: '#00D98B', speed: '52 km/h' },
                { name: 'Smashes (12)', count: '12 tirs', color: '#00F2FE', speed: '74 km/h' },
                { name: 'Bandejas & Lobs (8)', count: '8 tirs', color: '#FBBF24', speed: '58 km/h' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs font-mono bg-muted/40 px-2.5 py-1 rounded-lg border border-border/40 shadow-2xs">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold text-foreground">{item.name}</span>
                  <span className="text-[10px] text-muted-foreground">({item.speed} moy.)</span>
                </div>
              ))
            ) : (
              // Unique direction groups for selected category
              Array.from(new Set(activeTrajectories.map((t) => t.name))).map((uniqueName, idx) => {
                const matching = activeTrajectories.filter((t) => t.name === uniqueName);
                const sample = matching[0];
                return (
                  <div key={idx} className="flex items-center gap-1.5 text-xs font-mono bg-muted/40 px-2.5 py-1 rounded-lg border border-border/40 shadow-2xs">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sample.color }} />
                    <span className="font-semibold text-foreground">{uniqueName}</span>
                    <span className="text-[10px] text-muted-foreground">({sample.speed})</span>
                  </div>
                );
              })
            )}
          </div>

          {/* Dynamic Trajectory Details Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-border/50 w-full">
            {currentCategoryMeta.cards.map((c, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-muted-foreground font-mono block">{c.title}</span>
                  <span className="text-xs font-bold text-foreground">{c.value}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${c.badgeBg} ${c.badgeText}`}>
                  {c.badge}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Tactical Insight */}
        <div className="p-3 sm:p-3.5 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-cyan-500/15 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-foreground shadow-xs">
          <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 animate-pulse" />
          <p className="text-xs sm:text-sm font-medium">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Analyse IA :</span> {currentCategoryMeta.insight}
          </p>
        </div>
      </motion.div>

      {/* Match Highlights / Shorts Carousel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <MatchHighlightsReel player={player} />
      </motion.div>
    </div>
  );
}

