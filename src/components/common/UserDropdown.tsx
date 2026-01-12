import React, { useState, useRef, useEffect } from 'react';
import { Coins, User, Settings, LogOut, ChevronDown } from 'lucide-react';

interface UserDropdownProps {
    user: {
        name: string;
        role: string;
    } | null;
    credits?: number;
    onBuyCredits?: () => void;
    onProfile?: () => void;
    onSettings?: () => void;
    onLogout: () => void;
}

/**
 * UserDropdown - Menu déroulant utilisateur moderne
 * Affiche le profil, crédits et options de compte
 */
const UserDropdown: React.FC<UserDropdownProps> = ({ user, credits, onBuyCredits, onProfile, onSettings, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fermer en cliquant à l'extérieur
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Fermer au clic sur une option
    const handleOptionClick = (callback?: () => void) => {
        if (callback) callback();
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bouton du profil */}
            <button
                id="profile-button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Menu utilisateur"
                aria-expanded={isOpen}
            >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-600 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 z-10 min-w-[240px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    {/* Header - Nom et rôle */}
                    <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                        <p className="font-semibold text-gray-900 dark:text-white">{user?.name || 'Utilisateur'}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user?.role || 'Club'}</p>
                    </div>

                    {/* Crédits (si applicable) */}
                    {credits !== undefined && (
                        <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-1">
                                <Coins className="h-4 w-4 text-yellow-500" />
                                <span className="font-semibold">{credits} crédits</span>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="py-1">
                        {onBuyCredits && (
                            <button
                                id="buy-credits-button"
                                onClick={() => handleOptionClick(onBuyCredits)}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                            >
                                <Coins className="h-4 w-4" />
                                <span>Acheter des crédits</span>
                            </button>
                        )}

                        {onProfile && (
                            <button
                                onClick={() => handleOptionClick(onProfile)}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                            >
                                <User className="h-4 w-4" />
                                <span>Mon Profil</span>
                            </button>
                        )}

                        {onSettings && (
                            <button
                                onClick={() => handleOptionClick(onSettings)}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                            >
                                <Settings className="h-4 w-4" />
                                <span>Paramètres</span>
                            </button>
                        )}
                    </div>

                    {/* Déconnexion */}
                    {onLogout && (
                        <>
                            <div className="border-t border-gray-100 dark:border-gray-700" />
                            <div className="py-1">
                                <button
                                    onClick={() => handleOptionClick(onLogout)}
                                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors text-left"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Déconnexion</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserDropdown;
