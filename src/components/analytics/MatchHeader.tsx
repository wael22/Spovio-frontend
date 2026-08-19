import { ChevronLeft, Activity } from 'lucide-react';

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MetricsTabs, TabType } from '@/components/analytics/MetricsTabs';

interface MatchHeaderProps {
  matchTitle?: string;
  location?: string;
  duration?: string;
  intensityScore?: number;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function MatchHeader({
  matchTitle = "MATCH #1234",
  location = "Court A3 • Club Padel Elite • 28 Jan 2026",
  duration = "1h 24min",
  intensityScore = 78,
  activeTab,
  onTabChange
}: MatchHeaderProps) {
  const navigate = useNavigate();

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border/80 shadow-md pt-2.5 pb-1 px-3 sm:px-8"
    >
      <div className="max-w-7xl mx-auto space-y-2">
        {/* Row 1: Back + Match Title & Details */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button 
              onClick={() => navigate(-1)}
              className="p-1.5 hover:bg-accent hover:text-accent-foreground rounded-full transition-colors cursor-pointer text-foreground shrink-0"
              aria-label="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                <h1 className="font-extrabold text-base sm:text-xl tracking-tight text-foreground truncate">
                  {matchTitle}
                </h1>
              </div>
            </div>

          </div>
        </div>

        {/* Row 2: Statistics Categories Selection Tabs embedded in topbar */}
        <MetricsTabs
          activeTab={activeTab}
          onTabChange={onTabChange}
          embeddedInHeader={true}
        />
      </div>
    </motion.header>
  );
}
