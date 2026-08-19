import { motion } from 'framer-motion';
import { Loader2, Activity, Sparkles } from 'lucide-react';

export function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gradient-to-br from-[#0066FF] via-[#0284c7] to-[#0f172a] flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center px-4"
      >
        <motion.div
          className="text-white mb-8"
          animate={{ 
            y: [0, -10, 0],
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Activity className="w-16 h-16 text-white mx-auto mb-4" />
          <h1 className="text-4xl font-extrabold tracking-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            MATCH ANALYTICS
          </h1>
          <p className="text-xl mt-2 font-semibold">Spovio AI Vision</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-8 h-8 text-white animate-spin" />
          <p className="text-white text-lg font-medium">Analyse IA en cours...</p>
          
          <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden mt-2">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, ease: 'easeInOut' }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-white/80 text-sm mt-4 font-mono flex items-center justify-center gap-1"
          >
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>Traitement des 38 paramètres en temps réel</span>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Animated particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

