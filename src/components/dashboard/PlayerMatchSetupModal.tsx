import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { videoService } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  User,
  Check,
  Loader2,
  Shield,
  Bot,
  UserCheck,
  Swords,
  Target,
  ArrowRight,
  ArrowLeft,
  Lock,
  PlusCircle
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface SetupPlayer {
  id: number;
  name: string;
  team: "A" | "B";
  role: string;
  frameIndex: number;
  userId: string | null;
  isClaimed: boolean;
  isOwnedByOther?: boolean;
}

interface PlayerMatchSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: {
    id: string;
    title?: string;
    file_url?: string;
    bunny_video_id?: string;
    thumbnail_url?: string;
    match_players?: any;
    ai_detected_frames?: string[];
    user_id?: string | number | null;
  } | null;
  onSuccess?: () => void;
}

const DEMO_AI_PLAYER_IMAGES = [
  "/demo-players/Player1.png",
  "/demo-players/Player2.png",
  "/demo-players/Player3.1.png",
  "/demo-players/Player4.1.png",
];

const DEMO_PLAYER_IMAGES_BY_ROW = [
  [
    "/demo-players/Player1.png",
    "/demo-players/Player1.2.png",
    "/demo-players/Player1.3.png",
    "/demo-players/Player1.4.png",
    "/demo-players/Player1.png",
  ],
  [
    "/demo-players/Player2.png",
    "/demo-players/Player2.2.png",
    "/demo-players/Player2.3.png",
    "/demo-players/Player2.4.png",
    "/demo-players/Player2.png",
  ],
  [
    "/demo-players/Player3.1.png",
    "/demo-players/Player3.2.png",
    "/demo-players/Player3.3.png",
    "/demo-players/Player3.4.png",
    "/demo-players/Player3.1.png",
  ],
  [
    "/demo-players/Player4.1.png",
    "/demo-players/Player4.2.png",
    "/demo-players/Player4.3.png",
    "/demo-players/Player4.4.png",
    "/demo-players/Player4.1.png",
  ],
];

const isUserIdEqual = (id1: any, id2: any) => {
  if (id1 === null || id1 === undefined || id2 === null || id2 === undefined) return false;
  return String(id1) === String(id2);
};

