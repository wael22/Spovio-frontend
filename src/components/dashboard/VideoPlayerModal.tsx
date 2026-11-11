import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Hls from "hls.js";
import { Button } from "@/components/ui/button";
import {
  Scissors,
  Video as VideoIcon,
  Download,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ChevronLeft,
  ChevronRight,
  Zap,
  PanelRightOpen,
  PanelRightClose,
  SlidersHorizontal,
  Loader2,
  RotateCcw,
  RotateCw,
  Check,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { VideoClipEditor } from "./VideoClipEditor";
import { toast } from "sonner";
import { getMatchKey, getCleanVideoTitle } from "@/lib/videoUtils";
import {
  clipService,
  videoService,
  ServeSegment,
  VideoSegmentsResponse,
  VideoSegmentsSummary,
} from "@/lib/api";
import { getPreferredPlaybackUrl, getBunnyVideoUrl, getWorkingVideoUrl } from "@/lib/bunnyVideoHelper";
import { SegmentedSeekbar } from "./player/SegmentedSeekbar";
import { ServesSidebar, ClipStatusState } from "./player/ServesSidebar";
import {
  computePaddedClipBounds,
  findServeAtTime,
  formatGapDuration,
  formatMatchTime,
} from "./player/serveUtils";
import { cn } from "@/lib/utils";

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: any;
  allVideos?: any[];
  onClipCreated?: (clip: any) => void;
  isClip?: boolean;
}

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

