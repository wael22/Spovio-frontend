import { MapPin, Zap, Target, Users, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

export type TabType = 'position' | 'intensity' | 'shots' | 'team' | 'summary';

interface MetricsTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  embeddedInHeader?: boolean;
}

const tabs = [
  { id: 'position' as TabType, label: 'Position', shortLabel: 'Pos.', icon: MapPin, badge: 12 },
  { id: 'intensity' as TabType, label: 'Intensité', shortLabel: 'Intens.', icon: Zap, badge: 8 },
  { id: 'shots' as TabType, label: 'Frappes', shortLabel: 'Frappes', icon: Target, badge: 24 },
  { id: 'team' as TabType, label: 'Équipe', shortLabel: 'Équipe', icon: Users, badge: 6 },
  { id: 'summary' as TabType, label: 'Résumé', shortLabel: 'Résumé', icon: BarChart3, badge: 5 },
];

export function MetricsTabs({ activeTab, onTabChange, embeddedInHeader = false }: MetricsTabsProps) {
  const content = (
    <>
      {/* Mobile Integrated Tab Strip (< sm) */}
      <div className="sm:hidden w-full border-t border-border/40 pt-1.5 pb-0.5">
        <div className="grid grid-cols-5 gap-0.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-0.5 transition-all cursor-pointer ${
                  isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'scale-110 text-primary' : 'text-muted-foreground/80'}`} />
                <span className="text-[10px] tracking-tight leading-none mt-1 font-semibold truncate w-full text-center">
                  {tab.shortLabel}
                </span>

                {isActive && (
                  <motion.div
                    layoutId="mobileActiveTabUnderline"
                    className="absolute -bottom-1 left-2 right-2 h-0.5 bg-primary rounded-full shadow-[0_0_8px_hsl(var(--primary)/0.6)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>


      {/* Desktop Tabs (>= sm) */}
      <div className="hidden sm:block border-b border-border/60 pt-1">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs sm:text-sm transition-colors cursor-pointer ${
                  isActive
                    ? 'text-primary font-bold bg-primary/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{tab.label}</span>
                <span
                  className={`flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[9px] sm:text-[10px] font-bold shadow-xs ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {tab.badge}
                </span>

                {isActive && (
                  <motion.div
                    layoutId="desktopActiveTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );

  if (embeddedInHeader) {
    return <div className="w-full">{content}</div>;
  }

  return (
    <div className="py-2 mb-4 sticky top-[72px] sm:top-[76px] z-30 bg-background/95 backdrop-blur-md -mx-4 px-4 sm:mx-0 sm:px-0 sm:bg-transparent sm:backdrop-blur-none">
      {content}
    </div>
  );
}


