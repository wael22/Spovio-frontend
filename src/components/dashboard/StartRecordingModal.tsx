import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
// Radix Select intentionally NOT used inside Dialog to avoid Portal-in-Portal removeChild crash
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Play,
  QrCode,
  MapPin,
  Check,
  Loader2,
  AlertCircle,
  CheckCircle,
  User,
  Camera,
  Trophy
} from "lucide-react";
import { playerService, recordingService, videoService } from "@/lib/api";
import { SCORE_MODES, isScoreMode } from "@/lib/scoreModes";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import QRScannerModal from "./QRScannerModal";

interface StartRecordingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecordingStarted?: (session: any) => void;
  initialQrCode?: string; // 🆕 Added prop
}

// Durations moved inside component for translation

export function StartRecordingModal({ open, onOpenChange, onRecordingStarted, initialQrCode }: StartRecordingModalProps) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const durations = [
    { value: 60, label: "60 minutes", description: t('modals.startRecording.durations.short') },
    { value: 90, label: "90 minutes", description: t('modals.startRecording.durations.standard') },
    { value: 120, label: "120 minutes", description: t('modals.startRecording.durations.long') },
  ];

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(90);
  const [selectedClub, setSelectedClub] = useState("");
  const [selectedCourt, setSelectedCourt] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [scoreMode, setScoreMode] = useState("ADV 9+STB");

  // UI state
  const [clubs, setClubs] = useState<any[]>([]);
  const [courts, setCourts] = useState<any[]>([]);
  const [loadingClubs, setLoadingClubs] = useState(false);
  const [loadingCourts, setLoadingCourts] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // 🆕 Ref to store the court we need to inject/select after loading
  const pendingScannedCourt = useRef<any>(null);

  // 🆕 Ref to prevent multiple resets during the same "open" session
  const initializedRef = useRef(false);

  // Load FOLLOWED clubs when modal opens and reset form
  useEffect(() => {
    if (open && !initializedRef.current) {
      console.log('🔄 Modal opened - performing one-time initialization');
      initializedRef.current = true;

      // Only load clubs if we DON'T have an initial QR code
      // If we do, handleQRCodeScanned will handle loading to prevent race conditions
      if (!initialQrCode) {
        console.log('📡 No initial QR code, loading followed clubs');
        loadFollowedClubs();
      }

      // Reset form fields
      setTitle("");
      setDescription("");
      setSelectedDuration(90);
      setSelectedClub("");
      setSelectedCourt("");
      setTeamA("");
      setTeamB("");
      setScoreMode("ADV 9+STB");

      // Only clear QR code state if we don't have an initial one
      if (!initialQrCode) {
        setQrCode("");
        pendingScannedCourt.current = null;
      }
      setError("");
    } else if (!open) {
      // Reset the initialization guard when modal closes
      if (initializedRef.current) {
        console.log('🚪 Modal closed - resetting initializedRef');
        initializedRef.current = false;
      }
    }
  }, [open, initialQrCode]);

  // Handle initial QR code separate effect
  useEffect(() => {
    if (open && initialQrCode) {
      console.log('⚡ Handling initialQrCode prop:', initialQrCode);
      // Ensure this runs after the reset
      const timer = setTimeout(() => {
        handleQRCodeScanned(initialQrCode);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open, initialQrCode]);

  // Load courts when club is selected
  useEffect(() => {
    if (selectedClub) {
      loadCourts(selectedClub);
    } else {
      setCourts([]);
      setSelectedCourt("");
    }
  }, [selectedClub]);

  // 🆕 Effect to auto-select pending court once loaded
  useEffect(() => {
    if (pendingScannedCourt.current && courts.length > 0) {
      const targetId = pendingScannedCourt.current.id.toString();
      const exists = courts.some(c => c.id.toString() === targetId);

      if (exists) {
        console.log('🎯 Auto-selecting pending court:', targetId);
        setSelectedCourt(targetId);
        // We clear it to avoid re-selecting if user changes manually and we reload.
        pendingScannedCourt.current = null;
      }
    }
  }, [courts]);

  const loadFollowedClubs = async () => {
    setLoadingClubs(true);
    try {
      // 🆕 Use playerService.getFollowedClubs instead of getAvailableClubs
      const response = await playerService.getFollowedClubs();
      const clubList = response.data.clubs || [];
      setClubs(clubList);

      if (clubList.length === 0) {
        setError(t('modals.startRecording.errors.noClubFollowed'));
      } else {
        setError("");
      }
      return clubList;
    } catch (error: any) {
      console.error('Failed to load followed clubs:', error);
      toast.error('Impossible de charger vos clubs suivis');
      setError('Erreur lors du chargement de vos clubs suivis');
      return [];
    } finally {
      setLoadingClubs(false);
    }
  };

  const loadCourts = async (clubId: string) => {
    setLoadingCourts(true);
    setError("");
    try {
      const response = await recordingService.getClubCourtsForPlayers(clubId);
      let fetchedCourts = response.data.courts || [];

      // 🆕 Inject pending court if strictly needed and missing
      if (pendingScannedCourt.current && pendingScannedCourt.current.club.id.toString() === clubId) {
        const exists = fetchedCourts.some((c: any) => c.id.toString() === pendingScannedCourt.current.id.toString());
        if (!exists) {
          console.log('💉 Injecting pending court into list:', pendingScannedCourt.current);
          // Ensure minimal structure
          const courtToInject = {
            ...pendingScannedCourt.current,
            available: true,
            name: pendingScannedCourt.current.name || `Terrain ${pendingScannedCourt.current.number || pendingScannedCourt.current.id}`
          };
          fetchedCourts = [...fetchedCourts, courtToInject];
        }
      }

      setCourts(fetchedCourts);

      if (fetchedCourts.length === 0) {
        setError(t('modals.startRecording.errors.noCourts'));
      }
    } catch (error: any) {
      console.error('Failed to load courts:', error);
      toast.error('Impossible de charger les terrains');
      setError('Erreur lors du chargement des terrains');
      setCourts([]);
    } finally {
      setLoadingCourts(false);
    }
  };

  // 🆕 QR Code scanned handler with auto-fill
  const handleQRCodeScanned = async (code: string) => {
    console.log('✅ QR Code scanné:', code);
    setQrCode(code);
    setIsScannerOpen(false);
    setError("");
    setStarting(true);

    try {
      // 1. Load clubs first to ensure we have the base list
      // But only if we haven't loaded them yet or if we want to refresh
      // We await it so we can merge the scanned club later without race conditions
      let currentClubs = clubs;
      if (clubs.length === 0) {
        currentClubs = await loadFollowedClubs();
      }

      // 2. Validate QR code
      console.log('📡 Calling videoService.scanQrCode with:', code);
      const response = await videoService.scanQrCode(code);
      console.log('📥 Raw scanQrCode response:', response);

      const data = response.data || response;
      const { club, court } = data;

      console.log('✅ QR Code validé - parsed:', { club, court });

      if (!club || !court) {
        console.error('❌ Missing club or court in response');
        toast.error(t('modals.common.error'));
        return;
      }

      // 3. Store in Ref for injection/selection
      console.log('💾 Storing pending court in ref:', court);
      pendingScannedCourt.current = { ...court, club };

      // 3. Inject missing club if needed
      if (club?.id) {
        const exists = currentClubs.some(c => c.id.toString() === club.id.toString());
        if (!exists) {
          console.log('➕ Club manquant, ajout à la liste:', club);
          const newClubList = [...currentClubs, club];
          setClubs(newClubList);
          // Update local reference for checking later if needed
          currentClubs = newClubList;
        }
      }

      // 4. Auto-fill club and court fields
      const clubIdStr = club?.id?.toString() || "";
      console.log(`🎯 Setting selected club to: ${clubIdStr}`);

      // 🆕 Robust Delay: Ensure Select component has time to render new options if injected
      setTimeout(() => {
        setSelectedClub(clubIdStr);
        toast.success(`Code QR validé: ${club?.name} - ${court?.name}`);
      }, 1000);

      // 5. Auto-selection will happen via Effects
      // pendingScannedCourt ref -> loadCourts -> setCourts -> Effect(court) -> setSelectedCourt
    } catch (err: any) {
      console.error('❌ Erreur validation QR:', err);
      if (err.response?.status === 404) {
        toast.error('Code QR invalide. Veuillez scanner un QR code valide.');
      } else {
        setError('Erreur lors de la validation du QR code. Veuillez réessayer.');
      }
      pendingScannedCourt.current = null;
    } finally {
      setStarting(false);
    }
  };

  const handleStartRecording = async () => {
    // Validations
    if (!selectedClub || !selectedCourt) {
      setError(t('modals.startRecording.errors.selectClubCourt'));
      toast.error(t('modals.startRecording.errors.selectClubCourt'));
      return;
    }

    if (!qrCode) {
      setError(t('modals.startRecording.errors.qrRequired'));
      toast.error(t('modals.startRecording.errors.qrRequired'));
      return;
    }

    const selectedCourtData = courts.find(c => c.id.toString() === selectedCourt);
    const needsScore = !!(selectedCourtData?.has_scoreboard && selectedCourtData?.scoreboard_active);

    if (needsScore && (!teamA.trim() || !teamB.trim())) {
      setError("Renseignez les noms des deux équipes pour afficher le score pendant l'enregistrement");
      toast.error("Noms des équipes requis");
      return;
    }

    if (!user || !user.id) {
      setError("Utilisateur non authentifié");
      toast.error("Utilisateur non authentifié");
      return;
    }

    // 🆕 Check if user has enough credits (if user.credits exists)
    if (user.credits !== undefined && user.credits < 1) {
      setError(t('modals.startRecording.errors.credits'));
      toast.error(t('modals.startRecording.errors.credits'));
      return;
    }

    setStarting(true);
    setError("");

    try {
      // 🆕 Validate QR code matches selected court
      const qrValidation = await videoService.scanQrCode(qrCode);

      if (qrValidation.data.court.id.toString() !== selectedCourt) {
        setError(t('modals.startRecording.errors.qrMismatch'));
        toast.error(t('modals.startRecording.errors.qrMismatch'));
        setStarting(false);
        return;
      }

      // QR code is valid, start recording
      const response = await recordingService.startAdvancedRecording({
        club_id: parseInt(selectedClub),
        court_id: parseInt(selectedCourt),
        duration_minutes: selectedDuration,
        qr_code: qrCode,
        title: title || undefined,
        description: description || undefined,
        match_config: needsScore ? {
          team_a: teamA.trim(),
          team_b: teamB.trim(),
          score_mode: scoreMode,
        } : undefined,
      });

      toast.success("Enregistrement démarré avec succès !");

      // Notify parent
      if (onRecordingStarted) {
        onRecordingStarted(response.data.recording_session);
      }

      onOpenChange(false);

      // Reset form
      setTitle("");
      setDescription("");
      setSelectedClub("");
      setSelectedCourt("");
      setQrCode("");
      setTeamA("");
      setTeamB("");
      setScoreMode("ADV 9+STB");
    } catch (error: any) {
      console.error('Failed to start recording:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors du démarrage de l\'enregistrement';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setStarting(false);
    }
  };

  // 🆕 CourtCard component with enhanced display
  const CourtCard = ({ court }: { court: any }) => (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => court.available && setSelectedCourt(court.id.toString())}
      disabled={!court.available}
      className={`w-full p-3 rounded-xl border flex flex-col transition-all text-left ${selectedCourt === court.id.toString()
        ? "border-primary bg-primary/10"
        : court.available
          ? "border-border/50 bg-background/30 hover:border-primary/50"
          : "border-border/30 bg-background/10 opacity-50 cursor-not-allowed"
        }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{court.name}</p>
          <p className="text-xs text-muted-foreground">Terrain #{court.number || court.id}</p>
        </div>
        <div className="flex items-center gap-1">
          {court.available ? (
            <Badge variant="secondary" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>{t('modals.startRecording.courtStatus.available')}</span>
            </Badge>
          ) : (
            <Badge variant="destructive" className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>{t('modals.startRecording.courtStatus.occupied')}</span>
            </Badge>
          )}
          {court.has_scoreboard && court.scoreboard_active && (
            <Badge variant="outline" className="flex items-center gap-1 border-amber-500/50 text-amber-600 dark:text-amber-400">
              <Trophy className="h-3 w-3" />
              <span>Score</span>
            </Badge>
          )}
        </div>
      </div>

      {/* 🆕 Show recording info if court is occupied */}
      {!court.available && court.recording_info && (
        <div className="mt-2 p-2 bg-red-50 rounded border text-xs">
          <div className="flex items-center gap-1 text-red-700">
            <User className="h-3 w-3" />
            <span className="font-medium">{court.recording_info.player_name || t('modals.startRecording.courtStatus.inProgress')}</span>
          </div>
          {court.recording_info.remaining_minutes && (
            <div className="flex items-center gap-1 text-red-600 mt-1">
              <Clock className="h-3 w-3" />
              <span>{t('modals.startRecording.courtStatus.remaining', { min: court.recording_info.remaining_minutes })}</span>
            </div>
          )}
        </div>
      )}

      {!court.available && !court.recording_info && (
        <div className="mt-2 text-xs text-red-600">
          <p>⚠️ {t('modals.startRecording.courtStatus.unavailable')}</p>
        </div>
      )}
    </motion.button>
  );

  const selectedDurationOption = durations.find(d => d.value === selectedDuration);
  const selectedCourtObj = courts.find(c => c.id.toString() === selectedCourt);
  const scoreboardActive = !!(selectedCourtObj?.has_scoreboard && selectedCourtObj?.scoreboard_active);

  useEffect(() => {
    const court = courts.find(c => c.id.toString() === selectedCourt);
    if (!court?.has_scoreboard || !court?.scoreboard_active) return;
    if (isScoreMode(court.scoreboard_last_fmt)) {
      setScoreMode(court.scoreboard_last_fmt);
    }
  }, [selectedCourt, courts]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[95vh] overflow-y-auto bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="w-full max-w-[calc(100vw-4rem)] sm:max-w-none text-lg sm:text-xl font-orbitron break-words pr-8">
              {t('modals.startRecording.title')}
            </DialogTitle>
            <DialogDescription className="text-sm break-words">
              {t('modals.startRecording.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">{t('modals.startRecording.matchTitle')}</Label>
              <Input
                id="title"
                placeholder={t('modals.startRecording.matchTitlePlaceholder')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-background/50 border-border/50"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">{t('modals.startRecording.descriptionLabel')}</Label>
              <Textarea
                id="description"
                placeholder={t('modals.startRecording.descriptionPlaceholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-background/50 border-border/50 resize-none"
                rows={2}
              />
            </div>

            {/* Duration Selection */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                {t('modals.startRecording.durationLabel')}
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {durations.map((duration) => (
                  <motion.button
                    key={duration.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedDuration(duration.value)}
                    className={`p-2 sm:p-3 rounded-xl border text-left transition-all ${selectedDuration === duration.value
                      ? "border-primary bg-primary/10 shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                      : "border-border/50 bg-background/30 hover:border-primary/50"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{duration.label}</p>
                        <p className="text-xs text-muted-foreground">{duration.description}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
              {selectedDurationOption && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Durée sélectionnée: </span>
                    <span className="text-primary font-medium">{selectedDuration} minutes</span>
                  </p>
                </div>
              )}
            </div>

            {/* Club Selection - using native select to avoid Radix Portal-in-Dialog crash */}
            <div className="space-y-2">
              <Label>{t('modals.startRecording.clubLabel')} *</Label>
              <div className="relative">
                {loadingClubs ? (
                  <div className="flex h-10 w-full items-center gap-2 rounded-md border border-input bg-background/50 px-3 py-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Chargement...</span>
                  </div>
                ) : (
                  <select
                    value={selectedClub}
                    onChange={(e) => setSelectedClub(e.target.value)}
                    className="flex h-10 w-full items-center rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ color: selectedClub ? 'inherit' : 'var(--muted-foreground)' }}
                  >
                    <option value="" disabled>{t('modals.startRecording.selectClub')}</option>
                    {clubs.map((club) => (
                      <option key={club.id} value={club.id.toString()}>
                        {club.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Court Selection */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {t('modals.startRecording.courtLabel')} *
              </Label>
              {!selectedClub ? (
                <p className="text-sm text-muted-foreground">{t('modals.startRecording.selectCourt')}</p>
              ) : loadingCourts ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : courts.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {courts.map((court) => (
                    <CourtCard key={court.id} court={court} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t('modals.startRecording.noCourts')}
                </p>
              )}
            </div>

            {/* Scoreboard / Match configuration */}
            {scoreboardActive && (
              <div className="space-y-3 p-3 rounded-xl border border-amber-500/30 bg-amber-500/5">
                <Label className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  Configuration du match (score gravé dans la vidéo)
                </Label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="team-a" className="text-xs text-muted-foreground">Équipe 1</Label>
                    <Input
                      id="team-a"
                      placeholder="Ex: Ali / Ben"
                      value={teamA}
                      onChange={(e) => setTeamA(e.target.value)}
                      maxLength={60}
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team-b" className="text-xs text-muted-foreground">Équipe 2</Label>
                    <Input
                      id="team-b"
                      placeholder="Ex: Sami / Karim"
                      value={teamB}
                      onChange={(e) => setTeamB(e.target.value)}
                      maxLength={60}
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="score-mode" className="text-xs text-muted-foreground">Format de score</Label>
                  <select
                    id="score-mode"
                    value={scoreMode}
                    onChange={(e) => setScoreMode(e.target.value)}
                    className="flex h-10 w-full items-center rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    {SCORE_MODES.map((mode) => (
                      <option key={mode.value} value={mode.value}>
                        {mode.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Les règles (avantage, point d'or, tie-break...) sont appliquées par le scoreboard du terrain.
                  </p>
                </div>
              </div>
            )}

            {/* QR Code */}
            <div className="space-y-2">
              <Label htmlFor="qrCode" className="flex items-center gap-2">
                {t('modals.startRecording.qrLabel')} *
              </Label>
              <div className="flex gap-2">
                <Input
                  id="qrCode"
                  placeholder={t('modals.startRecording.qrPlaceholder')}
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  onBlur={(e) => {
                    const code = e.target.value.trim();
                    if (code && code !== qrCode) {
                      handleQRCodeScanned(code);
                    }
                  }}
                  className="bg-background/50 border-border/50"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setIsScannerOpen(true)}
                  title="Scanner avec la caméra"
                >
                  <QrCode className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/50">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="flex-1 w-full"
            >
              {t('modals.common.cancel')}
            </Button>
            <Button
              variant="neon"
              onClick={handleStartRecording}
              disabled={
                starting ||
                !selectedClub ||
                !selectedCourt ||
                !qrCode ||
                selectedCourtObj?.available === false
              }
              className="flex-1 gap-2 w-full"
            >
              {starting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">{t('modals.startRecording.starting')}</span>
                  <span className="sm:hidden">{t('modals.startRecording.starting')}</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('modals.startRecording.start')}</span>
                  <span className="sm:hidden">{t('modals.startRecording.start')}</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onCodeScanned={handleQRCodeScanned}
      />
    </>
  );
}
