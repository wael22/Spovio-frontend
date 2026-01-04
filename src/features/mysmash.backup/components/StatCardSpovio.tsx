// StatCard Component - Spovio Style
// Cards 2x2 avec icons colorées + glow effects

import { LucideIcon } from 'lucide-react';
import { spovioColors, spovioShadows } from '../constants/colors';

interface StatCardSpovioProps {
    icon: LucideIcon;
    value: string | number;
    label: string;
    iconColor?: 'cyan' | 'green' | 'purple';
}

export const StatCardSpovio = ({
    icon: Icon,
    value,
    label,
    iconColor = 'cyan'
}: StatCardSpovioProps) => {
    const iconColors = {
        cyan: spovioColors.cyan,
        green: spovioColors.green,
        purple: spovioColors.purple,
    };

    const glowColors = {
        cyan: 'rgba(0, 229, 255, 0.15)',
        green: 'rgba(0, 255, 179, 0.15)',
        purple: 'rgba(156, 39, 176, 0.15)',
    };

    return (
        <div
            className="rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden transition-all duration-300 hover:scale-105"
            style={{
                background: spovioColors.bgCard,
                border: `1px solid ${spovioColors.borderDefault}`,
                boxShadow: spovioShadows.card,
            }}
        >
            {/* Glow effect background */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    background: `radial-gradient(circle at top left, ${glowColors[iconColor]} 0%, transparent 70%)`,
                }}
            />

            {/* Icon */}
            <div className="relative mb-3">
                <Icon
                    className="h-8 w-8 mb-2"
                    style={{ color: iconColors[iconColor] }}
                />
            </div>

            {/* Value */}
            <div
                className="text-4xl font-bold mb-1 relative"
                style={{ color: spovioColors.textPrimary }}
            >
                {value}
            </div>

            {/* Label */}
            <div
                className="text-sm font-medium relative"
                style={{ color: spovioColors.textSecondary }}
            >
                {label}
            </div>
        </div>
    );
};
