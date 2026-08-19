import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Activity, Compass, Target, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { AnalyticsPlayer } from '../PlayerSelector';
import { MetricCard } from '../MetricCard';
import { Heatmap } from '../Heatmap';

interface PositionTabProps {
  player: AnalyticsPlayer;
}

export function PositionTab({ player }: PositionTabProps) {
  const { matchId } = useParams<{ matchId?: string }>();

  const { timelineData, surfaceCoverage, netDistance, highlightText } = useMemo(() => {
    const posUpper = (player?.position || 'FOND DE COURT').toUpperCase();
    const isNet = posUpper.includes('FILET') || posUpper.includes('NET');
    const isMid = posUpper.includes('MI-COURT') || posUpper.includes('MID');

    const baseZone = isNet ? 2.2 : isMid ? 1.5 : 0.8;
    const pId = player?.id || 1;

    const timeline = [
      { time: "0'", zone: Number(Math.max(0.2, Math.min(2.8, baseZone + ((pId * 3) % 7 - 3) * 0.15)).toFixed(1)) },
      { time: "15'", zone: Number(Math.max(0.2, Math.min(2.8, baseZone + ((pId * 5) % 7 - 2) * 0.2)).toFixed(1)) },
      { time: "30'", zone: Number(Math.max(0.2, Math.min(2.8, baseZone + ((pId * 2) % 7 - 4) * 0.18)).toFixed(1)) },
      { time: "45'", zone: Number(Math.max(0.2, Math.min(2.8, baseZone + ((pId * 4) % 7 - 1) * 0.22)).toFixed(1)) },
      { time: "60'", zone: Number(Math.max(0.2, Math.min(2.8, baseZone + ((pId * 6) % 7 - 3) * 0.19)).toFixed(1)) },
      { time: "75'", zone: Number(Math.max(0.2, Math.min(2.8, baseZone + ((pId * 1) % 7 - 2) * 0.25)).toFixed(1)) },
    ];

    const surface = (70 + (pId * 3.7) % 15).toFixed(1);
    const distNet = isNet ? "3.8 m" : isMid ? "5.4 m" : "7.6 m";
    
    let highlight = "Vous avez maintenu une position de fond de court solide tout au long du match";
    if (isNet) {
      highlight = "Forte présence offensive au filet avec plus de 65% de transitions rapides";
    } else if (isMid) {
      highlight = "Excellente couverture en zone de transition et bandejas régulières";
    }

    return {
      timelineData: timeline,
      surfaceCoverage: `${surface}%`,
      netDistance: distNet,
      highlightText: highlight,
    };
  }, [player, matchId]);

  return (
    <div className="space-y-6">
      {/* Heatmap Card Component */}
      <Heatmap player={player} />

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          icon={<Activity className="w-5 h-5 text-primary" />}
          label="Distance"
          value={`${player.distance} km`}
          subValue="Totale"
          badge={{ text: '+12% vs avg', trend: 'up' }}
          color="cyan"
        />
        <MetricCard
          icon={<TrendingUp className="w-5 h-5 text-primary" />}
          label="Vitesse"
          value={`${player.maxSpeed} km/h`}
          subValue="Max"
          badge={{ text: '4.2 km/h', label: 'Moyenne' }}
          color="cyan"
        />
        <MetricCard
          icon={<Compass className="w-5 h-5 text-emerald-500" />}
          label="Surface"
          value={surfaceCoverage}
          subValue="Couverte"
          badge={{ text: 'Top 20%', trend: 'trophy' }}
          color="emerald"
        />
        <MetricCard
          icon={<Target className="w-5 h-5 text-emerald-500" />}
          label="Distance"
          value={netDistance}
          subValue="au Filet"
          badge={{ text: 'Optimal', trend: 'check' }}
          color="emerald"
        />
      </div>

      {/* Position Evolution Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-lg"
      >
        <h3 className="font-extrabold mb-4 tracking-wide text-foreground">
          ÉVOLUTION POSITION (Timeline)
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={timelineData}>
            <defs>
              <linearGradient id="positionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00D98B" stopOpacity={0.8}/>
                <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.5}/>
                <stop offset="100%" stopColor="#0066FF" stopOpacity={0.3}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="time" style={{ fontSize: '12px' }} />
            <YAxis domain={[0, 3]} ticks={[0, 1, 2, 3]} tickFormatter={(value) => ['Fond', 'Mi-ct', 'Filet'][value] || ''} style={{ fontSize: '12px' }} />
            <Tooltip />
            <Area type="monotone" dataKey="zone" stroke="#0066FF" strokeWidth={2} fill="url(#positionGradient)" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-2 text-foreground">
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <p className="text-sm">
            <span className="font-medium">{highlightText}</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

