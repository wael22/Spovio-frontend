import { motion } from 'framer-motion';
import { MapPin, Navigation, Zap, Target, Lock, UserCheck } from 'lucide-react';

export interface AnalyticsPlayer {
  id: number;
  name: string;
  team: 'A' | 'B';
  position: string;
  distance: number;
  maxSpeed: number;
  shots: number;
  performanceScore: number;
  isUser?: boolean;
}

interface PlayerSelectorProps {
  players: AnalyticsPlayer[];
  selectedPlayer: AnalyticsPlayer;
  onSelectPlayer: (player: AnalyticsPlayer) => void;
}

export function PlayerSelector({ players, selectedPlayer, onSelectPlayer }: PlayerSelectorProps) {
  return (
    <div className="mt-2.5 sm:mt-0 py-1">

      {/* Mobile: Horizontal Snap Scroll (< sm) | PC: Spacious 2x2 Grid (>= sm) */}
      <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden gap-2.5 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:pb-0 sm:overflow-visible">

        {players.map((player, index) => {
          const isUser = player.id === 1 || player.isUser || index === 0;
          const isSelected = selectedPlayer.id === player.id;
          const isTeamA = player.team === 'A';

          return (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              onClick={() => {
                if (isUser) onSelectPlayer(player);
              }}
              className={`w-[68vw] max-w-[220px] shrink-0 snap-center sm:w-auto sm:max-w-none relative overflow-hidden rounded-xl sm:rounded-xl p-2.5 sm:p-3 text-left transition-all border ${
                isSelected
                  ? 'bg-card border-2 border-primary shadow-md shadow-primary/10 z-10 cursor-pointer'
                  : !isUser
                  ? 'bg-card/50 backdrop-blur-sm border-border/40 opacity-65 cursor-not-allowed'
                  : 'bg-card/70 backdrop-blur-md border-border/80 hover:border-primary/50 cursor-pointer'
              }`}
            >
              {/* Header: Name + Badge / Lock */}
              <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                <div className="flex items-center gap-1.5 truncate pr-1">
                  {isUser && (
                    <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
                  )}
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wide text-foreground truncate">
                    {player.name}
                  </span>
                </div>
                
                {!isUser ? (
                  <div className="flex items-center gap-1 bg-muted/60 text-muted-foreground px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold border border-border/50 shrink-0">
                    <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span>Privé</span>
                  </div>
                ) : (
                  <div className="bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold shrink-0">
                    VOUS
                  </div>
                )}
              </div>

              {/* Position */}
              <div className="flex items-center gap-1 mb-1.5 sm:mb-1.5 text-[10px] sm:text-xs text-muted-foreground">
                <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0 text-muted-foreground" />
                <span className="truncate">{player.position}</span>
              </div>

              {/* Stats - Compact 3-column row */}
              <div className="grid grid-cols-3 gap-0.5 sm:gap-1 mb-1.5 sm:mb-2 text-center bg-muted/30 p-1 sm:p-1.5 rounded-lg sm:rounded-lg border border-border/40">
                <div>
                  <div className="flex items-center justify-center gap-0.5 mb-0.5">
                    <Navigation className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-500" />
                  </div>
                  <div className="text-xs sm:text-base font-extrabold leading-none text-foreground">
                    {player.distance}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">km</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-0.5 mb-0.5">
                    <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" />
                  </div>
                  <div className="text-xs sm:text-base font-extrabold leading-none text-foreground">
                    {player.maxSpeed}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">km/h</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-0.5 mb-0.5">
                    <Target className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-500" />
                  </div>
                  <div className="text-xs sm:text-base font-extrabold leading-none text-foreground">
                    {player.shots}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">frappes</div>
                </div>
              </div>

              {/* Performance Score Bar */}
              <div className="bg-muted/40 rounded-lg sm:rounded-lg p-1 sm:p-1.5">
                <div className="flex items-center justify-between mb-0.5 text-[9px] sm:text-[10px]">
                  <span className="text-muted-foreground font-medium">Performance</span>
                  <span className="font-bold text-foreground">{player.performanceScore}%</span>
                </div>
                <div className="w-full h-1 sm:h-1 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${player.performanceScore}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                  />
                </div>
              </div>
            </motion.div>

          );
        })}
      </div>
    </div>
  );
}





