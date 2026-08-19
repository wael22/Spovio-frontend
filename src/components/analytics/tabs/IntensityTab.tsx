import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Zap, Flame, Battery, Clock, BarChart2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { AnalyticsPlayer } from '../PlayerSelector';
import { CircularGauge } from '../CircularGauge';

interface IntensityTabProps {
  player: AnalyticsPlayer;
}

export function IntensityTab({ player }: IntensityTabProps) {
  const intensityScore = player.performanceScore;

  const { sprintCount, sprintDistance, dynamicAcceleration, shortSprints, longSprints, shortPct, longPct } = useMemo(() => {
    const pId = player.id || 1;
    const distKm = player.distance || 2.4;
    const sprints = Math.round(distKm * 7.5 + (pId % 3));
    const sDistance = Math.round(sprints * 9.2);

    const shortS = Math.round(sprints * 0.78);
    const longS = Math.max(1, sprints - shortS);
    const sPct = Math.round((shortS / sprints) * 100);
    const lPct = 100 - sPct;

    const accData = [
      { time: "0'", acc: 0, dec: 0 },
      { time: "15'", acc: Number((2.4 + (pId * 0.4) % 1.5).toFixed(1)), dec: Number((-1.2 - (pId * 0.3) % 1.2).toFixed(1)) },
      { time: "30'", acc: Number((3.2 + (pId * 0.5) % 1.8).toFixed(1)), dec: Number((-2.0 - (pId * 0.4) % 1.5).toFixed(1)) },
      { time: "45'", acc: Number((2.2 + (pId * 0.3) % 1.4).toFixed(1)), dec: Number((-2.8 - (pId * 0.5) % 1.6).toFixed(1)) },
      { time: "60'", acc: Number((2.9 + (pId * 0.4) % 1.6).toFixed(1)), dec: Number((-1.6 - (pId * 0.3) % 1.3).toFixed(1)) },
      { time: "75'", acc: Number((1.8 + (pId * 0.3) % 1.2).toFixed(1)), dec: Number((-2.1 - (pId * 0.4) % 1.4).toFixed(1)) },
    ];

    return {
      sprintCount: sprints,
      sprintDistance: sDistance,
      dynamicAcceleration: accData,
      shortSprints: shortS,
      longSprints: longS,
      shortPct: sPct,
      longPct: lPct
    };
  }, [player]);

  return (
    <div className="space-y-6">
      {/* Intensity Gauge */}
      <CircularGauge value={intensityScore} label="INTENSITÉ DE JEU" />

      {/* Sprints Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-lg"
      >
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className="font-bold tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            SPRINTS
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-4xl font-bold mb-1" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              {sprintCount}
            </div>
            <div className="text-xs text-muted-foreground">Nombre</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-1" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              {sprintDistance}
            </div>
            <div className="text-xs text-muted-foreground">Distance (m)</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-1" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              {player.maxSpeed}
            </div>
            <div className="text-xs text-muted-foreground">Vitesse Max (km/h)</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-sm font-medium mb-2 text-foreground">
            <BarChart2 className="w-4 h-4 text-primary" />
            <span>Distribution durée sprints :</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">0-2s ({shortSprints} sprints)</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${shortPct}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-cyan-500 rounded-full"
                />
              </div>
              <span className="text-sm font-bold min-w-[35px]">{shortPct}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">2-4s ({longSprints} sprints)</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${longPct}%` }}
                  transition={{ duration: 1, delay: 0.4 }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
              <span className="text-sm font-bold min-w-[35px]">{longPct}%</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Physical Load Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-lg"
      >
        <div className="flex items-center gap-2 mb-4">
          <Battery className="w-5 h-5 text-emerald-500" />
          <h3 className="font-extrabold tracking-wide text-foreground">
            CHARGE PHYSIQUE
          </h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Player Load :</span>
            <span className="text-xl font-bold text-foreground">{((player.distance || 2.4) * 98.5).toFixed(1)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Calories :</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-foreground">{Math.round((player.distance || 2.4) * 215)} kcal</span>
              <Flame className="w-4 h-4 text-primary fill-primary/20" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Temps effectif :</span>
            <span className="text-sm font-bold">{Math.round((player.distance || 2.4) * 18)} min / 85 min</span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-2 text-foreground">
          <Clock className="w-4 h-4 text-primary shrink-0" />
          <p className="text-sm">
            <span className="font-semibold">Récupération recommandée : 36-48h</span>
          </p>
        </div>
      </motion.div>

      {/* Acceleration Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-lg"
      >
        <h3 className="font-extrabold mb-4 tracking-wide text-foreground">
          ACCÉLÉRATION & DÉCÉLÉRATION
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={dynamicAcceleration}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="time" style={{ fontSize: '12px' }} />
            <YAxis domain={[-4, 4]} style={{ fontSize: '12px' }} />
            <Tooltip />
            <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="acc" stroke="#00D98B" strokeWidth={2} name="Accélération" />
            <Line type="monotone" dataKey="dec" stroke="#0066FF" strokeWidth={2} name="Décélération" />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2 text-sm">
          <p>Pic accélération : <span className="font-bold text-emerald-500">3.8 m/s²</span> à 34'12"</p>
          <p>Pic décélération : <span className="font-bold text-primary">-3.2 m/s²</span> à 58'34"</p>
        </div>
      </motion.div>
    </div>
  );
}

