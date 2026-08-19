import { motion } from 'framer-motion';

interface CircularGaugeProps {
  value: number;
  label: string;
}

export function CircularGauge({ value, label }: CircularGaugeProps) {
  const getColor = (val: number) => {
    if (val >= 71) return '#0066FF';
    if (val >= 41) return '#00D98B';
    return '#00F2FE';
  };

  const color = getColor(value);
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (value / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-lg"
    >
      <h3 className="font-extrabold mb-6 text-center tracking-wide text-foreground">
        {label}
      </h3>

      <div className="flex justify-center mb-6">
        <div className="relative w-48 h-48">
          <svg className="transform -rotate-90 w-48 h-48">
            <circle
              cx="96"
              cy="96"
              r="70"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              className="text-muted/30"
            />
            <motion.circle
              cx="96"
              cy="96"
              r="70"
              fill="none"
              stroke={color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 2, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-6xl font-bold"
              style={{ fontFamily: 'Bebas Neue, sans-serif', color }}
            >
              {value}
            </motion.div>
            <div className="text-sm text-muted-foreground">/ 100</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-[#00F2FE]" />
            <span className="font-medium">Faible</span>
          </div>
          <span className="text-muted-foreground">45%</span>
        </div>
        <div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-[#00D98B]" />
            <span className="font-medium">Moyen</span>
          </div>
          <span className="text-muted-foreground">35%</span>
        </div>
        <div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-[#0066FF]" />
            <span className="font-medium">Élevé</span>
          </div>
          <span className="text-muted-foreground">20%</span>
        </div>
      </div>
    </motion.div>
  );
}

