import React, { useMemo, useState, useRef, useEffect } from "react";
import { ServeSegment, VideoSegmentsSummary } from "@/lib/api";
import { formatGapDuration, formatMatchTime } from "./serveUtils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Scissors,
  SlidersHorizontal,
  Search,
  X,
  Check,
  Loader2,
  Flame,
  PauseCircle,
  Lock,
  Unlock,
  Clock,
  Activity,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export type ServeFilter = "all" | "near" | "far" | "long" | "breaks";
export type ClipStatusState = "creating" | "created" | "error";

interface ServesSidebarProps {
  serves: ServeSegment[];
  summary?: VideoSegmentsSummary | null;
  activeServeNum: number | null;
  clipPaddingSec: number;
  onChangeClipPadding: (sec: number) => void;
  clipStatuses: Record<number, ClipStatusState>;
  onSelectServe: (serve: ServeSegment) => void;
  onQuickClipServe: (serve: ServeSegment) => void;
  onEditClipServe: (serve: ServeSegment) => void;
  onClose?: () => void;
}

export const ServesSidebar = React.memo(function ServesSidebar({
  serves,
  summary,
  activeServeNum,
  clipPaddingSec,
  onChangeClipPadding,
  clipStatuses,
  onSelectServe,
  onQuickClipServe,
  onEditClipServe,
}: ServesSidebarProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<ServeFilter>("all");
  const [autoFollow, setAutoFollow] = useState(true);
  const [isHoveringList, setIsHoveringList] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  // Map serve num -> next serve for accurate changeover gap labels even when filtered
  const nextServeByNum = useMemo(() => {
    const map = new Map<number, ServeSegment>();
    for (let i = 0; i < serves.length - 1; i++) {
      map.set(serves[i].num, serves[i + 1]);
    }
    return map;
  }, [serves]);

  const counts = useMemo(() => {
    let near = 0;
    let far = 0;
    let long = 0;
    let breaks = 0;
    let activeSec = 0;
    for (const s of serves) {
      if (s.team === "near") near++;
      else if (s.team === "far") far++;
      if (s.duration_s >= 30) long++;
      if (s.ended_by === "players left the court") breaks++;
      activeSec += s.duration_s || 0;
    }
    const avgSec = serves.length > 0 ? activeSec / serves.length : 0;
    return {
      all: serves.length,
      near,
      far,
      long,
      breaks,
      activeMins: Math.round((summary?.total_active_play_sec ?? activeSec) / 60),
      avgSec: (summary?.avg_rally_duration_sec ?? avgSec).toFixed(1),
    };
  }, [serves, summary]);

  const filteredServes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return serves.filter((s) => {
      if (filter === "near" && s.team !== "near") return false;
      if (filter === "far" && s.team !== "far") return false;
      if (filter === "long" && s.duration_s < 30) return false;
      if (filter === "breaks" && s.ended_by !== "players left the court") return false;

      if (q) {
        const cleanQ = q.replace(/^#/, "");
        const numMatch =
          String(s.num) === cleanQ ||
          `serve ${s.num}`.includes(q) ||
          String(s.num).includes(cleanQ);
        const timeMatch =
          s.serve_time.toLowerCase().includes(q) ||
          s.end_time.toLowerCase().includes(q) ||
          formatMatchTime(s.start_sec).includes(q);
        const teamMatch = s.team.toLowerCase().includes(q);
        return numMatch || timeMatch || teamMatch;
      }
      return true;
    });
  }, [serves, filter, searchQuery]);

  // Smoothly keep active serve visible when autoFollow is enabled
  useEffect(() => {
    if (!autoFollow || isHoveringList || !activeServeNum) return;
    const el = activeItemRef.current;
    if (el) {
      el.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [activeServeNum, autoFollow, isHoveringList]);

  const teamNearLabel = t("modals.videoPlayer.teamNear", "Proche");
  const teamFarLabel = t("modals.videoPlayer.teamFar", "Loin");

  return (
    <aside className="flex flex-col h-full bg-background dark:bg-slate-950/95 border-t lg:border-t-0 lg:border-l border-border min-h-0">
      {/* Sidebar Header & Quick Stats */}
      <div className="p-3 border-b border-border space-y-2.5 shrink-0 bg-card/60 dark:bg-transparent">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate">
                {t("modals.videoPlayer.servesTitle", "Services & Échanges")}
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-bold tabular-nums">
                {serves.length}
              </span>
            </h4>
            <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground mt-0.5 tabular-nums">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {counts.activeMins}m {t("modals.videoPlayer.activeTime", "jeu actif")}
              </span>
              <span>•</span>
              <span>
                {t("modals.videoPlayer.avgDuration", "Moy.")} {counts.avgSec}s
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant={autoFollow ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setAutoFollow((v) => !v)}
            className="h-7 px-2 text-[11px] gap-1 shrink-0"
            title={
              autoFollow
                ? "Auto-scroll actif sur le service en cours"
                : "Activer l'auto-scroll"
            }
          >
            {autoFollow ? (
              <Lock className="h-3 w-3 text-primary" />
            ) : (
              <Unlock className="h-3 w-3" />
            )}
            <span>{t("modals.videoPlayer.autoFollow", "Suivre")}</span>
          </Button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t(
              "modals.videoPlayer.searchPlaceholder",
              "Chercher #service ou temps (ex: 14, 12:10)"
            )}
            className="h-8 pl-8 pr-7 text-xs bg-muted/40"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1 flex-wrap">
          {(
            [
              { id: "all", label: `${t("modals.videoPlayer.filterAll", "Tous")} (${counts.all})` },
              { id: "near", label: `${teamNearLabel} (${counts.near})`, dot: "bg-sky-400" },
              { id: "far", label: `${teamFarLabel} (${counts.far})`, dot: "bg-emerald-400" },
              { id: "long", label: `${t("modals.videoPlayer.filterLong", "Longs ≥30s")} (${counts.long})` },
              { id: "breaks", label: `${t("modals.videoPlayer.filterBreaks", "Pauses")} (${counts.breaks})` },
            ] as { id: ServeFilter; label: string; dot?: string }[]
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors border",
                filter === item.id
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border-transparent"
              )}
            >
              {item.dot && <span className={cn("w-1.5 h-1.5 rounded-full", item.dot)} />}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Clip Padding Quick Setting */}
        <div className="flex items-center justify-between gap-2 pt-0.5 text-[11px]">
          <span className="text-muted-foreground flex items-center gap-1">
            <Scissors className="h-3 w-3 text-primary" />
            {t("modals.videoPlayer.clipMargin", "Marge clip rapide")} :
          </span>
          <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-md">
            {[0, 1, 2].map((pad) => (
              <button
                key={pad}
                type="button"
                onClick={() => onChangeClipPadding(pad)}
                className={cn(
                  "px-2 py-0.5 rounded text-[11px] font-medium transition-colors tabular-nums",
                  clipPaddingSec === pad
                    ? "bg-background text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {pad === 0 ? "Exact" : `±${pad}s`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable Serves List */}
      <div
        ref={listRef}
        onMouseEnter={() => setIsHoveringList(true)}
        onMouseLeave={() => setIsHoveringList(false)}
        className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-1.5"
      >
        {filteredServes.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            {t("modals.videoPlayer.noMatchingServes", "Aucun service ne correspond à ce filtre")}
          </div>
        ) : (
          filteredServes.map((serve) => {
            const isActive = serve.num === activeServeNum;
            const isNear = serve.team === "near";
            const isLong = serve.duration_s >= 30;
            const status = clipStatuses[serve.num];
            const nextServe = nextServeByNum.get(serve.num);
            const hasBreakAfter =
              serve.ended_by === "players left the court" && nextServe !== undefined;
            const gapSec =
              hasBreakAfter && nextServe
                ? Math.max(0, nextServe.start_sec - serve.end_sec)
                : 0;

            return (
              <React.Fragment key={serve.num}>
                <div
                  ref={isActive ? activeItemRef : undefined}
                  onClick={() => onSelectServe(serve)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectServe(serve);
                    }
                  }}
                  className={cn(
                    "group/row relative flex items-center justify-between gap-2 p-2.5 rounded-xl border transition-all cursor-pointer select-none",
                    isActive
                      ? isNear
                        ? "bg-sky-50 border-sky-400 shadow-sm ring-1 ring-sky-400/30 dark:bg-sky-500/15 dark:border-sky-500/60 dark:ring-sky-500/30"
                        : "bg-emerald-50 border-emerald-400 shadow-sm ring-1 ring-emerald-400/30 dark:bg-emerald-500/15 dark:border-emerald-500/60 dark:ring-emerald-500/30"
                      : "bg-card hover:bg-muted/60 border-border/70 hover:border-border shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:bg-card/50 dark:hover:bg-muted/70 dark:border-border/50 dark:shadow-none"
                  )}
                >
                  {/* Left color accent strip */}
                  <div
                    className={cn(
                      "w-1 self-stretch rounded-full shrink-0",
                      isNear ? "bg-sky-500 dark:bg-sky-400" : "bg-emerald-500 dark:bg-emerald-400"
                    )}
                  />

                  {/* Main serve metadata */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-xs text-foreground">
                        {`Serve ${serve.num}`}
                      </span>

                      <span
                        className={cn(
                          "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                          isNear
                            ? "bg-sky-500/15 text-sky-700 dark:text-sky-300"
                            : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        )}
                      >
                        {isNear ? teamNearLabel : teamFarLabel}
                      </span>

                      {isLong && (
                        <span
                          title="Échange long (≥ 30s)"
                          className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-orange-500/15 text-orange-700 dark:text-orange-300"
                        >
                          <Flame className="h-2.5 w-2.5" />
                          {serve.duration_s}s
                        </span>
                      )}

                      {isActive && (
                        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1 tabular-nums">
                      <span>
                        {formatMatchTime(serve.start_sec)} – {formatMatchTime(serve.end_sec)}
                      </span>
                      {!isLong && (
                        <>
                          <span>•</span>
                          <span className="font-medium text-foreground/80">
                            {serve.duration_s}s
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Direct Clip Creation Controls */}
                  <div
                    className="flex items-center gap-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      type="button"
                      size="sm"
                      variant={status === "created" ? "secondary" : "outline"}
                      disabled={status === "creating"}
                      onClick={() => onQuickClipServe(serve)}
                      title={`${t("modals.videoPlayer.quickClip", "Clip rapide")} (${
                        clipPaddingSec === 0 ? "Exact" : `±${clipPaddingSec}s`
                      })`}
                      className={cn(
                        "h-7 px-2 text-[11px] gap-1",
                        status === "created" &&
                          "text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                      )}
                    >
                      {status === "creating" ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : status === "created" ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Scissors className="h-3 w-3" />
                      )}
                      <span className="hidden sm:inline">
                        {status === "creating"
                          ? t("modals.videoPlayer.creatingClip", "Envoi...")
                          : status === "created"
                            ? t("modals.videoPlayer.clipQueued", "Clip ✓")
                            : "Clip"}
                      </span>
                    </Button>

                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => onEditClipServe(serve)}
                      title={t("modals.videoPlayer.editClip", "Ajuster dans l'éditeur de clip")}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {hasBreakAfter && (
                  <div className="flex items-center gap-2 py-1 px-2 text-[10px] text-amber-600 dark:text-amber-300/90">
                    <div className="h-px flex-1 bg-amber-500/25" />
                    <span className="flex items-center gap-1 font-medium shrink-0">
                      <PauseCircle className="h-3 w-3" />
                      {t("modals.videoPlayer.breakLabel", "Changement de côté / Pause")} (
                      {formatGapDuration(gapSec)})
                    </span>
                    <div className="h-px flex-1 bg-amber-500/25" />
                  </div>
                )}
              </React.Fragment>
            );
          })
        )}
      </div>
    </aside>
  );
});

