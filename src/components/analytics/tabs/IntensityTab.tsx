import { motion } from 'framer-motion';
import { Zap, Flame, Battery, Clock, BarChart2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { AnalyticsPlayer } from '../PlayerSelector';
import { CircularGauge } from '../CircularGauge';

const accelerationData = [
  { time: "0'", acc: 0, dec: 0 },
  { time: "15'", acc: 2.8, dec: -1.5 },
  { time: "30'", acc: 3.8, dec: -2.2 },
  { time: "45'", acc: 2.5, dec: -3.2 },
  { time: "60'", acc: 3.2, dec: -1.8 },
  { time: "75'", acc: 2.0, dec: -2.5 },
];

interface IntensityTabProps {
  player: AnalyticsPlayer;
}

export function IntensityTab({ player }: IntensityTabProps) {
  const intensityScore = player.performanceScore;

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
              18
            </div>
            <div className="text-xs text-muted-foreground">Nombre</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-1" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              165
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
            <span className="text-sm">0-2s (14 sprints)</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '78%' }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-cyan-500 rounded-full"
                />
              </div>
              <span className="text-sm font-bold min-w-[35px]">78%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">2-4s (4 sprints)</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '22%' }}
                  transition={{ duration: 1, delay: 0.4 }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
              <span className="text-sm font-bold min-w-[35px]">22%</span>
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
            <span className="text-xl font-bold text-foreground">245.6</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Calories :</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-foreground">520 kcal</span>
              <Flame className="w-4 h-4 text-primary fill-primary/20" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Temps effectif :</span>
            <span className="text-sm font-bold">45.3 min / 85 min (53.2%)</span>
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
          <LineChart data={accelerationData}>
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