export function PlayerMatchSetupModal({
  isOpen,
  onClose,
  video,
  onSuccess,
}: PlayerMatchSetupModalProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [activeStep, setActiveStep] = useState<1 | 2>(2);
  const [sport, setSport] = useState<"padel" | "tennis_singles" | "tennis_doubles">("padel");
  const [selectedSelfIndex, setSelectedSelfIndex] = useState<number>(0);

  const [players, setPlayers] = useState<SetupPlayer[]>([
    { id: 1, name: "Player 1", team: "A", role: "Player 1", frameIndex: 0, userId: null, isClaimed: false, isOwnedByOther: false },
    { id: 2, name: "Player 2", team: "A", role: "Player 2", frameIndex: 1, userId: null, isClaimed: false, isOwnedByOther: false },
    { id: 3, name: "Player 3", team: "B", role: "Player 3", frameIndex: 2, userId: null, isClaimed: false, isOwnedByOther: false },
    { id: 4, name: "Player 4", team: "B", role: "Player 4", frameIndex: 3, userId: null, isClaimed: false, isOwnedByOther: false },
  ]);

  const [aiFrames, setAiFrames] = useState<string[]>(DEMO_AI_PLAYER_IMAGES);
  const [isExtractingFrames, setIsExtractingFrames] = useState(false);

  const extractFramesFromVideoUrl = (videoUrl: string, baseThumbnail?: string) => {
    if (!videoUrl) return;
    setIsExtractingFrames(true);

    const tempVideo = document.createElement("video");
    tempVideo.crossOrigin = "anonymous";
    tempVideo.src = videoUrl;
    tempVideo.muted = true;
    tempVideo.playsInline = true;

    const timestamps: number[] = [];
    const extracted: string[] = [];
    let currentIndex = 0;

    const captureNext = () => {
      if (currentIndex >= timestamps.length) {
        if (extracted.length === 4) {
          setAiFrames(extracted);
        }
        setIsExtractingFrames(false);
        return;
      }
      tempVideo.currentTime = timestamps[currentIndex];
    };

    tempVideo.onloadedmetadata = () => {
      const dur = tempVideo.duration || 120;
      timestamps.push(
        Math.max(2, Math.floor(dur * 0.1)),
        Math.floor(dur * 0.32),
        Math.floor(dur * 0.58),
        Math.floor(dur * 0.82)
      );
      captureNext();
    };

    tempVideo.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = tempVideo.videoWidth || 640;
        canvas.height = tempVideo.videoHeight || 360;
        const ctx = canvas.getContext("2d");
        if (ctx && tempVideo.videoWidth > 0) {
          ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          extracted.push(dataUrl);
        }
      } catch (e) {
        console.warn("Canvas frame extraction CORS warning:", e);
      }
      currentIndex++;
      captureNext();
    };

    tempVideo.onerror = () => {
      setIsExtractingFrames(false);
    };

    tempVideo.load();
  };

  const rawCourtType = (video as any)?.court?.court_type || (video as any)?.court_type;
  const courtName = (video as any)?.court_name || (video as any)?.court?.name || (video as any)?.title || "";
  const inferredType = rawCourtType
    ? String(rawCourtType).toUpperCase()
    : (courtName.toLowerCase().includes("tennis") ? "TENNIS" : "PADEL");

  const isPadelCourt = inferredType === "PADEL";
  const isHost = video?.user_id ? isUserIdEqual(video.user_id, user?.id) : true;

  useEffect(() => {
    if (isOpen && video) {
      if (isPadelCourt) {
        setSport("padel");
        setActiveStep(2);
      } else {
        setSport("tennis_singles");
        setActiveStep(1);
      }
      const baseThumb = video.thumbnail_url || video.file_url;

      if (video.ai_detected_frames && video.ai_detected_frames.length >= 4) {
        setAiFrames(video.ai_detected_frames);
      } else if (video.file_url && (video.file_url.endsWith(".mp4") || video.file_url.includes("b-cdn.net"))) {
        extractFramesFromVideoUrl(video.file_url, baseThumb);
      } else {
        const fallback = DEMO_AI_PLAYER_IMAGES.map((imgUrl, i) => (i === 0 && baseThumb ? baseThumb : imgUrl));
        setAiFrames(fallback);
      }

      if (video.id) {
        videoService.getMatchPlayers(video.id).then((res) => {
          const hostUserId = res.data?.user_id || video.user_id;
          const rawMatchPlayers = res.data?.match_players || video.match_players;

          if (rawMatchPlayers) {
            try {
              const parsed = typeof rawMatchPlayers === "string"
                ? JSON.parse(rawMatchPlayers)
                : rawMatchPlayers;

              if (parsed.sport) {
                if (!isPadelCourt && (parsed.sport === "padel" || !["tennis_singles", "tennis_doubles"].includes(parsed.sport))) {
                  setSport("tennis_singles");
                } else if (isPadelCourt) {
                  setSport("padel");
                } else {
                  setSport(parsed.sport);
                }
              } else if (!isPadelCourt) {
                setSport("tennis_singles");
              }

              if (parsed.players && Array.isArray(parsed.players)) {
                const mappedPlayers = parsed.players.map((p: any, idx: number) => {
                  const slotUserId = p.user_id || p.userId || (idx === 0 && hostUserId ? hostUserId : null);
                  const isOwnedByOther = Boolean(slotUserId && !isUserIdEqual(slotUserId, user?.id));
                  const isClaimedFlag = Boolean(p.is_claimed || p.isClaimed || (isOwnedByOther && p.player_name && p.player_name !== "Partner"));

                  let displayName = p.player_name || p.name;
                  if (!displayName || ["Partner", "Opponent 1", "Opponent 2", "Opponent", "Host", "Me"].includes(displayName) || displayName.startsWith("Player ")) {
                    displayName = `Player ${idx + 1}`;
                  }

                  return {
                    id: p.id || idx + 1,
                    name: displayName,
                    team: p.team || (idx < 2 ? "A" : "B"),
                    role: p.role || `player_${idx + 1}`,
                    frameIndex: typeof p.frame_index === "number" ? p.frame_index : (typeof p.frameIndex === "number" ? p.frameIndex : idx),
                    userId: slotUserId ? String(slotUserId) : null,
                    isClaimed: isClaimedFlag,
                    isOwnedByOther,
                  };
                });
                setPlayers(mappedPlayers);

                const mySlot = mappedPlayers.find((p) => p.userId && isUserIdEqual(p.userId, user?.id));
                if (mySlot) {
                  setSelectedSelfIndex(mySlot.frameIndex);
                } else {
                  const firstUnclaimed = [0, 1, 2, 3].find(
                    (fIdx) => !mappedPlayers.some((p) => p.frameIndex === fIdx && p.isOwnedByOther)
                  );
                  setSelectedSelfIndex(firstUnclaimed !== undefined ? firstUnclaimed : 0);
                }
              }
            } catch (e) {
              console.error("Error parsing match_players:", e);
            }
          } else {
            const isHostUser = isUserIdEqual(hostUserId, user?.id);
            const defaultPlayers = [
              { id: 1, name: isHostUser ? (user?.name || "Host") : "Host", team: "A" as const, role: "player_1", frameIndex: 0, userId: hostUserId ? String(hostUserId) : null, isClaimed: true, isOwnedByOther: !isHostUser },
              { id: 2, name: t('components.playerMatchSetup.partner', 'Partner'), team: "A" as const, role: "player_2", frameIndex: 1, userId: null, isClaimed: false, isOwnedByOther: false },
              { id: 3, name: t('components.playerMatchSetup.opponent1', 'Opponent 1'), team: "B" as const, role: "opponent_1", frameIndex: 2, userId: null, isClaimed: false, isOwnedByOther: false },
              { id: 4, name: t('components.playerMatchSetup.opponent2', 'Opponent 2'), team: "B" as const, role: "opponent_2", frameIndex: 3, userId: null, isClaimed: false, isOwnedByOther: false },
            ];
            setPlayers(defaultPlayers);
            setSelectedSelfIndex(isHostUser ? 0 : 1);
          }
        }).catch((err) => {
          console.warn("Could not refresh video match_players:", err);
        });
      }
    }
  }, [isOpen, video, user, isPadelCourt, t]);

  // Auto-correct selectedSelfIndex if it lands on a frame claimed by someone else
  useEffect(() => {
    if (!players || players.length === 0) return;
    const isCurrentClaimedByOther = players.some(
      (p) => p.frameIndex === selectedSelfIndex && p.isOwnedByOther
    );
    if (isCurrentClaimedByOther) {
      const firstUnclaimed = [0, 1, 2, 3].find(
        (fIdx) => !players.some((p) => p.frameIndex === fIdx && p.isOwnedByOther)
      );
      if (firstUnclaimed !== undefined) {
        setSelectedSelfIndex(firstUnclaimed);
      }
    }
  }, [players, selectedSelfIndex]);

  const handleSelectSelf = (index: number) => {
    const claimedByOther = players.find(
      (p) => p.frameIndex === index && p.isOwnedByOther
    );
    if (claimedByOther) {
      toast.warning(
        t('components.playerMatchSetup.frameAlreadyClaimed', 'This AI frame is already claimed by {{name}}', {
          name: claimedByOther.name,
        })
      );
      return;
    }
    setSelectedSelfIndex(index);
  };

  const handleSave = async () => {
    if (!video?.id) return;
    setSaving(true);

    const myClaimedIdx = players.findIndex((p) => isUserIdEqual(p.userId, user?.id));
    const mySlotIdx = myClaimedIdx !== -1
      ? myClaimedIdx
      : players.findIndex((p) => p.frameIndex === selectedSelfIndex);

    const activePlayers = sport === "tennis_singles" ? players.slice(0, 2) : players;
    const targetSaveIdx = mySlotIdx !== -1 ? mySlotIdx : 0;

    const updatedPlayers = activePlayers.map((p, idx) => {
      const isTargetForUser = idx === targetSaveIdx;
      if (isTargetForUser) {
        return {
          id: p.id,
          name: user?.name || p.name || "Player",
          user_id: user?.id ? String(user.id) : null,
          is_claimed: true,
          role: idx === 0 ? "player_1" : `player_${idx + 1}`,
          team: sport === "tennis_singles" ? (idx === 0 ? "A" : "B") : p.team,
          is_user: true,
          frame_index: selectedSelfIndex,
          frame_url: aiFrames[selectedSelfIndex] || null,
        };
      }
      return {
        id: p.id,
        name: p.name,
        user_id: p.userId ? String(p.userId) : null,
        is_claimed: Boolean(p.userId || p.isClaimed),
        role: p.role || `player_${idx + 1}`,
        team: sport === "tennis_singles" ? (idx === 0 ? "A" : "B") : p.team,
        is_user: Boolean(p.userId && isUserIdEqual(p.userId, video.user_id)),
        frame_index: p.frameIndex,
        frame_url: aiFrames[p.frameIndex] || null,
      };
    });

    const payload = {
      sport,
      profile_image: aiFrames[selectedSelfIndex] || video.thumbnail_url || null,
      players: updatedPlayers,
      configured_at: new Date().toISOString(),
    };

    try {
      await videoService.updateMatchPlayers(video.id, payload);
      toast.success(t('components.playerMatchSetup.saveSuccess', 'Player roster saved successfully! Opening AI Analytics...'));
      onSuccess?.();
      onClose();
      if (video?.id) {
        navigate(`/analytics/${video.id}`);
      }
    } catch (error: any) {
      console.error("Save match players failed:", error);
      toast.error(error.response?.data?.error || t('components.playerMatchSetup.saveError', 'Error saving match roster'));
    } finally {
      setSaving(false);
    }
  };

  if (!video) return null;

  const playerCount = sport === "tennis_singles" ? 2 : 4;
  const userName = user?.name || "Player";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-xl max-h-[92vh] sm:max-h-[85vh] flex flex-col p-0 overflow-hidden bg-card border-border text-foreground rounded-2xl sm:rounded-3xl shadow-2xl">
        <DialogTitle className="sr-only">
          {t('components.playerMatchSetup.title', 'Match Setup')}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Identify yourself on the court
        </DialogDescription>

        {/* Modal Header */}
        <div className="flex-none px-4 py-3 sm:px-5 sm:py-3.5 border-b border-border bg-gradient-to-r from-sky-100 via-sky-50 to-cyan-100 dark:from-sky-950/70 dark:via-neutral-950 dark:to-cyan-950/60 pr-12">
          <div className="flex items-center gap-2 mb-0.5">
            <h2 className="text-base sm:text-lg font-black tracking-tight text-foreground">
              {t('components.playerMatchSetup.title', 'Match Setup')}
            </h2>
            <span className="text-[10px] sm:text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-200/70 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-700">
              {isPadelCourt ? t('components.playerMatchSetup.padel', 'Padel') : (sport === "tennis_doubles" ? t('components.playerMatchSetup.tennisDoubles', 'Tennis 2v2') : t('components.playerMatchSetup.tennisSingles', 'Tennis 1v1'))}
            </span>
          </div>

          <p className="text-xs text-muted-foreground font-medium">
            {t('components.playerMatchSetup.identifyPrompt', 'Identify yourself on the court')}
          </p>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar overscroll-contain touch-pan-y p-3 sm:p-5">
          <AnimatePresence mode="wait">
            {/* STEP 1: Tennis Format Selection (Only shown for Tennis courts) */}
            {activeStep === 1 && !isPadelCourt ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between space-y-1">
                  <div>
                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Target className="h-4 w-4 text-blue-500" />
                      {t('components.playerMatchSetup.step1TitleTennis', 'Select Tennis Format')}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t('components.playerMatchSetup.tennisFormatDesc', 'Choose between Tennis 1v1 Singles or 2v2 Doubles format.')}
                    </p>
                  </div>
                  {!isHost && (
                    <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 text-[10px] flex items-center gap-1 shrink-0">
                      <Lock className="h-3 w-3" /> {t('components.playerMatchSetup.setByHost', 'Set by host')}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: "tennis_singles", label: t('components.playerMatchSetup.tennisSingles', 'Tennis 1v1 (Singles)'), sub: t('components.playerMatchSetup.singlesSub', 'Singles (1 vs 1 • 2 Players)'), icon: User, activeBg: "bg-[#0EA5E9]/10 border-[#0EA5E9]" },
                    { id: "tennis_doubles", label: t('components.playerMatchSetup.tennisDoubles', 'Tennis 2v2 (Doubles)'), sub: t('components.playerMatchSetup.doublesSub', 'Doubles (2 vs 2 • 4 Players)'), icon: Swords, activeBg: "bg-[#0EA5E9]/10 border-[#0EA5E9]" },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = sport === item.id || (item.id === "tennis_singles" && sport !== "tennis_doubles");
                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={!isHost}
                        onClick={() => isHost && setSport(item.id as any)}
                        className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${!isHost ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
                          } ${isSelected
                            ? `${item.activeBg} ring-2 ring-[#0EA5E9] shadow-md`
                            : "bg-card hover:bg-muted/50 border-border text-foreground"
                          }`}
                      >
                        <div className="flex items-center justify-between w-full mb-3">
                          <div className={`p-2.5 rounded-xl ${isSelected ? "bg-[#0EA5E9]/20 text-[#0EA5E9]" : "bg-muted text-muted-foreground"}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          {isSelected && (
                            <span className="h-2.5 w-2.5 rounded-full bg-[#0EA5E9] animate-ping" />
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-bold text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.sub}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              /* STEP 2: Identify Yourself from AI Snapshots */
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 min-w-0">
                    <Bot className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                    <span className="truncate">{t('components.playerMatchSetup.step2TitleClean', 'Who are you on the court?')}</span>
                  </Label>

                  <Badge variant="outline" className="border-blue-500/40 text-blue-600 dark:text-blue-400 text-[10px] font-mono font-bold px-2 py-0.5 shrink-0 whitespace-nowrap flex items-center gap-1">
                    {isExtractingFrames ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>{t('components.playerMatchSetup.extracting', 'Extracting...')}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3 animate-pulse text-cyan-400" />
                        <span>{t('components.playerMatchSetup.detectedCount', { count: playerCount, defaultValue: `${playerCount} Detected` })}</span>
                      </>
                    )}
                  </Badge>
                </div>

                <div className="flex flex-col gap-2">
                  {Array.from({ length: playerCount }).map((_, index) => {
                    const claimedByOther = players.find(
                      (p) => p.frameIndex === index && p.isOwnedByOther
                    );
                    const isSelf = selectedSelfIndex === index && !claimedByOther;
                    const playerImages = DEMO_PLAYER_IMAGES_BY_ROW[index % DEMO_PLAYER_IMAGES_BY_ROW.length];

                    return (
                      <motion.div
                        key={index}
                        whileHover={{ scale: claimedByOther ? 1 : 1.005 }}
                        whileTap={{ scale: claimedByOther ? 1 : 0.995 }}
                        onClick={() => !claimedByOther && handleSelectSelf(index)}
                        className={`flex items-center justify-between gap-2 transition-all duration-200 group py-1.5 px-2.5 sm:px-3 rounded-xl border ${
                          claimedByOther
                            ? "opacity-60 cursor-not-allowed select-none border-border/40 bg-muted/20"
                            : isSelf
                            ? "cursor-pointer bg-[#0EA5E9]/10 border-[#0EA5E9] ring-2 ring-[#0EA5E9]/30 shadow-xs"
                            : "cursor-pointer bg-card hover:bg-muted/40 border-border hover:border-[#0EA5E9]/40"
                        }`}
                      >
                        {/* Left Section: Icon & Overlapping Rounded Avatars */}
                        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                          <div className="flex-shrink-0">
                            {isSelf ? (
                              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#0EA5E9] text-white flex items-center justify-center font-extrabold shadow-xs">
                                <Check className="h-3.5 w-3.5 stroke-[3]" />
                              </div>
                            ) : claimedByOther ? (
                              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold border border-amber-500/40">
                                <Lock className="h-3 w-3" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-muted-foreground/40 text-muted-foreground group-hover:border-[#0EA5E9] flex items-center justify-center transition-colors">
                                <PlusCircle className="h-3.5 w-3.5" />
                              </div>
                            )}
                          </div>

                          {/* Intersected / Overlapping Rounded Avatar Circles */}
                          <div className="flex items-center -space-x-3 sm:-space-x-3.5 overflow-x-auto no-scrollbar py-0.5 touch-pan-x shrink-0">
                            {playerImages.map((imgUrl, imgIdx) => (
                              <div
                                key={imgIdx}
                                className={`relative w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 flex-shrink-0 shadow-xs transition-all duration-200 ${
                                  isSelf
                                    ? "border-[#0EA5E9] ring-1 ring-[#0EA5E9]/40 scale-105"
                                    : claimedByOther
                                    ? "border-amber-500/40 grayscale-[40%]"
                                    : "border-background group-hover:border-[#0EA5E9]/50"
                                }`}
                                style={{ zIndex: 10 - imgIdx }}
                              >
                                <img
                                  src={imgUrl}
                                  alt={`Player ${index + 1} Snapshot ${imgIdx + 1}`}
                                  className="w-full h-full object-cover object-center"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Right Section: Player Name & Role */}
                        <div className="flex flex-col items-end text-right min-w-0 shrink-0 ml-1">
                          {isSelf ? (
                            <span className="text-xs sm:text-sm font-extrabold text-[#0EA5E9] flex items-center gap-1">
                              <UserCheck className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate max-w-[90px] xs:max-w-[120px] sm:max-w-none">
                                {t('components.playerMatchSetup.itsMe', "IT'S ME")} ({userName})
                              </span>
                            </span>
                          ) : claimedByOther ? (
                            <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                              <Lock className="h-3 w-3 shrink-0" />
                              <span className="truncate max-w-[90px] xs:max-w-[120px] sm:max-w-none">
                                {t('components.playerMatchSetup.claimedBy', { name: claimedByOther.name, defaultValue: `Claimed by ${claimedByOther.name}` })}
                              </span>
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-foreground group-hover:text-[#0EA5E9] transition-colors truncate max-w-[90px] xs:max-w-[120px] sm:max-w-none">
                              {t('components.playerMatchSetup.playerLabel', 'Player')} {index + 1}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal Footer Navigation */}
        <div className="flex-none p-3 sm:p-4 px-4 sm:px-6 border-t border-border bg-muted/40 dark:bg-neutral-950 flex items-center justify-between gap-2">
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-[#0EA5E9]" />
            <span>{t('components.playerMatchSetup.footerNotice', 'AI statistics & highlights ready after saving')}</span>
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-3 w-full sm:w-auto">
            {!isPadelCourt && activeStep === 2 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveStep(1)}
                disabled={saving}
                className="text-xs gap-1.5 rounded-full px-3 sm:px-4"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={saving}
                className="text-xs text-muted-foreground hover:text-foreground rounded-full px-3 sm:px-4"
              >
                {t('components.playerMatchSetup.cancel', 'Cancel')}
              </Button>
            )}

            {!isPadelCourt && activeStep === 1 ? (
              <Button
                size="sm"
                onClick={() => setActiveStep(2)}
                className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-bold gap-1.5 text-xs px-4 sm:px-5 rounded-full shadow-md"
              >
                Next <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  const isClaimedByOther = players.some(
                    (p) => p.frameIndex === selectedSelfIndex && p.isOwnedByOther
                  );
                  if (isClaimedByOther) {
                    toast.warning(t('components.playerMatchSetup.mustSelectUnclaimed', 'Please select an unclaimed AI snapshot frame before proceeding.'));
                    return;
                  }
                  handleSave();
                }}
                disabled={saving}
                className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-bold gap-1.5 shadow-md shadow-sky-500/25 text-xs px-4 sm:px-5 rounded-full justify-center"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {t('components.playerMatchSetup.saving', 'Saving...')}
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    {t('components.playerMatchSetup.confirm', 'Confirm')}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
