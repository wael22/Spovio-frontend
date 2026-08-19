import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Trophy, Check } from 'lucide-react';
import { ReactNode } from 'react';

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  subValue: string;
  badge?: {
    text: string;
    trend?: 'up' | 'down' | 'trophy' | 'check';
    label?: string;
  };
  color: string;
}

export function MetricCard({ icon, label, value, subValue, badge, color }: MetricCardProps) {
  const getBorderClass = (c: string) => {
    if (c === 'cyan' || c === '#0066FF' || c === 'primary') return 'border-l-primary';
    if (c === 'emerald' || c === '#00D98B' || c === '#2ED573') return 'border-l-emerald-500';
    if (c === 'purple' || c === '#5B2C91') return 'border-l-purple-500';
    return 'border-l-primary';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card/80 backdrop-blur-md text-card-foreground border border-border/80 rounded-2xl p-4 shadow-sm relative overflow-hidden border-l-4 ${getBorderClass(color)}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-semibold text-muted-foreground uppercase">{label}</span>
        </div>
      </div>

      <div className="mb-1">
        <div className="text-3xl font-extrabold tracking-tight text-foreground">
          {value}
        </div>
        <div className="text-xs text-muted-foreground">{subValue}</div>
      </div>

      {badge && (
        <div className="flex items-center gap-1 mt-2">
          {badge.trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-500" />}
          {badge.trend === 'down' && <TrendingDown className="w-3 h-3 text-rose-500" />}
          {badge.trend === 'trophy' && <Trophy className="w-3 h-3 text-primary" />}
          {badge.trend === 'check' && <Check className="w-3 h-3 text-emerald-500" />}
          <span className={`text-xs font-medium ${
            badge.trend === 'up' ? 'text-emerald-500' :
            badge.trend === 'down' ? 'text-rose-500' :
            badge.trend === 'trophy' ? 'text-primary' :
            badge.trend === 'check' ? 'text-emerald-500' :
            'text-muted-foreground'
          }`}>
            {badge.text}
          </span>
          {badge.label && <span className="text-xs text-muted-foreground ml-1">{badge.label}</span>}
        </div>
      )}
    </motion.div>
  );
}

