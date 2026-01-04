// BuyCreditsModal - Modal achat crédits
// Packages de crédits avec sélection

import { X, Coins, Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { spovioColorsDark, spovioGradients } from '../constants/colors';

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

interface BuyCreditsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPurchase: (packageId: number, credits: number, price: number) => void;
    currentBalance?: number;
}

export const BuyCreditsModal = ({
    isOpen,
    onClose,
    onPurchase,
    currentBalance = 15
}: BuyCreditsModalProps) => {
    const [selectedPackage, setSelectedPackage] = useState<number | null>(null);

    if (!isOpen) return null;

    const handlePurchase = () => {
        if (selectedPackage) {
            const pkg = packages.find(p => p.id === selectedPackage);
            if (pkg) {
                onPurchase(pkg.id, pkg.credits, pkg.price);
                onClose();
            }
        }
    };

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl"
                style={{
                    background: spovioColorsDark.bgCard,
                    border: `1px solid ${spovioColorsDark.borderCyan}`,
                    boxShadow: '0 0 40px rgba(0, 229, 255, 0.2)',
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Acheter des Crédits</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-white hover:bg-white/10"
                    >
                        <X className="h-6 w-6" />
                    </Button>
                </div>

                {/* Current Balance */}
                <div
                    className="rounded-xl p-4 mb-6 flex items-center gap-3"
                    style={{ background: spovioColorsDark.cyan + '20' }}
                >
                    <Coins className="h-8 w-8" style={{ color: spovioColorsDark.cyan }} />
                    <div>
                        <div className="text-sm" style={{ color: spovioColorsDark.textSecondary }}>
                            Solde actuel
                        </div>
                        <div className="text-2xl font-bold text-white">{currentBalance} crédits</div>
                    </div>
                </div>

                {/* Packages */}
                <div className="space-y-3">
                    {packages.map((pkg) => (
                        <button
                            key={pkg.id}
                            onClick={() => setSelectedPackage(pkg.id)}
                            className="w-full rounded-xl p-4 text-left transition-all relative"
                            style={{
                                background: selectedPackage === pkg.id
                                    ? spovioColorsDark.cyan + '20'
                                    : spovioColorsDark.bgDark,
                                border: selectedPackage === pkg.id
                                    ? `2px solid ${spovioColorsDark.cyan}`
                                    : `1px solid ${spovioColorsDark.borderDefault}`,
                            }}
                        >
                            {/* Popular Badge */}
                            {pkg.popular && (
                                <div
                                    className="absolute -top-2 left-4 px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1"
                                    style={{ background: spovioColorsDark.cyan }}
                                >
                                    <Zap className="h-3 w-3" />
                                    POPULAIRE
                                </div>
                            )}

                            {/* Selected Checkmark */}
                            {selectedPackage === pkg.id && (
                                <div
                                    className="absolute top-4 right-4 h-6 w-6 rounded-full flex items-center justify-center"
                                    style={{ background: spovioColorsDark.cyan }}
                                >
                                    <Check className="h-4 w-4 text-white" />
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xl font-bold text-white mb-1">
                                        {pkg.credits} {pkg.credits === 1 ? 'crédit' : 'crédits'}
                                    </div>
                                    {pkg.discount && (
                                        <div
                                            className="text-sm font-semibold"
                                            style={{ color: spovioColorsDark.green }}
                                        >
                                            Économise {pkg.discount}%
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-white">{pkg.price} DT</div>
                                    {pkg.credits > 1 && (
                                        <div className="text-xs" style={{ color: spovioColorsDark.textSecondary }}>
                                            {(pkg.price / pkg.credits).toFixed(1)} DT/crédit
                                        </div>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Purchase Button */}
                <Button
                    className="w-full text-white font-semibold py-6 rounded-xl border-0 mt-6"
                    style={{
                        background: selectedPackage
                            ? spovioGradients.cyanButton
                            : spovioColorsDark.bgDark,
                        boxShadow: selectedPackage
                            ? '0 0 20px rgba(0, 229, 255, 0.4)'
                            : 'none',
                        opacity: selectedPackage ? 1 : 0.5,
                    }}
                    disabled={!selectedPackage}
                    onClick={handlePurchase}
                >
                    Acheter maintenant
                </Button>

                {/* Info */}
                <div
                    className="mt-4 p-3 rounded-lg text-sm text-center"
                    style={{
                        background: spovioColorsDark.bgDark,
                        color: spovioColorsDark.textSecondary
                    }}
                >
                    💡 1 crédit = 1 vidéo débloquée. Les crédits n'expirent jamais.
                </div>
            </div>
        </>
    );
};
