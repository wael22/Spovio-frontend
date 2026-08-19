import { motion } from 'framer-motion';
import { Users, Ruler, BarChart2, Sparkles, User, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { AnalyticsPlayer } from '../PlayerSelector';

const distanceData = [
  { time: "0'", distance: 6.5 },
  { time: "15'", distance: 5.8 },
  { time: "30'", distance: 8.2 },
  { time: "45'", distance: 5.5 },
  { time: "60'", distance: 6.8 },
  { time: "75'", distance: 5.2 },
];

interface TeamTabProps {
  player: AnalyticsPlayer;
}

export function TeamTab({ player }: TeamTabProps) {
  const syncScore = 58;

  return (
    <div className="space-y-6">
      {/* Coordination Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-lg"
      >
        <h3 className="font-bold mb-6 text-center tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          COORDINATION AVEC PARTENAIRE
        </h3>

        <div className="flex justify-center mb-6">
          <div className="relative w-40 h-40">
            <svg className="transform -rotate-90 w-40 h-40">
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-muted/30"
              />
              <motion.circle
                cx="80"
                cy="80"
                r="60"
                fill="none"
                stroke="#00D98B"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 60}
                initial={{ strokeDashoffset: 2 * Math.PI * 60 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 60 - (syncScore / 100) * 2 * Math.PI * 60 }}
                transition={{ duration: 2, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-5xl font-bold text-[#00D98B]"
                style={{ fontFamily: 'Bebas Neue, sans-serif' }}
              >
                {syncScore}
              </motion.div>
              <div className="text-sm text-muted-foreground">Score Sync / 100</div>
            </div>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-primary" />
              <span>Distance moyenne :</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">6.4 m</span>
              <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full font-medium border border-amber-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> En progression
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-primary" />
              <span>Temps formation défensive (fond) :</span>
            </div>
            <span className="font-bold">74%</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-cyan-500" />
              <span>Temps formation offensive (filet) :</span>
            </div>
            <span className="font-bold">26%</span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-2 text-foreground">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-sm font-medium">Conseil Partenaire : Montez ensemble au filet après un bon lob pour couvrir l’espace central.</p>
        </div>
      </motion.div>

      {/* Distance Between Partners */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-lg"
      >
        <h3 className="font-bold mb-4 tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          DISTANCE ENTRE PARTENAIRES (Temps réel)
        </h3>
        
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={distanceData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="time" style={{ fontSize: '12px' }} />
            <YAxis domain={[0, 10]} style={{ fontSize: '12px' }} label={{ value: 'm', position: 'insideLeft' }} />
            <Tooltip />
            <ReferenceLine y={5} stroke="#00D98B" strokeDasharray="3 3" strokeWidth={2} label="Min Optimal" />
            <ReferenceLine y={7} stroke="#00D98B" strokeDasharray="3 3" strokeWidth={2} label="Max Optimal" />
            <Line type="monotone" dataKey="distance" stroke="#0066FF" strokeWidth={3} dot={{ fill: '#0066FF', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
            <div className="font-bold text-emerald-600 dark:text-emerald-400">78%</div>
            <div className="text-muted-foreground">Zone optimale (5-7m)</div>
          </div>
          <div className="p-2 bg-primary/10 border border-primary/20 rounded-xl text-center">
            <div className="font-bold text-primary">15%</div>
            <div className="text-muted-foreground">Trop éloignés (&gt;7m)</div>
          </div>
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-center">
            <div className="font-bold text-cyan-600 dark:text-cyan-400">7%</div>
            <div className="text-muted-foreground">Trop proches (&lt;5m)</div>
          </div>
        </div>
      </motion.div>

      {/* Activity Ratio */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-lg"
      >
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-bold tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            QUI FAIT LE PLUS D'EFFORTS ?
          </h3>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-sm min-w-[100px] flex items-center gap-1 font-medium">
              <User className="w-3.5 h-3.5 text-primary" /> Vous
            </span>
            <div className="flex-1 h-8 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '58%' }}
                transition={{ duration: 1, delay: 0.4 }}
                className="h-full bg-gradient-to-r from-primary to-cyan-500 flex items-center justify-end pr-3"
              >
                <span className="text-white text-sm font-bold">58%</span>
              </motion.div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm min-w-[100px] flex items-center gap-1 font-medium">
              <User className="w-3.5 h-3.5 text-emerald-500" /> Partenaire
            </span>
            <div className="flex-1 h-8 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '42%' }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 flex items-center justify-end pr-3"
              >
                <span className="text-white text-sm font-bold">42%</span>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-sm font-medium mb-3">Détails :</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">• Frappes :</span>
              <span>Vous <span className="font-bold text-primary">58%</span> | Partenaire <span className="font-bold text-emerald-500">42%</span></span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">• Distance :</span>
              <span>Vous <span className="font-bold text-primary">62%</span> | Partenaire <span className="font-bold text-emerald-500">38%</span></span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">• Sprints :</span>
              <span>Vous <span className="font-bold text-primary">55%</span> | Partenaire <span className="font-bold text-emerald-500">45%</span></span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-2 text-foreground">
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <p className="text-sm font-medium">Équilibre bon, mais pensez à alterner les montées au filet.</p>
        </div>
      </motion.div>
    </div>
  );
}