export function VideoPlayerModal({
  isOpen,
  onClose,
  video,
  allVideos = [],
  onClipCreated,
  isClip = false,
}: VideoPlayerModalProps) {
  const { t, i18n } = useTranslation();
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const segmentsCacheRef = useRef<Map<string | number, VideoSegmentsResponse>>(new Map());
  const pendingRestoreRef = useRef<{ time: number; play: boolean } | null>(null);
  const isScrubbingRef = useRef(false);
  const lastAutoSkipAtRef = useRef(0);
  const autoStopTriggeredRef = useRef(false);
  const skipNoticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userToggledSidebarRef = useRef(false);
  const speedMenuRef = useRef<HTMLDivElement>(null);

  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [currentVideo, setCurrentVideo] = useState<any>(video);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState<number>(video?.duration || 0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // AI Segments & Sidebar state
  const [serves, setServes] = useState<ServeSegment[]>([]);
  const [segmentsSummary, setSegmentsSummary] = useState<VideoSegmentsSummary | null>(null);
  const [segmentsLoading, setSegmentsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [skipDeadTime, setSkipDeadTime] = useState(false);
  const [skipNotice, setSkipNotice] = useState<string | null>(null);

  // Clip Creation state
  const [clipPaddingSec, setClipPaddingSec] = useState<number>(1);
  const [clipStatusesByVideo, setClipStatusesByVideo] = useState<
    Record<string, Record<number, ClipStatusState>>
  >({});
  const [clipEditorOpen, setClipEditorOpen] = useState(false);
  const [clipDraft, setClipDraft] = useState<{
    startTime?: number;
    endTime?: number;
    title?: string;
    description?: string;
  } | null>(null);

  // Keep latest values in refs for timeupdate/keyboard handlers
  const servesRef = useRef<ServeSegment[]>(serves);
  servesRef.current = serves;
  const skipDeadTimeRef = useRef<boolean>(skipDeadTime);
  skipDeadTimeRef.current = skipDeadTime;
  const durationRef = useRef<number>(duration);
  durationRef.current = duration;

  useEffect(() => {
    setCurrentVideo(video);
    setDuration(video?.duration || 0);
    setCurrentTime(0);
    setBufferedEnd(0);
    setIsPlaying(false);
    setIsBuffering(false);
    setSpeedMenuOpen(false);
    autoStopTriggeredRef.current = false;
    userToggledSidebarRef.current = false;
  }, [video]);

  // Multi-angle companion detection
  const currentMatchKey = getMatchKey(currentVideo);
  const companionVideos =
    currentMatchKey && allVideos?.length
      ? allVideos
          .filter((v) => getMatchKey(v) === currentMatchKey)
          .sort((a, b) => (a.camera_index || 1) - (b.camera_index || 1))
      : [];
  const isMultiAngle = companionVideos.length > 1;

  const rawTitle = currentVideo?.title || t("modals.videoPlayer.title", "Lecteur vidéo");
  const cleanedTitle = isMultiAngle
    ? getCleanVideoTitle(currentVideo, companionVideos.length)
    : rawTitle;
  const displayTitle = i18n.language?.startsWith("en")
    ? cleanedTitle.replace(/\bCaméra\b/gi, "Camera")
    : cleanedTitle;

  const teamNearLabel = t("modals.videoPlayer.teamNear", "Proche");
  const teamFarLabel = t("modals.videoPlayer.teamFar", "Loin");

  const showSkipBadge = useCallback((msg: string) => {
    setSkipNotice(msg);
    if (skipNoticeTimerRef.current) clearTimeout(skipNoticeTimerRef.current);
    skipNoticeTimerRef.current = setTimeout(() => {
      setSkipNotice(null);
    }, 2200);
  }, []);

  useEffect(() => {
    return () => {
      if (skipNoticeTimerRef.current) clearTimeout(skipNoticeTimerRef.current);
    };
  }, []);

  // Track Fullscreen state
  useEffect(() => {
    const onFsChange = () => {
      const container = playerContainerRef.current;
      setIsFullscreen(Boolean(container && document.fullscreenElement === container));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Close speed menu on outside click
  useEffect(() => {
    if (!speedMenuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(e.target as Node)) {
        setSpeedMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [speedMenuOpen]);

  // Load AI serve segments cleanly (never for clips to avoid ID collision)
  useEffect(() => {
    const isActualVideo = Boolean(
      !isClip &&
        currentVideo?.id &&
        (currentVideo.processing_status !== undefined ||
          currentVideo.ai_status !== undefined ||
          currentVideo.ai_analytics_requested !== undefined ||
          currentVideo.court_name !== undefined)
    );

    if (!isOpen || !isActualVideo || !currentVideo?.id) {
      setServes([]);
      setSegmentsSummary(null);
      setSidebarOpen(false);
      setSegmentsLoading(false);
      return;
    }

    const vidId = currentVideo.id;
    const cached = segmentsCacheRef.current.get(vidId);
    if (cached) {
      const cachedServes = cached.serves || [];
      setServes(cachedServes);
      setSegmentsSummary(cached.summary || null);
      if (
        cachedServes.length > 0 &&
        !userToggledSidebarRef.current &&
        typeof window !== "undefined" &&
        window.innerWidth >= 1024
      ) {
        setSidebarOpen(true);
      } else if (cachedServes.length === 0) {
        setSidebarOpen(false);
      }
      return;
    }

    let cancelled = false;
    setSegmentsLoading(true);

    videoService
      .getVideoSegments(vidId)
      .then((res) => {
        if (cancelled) return;
        const data = res.data;
        segmentsCacheRef.current.set(vidId, data);
        const fetchedServes = data?.serves || [];
        setServes(fetchedServes);
        setSegmentsSummary(data?.summary || null);
        if (
          fetchedServes.length > 0 &&
          !userToggledSidebarRef.current &&
          typeof window !== "undefined" &&
          window.innerWidth >= 1024
        ) {
          setSidebarOpen(true);
        } else if (fetchedServes.length === 0) {
          setSidebarOpen(false);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn("[VideoPlayer] Segments unavailable:", err?.response?.status || err?.message);
        setServes([]);
        setSegmentsSummary(null);
        setSidebarOpen(false);
      })
      .finally(() => {
        if (!cancelled) setSegmentsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, isClip, currentVideo?.id, currentVideo?.processing_status, currentVideo?.ai_status, currentVideo?.ai_analytics_requested, currentVideo?.court_name]);

  // Callback ref to capture <video> node
  const videoCallbackRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    setVideoElement(node);
  }, []);

  // Initialize HLS or MP4 stream
  useEffect(() => {
    if (!currentVideo || !isOpen || !videoElement) {
      if (!isOpen && videoElement && !videoElement.paused) {
        videoElement.pause();
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      return;
    }

    const playbackUrl = getPreferredPlaybackUrl(currentVideo) || currentVideo.file_url || "";
    if (!playbackUrl) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const fallbackMp4 =
      (currentVideo.file_url && currentVideo.file_url.includes(".mp4") && currentVideo.file_url) ||
      (currentVideo.bunny_video_id
        ? getBunnyVideoUrl(currentVideo.bunny_video_id, "720p")
        : "");

    let triedMp4Fallback = false;
    const isHLS = playbackUrl.includes(".m3u8");
    const isMP4 = playbackUrl.includes(".mp4");

    const applyPendingRestore = () => {
      const pending = pendingRestoreRef.current;
      if (!pending || !videoRef.current) return;
      pendingRestoreRef.current = null;
      videoRef.current.currentTime = pending.time;
      setCurrentTime(pending.time);
      if (pending.play) {
        videoRef.current.play().catch(() => {});
      }
    };

    if (isMP4) {
      videoElement.src = playbackUrl;
      videoElement.load();
      videoElement.playbackRate = playbackRate;
      videoElement.volume = volume;
      videoElement.muted = isMuted;
      if (pendingRestoreRef.current) {
        const onMeta = () => applyPendingRestore();
        videoElement.addEventListener("loadedmetadata", onMeta, { once: true });
      }
    } else if (isHLS && Hls.isSupported()) {
      const startPos = pendingRestoreRef.current ? pendingRestoreRef.current.time : -1;
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
        startPosition: startPos,
      });

      hls.loadSource(playbackUrl);
      hls.attachMedia(videoElement);
      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoElement.playbackRate = playbackRate;
        videoElement.volume = volume;
        videoElement.muted = isMuted;
        applyPendingRestore();
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;
        console.error("[VideoPlayer] Fatal HLS error:", data);
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          if (!triedMp4Fallback && fallbackMp4 && fallbackMp4 !== playbackUrl) {
            triedMp4Fallback = true;
            hls.destroy();
            hlsRef.current = null;
            videoElement.src = fallbackMp4;
            videoElement.load();
            return;
          }
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
    } else if (isHLS && videoElement.canPlayType("application/vnd.apple.mpegurl")) {
      videoElement.src = playbackUrl;
      videoElement.load();
      videoElement.addEventListener("loadedmetadata", () => applyPendingRestore(), { once: true });
    } else {
      videoElement.src = playbackUrl;
      videoElement.load();
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
    // Intentionally keep playbackRate/volume/muted out so tweaks don't reload stream
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVideo, isOpen, videoElement]);

  // Sync volume/mute/rate imperatively
  useEffect(() => {
    if (!videoElement) return;
    videoElement.volume = volume;
    videoElement.muted = isMuted;
  }, [videoElement, volume, isMuted]);

  useEffect(() => {
    if (!videoElement) return;
    videoElement.playbackRate = playbackRate;
  }, [videoElement, playbackRate]);

  // Binary search active serve (only changes state passed down on boundary transitions)
  const serveLookup = useMemo(() => findServeAtTime(serves, currentTime), [serves, currentTime]);
  const activeServe = serveLookup.activeServe;
  const activeServeNum = activeServe?.num ?? null;

  // Player actions
  const togglePlay = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      autoStopTriggeredRef.current = false;
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, []);

  const handleSeek = useCallback((timeSec: number) => {
    const el = videoRef.current;
    if (!el) return;
    const dur = el.duration && Number.isFinite(el.duration) ? el.duration : durationRef.current;
    const clamped = Math.max(0, dur > 0 ? Math.min(dur, timeSec) : timeSec);
    el.currentTime = clamped;
    setCurrentTime(clamped);
    autoStopTriggeredRef.current = false;
  }, []);

  const handleSelectServe = useCallback((serve: ServeSegment) => {
    const el = videoRef.current;
    if (!el) return;
    // +0.02s guarantees currentTime >= serve.start_sec even with float rounding
    const target = serve.end_sec - serve.start_sec > 0.5 ? serve.start_sec + 0.02 : serve.start_sec;
    el.currentTime = target;
    setCurrentTime(target);
    lastAutoSkipAtRef.current = Date.now();
    autoStopTriggeredRef.current = false;
    el.play().catch(() => {});
  }, []);

  const jumpPrevServe = useCallback(() => {
    const list = servesRef.current;
    if (list.length === 0) return;
    const tNow = videoRef.current?.currentTime ?? 0;
    const lookup = findServeAtTime(list, tNow);
    if (lookup.activeIndex > 0) {
      // If more than 2.5s into current serve, rewind to current serve start; otherwise jump to previous serve
      const curr = list[lookup.activeIndex];
      if (tNow - curr.start_sec > 2.5) {
        handleSelectServe(curr);
      } else {
        handleSelectServe(list[lookup.activeIndex - 1]);
      }
    } else if (lookup.activeIndex === 0) {
      handleSelectServe(list[0]);
    } else if (lookup.nextServeIndex > 0) {
      handleSelectServe(list[lookup.nextServeIndex - 1]);
    } else if (lookup.nextServeIndex === -1) {
      handleSelectServe(list[list.length - 1]);
    } else {
      handleSelectServe(list[0]);
    }
  }, [handleSelectServe]);

  const jumpNextServe = useCallback(() => {
    const list = servesRef.current;
    if (list.length === 0) return;
    const tNow = videoRef.current?.currentTime ?? 0;
    const lookup = findServeAtTime(list, tNow);
    if (lookup.nextServeIndex >= 0 && lookup.nextServeIndex < list.length) {
      handleSelectServe(list[lookup.nextServeIndex]);
    }
  }, [handleSelectServe]);

  const toggleFullscreen = useCallback(() => {
    const container = playerContainerRef.current;
    if (!container) return;
    if (document.fullscreenElement === container) {
      document.exitFullscreen().catch(() => {});
    } else {
      container.requestFullscreen().catch(() => {});
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  // Multi-angle switch preserving time & play state
  const handleSwitchAngle = (companion: any) => {
    if (!companion || companion.id === currentVideo?.id) return;
    const el = videoRef.current;
    pendingRestoreRef.current = {
      time: el?.currentTime || currentTime || 0,
      play: el ? !el.paused : false,
    };
    setCurrentVideo(companion);
  };

  // Download handler
  const handleDownloadCurrent = async () => {
    if (!currentVideo) return;
    if (
      currentVideo.is_expired ||
      (currentVideo.processing_status && currentVideo.processing_status !== "ready")
    ) {
      toast.error(t("toasts.downloadUnavailable", "Téléchargement indisponible"));
      return;
    }
    if (!currentVideo.bunny_video_id) {
      toast.error(t("toasts.bunnyMissing", "Vidéo non disponible pour le téléchargement"));
      return;
    }

    const angleNum = currentVideo.camera_index || 1;
    const angleLabel = isMultiAngle
      ? ` (${t("modals.videoPlayer.angle", { angle: angleNum, defaultValue: `Angle ${angleNum}` })})`
      : "";
    try {
      toast.loading(`${t("toasts.findingQuality", "Recherche de la meilleure qualité...")}${angleLabel}`, {
        id: "player-download-toast",
      });
      const finalUrl = await getWorkingVideoUrl(currentVideo.bunny_video_id, "720p");

      toast.loading(`${t("toasts.downloading", "Téléchargement en cours...")}${angleLabel}`, {
        id: "player-download-toast",
      });
      const response = await fetch(finalUrl);
      if (!response.ok) throw new Error("Network error");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const angleSuffix = isMultiAngle ? `_Angle${angleNum}` : "";
      link.download = `${(currentVideo.title || "video").replace(/\s+/g, "_")}${angleSuffix}.mp4`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast.dismiss("player-download-toast");
      toast.success(`${t("toasts.downloadComplete", "Téléchargement terminé !")}${angleLabel}`);
    } catch (err) {
      console.error("Download error:", err);
      toast.dismiss("player-download-toast");
      toast.info(t("toasts.downloadFailed", "Téléchargement direct échoué, ouverture du lien..."));
      window.open(
        `https://vz-9b857324-07d.b-cdn.net/${currentVideo.bunny_video_id}/play_720p.mp4`,
        "_blank"
      );
    }
  };

  // Clip Status Map helper for current video
  const currentVideoKey = String(currentVideo?.id ?? "none");
  const currentClipStatuses = useMemo(
    () => clipStatusesByVideo[currentVideoKey] || {},
    [clipStatusesByVideo, currentVideoKey]
  );

  // 1-Click Direct Clip from Serve Section
  const handleQuickClipServe = useCallback(
    async (serve: ServeSegment) => {
      if (!currentVideo?.id) return;
      const vKey = String(currentVideo.id);
      if (clipStatusesByVideo[vKey]?.[serve.num] === "creating") return;

      const bounds = computePaddedClipBounds(
        serve,
        clipPaddingSec,
        durationRef.current || currentVideo.duration
      );
      const sideText = serve.team === "near" ? teamNearLabel : teamFarLabel;
      const baseTitle = displayTitle || "Match";
      const rawClipTitle = `Serve ${serve.num} (${sideText}) - ${baseTitle}`;
      const clipTitle = rawClipTitle.slice(0, 180);
      const clipDescription = `${formatMatchTime(bounds.startTime)} - ${formatMatchTime(
        bounds.endTime
      )} • Serve ${serve.num} (${serve.duration_s}s)`;

      setClipStatusesByVideo((prev) => ({
        ...prev,
        [vKey]: { ...(prev[vKey] || {}), [serve.num]: "creating" },
      }));

      try {
        const resp = await clipService.createClip({
          video_id: String(currentVideo.id),
          start_time: bounds.startTime,
          end_time: bounds.endTime,
          title: clipTitle,
          description: clipDescription,
        });

        setClipStatusesByVideo((prev) => ({
          ...prev,
          [vKey]: { ...(prev[vKey] || {}), [serve.num]: "created" },
        }));

        toast.success(
          t("modals.videoPlayer.clipStartedToast", {
            title: `Serve ${serve.num}`,
            defaultValue: `Clip "Serve ${serve.num}" lancé ! Retrouvez-le dans Mes Clips.`,
          })
        );
        onClipCreated?.(resp.data?.clip);
      } catch (err: any) {
        console.error("[VideoPlayer] Quick clip error:", err);
        setClipStatusesByVideo((prev) => ({
          ...prev,
          [vKey]: { ...(prev[vKey] || {}), [serve.num]: "error" },
        }));
        const msg =
          err?.response?.data?.error ||
          t("modals.videoPlayer.clipErrorToast", "Impossible de lancer la création du clip.");
        toast.error(msg);
      }
    },
    [
      currentVideo?.id,
      currentVideo?.duration,
      clipStatusesByVideo,
      clipPaddingSec,
      teamNearLabel,
      teamFarLabel,
      displayTitle,
      t,
      onClipCreated,
    ]
  );

  // Open pre-populated VideoClipEditor for fine trim / title
  const openEditorWithDraft = useCallback(
    (draft: { startTime?: number; endTime?: number; title?: string; description?: string } | null) => {
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
      }
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setClipDraft(draft);
      setClipEditorOpen(true);
    },
    []
  );

  const handleEditClipServe = useCallback(
    (serve: ServeSegment) => {
      const bounds = computePaddedClipBounds(
        serve,
        clipPaddingSec,
        durationRef.current || currentVideo?.duration
      );
      const sideText = serve.team === "near" ? teamNearLabel : teamFarLabel;
      const baseTitle = displayTitle || "Match";
      const title = `Serve ${serve.num} (${sideText}) - ${baseTitle}`.slice(0, 180);
      const description = `${formatMatchTime(bounds.startTime)} - ${formatMatchTime(
        bounds.endTime
      )} • Serve ${serve.num} (${serve.duration_s}s)`;

      openEditorWithDraft({
        startTime: bounds.startTime,
        endTime: bounds.endTime,
        title,
        description,
      });
    },
    [clipPaddingSec, currentVideo?.duration, displayTitle, openEditorWithDraft, teamFarLabel, teamNearLabel]
  );

  const handleOpenFreeClipEditor = () => {
    if (activeServe) {
      handleEditClipServe(activeServe);
      return;
    }
    const cur = videoRef.current?.currentTime ?? currentTime ?? 0;
    const dur = durationRef.current || currentVideo?.duration || cur + 30;
    const start = Math.max(0, Math.floor(cur));
    const end = Math.min(dur, Math.max(start + 1, start + 25));
    openEditorWithDraft({
      startTime: start,
      endTime: end,
      title: "",
      description: "",
    });
  };

  // HTMLVideoElement events
  const handleTimeUpdate = () => {
    const el = videoRef.current;
    if (!el) return;
    const tNow = el.currentTime;
    setCurrentTime(tNow);

    // Update buffered ahead
    if (el.buffered && el.buffered.length > 0) {
      for (let i = 0; i < el.buffered.length; i++) {
        if (el.buffered.start(i) <= tNow && el.buffered.end(i) >= tNow) {
          setBufferedEnd(el.buffered.end(i));
          break;
        }
      }
    }

    // Auto-skip dead time when "Rallies only" mode is active
    const list = servesRef.current;
    if (
      skipDeadTimeRef.current &&
      list.length > 0 &&
      !el.paused &&
      !isScrubbingRef.current &&
      Date.now() - lastAutoSkipAtRef.current > 800
    ) {
      const lookup = findServeAtTime(list, tNow);
      if (lookup.inGap) {
        if (lookup.nextServeIndex >= 0) {
          const nextServe = list[lookup.nextServeIndex];
          const gapRemaining = nextServe.start_sec - tNow;
          const prevServe = lookup.nextServeIndex > 0 ? list[lookup.nextServeIndex - 1] : null;
          const pastPrevBuffer = !prevServe || tNow - prevServe.end_sec > 0.7;

          if (gapRemaining > 1.3 && pastPrevBuffer) {
            lastAutoSkipAtRef.current = Date.now();
            const target =
              nextServe.end_sec - nextServe.start_sec > 0.5
                ? nextServe.start_sec + 0.02
                : nextServe.start_sec;
            el.currentTime = target;
            setCurrentTime(target);
            showSkipBadge(`⚡ → Serve ${nextServe.num} (-${formatGapDuration(gapRemaining)})`);
          }
        } else if (!autoStopTriggeredRef.current) {
          const lastServe = list[list.length - 1];
          const totalDur = el.duration && Number.isFinite(el.duration) ? el.duration : durationRef.current;
          if (lastServe && tNow > lastServe.end_sec + 1.5 && (totalDur === 0 || totalDur - tNow > 4)) {
            autoStopTriggeredRef.current = true;
            el.pause();
            showSkipBadge(t("modals.videoPlayer.endOfRallies", "Fin des échanges"));
          }
        }
      }
    }
  };

  // Keyboard shortcuts when modal is open & editor closed
  useEffect(() => {
    if (!isOpen || clipEditorOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      const el = videoRef.current;
      if (!el) return;

      switch (e.key) {
        case " ":
        case "k":
        case "K":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
        case "j":
        case "J":
          e.preventDefault();
          handleSeek((el.currentTime || 0) - 5);
          break;
        case "ArrowRight":
        case "l":
        case "L":
          e.preventDefault();
          handleSeek((el.currentTime || 0) + 5);
          break;
        case "ArrowUp":
        case "[":
          if (servesRef.current.length > 0) {
            e.preventDefault();
            jumpPrevServe();
          }
          break;
        case "ArrowDown":
        case "]":
          if (servesRef.current.length > 0) {
            e.preventDefault();
            jumpNextServe();
          }
          break;
        case "m":
        case "M":
          e.preventDefault();
          toggleMute();
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, clipEditorOpen, togglePlay, handleSeek, jumpPrevServe, jumpNextServe, toggleMute, toggleFullscreen]);

  if (!currentVideo) return null;

  const hasServes = serves.length > 0;
  const upcomingServe =
    serveLookup.nextServeIndex >= 0 && serveLookup.nextServeIndex < serves.length
      ? serves[serveLookup.nextServeIndex]
      : null;
  const activeClipStatus = activeServe ? currentClipStatuses[activeServe.num] : undefined;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent
          className={cn(
            "flex flex-col gap-0 p-0 overflow-hidden max-h-[92vh] w-[calc(100%-1.5rem)]",
            hasServes && sidebarOpen ? "sm:max-w-6xl xl:max-w-7xl" : "sm:max-w-4xl md:max-w-5xl"
          )}
        >
          {/* Modal Top Header */}
          <div className="shrink-0 p-3 sm:p-4 border-b border-border space-y-2.5 bg-card dark:bg-background">
            <div className="pr-9 flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-base sm:text-lg text-foreground leading-snug break-words">
                {displayTitle}
              </h3>
              {hasServes && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tabular-nums">
                  {t("modals.videoPlayer.servesPanel", {
                    count: serves.length,
                    defaultValue: `${serves.length} services`,
                  })}
                </span>
              )}
              {segmentsLoading && !hasServes && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-0.5">
              {isMultiAngle ? (
                <div className="flex items-center gap-1.5 bg-muted/80 dark:bg-muted/40 p-1 rounded-lg w-fit max-w-full overflow-x-auto shrink-0">
                  {companionVideos.map((cVid) => {
                    const isSelected = cVid.id === currentVideo.id;
                    const angleNum = cVid.camera_index || 1;
                    return (
                      <Button
                        key={cVid.id}
                        variant={isSelected ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handleSwitchAngle(cVid)}
                        className={cn(
                          "h-7 sm:h-8 text-xs sm:text-sm px-2.5 sm:px-3 font-medium gap-1.5 shrink-0",
                          isSelected && "shadow-sm font-semibold"
                        )}
                      >
                        <VideoIcon className="h-3.5 w-3.5" />
                        <span>
                          {t("modals.videoPlayer.angle", {
                            angle: angleNum,
                            defaultValue: `Angle ${angleNum}`,
                          })}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              ) : (
                <div className="hidden sm:block" />
              )}

              {/* Header Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                {hasServes && (
                  <Button
                    type="button"
                    variant={sidebarOpen ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => {
                      userToggledSidebarRef.current = true;
                      setSidebarOpen((v) => !v);
                    }}
                    className="gap-1.5 h-8 sm:h-9 text-xs sm:text-sm px-2.5 sm:px-3"
                  >
                    {sidebarOpen ? (
                      <PanelRightClose className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
                    ) : (
                      <PanelRightOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    )}
                    <span className="tabular-nums">
                      {t("modals.videoPlayer.servesPanel", {
                        count: serves.length,
                        defaultValue: `Services (${serves.length})`,
                      })}
                    </span>
                  </Button>
                )}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadCurrent}
                  className="flex-1 sm:flex-none justify-center gap-1.5 h-8 sm:h-9 text-xs sm:text-sm px-2.5 sm:px-3 min-w-0"
                  disabled={
                    currentVideo.is_expired ||
                    (currentVideo.processing_status && currentVideo.processing_status !== "ready")
                  }
                >
                  <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  <span className="truncate">
                    {isMultiAngle
                      ? t("modals.videoPlayer.downloadAngle", {
                          angle: currentVideo.camera_index || 1,
                          defaultValue: `Télécharger Angle ${currentVideo.camera_index || 1}`,
                        })
                      : t("modals.videoPlayer.download", { defaultValue: "Télécharger" })}
                  </span>
                </Button>

                {!isClip && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleOpenFreeClipEditor}
                    className="flex-1 sm:flex-none justify-center gap-1.5 h-8 sm:h-9 text-xs sm:text-sm px-2.5 sm:px-3 min-w-0"
                  >
                    <Scissors className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span className="truncate">
                      {activeServe
                        ? `${t("modals.videoPlayer.createClip", { defaultValue: "Créer un clip" })} (S${activeServe.num})`
                        : isMultiAngle
                          ? t("modals.videoPlayer.createClipAngle", {
                              angle: currentVideo.camera_index || 1,
                              defaultValue: `Créer clip (Angle ${currentVideo.camera_index || 1})`,
                            })
                          : t("modals.videoPlayer.createClip", { defaultValue: "Créer un clip" })}
                    </span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Player Studio Workspace (Video + Custom Segmented Dock | Collapsible Serves Sidebar) */}
          <div
            ref={playerContainerRef}
            className={cn(
              "flex-1 min-h-0 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden bg-background text-foreground dark:bg-black",
              isFullscreen && "w-screen h-screen"
            )}
          >
            {/* Video Stage + Custom Control Dock */}
            <div className="flex-1 min-w-0 flex flex-col bg-background dark:bg-black relative min-h-0">
              {/* Video Viewport */}
              <div
                onClick={togglePlay}
                onDoubleClick={toggleFullscreen}
                className={cn(
                  "relative flex-1 min-h-0 flex items-center justify-center bg-black cursor-pointer select-none overflow-hidden",
                  !isFullscreen && "aspect-video lg:aspect-auto lg:min-h-[340px]"
                )}
              >
                <video
                  ref={videoCallbackRef}
                  className={cn(
                    "w-full h-full object-contain",
                    !isFullscreen && "max-h-[55vh] lg:max-h-[60vh]"
                  )}
                  playsInline
                  preload="metadata"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={(e) => {
                    const dur = e.currentTarget.duration;
                    if (dur && Number.isFinite(dur)) setDuration(dur);
                    setIsBuffering(false);
                  }}
                  onDurationChange={(e) => {
                    const dur = e.currentTarget.duration;
                    if (dur && Number.isFinite(dur)) setDuration(dur);
                  }}
                  onWaiting={() => setIsBuffering(true)}
                  onSeeking={() => setIsBuffering(true)}
                  onSeeked={() => setIsBuffering(false)}
                  onCanPlay={() => setIsBuffering(false)}
                  onPlaying={() => setIsBuffering(false)}
                >
                  {t("modals.videoPlayer.unsupported")}
                </video>

                {/* Active Serve Top-Left Floating HUD Badge */}
                {activeServe && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-3 left-3 z-20 flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/90 text-slate-900 border border-black/10 dark:bg-black/75 dark:text-white dark:border-white/15 backdrop-blur-md text-xs shadow-lg pointer-events-none"
                  >
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        activeServe.team === "near"
                          ? "bg-sky-500 dark:bg-sky-400"
                          : "bg-emerald-500 dark:bg-emerald-400"
                      )}
                    />
                    <span className="font-bold">{`Serve ${activeServe.num}`}</span>
                    <span className="text-slate-600 dark:text-white/70">
                      {activeServe.team === "near" ? teamNearLabel : teamFarLabel}
                    </span>
                    <span className="text-slate-500 dark:text-white/50 tabular-nums">
                      {activeServe.duration_s}s
                    </span>
                  </div>
                )}

                {/* Skip Dead Time Ephemeral Jump Pill */}
                {skipNotice && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-amber-500/95 text-slate-950 font-semibold text-xs shadow-lg backdrop-blur-md pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                    {skipNotice}
                  </div>
                )}

                {/* Buffering Spinner */}
                {isBuffering && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
                    <Loader2 className="h-10 w-10 text-white animate-spin drop-shadow-lg" />
                  </div>
                )}

                {/* Center Play Overlay When Paused */}
                {!isPlaying && !isBuffering && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/90 text-slate-900 border border-black/10 dark:bg-black/60 dark:text-white dark:border-white/25 backdrop-blur-md flex items-center justify-center shadow-2xl transition-transform hover:scale-105">
                      <Play className="h-6 w-6 sm:h-7 sm:w-7 fill-current ml-0.5" />
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Custom Seekbar & Pro Control Dock */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 px-3 sm:px-4 pt-2.5 pb-3 space-y-2 border-t transition-colors bg-card dark:bg-slate-950/95 border-border dark:border-white/10 text-foreground dark:text-white"
              >
                {/* Segmented Seekbar + Separated "Serve 1", "Serve 2" Chapter Strip */}
                <SegmentedSeekbar
                  duration={duration}
                  currentTime={currentTime}
                  bufferedEnd={bufferedEnd}
                  serves={serves}
                  activeServeNum={activeServeNum}
                  onSeek={handleSeek}
                  onSelectServe={handleSelectServe}
                  onScrubStateChange={(scrubbing) => {
                    isScrubbingRef.current = scrubbing;
                  }}
                  showChapterStrip={hasServes}
                />

                {/* Transport & Serve Navigation Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                  {/* Left: Play, +/-5s, Volume, Time */}
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all active:scale-95"
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4 fill-current" />
                      ) : (
                        <Play className="h-4 w-4 fill-current ml-0.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSeek((videoRef.current?.currentTime || 0) - 5)}
                      title="-5s (J / ←)"
                      className="hidden sm:flex items-center justify-center h-8 px-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground dark:hover:bg-white/10 dark:text-white/80 dark:hover:text-white transition-colors text-[11px] font-medium gap-0.5"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>5</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSeek((videoRef.current?.currentTime || 0) + 5)}
                      title="+5s (L / →)"
                      className="hidden sm:flex items-center justify-center h-8 px-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground dark:hover:bg-white/10 dark:text-white/80 dark:hover:text-white transition-colors text-[11px] font-medium gap-0.5"
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                      <span>5</span>
                    </button>

                    <div className="flex items-center gap-1.5 pl-0.5">
                      <button
                        type="button"
                        onClick={toggleMute}
                        title="Mute (M)"
                        className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground dark:hover:bg-white/10 dark:text-white/85 dark:hover:text-white transition-colors"
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="h-4 w-4 text-rose-500 dark:text-rose-400" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={isMuted ? 0 : volume}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          setVolume(v);
                          if (v > 0 && isMuted) setIsMuted(false);
                        }}
                        aria-label="Volume"
                        className="hidden md:block w-16 accent-primary cursor-pointer h-1"
                      />
                    </div>

                    <div className="pl-1.5 text-xs font-mono tabular-nums">
                      <span className="font-semibold text-foreground dark:text-white/90">
                        {formatMatchTime(currentTime)}
                      </span>
                      <span className="text-muted-foreground/50 dark:text-white/40 mx-1">/</span>
                      <span className="text-muted-foreground dark:text-white/60">
                        {formatMatchTime(duration)}
                      </span>
                    </div>
                  </div>

                  {/* Center: Prev/Next Serve Pill + Rallies-Only + Active Serve Quick Clip */}
                  {hasServes && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <div className="flex items-center bg-muted/70 border border-border dark:bg-white/[0.08] dark:border-white/10 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={jumpPrevServe}
                          title={`${t("modals.videoPlayer.prevServe", "Service préc.")} (↑)`}
                          className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-background text-muted-foreground hover:text-foreground dark:hover:bg-white/15 dark:text-white/85 dark:hover:text-white transition-colors"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>

                        {activeServe ? (
                          <span className="px-2 text-xs font-semibold tabular-nums text-foreground dark:text-white whitespace-nowrap">
                            {`Serve ${activeServe.num}`}
                            <span className="text-muted-foreground dark:text-white/45 font-normal">
                              {` / ${serves.length}`}
                            </span>
                          </span>
                        ) : upcomingServe ? (
                          <button
                            type="button"
                            onClick={() => handleSelectServe(upcomingServe)}
                            className="px-2 text-xs font-semibold tabular-nums text-amber-600 hover:text-amber-700 dark:text-amber-300 dark:hover:text-amber-200 whitespace-nowrap"
                          >
                            {`→ Serve ${upcomingServe.num}`}
                          </button>
                        ) : (
                          <span className="px-2 text-xs text-muted-foreground dark:text-white/60 tabular-nums">
                            {`-- / ${serves.length}`}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={jumpNextServe}
                          disabled={!upcomingServe}
                          title={`${t("modals.videoPlayer.nextServe", "Service suiv.")} (↓)`}
                          className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-background disabled:opacity-35 text-muted-foreground hover:text-foreground dark:hover:bg-white/15 dark:text-white/85 dark:hover:text-white transition-colors"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Skip Dead Time Toggle */}
                      <button
                        type="button"
                        onClick={() => setSkipDeadTime((v) => !v)}
                        title={t(
                          "modals.videoPlayer.skipDeadTimeTooltip",
                          "Sauter automatiquement les temps morts et changements de côté"
                        )}
                        className={cn(
                          "flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-medium border transition-all",
                          skipDeadTime
                            ? "bg-amber-50 border-amber-300 text-amber-800 shadow-sm dark:bg-amber-500/25 dark:border-amber-400/70 dark:text-amber-200 dark:shadow-[0_0_10px_rgba(251,191,36,0.2)]"
                            : "bg-muted/60 hover:bg-muted border-border text-foreground/80 hover:text-foreground dark:bg-white/[0.06] dark:hover:bg-white/15 dark:border-white/10 dark:text-white/80 dark:hover:text-white"
                        )}
                      >
                        <Zap
                          className={cn(
                            "h-3.5 w-3.5",
                            skipDeadTime && "fill-amber-500 text-amber-600 dark:fill-amber-300 dark:text-amber-300"
                          )}
                        />
                        <span className="hidden sm:inline">
                          {t("modals.videoPlayer.skipDeadTime", "Échanges seuls")}
                        </span>
                      </button>

                      {/* Direct Quick Clip from Active Serve */}
                      {activeServe && !isClip && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleQuickClipServe(activeServe)}
                            disabled={activeClipStatus === "creating"}
                            title={`${t("modals.videoPlayer.quickClip", "Clip rapide")} Serve ${activeServe.num} (${
                              clipPaddingSec === 0 ? "Exact" : `±${clipPaddingSec}s`
                            })`}
                            className={cn(
                              "flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-semibold border transition-colors",
                              activeClipStatus === "created"
                                ? "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-500/20 dark:border-emerald-400/60 dark:text-emerald-300"
                                : "bg-sky-50 hover:bg-sky-100 border-sky-300 text-sky-700 dark:bg-sky-500/20 dark:hover:bg-sky-500/35 dark:border-sky-400/60 dark:text-sky-200"
                            )}
                          >
                            {activeClipStatus === "creating" ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : activeClipStatus === "created" ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <Scissors className="h-3.5 w-3.5" />
                            )}
                            <span>{`Clip S${activeServe.num}`}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEditClipServe(activeServe)}
                            title={t("modals.videoPlayer.editClip", "Ajuster")}
                            className="flex items-center justify-center h-8 w-8 rounded-lg bg-muted/60 hover:bg-muted border border-border text-muted-foreground hover:text-foreground dark:bg-white/[0.06] dark:hover:bg-white/15 dark:border-white/10 dark:text-white/80 dark:hover:text-white transition-colors"
                          >
                            <SlidersHorizontal className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Right: Speed, Sidebar toggle (when fullscreen), Fullscreen */}
                  <div className="flex items-center gap-1.5 relative">
                    <div ref={speedMenuRef} className="relative">
                      <button
                        type="button"
                        onClick={() => setSpeedMenuOpen((v) => !v)}
                        title={t("modals.videoPlayer.playbackSpeed", "Vitesse de lecture")}
                        className="flex items-center justify-center h-8 px-2 rounded-lg bg-muted/70 hover:bg-muted border border-border text-xs font-semibold tabular-nums text-foreground dark:bg-white/[0.08] dark:hover:bg-white/15 dark:border-white/10 dark:text-white/90 transition-colors"
                      >
                        {`${playbackRate}x`}
                      </button>

                      {speedMenuOpen && (
                        <div className="absolute bottom-full right-0 mb-1.5 py-1 rounded-lg bg-popover text-popover-foreground border border-border dark:bg-slate-900 dark:border-white/15 shadow-xl z-40 min-w-[78px]">
                          {PLAYBACK_RATES.map((rate) => (
                            <button
                              key={rate}
                              type="button"
                              onClick={() => {
                                setPlaybackRate(rate);
                                setSpeedMenuOpen(false);
                              }}
                              className={cn(
                                "w-full text-left px-3 py-1.5 text-xs tabular-nums transition-colors flex items-center justify-between",
                                playbackRate === rate
                                  ? "bg-primary/10 text-primary dark:bg-sky-500/25 dark:text-sky-300 font-semibold"
                                  : "text-foreground/80 hover:bg-muted dark:text-white/80 dark:hover:bg-white/10"
                              )}
                            >
                              <span>{`${rate}x`}</span>
                              {playbackRate === rate && <Check className="h-3 w-3" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {isFullscreen && hasServes && (
                      <button
                        type="button"
                        onClick={() => {
                          userToggledSidebarRef.current = true;
                          setSidebarOpen((v) => !v);
                        }}
                        className="flex items-center justify-center h-8 px-2 rounded-lg bg-muted/70 hover:bg-muted border border-border text-xs font-medium gap-1 text-foreground dark:bg-white/[0.08] dark:hover:bg-white/15 dark:border-white/10 dark:text-white/90"
                      >
                        {sidebarOpen ? (
                          <PanelRightClose className="h-4 w-4 text-primary dark:text-sky-400" />
                        ) : (
                          <PanelRightOpen className="h-4 w-4" />
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      title={
                        isFullscreen
                          ? t("modals.videoPlayer.exitFullscreen", "Quitter le plein écran")
                          : `${t("modals.videoPlayer.fullscreen", "Plein écran")} (F)`
                      }
                      className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground dark:hover:bg-white/15 dark:text-white/85 dark:hover:text-white transition-colors"
                    >
                      {isFullscreen ? (
                        <Minimize className="h-4 w-4" />
                      ) : (
                        <Maximize className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Collapsible AI Serves Sidebar */}
            {hasServes && sidebarOpen && (
              <div
                className={cn(
                  "shrink-0 min-h-0 lg:relative",
                  isFullscreen
                    ? "w-full lg:w-[370px] h-[38vh] lg:h-full"
                    : "w-full lg:w-[360px] xl:w-[390px] h-[38vh] min-h-[260px] lg:h-auto"
                )}
              >
                <div className="h-full lg:absolute lg:inset-0">
                  <ServesSidebar
                    serves={serves}
                    summary={segmentsSummary}
                    activeServeNum={activeServeNum}
                    clipPaddingSec={clipPaddingSec}
                    onChangeClipPadding={setClipPaddingSec}
                    clipStatuses={currentClipStatuses}
                    onSelectServe={handleSelectServe}
                    onQuickClipServe={handleQuickClipServe}
                    onEditClipServe={handleEditClipServe}
                  />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {clipEditorOpen && (
        <VideoClipEditor
          isOpen={clipEditorOpen}
          onClose={() => {
            setClipEditorOpen(false);
            setClipDraft(null);
          }}
          video={{
            ...currentVideo,
            duration: duration || currentVideo.duration,
          }}
          initialStartTime={clipDraft?.startTime}
          initialEndTime={clipDraft?.endTime}
          initialTitle={clipDraft?.title}
          initialDescription={clipDraft?.description}
          onClipCreated={(clip) => {
            setClipEditorOpen(false);
            setClipDraft(null);
            onClipCreated?.(clip);
          }}
        />
      )}
    </>
  );
}
