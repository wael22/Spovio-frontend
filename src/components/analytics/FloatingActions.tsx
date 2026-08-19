import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Download, BarChart2, Plus, X } from 'lucide-react';

export function FloatingActions() {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { icon: BarChart2, label: 'Comparer', iconColor: 'text-cyan-500', borderColor: 'border-l-cyan-500' },
    { icon: Download, label: 'PDF', iconColor: 'text-emerald-500', borderColor: 'border-l-emerald-500' },
    { icon: Share2, label: 'Partager', iconColor: 'text-amber-500', borderColor: 'border-l-amber-500' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-16 right-0 space-y-3"
          >
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-3 bg-card/90 backdrop-blur-md border border-border text-foreground rounded-xl shadow-xl px-4 py-2.5 border-l-4 ${action.borderColor} hover:bg-accent transition-all cursor-pointer`}
                >
                  <Icon className={`w-4 h-4 ${action.iconColor}`} />
                  <span className="text-xs font-bold tracking-wide pr-1">{action.label}</span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/30 flex items-center justify-center cursor-pointer border border-primary/20 hover:bg-primary/90"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Plus className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
