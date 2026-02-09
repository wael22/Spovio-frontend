import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Infinity
} from "lucide-react";
import { playerService, recordingService, videoService } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import QRScannerModal from "./QRScannerModal";

interface StartRecordingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecordingStarted?: (session: any) => void;
}

const durations = [
  { value: 60, label: "60 minutes", description: "Match court" },
  { value: 90, label: "90 minutes", description: "Durée standard" },
  { value: 120, label: "120 minutes", description: "Match long" },
  { value: 200, label: "MAX (200 min)", description: "Durée maximale" },
];

export function StartRecordingModal({ open, onOpenChange, onRecordingStarted }: StartRecordingModalProps) {
  const { user } = useAuth();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(90);
  const [selectedClub, setSelectedClub] = useState("");
  const [selectedCourt, setSelectedCourt] = useState("");
  const [qrCode, setQrCode] = useState("");

  // UI state
  const [clubs, setClubs] = useState<any[]>([]);
  const [courts, setCourts] = useState<any[]>([]);
  const [loadingClubs, setLoadingClubs] = useState(false);
  const [loadingCourts, setLoadingCourts] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  // Load FOLLOWED clubs when modal opens
  useEffect(() => {
    if (open) {
      loadFollowedClubs();
      // Reset form
      setTitle("");
      setDescription("");
      setSelectedDuration(90);
      setSelectedClub("");
      setSelectedCourt("");
      setQrCode("");
      setError("");
    }
  }, [open]);

  // Load courts when club is selected
  useEffect(() => {
    if (selectedClub) {
      loadCourts(selectedClub);
    } else {
      setCourts([]);
      setSelectedCourt("");
    }
  }, [selectedClub]);

  const loadFollowedClubs = async () => {
    setLoadingClubs(true);
    try {
      // 🆕 Use playerService.getFollowedClubs instead of getAvailableClubs
      const response = await playerService.getFollowedClubs();
      setClubs(response.data.clubs || []);

      if ((response.data.clubs || []).length === 0) {
        setError('Vous ne suivez aucun club. Rendez-vous dans l\'onglet "Clubs" pour suivre un club.');
      } else {
        setError("");
      }
    } catch (error: any) {
      console.error('Failed to load followed clubs:', error);
      toast.error('Impossible de charger vos clubs suivis');
      setError('Erreur lors du chargement de vos clubs suivis');
    } finally {
      setLoadingClubs(false);
    }
  };

  const loadCourts = async (clubId: string) => {
    setLoadingCourts(true);
    setError("");
    try {
      const response = await recordingService.getClubCourtsForPlayers(clubId);
      setCourts(response.data.courts || []);

      if (!response.data.courts || response.data.courts.length === 0) {
        setError('Aucun terrain trouvé pour ce club');
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
    setIsQRScannerOpen(false);
    setError("");
    setStarting(true);

    try {
      // Validate QR code and get court/club info
      const response = await videoService.scanQrCode(code);
      const { court, club } = response.data;

      console.log('✅ QR Code validé - Club:', club?.name, 'Terrain:', court?.name);

      // Auto-fill club and court fields
      setSelectedClub(club?.id?.toString() || "");
      setSelectedCourt(court?.id?.toString() || "");

      // Load courts for this club if not already loaded
      if (club?.id && courts.length === 0) {
        await loadCourts(club.id.toString());
      }

      toast.success(`Code QR validé: ${club?.name} - ${court?.name}`);
    } catch (err: any) {
      console.error('❌ Erreur validation QR:', err);
      if (err.response?.status === 404) {
        toast.error('Code QR invalide. Veuillez scanner un QR code valide.');
      } else {
        setError('Erreur lors de la validation du QR code. Veuillez réessayer.');
      }
    } finally {
      setStarting(false);
    }
  };

  const handleStartRecording = async () => {
    // Validations
    if (!selectedClub || !selectedCourt) {
      setError("Veuillez sélectionner un club et un terrain");
      toast.error("Veuillez sélectionner un club et un terrain");
      return;
    }

    if (!qrCode) {
      setError("Le code QR du terrain est requis");
      toast.error("Le code QR du terrain est requis");
      return;
    }

    if (!user || !user.id) {
      setError("Utilisateur non authentifié");
      toast.error("Utilisateur non authentifié");
      return;
    }

    // 🆕 Check if user has enough credits (if user.credits exists)
    if (user.credits !== undefined && user.credits < 1) {
      setError("Crédit insuffisant. Veuillez acheter des crédits.");
      toast.error("Crédit insuffisant. Veuillez acheter des crédits.");
      return;
    }

    setStarting(true);
    setError("");

    try {
      // 🆕 Validate QR code matches selected court
      const qrValidation = await videoService.scanQrCode(qrCode);

      if (qrValidation.data.court.id.toString() !== selectedCourt) {
        setError(`Le code QR ne correspond pas au terrain sélectionné. Ce code est pour le terrain "${qrValidation.data.court.name}"`);
        toast.error(`Le code QR ne correspond pas au terrain sélectionné`);
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
        {court.available ? (
          <Badge variant="secondary" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-600" />
            <span>Disponible</span>
          </Badge>
        ) : (
          <Badge variant="destructive" className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span>Occupé</span>
          </Badge>
        )}
      </div>

      {/* 🆕 Show recording info if court is occupied */}
      {!court.available && court.recording_info && (
        <div className="mt-2 p-2 bg-red-50 rounded border text-xs">
          <div className="flex items-center gap-1 text-red-700">
            <User className="h-3 w-3" />
            <span className="font-medium">{court.recording_info.player_name || 'En cours'}</span>
          </div>
          {court.recording_info.remaining_minutes && (
            <div className="flex items-center gap-1 text-red-600 mt-1">
              <Clock className="h-3 w-3" />
              <span>Reste: {court.recording_info.remaining_minutes} min</span>
            </div>
          )}
        </div>
      )}

      {!court.available && !court.recording_info && (
        <div className="mt-2 text-xs text-red-600">
          <p>⚠️ Terrain temporairement indisponible</p>
        </div>
      )}
    </motion.button>
  );

  const selectedDurationOption = durations.find(d => d.value === selectedDuration);
  const selectedCourtObj = courts.find(c => c.id.toString() === selectedCourt);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[95vh] overflow-y-auto bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="w-full max-w-[calc(100vw-4rem)] sm:max-w-none text-lg sm:text-xl font-orbitron break-words pr-8">
              Nouvel Enregistrement avec Durée
            </DialogTitle>
            <DialogDescription className="text-sm break-words">
              Configurez votre enregistrement de match avec une durée personnalisée
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
              <Label htmlFor="title">Titre du match</Label>
              <Input
                id="title"
                placeholder="Ex: Match contre équipe X"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-background/50 border-border/50"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Notes sur le match..."
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
                Durée d'enregistrement
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
                      {duration.value === 200 ? (
                        <Infinity className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      )}
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

            {/* Club Selection */}
            <div className="space-y-2">
              <Label>Club *</Label>
              {loadingClubs ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : (
                <Select value={selectedClub} onValueChange={setSelectedClub}>
                  <SelectTrigger className="bg-background/50 border-border/50">
                    <SelectValue placeholder="Sélectionner un club" />
                  </SelectTrigger>
                  <SelectContent>
                    {clubs.map((club) => (
                      <SelectItem key={club.id} value={club.id.toString()}>
                        {club.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Court Selection */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Terrain disponible *
              </Label>
              {!selectedClub ? (
                <p className="text-sm text-muted-foreground">Sélectionnez d'abord un club</p>
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
                  Aucun terrain disponible
                </p>
              )}
            </div>

            {/* QR Code */}
            <div className="space-y-2">
              <Label htmlFor="qrCode" className="flex items-center gap-2">
                QR Code du terrain *
              </Label>
              <div className="flex gap-2">
                <Input
                  id="qrCode"
                  placeholder="Code du terrain"
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
                  onClick={() => setIsQRScannerOpen(true)}
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
              Annuler
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
                  <span className="hidden sm:inline">Démarrage...</span>
                  <span className="sm:hidden">Démarrage...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span className="hidden sm:inline">Démarrer l'enregistrement</span>
                  <span className="sm:hidden">Démarrer</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onCodeScanned={handleQRCodeScanned}
      />
    </>
  );
}
