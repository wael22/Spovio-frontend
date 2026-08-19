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
import { videoService } from '@/lib/api';

const mockPlayers: AnalyticsPlayer[] = [
  {
    id: 1,
    name: 'MOEZ (VOUS)',
    team: 'A',
    position: 'FOND DE COURT',
    distance: 2.38,
    maxSpeed: 15.2,
    shots: 138,
    performanceScore: 62
  },
  {
    id: 2,
    name: 'THOMAS',
    team: 'A',
    position: 'MI-COURT',
    distance: 2.20,
    maxSpeed: 14.6,
    shots: 124,
    performanceScore: 58
  },
  {
    id: 3,
    name: 'MAXIME',
    team: 'B',
    position: 'FILET',
    distance: 2.45,
    maxSpeed: 15.8,
    shots: 142,
    performanceScore: 65
  },
  {
    id: 4,
    name: 'ANTOINE',
    team: 'B',
    position: 'FOND DE COURT',
    distance: 2.28,
    maxSpeed: 14.9,
    shots: 130,
    performanceScore: 60
  }
];

export default function MatchAnalytics() {
  const { matchId } = useParams<{ matchId?: string }>();
  const [videoData, setVideoData] = useState<any | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<AnalyticsPlayer>(mockPlayers[0]); // Default to JOUEUR 1 (Current User)
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
    }
  }, [matchId]);

  const playersList = useMemo(() => {
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
    return mockPlayers;
  }, [videoData]);

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
        intensityScore={78}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* 4 Players Horizontal Grid */}
        <PlayerSelector
          players={playersList}
          selectedPlayer={selectedPlayer}
          onSelectPlayer={setSelectedPlayer}
        />

        {/* Active Metric Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            {activeTab === 'position' && <PositionTab player={selectedPlayer} />}
            {activeTab === 'intensity' && <IntensityTab player={selectedPlayer} />}
            {activeTab === 'shots' && <ShotsTab player={selectedPlayer} />}
            {activeTab === 'team' && <TeamTab player={selectedPlayer} />}
            {activeTab === 'summary' && <SummaryTab player={selectedPlayer} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

