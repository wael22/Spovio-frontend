import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
    Clock,
    Play,
    QrCode,
    MapPin,
    Loader2,
    AlertCircle,
    Camera,
    ArrowLeft,
    Infinity as InfinityIcon,
    CheckCircle
} from "lucide-react";
import { recordingService, videoService } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import QRScanner from "./QRScanner";

interface DirectRecordingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRecordingStarted?: (session: any) => void;
}

type ModalStep = "scanning" | "configuring";

// Durations moved inside component

const DirectRecordingModal = ({ isOpen, onClose, onRecordingStarted }: DirectRecordingModalProps) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [step, setStep] = useState<ModalStep>("scanning");

    const durations = [
        { value: 60, label: "60 minutes", description: t('modals.startRecording.durations.short') },
        { value: 90, label: "90 minutes", description: t('modals.startRecording.durations.standard') },
        { value: 120, label: "120 minutes", description: t('modals.startRecording.durations.long') },
        { value: 200, label: t('modals.startRecording.durations.max'), description: t('modals.startRecording.durations.max') },
    ];

    // Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedDuration, setSelectedDuration] = useState(90);
    const [qrCode, setQrCode] = useState("");
    const [scannedData, setScannedData] = useState<{ club: any; court: any } | null>(null);

    // UI State
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState("");
    const [validating, setValidating] = useState(false);

    // Reset when closed
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setStep("scanning");
                setTitle("");
                setDescription("");
                setQrCode("");
                setScannedData(null);
                setError("");
                setStarting(false);
                setValidating(false);
            }, 300);
        }
    }, [isOpen]);

    const handleScanSuccess = async (code: string) => {
        console.log('✅ Direct Scan Success:', code);
        setQrCode(code);
        setValidating(true);
        setError("");

        try {
            const response = await videoService.scanQrCode(code);
            const data = response.data || response;

            if (!data.club || !data.court) {
                toast.error(t('modals.common.error'));
                setError(t('modals.common.error'));
                return;
            }

            console.log('✅ QR Validated:', data);
            setScannedData({ club: data.club, court: data.court });
            setStep("configuring");
            toast.success(`Terrain détecté: ${data.court.name}`);
        } catch (err: any) {
            console.error('❌ QR Validation Error:', err);
            setError(t('modals.common.error'));
            toast.error(t('modals.common.error'));
        } finally {
            setValidating(false);
        }
    };

    const handleStartRecording = async () => {
        if (!scannedData || !qrCode) return;

        if (user?.credits !== undefined && user.credits < 1) {
            toast.error(t('modals.startRecording.errors.credits'));
            return;
        }

        setStarting(true);
        try {
            const response = await recordingService.startAdvancedRecording({
                club_id: parseInt(scannedData.club.id),
                court_id: parseInt(scannedData.court.id),
                duration_minutes: selectedDuration,
                qr_code: qrCode,
                title: title || undefined,
                description: description || undefined,
            });

            toast.success(t('modals.common.success'));
            if (onRecordingStarted) {
                onRecordingStarted(response.data.recording_session);
            }
            onClose();
        } catch (err: any) {
            console.error('Failed to start:', err);
            toast.error(err.response?.data?.error || t('modals.common.error'));
        } finally {
            setStarting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg bg-card border-border/50 max-h-[95vh] overflow-hidden flex flex-col p-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="font-orbitron flex items-center gap-2">
                        {step === "scanning" ? (
                            <>
                                <Camera className="h-5 w-5 text-primary" />
                                {t('modals.directRecording.titleScan')}
                            </>
                        ) : (
                            <>
                                <QrCode className="h-5 w-5 text-primary" />
                                {t('modals.directRecording.titleConfig')}
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {step === "scanning"
                            ? t('modals.directRecording.scanInstruction')
                            : t('modals.directRecording.configInstruction')}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <AnimatePresence mode="wait">
                        {step === "scanning" ? (
                            <motion.div
                                key="scanning"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-4"
                            >
                                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-xs text-center">
                                    📱 {t('modals.directRecording.scanGuide')}
                                </div>

                                <div className="relative aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden border-2 border-primary/30 shadow-lg shadow-primary/10">
                                    {validating ? (
                                        <div className="absolute inset-0 z-10 bg-background/80 flex flex-col items-center justify-center transition-all">
                                            <Loader2 className="h-10 w-10 animate-spin text-primary mb-2" />
                                            <p className="text-sm font-medium">{t('modals.directRecording.validating')}</p>
                                        </div>
                                    ) : (
                                        <QRScanner onScanSuccess={handleScanSuccess} />
                                    )}

                                    {/* Overlay guide focus */}
                                    <div className="absolute inset-0 pointer-events-none border-[40px] border-black/20" />
                                    <div className="absolute inset-[40px] pointer-events-none border-2 border-primary/50 rounded-xl">
                                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                                    </div>
                                </div>

                                <div className="text-center">
                                    <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-foreground">
                                        {t('modals.common.cancel')}
                                    </Button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="configuring"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                {/* Detected Court Info */}
                                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <MapPin className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm">{scannedData?.court.name}</h3>
                                            <p className="text-xs text-muted-foreground">{scannedData?.club.name}</p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        {t('modals.directRecording.connected')}
                                    </Badge>
                                </div>

                                {/* Title Input */}
                                <div className="space-y-2">
                                    <Label htmlFor="direct-title">{t('modals.startRecording.matchTitle')} (optionnel)</Label>
                                    <Input
                                        id="direct-title"
                                        placeholder={t('modals.startRecording.matchTitlePlaceholder')}
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="bg-background/50"
                                    />
                                </div>

                                {/* Duration Picker */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <Clock className="h-3 w-3" />
                                        {t('modals.startRecording.durationLabel')}
                                    </Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {durations.map((d) => (
                                            <button
                                                key={d.value}
                                                onClick={() => setSelectedDuration(d.value)}
                                                className={`p-3 rounded-xl border text-left transition-all ${selectedDuration === d.value
                                                    ? "border-primary bg-primary/10 text-primary"
                                                    : "border-border/50 bg-background/50 hover:border-primary/30"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {d.value === 200 ? <InfinityIcon className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                                    <span className="text-sm font-bold">{d.value} min</span>
                                                </div>
                                                <p className="text-[10px] opacity-70 mt-0.5">{d.description}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Submit Actions */}
                                <div className="flex gap-2 pt-2">
                                    <Button variant="outline" className="flex-1" onClick={() => setStep("scanning")}>
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        {t('modals.directRecording.retry')}
                                    </Button>
                                    <Button variant="neon" className="flex-[2] gap-2" disabled={starting} onClick={handleStartRecording}>
                                        {starting ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Play className="h-4 w-4" />
                                        )}
                                        {t('modals.directRecording.start')}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DirectRecordingModal;
