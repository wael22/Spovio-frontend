import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import UserDropdown from './UserDropdown';
import { Sparkles, Sun, Moon } from 'lucide-react';

interface NavbarProps {
    title?: string;
}

const Navbar: React.FC<NavbarProps> = ({ title }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.classList.toggle('dark');
    };

    const handleLogout = async () => {
        await logout();
        navigate('/auth');
    };

    const handleProfile = () => {
        navigate('/profile');
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/30 dark:border-gray-700/30">
            <div className="max-w-7xl mx-auto px-3 sm:px-6">
                <div className="flex justify-between items-center h-14">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                            <span className="hidden sm:inline bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 bg-clip-text text-transparent">
                                MySmash
                            </span>
                        </h1>

                        {title && (
                            <h2 className="text-sm font-medium hidden md:block text-gray-700 dark:text-gray-300">
                                {title}
                            </h2>
                        )}
                    </div>

                    {/* Menu utilisateur */}
                    <div className="flex items-center gap-2">
                        {/* Toggle Theme */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg transition-all hover:scale-110 bg-gray-100 dark:bg-gray-800 border-2 border-blue-500 dark:border-cyan-400"
                            aria-label="Changer le thème"
                        >
                            {theme === 'dark' ? (
                                <Sun className="h-5 w-5 text-yellow-400" />
                            ) : (
                                <Moon className="h-5 w-5 text-indigo-600" />
                            )}
                        </button>

                        {/* User Dropdown */}
                        <UserDropdown
                            user={user}
                            credits={user?.role === 'player' ? user?.credits_balance : undefined}
                            onProfile={handleProfile}
                            onLogout={handleLogout}
                        />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
