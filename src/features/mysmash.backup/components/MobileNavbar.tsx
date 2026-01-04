// MobileNavbar avec ProfileMenu intégré
import { Video, Bell, Moon, Sun, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ProfileMenu } from './ProfileMenu';

interface MobileNavbarProps {
    userName?: string;
    userEmail?: string;
    notificationCount?: number;
    onMenuClick?: () => void;
    onProfile?: () => void;
    onSettings?: () => void;
    onLogout?: () => void;
    onToggleTheme?: () => void;
    isDark?: boolean;
}

export const MobileNavbar = ({
    userName = 'TM',
    userEmail,
    notificationCount = 0,
    onMenuClick,
    onProfile,
    onSettings,
    onLogout,
    onToggleTheme,
    isDark = true,
}: MobileNavbarProps) => {
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    return (
        <>
            <div className="w-full bg-[#0A0E1A] border-b border-white/5 px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo Vidéo Cyan */}
                    <div
                        className="flex items-center justify-center h-12 w-12 rounded-xl bg-[#00E5FF]"
                        style={{ boxShadow: '0 0 15px rgba(0, 229, 255, 0.4)' }}
                    >
                        <Video className="h-6 w-6 text-[#0A0E1A]" />
                    </div>

                    {/* Actions Droite */}
                    <div className="flex items-center gap-2">
                        {/* Notification avec Badge */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative text-white hover:bg-white/10 h-10 w-10"
                        >
                            <Bell className="h-5 w-5" />
                            {notificationCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-[#E53935] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {notificationCount > 9 ? '9+' : notificationCount}
                                </span>
                            )}
                        </Button>

                        {/* Toggle Thème */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-[#00E5FF] hover:bg-white/10 h-10 w-10"
                            onClick={onToggleTheme}
                        >
                            {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                        </Button>

                        {/* Avatar Utilisateur - Cliquable */}
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="h-10 w-10 rounded-full bg-[#00E5FF] text-[#0A0E1A] flex items-center justify-center font-bold text-sm border-2 border-[#00E5FF]/30 hover:scale-110 transition-transform"
                        >
                            {userName}
                        </button>

                        {/* Menu Hamburger */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/10 h-10 w-10"
                            onClick={onMenuClick}
                        >
                            <Menu className="h-6 w-6" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Profile Menu */}
            <ProfileMenu
                isOpen={showProfileMenu}
                onClose={() => setShowProfileMenu(false)}
                onProfile={() => onProfile?.()}
                onSettings={() => onSettings?.()}
                onLogout={() => onLogout?.()}
                userName={userName}
                userEmail={userEmail}
            />
        </>
    );
};
