import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MatchHeader } from '@/components/analytics/MatchHeader';
import { PlayerSelector, AnalyticsPlayer } from '@/components/analytics/PlayerSelector';
import { MetricsTabs, TabType } from '@/components/analytics/MetricsTabs';
import { PositionTab } from '@/components/analytics/tabs/PositionTab';
import { IntensityTab } from '@/components/analytics/tabs/IntensityTab';
import { ShotsTab } from '@/components/analytics/tabs/ShotsTab';
import { TeamTab } from '@/components/analytics/tabs/TeamTab';
import { SummaryTab } from '@/components/analytics/tabs/SummaryTab';
import { useParams } from 'react-router-dom';
import { videoService, matchAnalyticsService } from '@/lib/api';

const getInitialPlayers = (mId: string | number = 1): AnalyticsPlayer[] => {
  const seed = Number(mId) || 1;
  return [
    {
      id: 1,
      name: 'MOEZ (VOUS)',
      team: 'A',
      position: 'FOND DE COURT',
      distance: Number((2.8 + (seed * 0.3) % 1.5).toFixed(2)),
      maxSpeed: Number((16.2 + (seed * 0.4) % 3.0).toFixed(1)),
      shots: Math.round(145 + (seed * 7) % 30),
      performanceScore: Math.round(68 + (seed * 3) % 20)
    },
    {
      id: 2,
      name: 'THOMAS',
      team: 'A',
      position: 'MI-COURT',
      distance: Number((2.6 + (seed * 0.2) % 1.4).toFixed(2)),
      maxSpeed: Number((15.4 + (seed * 0.3) % 2.5).toFixed(1)),
      shots: Math.round(135 + (seed * 5) % 28),
      performanceScore: Math.round(64 + (seed * 4) % 18)
    },
    {
      id: 3,
      name: 'MAXIME',
      team: 'B',
      position: 'FILET',
      distance: Number((3.0 + (seed * 0.4) % 1.6).toFixed(2)),
      maxSpeed: Number((17.0 + (seed * 0.5) % 3.2).toFixed(1)),
      shots: Math.round(152 + (seed * 6) % 32),
      performanceScore: Math.round(72 + (seed * 5) % 19)
    },
    {
      id: 4,
      name: 'ANTOINE',
      team: 'B',
      position: 'FOND DE COURT',
      distance: Number((2.7 + (seed * 0.3) % 1.3).toFixed(2)),
      maxSpeed: Number((15.8 + (seed * 0.4) % 2.8).toFixed(1)),
      shots: Math.round(140 + (seed * 4) % 26),
      performanceScore: Math.round(66 + (seed * 3) % 17)
    }
  ];
};

export default function MatchAnalytics() {
  const { matchId } = useParams<{ matchId?: string }>();
  const [videoData, setVideoData] = useState<any | null>(null);
  const [matchAnalyticsData, setMatchAnalyticsData] = useState<any | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<TabType>('position');

  useEffect(() => {
    if (matchId) {
      videoService.getVideo(matchId)
        .then((res) => {
          if (res.data) {
            setVideoData(res.data.video || res.data);
          }
        })
        .catch((err) => {
          console.warn("Could not fetch video details for analytics:", err);
        });

      matchAnalyticsService.getMatchAnalytics(matchId)
        .then((res) => {
          if (res.data?.analytics) {
            setMatchAnalyticsData(res.data);
          }
        })
        .catch((err) => {
          console.warn("Could not fetch dynamic match analytics:", err);
        });
    }
  }, [matchId]);

  const playersList = useMemo(() => {
    // If we have dynamic player stats from DB
    if (matchAnalyticsData?.players && Array.isArray(matchAnalyticsData.players) && matchAnalyticsData.players.length >= 4) {
      return matchAnalyticsData.players.map((p: any, idx: number) => {
        const mov = p.movement_data || {};
        const shots = p.shots_data || {};
        const pos = p.position_data || {};
        return {
          id: p.player_slot || idx + 1,
          name: (p.player_name || `Joueur ${idx + 1}`).toUpperCase(),
          team: idx < 2 ? 'A' : 'B',
          position: pos.net_presence_pct > 50 ? 'FILET' : 'FOND DE COURT',
          distance: mov.distance_km || 2.35,
          maxSpeed: mov.max_speed_kmh || 15.4,
          shots: shots.total_shots || 135,
          performanceScore: p.overall_score || 75
        } as AnalyticsPlayer;
      });
    }

    if (videoData?.match_players) {
      try {
        const parsed = typeof videoData.match_players === "string"
          ? JSON.parse(videoData.match_players)
          : videoData.match_players;
        if (parsed.players && Array.isArray(parsed.players)) {
          return mockPlayers.map((p, idx) => {
            const matchP = parsed.players[idx];
            return {
              ...p,
              name: (matchP?.player_name || matchP?.name || p.name).toUpperCase()
            };
          });
        }
      } catch (e) {
        console.warn("Error parsing match_players in analytics:", e);
      }
    }
    return getInitialPlayers(matchId);
  }, [videoData, matchAnalyticsData, matchId]);

  // Always bind activePlayer to the live playersList
  const activePlayer = useMemo(() => {
    return playersList.find(p => p.id === selectedPlayerId) || playersList[0] || getInitialPlayers(matchId)[0];
  }, [playersList, selectedPlayerId, matchId]);

  // Derived Header Fields
  const matchTitle = videoData?.title || (matchId ? `MATCH #${matchId}` : "MATCH #1234");
  const courtName = videoData?.court_name || videoData?.court?.name || "Court A3";
  const clubName = videoData?.club_name || videoData?.court?.club?.name || "Club Padel Elite";
  const rawDate = videoData?.recorded_at || videoData?.created_at;
  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
    : "28 Jan 2026";

  const locationStr = `${courtName} • ${clubName} • ${formattedDate}`;

  const rawDuration = videoData?.duration;
  const formattedDuration = rawDuration && rawDuration > 0
    ? Math.floor(rawDuration / 3600) > 0
      ? `${Math.floor(rawDuration / 3600)}h ${Math.floor((rawDuration % 3600) / 60)}min`
      : `${Math.floor(rawDuration / 60)}min`
    : "1h 24min";

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 sm:pt-28 pb-12">

      <MatchHeader 
        matchTitle={matchTitle} 
        location={locationStr}
        duration={formattedDuration}
        intensityScore={activePlayer.performanceScore || 78}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* 4 Players Horizontal Grid */}
        <PlayerSelector
          players={playersList}
          selectedPlayer={activePlayer}
          onSelectPlayer={(p) => setSelectedPlayerId(p.id)}
        />

        {/* Active Metric Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${activePlayer.id}-${matchId}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            {activeTab === 'position' && <PositionTab player={activePlayer} />}
            {activeTab === 'intensity' && <IntensityTab player={activePlayer} />}
            {activeTab === 'shots' && <ShotsTab player={activePlayer} />}
            {activeTab === 'team' && <TeamTab player={activePlayer} />}
            {activeTab === 'summary' && <SummaryTab player={activePlayer} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

