import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { ServeSegment } from "@/lib/api";
import { findServeAtTime, formatGapDuration, formatMatchTime } from "./serveUtils";
import { ChevronLeft, ChevronRight, PauseCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface SegmentedSeekbarProps {
  duration: number;
  currentTime: number;
  bufferedEnd: number;
  serves: ServeSegment[];
  activeServeNum: number | null;
  onSeek: (timeSec: number) => void;
  onSelectServe: (serve: ServeSegment) => void;
  onScrubStateChange?: (isScrubbing: boolean) => void;
  showChapterStrip?: boolean;
}

interface TimelineBlocksProps {
  serves: ServeSegment[];
  duration: number;
  activeServeNum: number | null;
  hoveredServeNum: number | null;
}

const TimelineBlocks = React.memo(function TimelineBlocks({
  serves,
  duration,
  activeServeNum,
  hoveredServeNum,
}: TimelineBlocksProps) {
  const blocks = useMemo(() => {
    if (!duration || duration <= 0 || serves.length === 0) return [];
    return serves.map((serve) => {
      const startPct = Math.max(0, Math.min(100, (serve.start_sec / duration) * 100));
      const rawWidthPct = ((serve.end_sec - serve.start_sec) / duration) * 100;
      const widthPct = Math.max(0.28, Math.min(100 - startPct, rawWidthPct));
      return {
        num: serve.num,
        team: serve.team,
        isBreakEnd: serve.ended_by === "players left the court",
        startPct,
        widthPct,
      };
    });
  }, [serves, duration]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
      {blocks.map((b) => {
        const isActive = activeServeNum === b.num;
        const isHovered = hoveredServeNum === b.num;
        const isNear = b.team === "near";

        return (
          <div
            key={b.num}
            style={{
              left: `${b.startPct}%`,
              width: `${b.widthPct}%`,
            }}
            className={cn(
              "absolute top-0 bottom-0 transition-opacity duration-150 border-r border-white/80 dark:border-black/60",
              isActive
                ? isNear
                  ? "bg-sky-500 dark:bg-sky-400 shadow-[0_0_8px_rgba(14,165,233,0.75)] dark:shadow-[0_0_8px_rgba(56,189,248,0.9)] z-10"
                  : "bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.75)] dark:shadow-[0_0_8px_rgba(52,211,153,0.9)] z-10"
                : isHovered
                  ? isNear
                    ? "bg-sky-400 dark:bg-sky-300 z-10"
                    : "bg-emerald-400 dark:bg-emerald-300 z-10"
                  : isNear
                    ? "bg-sky-500/75 dark:bg-sky-500/80"
                    : "bg-emerald-500/75 dark:bg-emerald-500/80"
            )}
          />
        );
      })}
    </div>
  );
});

interface ChapterStripProps {
  serves: ServeSegment[];
  activeServeNum: number | null;
  onSelectServe: (serve: ServeSegment) => void;
  onHoverServe: (serveNum: number | null) => void;
  teamNearLabel: string;
  teamFarLabel: string;
  breakLabel: string;
}

const ChapterStrip = React.memo(function ChapterStrip({
  serves,
  activeServeNum,
  onSelectServe,
  onHoverServe,
  teamNearLabel,
  teamFarLabel,
  breakLabel,
}: ChapterStripProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const activeChipRef = useRef<HTMLButtonElement>(null);
  const [userHoveringStrip, setUserHoveringStrip] = useState(false);

  // Auto-center active serve pill ONLY when activeServeNum transitions
  useEffect(() => {
    if (!activeServeNum || userHoveringStrip) return;
    const chip = activeChipRef.current;
    if (chip && stripRef.current) {
      chip.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeServeNum, userHoveringStrip]);

  const scrollStripBy = (delta: number) => {
    stripRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!stripRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      stripRef.current.scrollLeft += e.deltaY;
    }
  };

  if (serves.length === 0) return null;

  return (
    <div
      className="relative flex items-center gap-1 pt-1.5"
      onMouseEnter={() => setUserHoveringStrip(true)}
      onMouseLeave={() => {
        setUserHoveringStrip(false);
        onHoverServe(null);
      }}
    >
      <button
        type="button"
        onClick={() => scrollStripBy(-260)}
        className="hidden sm:flex items-center justify-center h-7 w-6 rounded-md bg-muted/80 hover:bg-muted border border-border/80 text-muted-foreground hover:text-foreground dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/10 dark:text-white/80 dark:hover:text-white transition-colors shrink-0"
        aria-label="Scroll serves left"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      <div
        ref={stripRef}
        onWheel={handleWheel}
        className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 flex-1 min-w-0"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {serves.map((serve, index) => {
          const isActive = serve.num === activeServeNum;
          const isNear = serve.team === "near";
          const nextServe = index + 1 < serves.length ? serves[index + 1] : null;
          const hasBreakAfter =
            serve.ended_by === "players left the court" && nextServe !== null;
          const gapSec =
            hasBreakAfter && nextServe ? Math.max(0, nextServe.start_sec - serve.end_sec) : 0;

          return (
            <React.Fragment key={serve.num}>
              <button
                ref={isActive ? activeChipRef : undefined}
                type="button"
                onClick={() => onSelectServe(serve)}
                onMouseEnter={() => onHoverServe(serve.num)}
                title={`Serve ${serve.num} (${isNear ? teamNearLabel : teamFarLabel}) • ${formatMatchTime(serve.start_sec)} (${serve.duration_s}s)`}
                className={cn(
                  "group/chip relative flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap shrink-0 transition-all border cursor-pointer select-none",
                  isActive
                    ? isNear
                      ? "bg-sky-50 border-sky-400 text-sky-900 shadow-sm ring-1 ring-sky-400/30 dark:bg-sky-500/25 dark:border-sky-400 dark:text-white dark:ring-0 dark:shadow-[0_0_12px_rgba(56,189,248,0.35)]"
                      : "bg-emerald-50 border-emerald-400 text-emerald-900 shadow-sm ring-1 ring-emerald-400/30 dark:bg-emerald-500/25 dark:border-emerald-400 dark:text-white dark:ring-0 dark:shadow-[0_0_12px_rgba(52,211,153,0.35)]"
                    : "bg-muted/50 hover:bg-muted border-border/80 hover:border-border text-foreground/85 hover:text-foreground dark:bg-white/[0.06] dark:hover:bg-white/[0.14] dark:border-white/10 dark:hover:border-white/25 dark:text-white/80 dark:hover:text-white"
                )}
              >
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full shrink-0",
                    isNear ? "bg-sky-500 dark:bg-sky-400" : "bg-emerald-500 dark:bg-emerald-400"
                  )}
                />
                <span className="font-semibold tracking-tight">{`Serve ${serve.num}`}</span>
                <span className="text-[10px] text-muted-foreground dark:text-white/55 tabular-nums">
                  {serve.duration_s}s
                </span>
              </button>

              {hasBreakAfter && (
                <div
                  title={`${breakLabel} (~${formatGapDuration(gapSec)})`}
                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-[10px] text-amber-700 dark:bg-amber-500/15 dark:border-amber-400/25 dark:text-amber-300 shrink-0 select-none"
                >
                  <PauseCircle className="h-2.5 w-2.5" />
                  <span className="tabular-nums">{formatGapDuration(gapSec)}</span>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => scrollStripBy(260)}
        className="hidden sm:flex items-center justify-center h-7 w-6 rounded-md bg-muted/80 hover:bg-muted border border-border/80 text-muted-foreground hover:text-foreground dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/10 dark:text-white/80 dark:hover:text-white transition-colors shrink-0"
        aria-label="Scroll serves right"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
});

export function SegmentedSeekbar({
  duration,
  currentTime,
  bufferedEnd,
  serves,
  activeServeNum,
  onSeek,
  onSelectServe,
  onScrubStateChange,
  showChapterStrip = true,
}: SegmentedSeekbarProps) {
  const { t } = useTranslation();
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverInfo, setHoverInfo] = useState<{
    pct: number;
    timeSec: number;
    serve: ServeSegment | null;
    nextServe: ServeSegment | null;
  } | null>(null);
  const [stripHoveredServeNum, setStripHoveredServeNum] = useState<number | null>(null);

  const safeDuration = duration > 0 ? duration : 0;
  const progressPct =
    safeDuration > 0 ? Math.max(0, Math.min(100, (currentTime / safeDuration) * 100)) : 0;
  const bufferedPct =
    safeDuration > 0 ? Math.max(0, Math.min(100, (bufferedEnd / safeDuration) * 100)) : 0;

  const teamNearLabel = t("modals.videoPlayer.teamNear", "Proche");
  const teamFarLabel = t("modals.videoPlayer.teamFar", "Loin");
  const breakLabel = t("modals.videoPlayer.breakLabel", "Changement de côté / Pause");

  const computeTimeFromPointer = useCallback(
    (clientX: number) => {
      if (!trackRef.current || safeDuration <= 0) return { pct: 0, timeSec: 0 };
      const rect = trackRef.current.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return {
        pct: pct * 100,
        timeSec: pct * safeDuration,
      };
    },
    [safeDuration]
  );

  const updateHover = useCallback(
    (clientX: number) => {
      if (safeDuration <= 0) return;
      const { pct, timeSec } = computeTimeFromPointer(clientX);
      const lookup = findServeAtTime(serves, timeSec);
      const nextServe =
        lookup.nextServeIndex >= 0 && lookup.nextServeIndex < serves.length
          ? serves[lookup.nextServeIndex]
          : null;

      setHoverInfo({
        pct,
        timeSec,
        serve: lookup.activeServe,
        nextServe,
      });
    },
    [computeTimeFromPointer, safeDuration, serves]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (safeDuration <= 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    onScrubStateChange?.(true);
    const { timeSec } = computeTimeFromPointer(e.clientX);
    updateHover(e.clientX);
    onSeek(timeSec);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    updateHover(e.clientX);
    if (isDragging) {
      const { timeSec } = computeTimeFromPointer(e.clientX);
      onSeek(timeSec);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setIsDragging(false);
      onScrubStateChange?.(false);
    }
  };

  const hoveredServeNum = hoverInfo?.serve?.num ?? stripHoveredServeNum;

  return (
    <div className="w-full select-none space-y-1">
      {/* Main Seekbar Track */}
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={() => {
          if (!isDragging) setHoverInfo(null);
        }}
        className="group relative flex items-center h-6 sm:h-5 cursor-pointer touch-none"
        role="slider"
        aria-label="Timeline"
        aria-valuemin={0}
        aria-valuemax={Math.round(safeDuration)}
        aria-valuenow={Math.round(currentTime)}
      >
        {/* Floating Rich Chapter Tooltip */}
        {hoverInfo && safeDuration > 0 && (
          <div
            className="absolute bottom-6 -translate-x-1/2 z-30 pointer-events-none px-2.5 py-1.5 rounded-lg bg-popover/95 border border-border shadow-xl text-popover-foreground dark:bg-slate-950/95 dark:border-white/15 dark:text-white text-xs whitespace-nowrap backdrop-blur-md"
            style={{
              left: `${Math.max(8, Math.min(92, hoverInfo.pct))}%`,
            }}
          >
            {hoverInfo.serve ? (
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      hoverInfo.serve.team === "near"
                        ? "bg-sky-500 dark:bg-sky-400"
                        : "bg-emerald-500 dark:bg-emerald-400"
                    )}
                  />
                  <span className="font-bold">{`Serve ${hoverInfo.serve.num}`}</span>
                  <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground dark:bg-white/10 dark:text-white/80">
                    {hoverInfo.serve.team === "near" ? teamNearLabel : teamFarLabel}
                  </span>
                  <span className="text-sky-600 dark:text-sky-300 font-semibold tabular-nums">
                    {hoverInfo.serve.duration_s}s
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground dark:text-white/65 tabular-nums flex items-center gap-1.5">
                  <span>
                    {formatMatchTime(hoverInfo.serve.start_sec)} –{" "}
                    {formatMatchTime(hoverInfo.serve.end_sec)}
                  </span>
                  <span>•</span>
                  <span className="text-foreground dark:text-white/90 font-medium">
                    {formatMatchTime(hoverInfo.timeSec)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold tabular-nums">
                  {formatMatchTime(hoverInfo.timeSec)}
                </span>
                {serves.length > 0 && hoverInfo.nextServe && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-300/90 font-medium">
                    • {`→ Serve ${hoverInfo.nextServe.num}`}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Rail background */}
        <div
          className={cn(
            "relative w-full rounded-full bg-slate-200 dark:bg-white/20 transition-all duration-150 overflow-hidden",
            isDragging ? "h-3" : "h-2 group-hover:h-3"
          )}
        >
          {/* Buffered progress */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-slate-300/90 dark:bg-white/25 transition-[width] duration-200 pointer-events-none"
            style={{ width: `${bufferedPct}%` }}
          />

          {/* Separated AI Serve Sections */}
          {serves.length > 0 && (
            <TimelineBlocks
              serves={serves}
              duration={safeDuration}
              activeServeNum={activeServeNum}
              hoveredServeNum={hoveredServeNum}
            />
          )}

          {/* Played continuous progress overlay */}
          <div
            className={cn(
              "absolute top-0 bottom-0 left-0 pointer-events-none",
              serves.length > 0 ? "bg-slate-900/20 dark:bg-white/35" : "bg-primary"
            )}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Hover vertical indicator line */}
        {hoverInfo && (
          <div
            className="absolute top-1 bottom-1 w-0.5 bg-slate-900/60 dark:bg-white/70 pointer-events-none rounded-full"
            style={{ left: `${hoverInfo.pct}%` }}
          />
        )}

        {/* Playhead scrubber knob */}
        <div
          className={cn(
            "absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_1px_5px_rgba(0,0,0,0.35)] dark:shadow-[0_0_8px_rgba(0,0,0,0.8)] border-2 border-primary pointer-events-none transition-transform duration-100",
            isDragging ? "w-4 h-4 scale-110" : "w-3 h-3 group-hover:w-3.5 group-hover:h-3.5"
          )}
          style={{ left: `${progressPct}%` }}
        />
      </div>

      {/* Separated Labeled Serve Sections Strip ("Serve 1", "Serve 2", ...) — hidden on <sm where the open feed sits below */}
      {showChapterStrip && serves.length > 0 && (
        <div className="hidden sm:block">
          <ChapterStrip
            serves={serves}
            activeServeNum={activeServeNum}
            onSelectServe={onSelectServe}
            onHoverServe={setStripHoveredServeNum}
            teamNearLabel={teamNearLabel}
            teamFarLabel={teamFarLabel}
            breakLabel={breakLabel}
          />
        </div>
      )}
    </div>
  );
}

