// CreditsPage Component - Page "Crédits"
// Achat et gestion crédits

import { CreditCard, Coins, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { spovioColors } from '../constants/colors';

interface CreditPackage {
    id: number;
    credits: number;
    price: number;
    discount?: number;
    popular?: boolean;
}

const packages: CreditPackage[] = [
    { id: 1, credits: 1, price: 5 },
    { id: 2, credits: 5, price: 20, discount: 20 },
    { id: 3, credits: 10, price: 35, discount: 30, popular: true },
    { id: 4, credits: 25, price: 75, discount: 40 },
];

export const CreditsPage = () => {
    return (
        <div className="px-4 py-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <Coins className="h-8 w-8" style={{ color: spovioColors.cyan }} />
                    <h1 className="text-3xl font-bold text-white">Crédits</h1>
                </div>
                <p style={{ color: spovioColors.textSecondary }}>
                    Recharge ton solde pour débloquer tes vidéos
                </p>
            </div>

            {/* Current Balance */}
            <div
                className="rounded-2xl p-6 mb-8"
                style={{
                    background: `linear-gradient(135deg, ${spovioColors.cyan} 0%, ${spovioColors.cyanDark} 100%)`,
                    boxShadow: '0 0 30px rgba(0, 229, 255, 0.3)',
                }}
            >
                <p className="text-white/80 text-sm mb-1">Solde actuel</p>
                <div className="flex items-center gap-3">
                    <Coins className="h-10 w-10 text-white" />
                    <span className="text-5xl font-bold text-white">15</span>
                    <span className="text-2xl text-white/80">crédits</span>
                </div>
            </div>

            {/* Packages Grid */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-white mb-4">Packages disponibles</h2>

                {packages.map((pkg) => (
                    <div
                        key={pkg.id}
                        className="rounded-2xl p-5 relative transition-all hover:scale-[1.02]"
                        style={{
                            background: spovioColors.bgCard,
                            border: pkg.popular
                                ? `2px solid ${spovioColors.cyan}`
                                : `1px solid ${spovioColors.borderDefault}`,
                            boxShadow: pkg.popular
                                ? '0 0 20px rgba(0, 229, 255, 0.2)'
                                : 'none',
                        }}
                    >
                        {/* Popular Badge */}
                        {pkg.popular && (
                            <div
                                className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1"
                                style={{ background: spovioColors.cyan }}
                            >
                                <Zap className="h-3 w-3" />
                                POPULAIRE
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div
                                    className="h-16 w-16 rounded-xl flex items-center justify-center"
                                    style={{ background: spovioColors.cyan + '20' }}
                                >
                                    <span className="text-2xl font-bold" style={{ color: spovioColors.cyan }}>
                                        {pkg.credits}
                                    </span>
                                </div>

                                <div>
                                    <div className="text-white font-bold text-lg">
                                        {pkg.credits} {pkg.credits === 1 ? 'crédit' : 'crédits'}
                                    </div>
                                    {pkg.discount && (
                                        <div
                                            className="text-sm font-semibold"
                                            style={{ color: spovioColors.green }}
                                        >
                                            -{pkg.discount}% de réduction
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-white font-bold text-2xl">{pkg.price} DT</div>
                                <Button
                                    size="sm"
                                    className="mt-2 rounded-lg border-0 text-white font-semibold"
                                    style={{
                                        background: pkg.popular
                                            ? `linear-gradient(135deg, ${spovioColors.cyan} 0%, ${spovioColors.cyanDark} 100%)`
                                            : spovioColors.bgDark,
                                    }}
                                >
                                    Acheter
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Info */}
            <div
                className="mt-8 p-4 rounded-xl"
                style={{ background: spovioColors.bgCard }}
            >
                <p className="text-sm" style={{ color: spovioColors.textSecondary }}>
                    💡 <strong>1 crédit = 1 vidéo débloquée</strong>. Les crédits n'expirent jamais.
                </p>
            </div>
        </div>
    );
};
