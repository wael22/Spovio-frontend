import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Loader2, VideoIcon, Edit, Trash2, Plus, X, Image as ImageIcon, Eye } from 'lucide-react';
import { adminService } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Resolve overlay image URL robustly - handles relative paths & absolute URLs
const resolveOverlayUrl = (path: string): string => {
    if (!path) return '';
    // Already a full URL - return as-is
    if (path.startsWith('http://') || path.startsWith('https://')) return path;

    // Relative path: The backend serves overlays via the auth blueprint
    // Route in backend: @auth_bp.route('/static/overlays/<path:filename>')
    // Mount point: /api/auth
    // Example: "static/overlays/file.png" → "https://api.spovio.net/api/auth/static/overlays/file.png"
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    if (cleanPath.startsWith('static/overlays')) {
        return `https://api.spovio.net/api/auth/${cleanPath}`;
    }
    return `https://api.spovio.net/api/${cleanPath}`;
};

interface ClubOverlayManagerProps {
    club: { id: string; name: string } | null;
    isOpen: boolean;
    onClose: () => void;
}

interface Overlay {
    id: string;
    name: string;
    image_url: string;
    position_x: number;
    position_y: number;
    width: number;
    opacity: number;
    is_active: boolean;
}

interface FormData {
    name: string;
    image_url: string;
    position_x: number;
    position_y: number;
    width: number;
    opacity: number;
    is_active: boolean;
}

const CAMERA_RESOLUTIONS = [
    { label: '16:9 — HD (1920×1080)', ratio: '56.25%', tag: '16:9' },
    { label: '16:9 — 720p (1280×720)', ratio: '56.25%', tag: '16:9' },
    { label: '4:3 — Standard (1280×960)', ratio: '75%', tag: '4:3' },
    { label: '4:3 — VGA (640×480)', ratio: '75%', tag: '4:3' },
    { label: '1:1 — Carré (1080×1080)', ratio: '100%', tag: '1:1' },
    { label: '9:16 — Vertical (1080×1920)', ratio: '177.78%', tag: '9:16' },
];

