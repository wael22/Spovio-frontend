// VideoContextMenu Component - Menu 3 points pour vidéos
// Actions: Lire, Créer clip, Partager, Télécharger, Supprimer

import { Play, Scissors, Share2, Download, Trash2 } from 'lucide-react';
import { spovioColors } from '../constants/colors';

interface VideoContextMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onPlay: () => void;
    onCreateClip: () => void;
    onShare: () => void;
    onDownload: () => void;
    onDelete: () => void;
    position?: { x: number; y: number };
}

export const VideoContextMenu = ({
    isOpen,
    onClose,
    onPlay,
    onCreateClip,
    onShare,
    onDownload,
    onDelete,
    position,
}: VideoContextMenuProps) => {
    if (!isOpen) return null;

    const menuItems = [
        { icon: Play, label: 'Lire', onClick: onPlay, color: spovioColors.textPrimary },
        { icon: Scissors, label: 'Créer un clip', onClick: onCreateClip, color: spovioColors.textPrimary },
        { icon: Share2, label: 'Partager', onClick: onShare, color: spovioColors.textPrimary },
        { icon: Download, label: 'Télécharger', onClick: onDownload, color: spovioColors.textPrimary },
        { icon: Trash2, label: 'Supprimer', onClick: onDelete, color: spovioColors.red },
    ];

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            />

            {/* Menu */}
            <div
                className="fixed z-50 rounded-2xl p-2 min-w-[200px] shadow-2xl"
                style={{
                    background: spovioColors.bgCard,
                    border: `1px solid ${spovioColors.borderDefault}`,
                    top: position?.y || '50%',
                    left: position?.x || '50%',
                    transform: position ? 'none' : 'translate(-50%, -50%)',
                }}
            >
                {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={index}
                            onClick={() => {
                                item.onClick();
                                onClose();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all hover:bg-white/5"
                        >
                            <Icon className="h-5 w-5" style={{ color: item.color }} />
                            <span className="font-medium" style={{ color: item.color }}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </>
    );
};
