// LoginModal - Modal de connexion
// Email + Mot de passe

import { X, Mail, Lock, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { spovioColorsDark, spovioGradients } from '../constants/colors';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (email: string, password: string) => void;
}

export const LoginModal = ({ isOpen, onClose, onLogin }: LoginModalProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(email, password);
    };

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md rounded-2xl p-6 shadow-2xl"
                style={{
                    background: spovioColorsDark.bgCard,
                    border: `1px solid ${spovioColorsDark.borderCyan}`,
                    boxShadow: '0 0 40px rgba(0, 229, 255, 0.2)',
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Connexion</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-white hover:bg-white/10"
                    >
                        <X className="h-6 w-6" />
                    </Button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div>
                        <label className="text-white font-medium mb-2 block">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: spovioColorsDark.textSecondary }} />
                            <Input
                                type="email"
                                placeholder="ton@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 border-0 text-white"
                                style={{ background: spovioColorsDark.bgDark }}
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="text-white font-medium mb-2 block">Mot de passe</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: spovioColorsDark.textSecondary }} />
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 border-0 text-white"
                                style={{ background: spovioColorsDark.bgDark }}
                                required
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full text-white font-semibold py-6 rounded-xl border-0 mt-6"
                        style={{
                            background: spovioGradients.cyanButton,
                            boxShadow: '0 0 20px rgba(0, 229, 255, 0.4)',
                        }}
                    >
                        <LogIn className="h-5 w-5 mr-2" />
                        Se Connecter
                    </Button>
                </form>

                {/* Footer */}
                <div className="mt-4 text-center text-sm" style={{ color: spovioColorsDark.textSecondary }}>
                    Pas encore de compte ?{' '}
                    <button className="font-semibold" style={{ color: spovioColorsDark.cyan }}>
                        Créer un compte
                    </button>
                </div>
            </div>
        </>
    );
};
