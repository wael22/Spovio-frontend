// ProfileMenu Component - Menu déroulant sur avatar
// Options: Profil, Réglages, Déconnexion

import { User, Settings, LogOut } from 'lucide-react';
import { spovioColorsDark } from '../constants/colors';

interface ProfileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onProfile: () => void;
    onSettings: () => void;
    onLogout: () => void;
    userName: string;
    userEmail?: string;
}

export const ProfileMenu = ({
    isOpen,
    onClose,
    onProfile,
    onSettings,
    onLogout,
    userName,
    userEmail = 'thomas@example.com',
}: ProfileMenuProps) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 z-40" onClick={onClose} />

            {/* Menu */}
            <div
                className="fixed top-16 right-4 z-50 rounded-2xl p-2 min-w-[240px] shadow-2xl"
                style={{
                    background: spovioColorsDark.bgCard,
                    border: `1px solid ${spovioColorsDark.borderDefault}`,
                }}
            >
                {/* User Info */}
                <div className="px-4 py-3 border-b" style={{ borderColor: spovioColorsDark.borderDefault }}>
                    <div className="font-bold text-white">{userName}</div>
                    <div className="text-sm" style={{ color: spovioColorsDark.textSecondary }}>
                        {userEmail}
                    </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                    <button
                        onClick={() => {
                            onProfile();
                            onClose();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all hover:bg-white/5"
                    >
                        <User className="h-5 w-5" style={{ color: spovioColorsDark.cyan }} />
                        <span className="font-medium text-white">Mon Profil</span>
                    </button>

                    <button
                        onClick={() => {
                            onSettings();
                            onClose();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all hover:bg-white/5"
                    >
                        <Settings className="h-5 w-5" style={{ color: spovioColorsDark.textPrimary }} />
                        <span className="font-medium text-white">Réglages</span>
                    </button>

                    <div className="border-t my-2" style={{ borderColor: spovioColorsDark.borderDefault }} />

                    <button
                        onClick={() => {
                            onLogout();
                            onClose();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all hover:bg-white/5"
                    >
                        <LogOut className="h-5 w-5" style={{ color: spovioColorsDark.red }} />
                        <span className="font-medium" style={{ color: spovioColorsDark.red }}>
                            Se Déconnecter
                        </span>
                    </button>
                </div>
            </div>
        </>
    );
};
