// SupportPage Component - Page "Support"
// Formulaire de contact support

import { MessageSquare, Mail, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { spovioColors } from '../constants/colors';

export const SupportPage = () => {
    return (
        <div className="px-4 py-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <MessageSquare className="h-8 w-8" style={{ color: spovioColors.cyan }} />
                    <h1 className="text-3xl font-bold text-white">Support</h1>
                </div>
                <p style={{ color: spovioColors.textSecondary }}>
                    Une question ? On est là pour t'aider
                </p>
            </div>

            {/* Contact Form */}
            <div
                className="rounded-2xl p-6 space-y-4"
                style={{
                    background: spovioColors.bgCard,
                    border: `1px solid ${spovioColors.borderDefault}`
                }}
            >
                <div>
                    <label className="text-white font-medium mb-2 block">Sujet</label>
                    <Input
                        placeholder="De quoi as-tu besoin ?"
                        className="border-0 text-white"
                        style={{ background: spovioColors.bgDark }}
                    />
                </div>

                <div>
                    <label className="text-white font-medium mb-2 block">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: spovioColors.textSecondary }} />
                        <Input
                            type="email"
                            placeholder="ton@email.com"
                            className="pl-10 border-0 text-white"
                            style={{ background: spovioColors.bgDark }}
                        />
                    </div>
                </div>

                <div>
                    <label className="text-white font-medium mb-2 block">Message</label>
                    <Textarea
                        placeholder="Décris ton problème ou ta question..."
                        rows={6}
                        className="border-0 text-white resize-none"
                        style={{ background: spovioColors.bgDark }}
                    />
                </div>

                <Button
                    className="w-full text-white font-semibold py-6 rounded-xl border-0"
                    style={{
                        background: `linear-gradient(135deg, ${spovioColors.cyan} 0%, ${spovioColors.cyanDark} 100%)`,
                        boxShadow: '0 0 20px rgba(0, 229, 255, 0.4)',
                    }}
                >
                    <Send className="h-5 w-5 mr-2" />
                    Envoyer le message
                </Button>
            </div>

            {/* FAQ Link */}
            <div className="mt-6 text-center">
                <p style={{ color: spovioColors.textSecondary }} className="mb-2">
                    Besoin d'une réponse rapide ?
                </p>
                <Button variant="link" style={{ color: spovioColors.cyan }}>
                    Consulter la FAQ →
                </Button>
            </div>
        </div>
    );
};
