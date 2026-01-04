// MenuDrawer Component - Drawer menu hamburger
// Ouvre un panneau latéral avec navigation

import { X, LayoutDashboard, Scissors, Building, MessageSquare, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { spovioColors } from '../constants/colors';

interface MenuDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    currentPage: string;
    onNavigate: (page: string) => void;
    credits?: number;
}

export const MenuDrawer = ({
    isOpen,
    onClose,
    currentPage,
    onNavigate,
    credits = 15
}: MenuDrawerProps) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'clips', label: 'Mes Clips', icon: Scissors },
        { id: 'clubs', label: 'Clubs', icon: Building },
        { id: 'support', label: 'Support', icon: MessageSquare },
    ];

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className="fixed top-0 right-0 h-full w-80 z-50 shadow-2xl"
                style={{ background: spovioColors.bgDark }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: spovioColors.borderDefault }}>
                    <h2 className="text-xl font-bold text-white">Menu</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-white hover:bg-white/10"
                    >
                        <X className="h-6 w-6" />
                    </Button>
                </div>

                {/* Menu Items */}
                <div className="p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onNavigate(item.id);
                                    onClose();
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                                style={{
                                    background: isActive ? spovioColors.cyan + '20' : 'transparent',
                                    color: isActive ? spovioColors.cyan : spovioColors.textPrimary,
                                    borderLeft: isActive ? `3px solid ${spovioColors.cyan}` : '3px solid transparent',
                                }}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}

                    {/* Credits Display */}
                    <div
                        className="flex items-center gap-3 px-4 py-3 rounded-xl mt-4"
                        style={{ background: spovioColors.bgCard, border: `1px solid ${spovioColors.borderCyan}` }}
                    >
                        <CreditCard className="h-5 w-5" style={{ color: spovioColors.cyan }} />
                        <div>
                            <div className="text-white font-bold text-lg">{credits} crédits</div>
                            <div className="text-xs" style={{ color: spovioColors.textSecondary }}>
                                Solde disponible
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Action */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <Button
                        className="w-full text-white font-semibold py-6 rounded-xl border-0"
                        style={{
                            background: `linear-gradient(135deg, ${spovioColors.green} 0%, #00D99F 100%)`,
                            boxShadow: '0 0 20px rgba(0, 255, 179, 0.4)',
                        }}
                        onClick={() => {
                            onNavigate('createClip');
                            onClose();
                        }}
                    >
                        + Créer un clip
                    </Button>
                </div>
            </div>
        </>
    );
};
