import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, MapPin, Clock, StopCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActiveRecordingBannerProps {
  court: string;
  club: string;
  startTime: Date;
  duration?: number; // Duration in minutes
  onStop?: () => void;
  onDismiss?: () => void;
}

export function ActiveRecordingBanner({
  court,
  club,
  startTime,
  duration, // Duration in minutes
  onStop,
  onDismiss,
}: ActiveRecordingBannerProps) {
  const [remaining, setRemaining] = useState("--:--");
  const [isVisible, setIsVisible] = useState(true);
  const [stopping, setStopping] = useState(false);

  useEffect(() => {
    const calculateRemaining = () => {
      if (!startTime || !duration) return;

      const now = new Date();
      // Start time is already a Date object from props
      const start = startTime.getTime();
      const durationMs = duration * 60 * 1000;
      const end = start + durationMs;
      const diff = end - now.getTime();

      if (diff <= 0) {
        setRemaining("00:00");
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setRemaining(
        `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    };

    calculateRemaining(); // Initial calculation
    const interval = setInterval(calculateRemaining, 1000);

    return () => clearInterval(interval);
  }, [startTime, duration]);

  const handleStop = async () => {
    if (stopping || !onStop) return;

    setStopping(true);
    try {
      await onStop();
    } catch (error) {
      console.error("Error stopping recording:", error);
      setStopping(false);
    }
    // Note: stopping state will reset when component unmounts/re-renders after stop
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="relative overflow-hidden z-40 pointer-events-auto"
      >
        <div className="bg-gradient-to-r from-destructive/90 via-destructive to-destructive/90 text-destructive-foreground">
          {/* Animated background pulse */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)] animate-pulse" />

          <div className="container mx-auto px-3 py-2 sm:px-4 sm:py-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              {/* Top Section - Always visible */}
              <div className="flex items-center justify-between gap-2">
                {/* Recording Indicator */}
                <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                  </span>
                  <Video className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="font-semibold text-sm sm:text-base">EN DIRECT</span>
                </div>

                {/* Mobile: Stop button inline */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStop}
                  disabled={stopping}
                  className="bg-white/10 border-white/20 hover:bg-white/20 text-white gap-1.5 relative z-50 cursor-pointer sm:hidden text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {stopping ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Arrêt...
                    </>
                  ) : (
                    <>
                      <StopCircle className="h-3.5 w-3.5" />
                      Arrêter
                    </>
                  )}
                </Button>
              </div>

              {/* Info Section - Mobile: Second row, Desktop: Same row */}
              <div className="flex items-center gap-3 text-xs sm:text-sm flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-1.5 min-w-0">
                  <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">{court} • {club}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="font-mono">{remaining}</span>
                </div>
              </div>

              {/* Desktop: Stop button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleStop}
                disabled={stopping}
                className="hidden sm:flex bg-white/10 border-white/20 hover:bg-white/20 text-white gap-2 relative z-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {stopping ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Arrêt en cours...
                  </>
                ) : (
                  <>
                    <StopCircle className="h-4 w-4" />
                    Arrêter
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
