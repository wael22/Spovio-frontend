import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardModernProps {
  icon: LucideIcon;
  label: string;
  value: string;
  color?: "primary" | "accent" | "cyan" | "purple";
}

const colorClasses = {
  primary: {
    bg: "bg-primary/10",
    icon: "text-primary",
    glow: "group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)]",
    border: "border-primary/20 group-hover:border-primary/50",
  },
  accent: {
    bg: "bg-accent/10",
    icon: "text-accent",
    glow: "group-hover:shadow-[0_0_30px_hsl(var(--accent)/0.3)]",
    border: "border-accent/20 group-hover:border-accent/50",
  },
  cyan: {
    bg: "bg-[hsl(180,100%,50%)]/10",
    icon: "text-[hsl(180,100%,50%)]",
    glow: "group-hover:shadow-[0_0_30px_hsl(180,100%,50%,0.3)]",
    border: "border-[hsl(180,100%,50%)]/20 group-hover:border-[hsl(180,100%,50%)]/50",
  },
  purple: {
    bg: "bg-[hsl(270,100%,60%)]/10",
    icon: "text-[hsl(270,100%,60%)]",
    glow: "group-hover:shadow-[0_0_30px_hsl(270,100%,60%,0.3)]",
    border: "border-[hsl(270,100%,60%)]/20 group-hover:border-[hsl(270,100%,60%)]/50",
  },
};

export function StatCardModern({
  icon: Icon,
  label,
  value,
  color = "primary",
}: StatCardModernProps) {
  const colors = colorClasses[color];

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
      className={`group relative p-6 rounded-2xl glass border ${colors.border} ${colors.glow} transition-all duration-300 cursor-pointer`}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-transparent via-transparent to-primary/5" />
      
      <div className="relative flex items-center gap-4">
        {/* Icon Container */}
        <div className={`p-3 rounded-xl ${colors.bg}`}>
          <Icon className={`h-6 w-6 ${colors.icon}`} />
        </div>

        {/* Content */}
        <div>
          <p className="text-2xl lg:text-3xl font-bold font-orbitron">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}