const ClubOverlayManager: React.FC<ClubOverlayManagerProps> = ({ club, isOpen, onClose }) => {
    const [overlays, setOverlays] = useState<Overlay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingOverlay, setEditingOverlay] = useState<Overlay | { new: boolean } | null>(null);
    const [formData, setFormData] = useState<FormData>(getInitialFormData());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedResolution, setSelectedResolution] = useState(CAMERA_RESOLUTIONS[0]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    function getInitialFormData(): FormData {
        return {
            name: '',
            image_url: '',
            position_x: 0,
            position_y: 0,
            width: 3,
            opacity: 0.2,
            is_active: true
        };
    }

    useEffect(() => {
        if (isOpen && club) {
            loadOverlays();
            setEditingOverlay(null);
            setError('');
        }
    }, [isOpen, club]);

    const loadOverlays = async () => {
        if (!club) return;
        try {
            setLoading(true);
            const response = await adminService.getClubOverlays(club.id);
            setOverlays(response.data.overlays || []);
        } catch (error) {
            console.error('Erreur chargement overlays:', error);
            setError('Impossible de charger les overlays.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (overlayId: string, overlayName: string) => {
        if (!club) return;
        if (!confirm(`Supprimer l'overlay "${overlayName}" ?`)) return;

        try {
            await adminService.deleteClubOverlay(club.id, overlayId);
            loadOverlays();
        } catch (error) {
            console.error('Erreur suppression overlay:', error);
            setError("Erreur lors de la suppression.");
        }
    };

    const startEdit = (overlay: Overlay) => {
        setEditingOverlay(overlay);
        setFormData({
            name: overlay.name,
            image_url: overlay.image_url,
            position_x: overlay.position_x,
            position_y: overlay.position_y,
            width: overlay.width,
            opacity: overlay.opacity,
            is_active: overlay.is_active
        });
    };

    const startCreate = () => {
        setEditingOverlay({ new: true });
        setFormData(getInitialFormData());
    };

    const handleSave = async () => {
        if (!club) return;
        try {
            setIsSubmitting(true);
            setError('');

            if (editingOverlay && 'id' in editingOverlay) {
                await adminService.updateClubOverlay(club.id, editingOverlay.id, formData);
            } else {
                await adminService.createClubOverlay(club.id, formData);
            }

            await loadOverlays();
            setEditingOverlay(null);
        } catch (err) {
            console.error('Erreur sauvegarde:', err);
            setError("Erreur lors de l'enregistrement.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !club) return;

        try {
            setIsSubmitting(true);
            setError('');

            // Create FormData for file upload
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);

            // Upload file to backend
            const response = await adminService.uploadOverlayImage(club.id, uploadFormData);

            // Set the returned server URL
            setFormData(prev => ({
                ...prev,
                image_url: response.data.image_url
            }));

        } catch (err: any) {
            console.error('Erreur upload:', err);
            setError(err.response?.data?.error || "Erreur lors de l'upload de l'image.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!max-w-[90vw] w-[90vw] h-[90vh] flex flex-col p-0 gap-0 sm:max-w-[90vw]">
                <DialogHeader className="p-6 border-b shrink-0 bg-white z-10">
                    <DialogTitle className="text-2xl">Gestion des Overlays Vidéo - {club?.name}</DialogTitle>
                    <DialogDescription className="text-base">
                        Gérez les logos et images flottantes qui s'affichent sur les vidéos de ce club
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="px-6 pt-4">
                        <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
                    </div>
                )}

                <div className="flex-1 overflow-hidden flex flex-row">
                    {/* COLONNE GAUCHE: Formulaire ou Liste */}
                    <div className="w-[500px] shrink-0 border-r bg-slate-50 flex flex-col overflow-y-auto">
                        <div className="p-6">
                            {editingOverlay ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-lg">
                                            {'id' in editingOverlay ? 'Modifier Overlay' : 'Nouvel Overlay'}
                                        </h3>
                                        <Button variant="ghost" size="sm" onClick={() => setEditingOverlay(null)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* Image Upload */}
                                    <div className="space-y-2">
                                        <Label>Image de l'overlay</Label>
                                        <div className="flex gap-4 items-start p-4 bg-white border rounded-lg">
                                            <div
                                                className="border rounded w-20 h-20 flex items-center justify-center overflow-hidden"
                                                style={{
                                                    background: 'repeating-conic-gradient(#d1d5db 0% 25%, white 0% 50%) 0 0 / 16px 16px'
                                                }}
                                            >
                                                {formData.image_url ? (
                                                    <img
                                                        src={resolveOverlayUrl(formData.image_url)}
                                                        alt="Preview"
                                                        className="w-full h-full object-contain"
                                                        onError={(e) => console.error('❌ Image preview failed:', resolveOverlayUrl(formData.image_url))}
                                                    />
                                                ) : (
                                                    <ImageIcon className="text-gray-300 h-6 w-6" />
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    ref={fileInputRef}
                                                    onChange={handleFileChange}
                                                    disabled={isSubmitting}
                                                    className="text-sm"
                                                />
                                                <p className="text-xs text-blue-600">
                                                    ℹ️ PNG transparent recommandé
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Name */}
                                    <div className="space-y-2">
                                        <Label className="text-sm">Nom (Optionnel)</Label>
                                        <Input
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Logo Sponsor"
                                            className="h-9"
                                        />
                                    </div>

                                    {/* Sliders */}
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <Label className="text-sm">Position X ({formData.position_x}%)</Label>
                                            <Slider
                                                value={[formData.position_x]}
                                                max={100}
                                                step={1}
                                                onValueChange={([val]) => setFormData({ ...formData, position_x: val })}
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-sm">Position Y ({formData.position_y}%)</Label>
                                            <Slider
                                                value={[formData.position_y]}
                                                max={100}
                                                step={1}
                                                onValueChange={([val]) => setFormData({ ...formData, position_y: val })}
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-sm">Largeur ({formData.width}%)</Label>
                                            <Slider
                                                value={[formData.width]}
                                                max={40}
                                                step={1}
                                                onValueChange={([val]) => setFormData({ ...formData, width: val })}
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-sm">Opacité ({formData.opacity.toFixed(2)})</Label>
                                            <Slider
                                                value={[formData.opacity]}
                                                max={1}
                                                step={0.05}
                                                onValueChange={([val]) => setFormData({ ...formData, opacity: val })}
                                            />
                                        </div>
                                    </div>

                                    {/* Active & Actions */}
                                    <div className="flex items-center justify-between pt-3 border-t">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                checked={formData.is_active}
                                                onCheckedChange={checked => setFormData({ ...formData, is_active: checked })}
                                            />
                                            <Label className="text-sm">Actif</Label>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => setEditingOverlay(null)}>Annuler</Button>
                                            <Button size="sm" onClick={handleSave} disabled={isSubmitting || !formData.image_url}>
                                                {isSubmitting && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                                                Sauvegarder
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : loading ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                </div>
                            ) : overlays.length === 0 ? (
                                <div className="text-center py-12">
                                    <VideoIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                    <h3 className="text-base font-medium mb-1">Aucun overlay</h3>
                                    <p className="text-sm text-gray-600 mb-3">Ajoutez des logos</p>
                                    <Button onClick={startCreate} size="sm">
                                        <Plus className="h-4 w-4 mr-1" />Ajouter
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center pb-3 border-b">
                                        <div>
                                            <h3 className="font-semibold">Overlays</h3>
                                            <p className="text-xs text-gray-500">{overlays.length} élément(s)</p>
                                        </div>
                                        <Button onClick={startCreate} size="sm">
                                            <Plus className="h-4 w-4 mr-1" />Ajouter
                                        </Button>
                                    </div>

                                    {overlays.map((ov) => (
                                        <div key={ov.id} className="p-3 border rounded-lg bg-white hover:shadow transition-all">
                                            <div className="flex items-start gap-3">
                                                {/* Thumbnail */}
                                                <div
                                                    className="border rounded w-14 h-14 shrink-0 flex items-center justify-center overflow-hidden"
                                                    style={{
                                                        background: 'repeating-conic-gradient(#d1d5db 0% 25%, white 0% 50%) 0 0 / 12px 12px'
                                                    }}
                                                >
                                                    {ov.image_url ? (
                                                        <img
                                                            src={resolveOverlayUrl(ov.image_url)}
                                                            alt={ov.name}
                                                            className="w-full h-full object-contain"
                                                            onError={(e) => {
                                                                console.error('❌ Overlay image failed:', resolveOverlayUrl(ov.image_url));
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <ImageIcon className="text-gray-300 h-5 w-5" />
                                                    )}
                                                </div>
                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-medium text-sm truncate">{ov.name || 'Sans nom'}</h4>
                                                        <Badge variant={ov.is_active ? "default" : "secondary"} className={`text-xs ${ov.is_active ? "bg-green-600" : ""}`}>
                                                            {ov.is_active ? "Actif" : "Off"}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex gap-1 text-xs text-gray-600 flex-wrap">
                                                        <span className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">X:{ov.position_x}% Y:{ov.position_y}%</span>
                                                        <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-mono">Taille: {ov.width}%</span>
                                                        <span className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">Opacité: {ov.opacity.toFixed(2)}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-1 truncate" title={resolveOverlayUrl(ov.image_url)}>
                                                        🔗 {resolveOverlayUrl(ov.image_url)}
                                                    </p>
                                                </div>
                                                {/* Actions */}
                                                <div className="flex flex-col gap-1">
                                                    <Button variant="outline" size="sm" onClick={() => startEdit(ov)} className="h-7 w-7 p-0" title="Modifier">
                                                        <Edit className="h-3 w-3" />
                                                    </Button>
                                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(ov.id, ov.name)} className="h-7 w-7 p-0" title="Supprimer">
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* COLONNE DROITE: Prévisualisation Vidéo */}
                    <div className="flex-1 bg-black flex flex-col items-center justify-center p-8 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black pointer-events-none" />

                        {/* Resolution Selector */}
                        <div className="z-10 mb-4 flex items-center gap-3 flex-wrap justify-center">
                            <span className="text-gray-400 text-sm font-medium">📷 Résolution caméra :</span>
                            <div className="flex gap-2 flex-wrap justify-center">
                                {CAMERA_RESOLUTIONS.map((res) => (
                                    <button
                                        key={res.label}
                                        onClick={() => setSelectedResolution(res)}
                                        className={`px-3 py-1 rounded-full text-xs font-mono border transition-all ${selectedResolution.label === res.label
                                            ? 'bg-blue-600 border-blue-500 text-white'
                                            : 'border-gray-600 text-gray-400 hover:border-blue-500 hover:text-white'
                                            }`}
                                    >
                                        {res.tag} — {res.label.split('(')[1]?.replace(')', '') || ''}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <h3 className="mb-3 text-gray-400 font-medium z-10 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            Prévisualisation — {selectedResolution.label}
                        </h3>

                        <div
                            className="relative w-full max-w-2xl rounded-lg border border-gray-700 shadow-2xl overflow-hidden z-10"
                            style={{
                                paddingBottom: selectedResolution.ratio,
                                background: 'repeating-conic-gradient(#374151 0% 25%, #1f2937 0% 50%) 0 0 / 32px 32px'
                            }}
                        >
                            <div className="absolute inset-0 flex items-center justify-center text-gray-600 font-bold text-3xl select-none">
                                VIDEO PADEL
                            </div>

                            {/* Overlay en cours d'édition */}
                            {editingOverlay && formData.image_url && (
                                <img
                                    src={resolveOverlayUrl(formData.image_url)}
                                    alt="Preview"
                                    onError={(e) => console.error('❌ Preview img failed:', resolveOverlayUrl(formData.image_url))}
                                    style={{
                                        position: 'absolute',
                                        left: `${formData.position_x}%`,
                                        top: `${formData.position_y}%`,
                                        width: `${formData.width}%`,
                                        opacity: formData.opacity,
                                        transition: 'all 0.15s ease',
                                        outline: '2px dashed yellow',
                                        zIndex: 50
                                    }}
                                />
                            )}

                            {/* Tous les overlays actifs (mode liste) */}
                            {!editingOverlay && overlays.map(ov => ov.is_active && (
                                <img
                                    key={ov.id}
                                    src={resolveOverlayUrl(ov.image_url)}
                                    alt={ov.name}
                                    title={`${ov.name} — ${ov.width}% de largeur`}
                                    onError={(e) => console.error('❌ Active overlay img failed:', resolveOverlayUrl(ov.image_url))}
                                    style={{
                                        position: 'absolute',
                                        left: `${ov.position_x}%`,
                                        top: `${ov.position_y}%`,
                                        width: `${ov.width}%`,
                                        opacity: ov.opacity,
                                        zIndex: 10
                                    }}
                                />
                            ))}
                        </div>

                        <p className="mt-4 text-sm text-gray-400 max-w-md text-center z-10">
                            {editingOverlay
                                ? "Ajustez les curseurs pour positionner l'overlay en temps réel"
                                : "Aperçu de tous les overlays actifs sur la vidéo"}
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ClubOverlayManager;
