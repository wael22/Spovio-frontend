import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, X, MapPin, Clock, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActiveRecordingBannerProps {
  court: string;
  club: string;
  startTime: Date;
  onStop?: () => void;
  onDismiss?: () => void;
}

export function ActiveRecordingBanner({
  court,
  club,
  startTime,
  onStop,
  onDismiss,
}: ActiveRecordingBannerProps) {
  const [elapsed, setElapsed] = useState("00:00");
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Date.now() - startTime.getTime();
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setElapsed(
        `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="relative overflow-hidden"
      >
        <div className="bg-gradient-to-r from-destructive/90 via-destructive to-destructive/90 text-destructive-foreground">
          {/* Animated background pulse */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)] animate-pulse" />
          
          <div className="container mx-auto px-4 lg:px-8 py-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Left Section */}
              <div className="flex items-center gap-4">
                {/* Recording Indicator */}
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                  </span>
                  <Video className="h-5 w-5" />
                  <span className="font-semibold">EN DIRECT</span>
                </div>

                {/* Info */}
                <div className="hidden sm:flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span>{court} • {club}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span className="font-mono">{elapsed}</span>
                  </div>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onStop}
                  className="bg-white/10 border-white/20 hover:bg-white/20 text-white gap-2"
                >
                  <StopCircle className="h-4 w-4" />
                  Arrêter
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsVisible(false);
                    onDismiss?.();
                  }}
                  className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
