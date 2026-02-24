import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertTriangle, Calendar as CalendarIcon, Clock } from "lucide-react";
import { toast } from "sonner";
import { recoveryService, playerService } from "@/lib/api";
import { useTranslation } from "react-i18next";

interface ReportIssueModalProps {
    isOpen: boolean;
    onClose: () => void;
    prefillData?: {
        court_name?: string;
        date?: string;
        video_id?: number;
    };
}

export function ReportIssueModal({
    isOpen,
    onClose,
    prefillData
}: ReportIssueModalProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [clubs, setClips] = useState<any[]>([]);
    const [courts, setCourts] = useState<any[]>([]);
    const [selectedClubId, setSelectedClubId] = useState<string>("");

    const [formData, setFormData] = useState({
        court_id: "",
        date: new Date().toISOString().split('T')[0],
        start_time: "10:00",
        end_time: "11:30",
        description: "",
    });

    useEffect(() => {
        if (isOpen) {
            loadClubs();
        }
    }, [isOpen]);

    const loadClubs = async () => {
        try {
            const response = await playerService.getFollowedClubs();
            setClips(response.data.clubs || []);
        } catch (error) {
            console.error("Failed to load clubs:", error);
        }
    };

    const loadCourts = async (clubId: string) => {
        try {
            // We need a way to get courts for a specific club. 
            // Using public endpoint if available or specific service
            const { videoService } = await import("@/lib/api");
            const response = await videoService.getCourtsForClub(clubId);
            setCourts(response.data.courts || []);
        } catch (error) {
            console.error("Failed to load courts:", error);
            setCourts([]);
        }
    };

    const handleClubChange = (clubId: string) => {
        setSelectedClubId(clubId);
        setFormData(prev => ({ ...prev, court_id: "" }));
        loadCourts(clubId);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.court_id || !formData.date || !formData.start_time || !formData.end_time) {
            toast.error(t('modals.startRecording.errors.selectClubCourt')); // close enough or generic error
            return;
        }

        try {
            setLoading(true);

            // Construct ISO datetimes
            const startDateTime = new Date(`${formData.date}T${formData.start_time}:00`);
            const endDateTime = new Date(`${formData.date}T${formData.end_time}:00`);

            if (endDateTime <= startDateTime) {
                toast.error("L'heure de fin doit être après l'heure de début");
                setLoading(false);
                return;
            }

            await recoveryService.reportIssue({
                court_id: parseInt(formData.court_id),
                match_start: startDateTime.toISOString(),
                match_end: endDateTime.toISOString(),
                description: formData.description
            });

            toast.success(t('modals.reportIssue.success'));
            onClose();
            // Reset form
            setFormData({
                court_id: "",
                date: new Date().toISOString().split('T')[0],
                start_time: "10:00",
                end_time: "11:30",
                description: "",
            });
            setSelectedClubId("");

        } catch (error: any) {
            console.error("Report error:", error);
            toast.error(error.response?.data?.error || "Erreur lors de l'envoi du signalement");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        {t('modals.reportIssue.title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('modals.reportIssue.description')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>{t('modals.startRecording.clubLabel')}</Label>
                        <Select onValueChange={handleClubChange} value={selectedClubId}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('modals.reportIssue.selectClub')} />
                            </SelectTrigger>
                            <SelectContent>
                                {clubs.map((club) => (
                                    <SelectItem key={club.id} value={club.id.toString()}>
                                        {club.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>{t('modals.reportIssue.courtLabel')}</Label>
                        <Select
                            onValueChange={(val) => setFormData({ ...formData, court_id: val })}
                            value={formData.court_id}
                            disabled={!selectedClubId && courts.length === 0}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('modals.reportIssue.selectCourt')} />
                            </SelectTrigger>
                            <SelectContent>
                                {courts.map((court) => (
                                    <SelectItem key={court.id} value={court.id.toString()}>
                                        {court.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t('modals.reportIssue.date')}</Label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t('modals.reportIssue.startTime')}</Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="time"
                                    value={formData.start_time}
                                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>{t('modals.reportIssue.endTime')}</Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="time"
                                    value={formData.end_time}
                                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>{t('modals.reportIssue.descriptionLabel')}</Label>
                        <Textarea
                            placeholder={t('modals.reportIssue.descriptionPlaceholder')}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="resize-none"
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            {t('modals.common.cancel')}
                        </Button>
                        <Button type="submit" variant="neon" disabled={loading || !formData.court_id}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('modals.reportIssue.submit')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
