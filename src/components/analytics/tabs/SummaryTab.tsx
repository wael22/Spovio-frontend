import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Lightbulb, Calendar, Award, Medal, CheckCircle2, Target, ArrowRight, Bot } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { AnalyticsPlayer } from '../PlayerSelector';

interface SummaryTabProps {
  player: AnalyticsPlayer;
}

export function SummaryTab({ player }: SummaryTabProps) {
  const { evoData, smashMaxSpeed, distStr, srvRegPct } = useMemo(() => {
    const pId = player.id || 1;
    const base = player.performanceScore || 70;
    const data = [
      { match: 'M1', score: Math.max(30, base - 24) },
      { match: 'M2', score: Math.max(35, base - 20) },
      { match: 'M3', score: Math.max(40, base - 16) },
      { match: 'M4', score: Math.max(45, base - 13) },
      { match: 'M5', score: Math.max(50, base - 10) },
      { match: 'M6', score: Math.max(55, base - 8) },
      { match: 'M7', score: Math.max(60, base - 5) },
      { match: 'M8', score: Math.max(62, base - 3) },
      { match: 'M9', score: Math.max(64, base - 1) },
      { match: 'M10', score: base },
    ];
    return {
      evoData: data,
      smashMaxSpeed: `${player.maxSpeed || 15.2} km/h`,
      distStr: `${player.distance || 2.38} km`,
      srvRegPct: `${Math.round(65 + ((pId * 5) % 18))}%`
    };
  }, [player]);
  return (
    <div className="space-y-6">
      {/* Top 3 Performances */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-lg"
      >
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-6 h-6 text-primary" />
          <h3 className="font-bold tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            VOS MEILLEURES STATS
          </h3>
        </div>

        <div className="space-y-4">
          {/* #1 Top Performance */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative p-4 bg-primary/10 border-l-4 border-primary rounded-xl border border-border"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/20 rounded-xl text-primary font-black text-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-bold mb-1">Régularité au Service : {srvRegPct} de premières balles</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: srvRegPct }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full"
                    />
                  </div>
                  <span className="text-sm font-bold text-primary">Bonne base</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Sécurité de mise en jeu</p>
              </div>
            </div>
          </motion.div>

          {/* #2 Performance */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="relative p-4 bg-cyan-500/10 border-l-4 border-cyan-500 rounded-xl border border-border"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-cyan-500/20 rounded-xl text-cyan-500 font-black text-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-cyan-500" />
              </div>
              <div className="flex-1">
                <div className="font-bold mb-1">Vitesse Max : {smashMaxSpeed}</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '75%' }}
                      transition={{ duration: 1, delay: 0.4 }}
                      className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full"
                    />
                  </div>
                  <span className="text-sm font-bold text-cyan-500">Contrôlé</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Vitesse maximale atteinte</p>
              </div>
            </div>
          </motion.div>

          {/* #3 Performance */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="relative p-4 bg-emerald-500/10 border-l-4 border-emerald-500 rounded-xl border border-border"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-500 font-black text-xl flex items-center justify-center">
                <Medal className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="flex-1">
                <div className="font-bold mb-1">Volume de Jeu : {distStr} parcourus</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '68%' }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                    />
                  </div>
                  <span className="text-sm font-bold text-emerald-500">Actif</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Excellente mobilité générale</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Evolution Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-lg"
      >
        <h3 className="font-bold mb-4 tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          PROGRESSION SUR LES 10 DERNIERS MATCHS
        </h3>
        
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={evoData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="match" style={{ fontSize: '12px' }} />
            <YAxis domain={[0, 100]} style={{ fontSize: '12px' }} />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#0066FF" 
              strokeWidth={3}
              dot={{ fill: '#0066FF', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              Tendance : +18% sur le dernier mois
            </p>
          </div>
        </div>
      </motion.div>

      {/* AI Coach Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-br from-primary via-blue-600 to-indigo-900 rounded-2xl p-6 shadow-xl text-white border border-primary/30"
      >
        <div className="flex items-center gap-2 mb-4">
          <Bot className="w-6 h-6 text-cyan-300" />
          <h3 className="font-bold tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            CONSEILS DU COACH IA
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span className="font-semibold">Points forts :</span>
            </div>
            <ul className="space-y-1 ml-6 text-sm text-white/90">
              <li>• Bonne régularité en fond de court (68% de remises réussies)</li>
              <li>• Recherche intelligente du centre (T) pour sécuriser les échanges</li>
              <li>• Bon engagement au service</li>
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-cyan-300 shrink-0" />
              <span className="font-semibold">Axes d'amélioration :</span>
            </div>
            <ul className="space-y-1 ml-6 text-sm text-white/90">
              <li>• Oser monter au filet après avoir lobé les adversaires</li>
              <li>• Laisser la balle taper la vitre arrière pour se donner du temps</li>
              <li>• Préparer la raquette plus tôt sur les balles rapides</li>
            </ul>
          </div>

          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-white/90" />
              <span className="font-semibold text-sm">Programme suggéré :</span>
            </div>
            <button className="w-full mt-2 px-4 py-3 bg-white text-primary rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-between shadow-lg cursor-pointer">
              <span>VOIR LES EXERCICES</span>
              <ArrowRight className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

