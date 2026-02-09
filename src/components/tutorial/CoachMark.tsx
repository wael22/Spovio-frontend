import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface CoachMarkProps {
    title?: string;
    message: string;
    secondaryMessage?: string;
    currentStep: number;
    totalSteps: number;
    position?: 'top' | 'bottom' | 'center';
    onNext: () => void;
    onSkip: () => void;
    isFinal?: boolean;
}

export const CoachMark = ({
    title,
    message,
    secondaryMessage,
    currentStep,
    totalSteps,
    position = 'center',
    onNext,
    onSkip,
    isFinal = false,
}: CoachMarkProps) => {
    // Calculer la position du coach mark
    // Sur mobile, toujours centrer pour éviter les coupures
    const getPositionStyles = () => {
        // Sur mobile (< 640px), toujours centrer
        const mobileCenter = 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';

        switch (position) {
            case 'top':
                // Mobile: centré, Desktop: en haut
                return `${mobileCenter} sm:top-20 sm:translate-y-0 max-h-[85vh] overflow-y-auto`;
            case 'bottom':
                // Mobile: centré, Desktop: en bas
                return `${mobileCenter} sm:top-auto sm:bottom-20 sm:translate-y-0 max-h-[85vh] overflow-y-auto`;
            case 'center':
            default:
                // Toujours centré
                return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[85vh] overflow-y-auto';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`fixed ${getPositionStyles()} z-[60] w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] sm:max-w-md overflow-x-hidden !left-1/2 !-translate-x-1/2`}
        >
            {/* Coach Mark Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-3 sm:p-6 space-y-2 sm:space-y-4 overflow-x-hidden">
                {/* Header avec indicateur de progression */}
                <div className="flex items-center justify-between gap-2">
                    {/* Indicateur de progression */}
                    {!isFinal && (
                        <div className="flex items-center gap-1 sm:gap-2">
                            <span className="text-[10px] sm:text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                {currentStep + 1}/{totalSteps}
                            </span>
                            {/* Barre de progression */}
                            <div className="w-12 sm:w-24 h-1 sm:h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Bouton fermer */}
                    <button
                        onClick={onSkip}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-0.5 sm:p-1 shrink-0"
                        aria-label="Fermer le tutoriel"
                    >
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>

                {/* Contenu */}
                <div className="space-y-1.5 sm:space-y-3">
                    {title && (
                        <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white leading-tight">
                            {title}
                        </h3>
                    )}

                    <p className="text-xs sm:text-base text-gray-700 dark:text-gray-300 leading-snug sm:leading-relaxed">
                        {message}
                    </p>

                    {secondaryMessage && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-2 sm:border-l-4 border-blue-500 p-1.5 sm:p-3 rounded">
                            <p className="text-[10px] sm:text-sm text-blue-900 dark:text-blue-200 leading-snug">
                                {secondaryMessage}
                            </p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 sm:gap-3 pt-0.5 sm:pt-2">
                    {!isFinal && (
                        <Button
                            variant="outline"
                            onClick={onSkip}
                            className="flex-1 h-9 sm:h-12 text-xs sm:text-base"
                        >
                            Passer
                        </Button>
                    )}

                    <Button
                        onClick={onNext}
                        className="flex-1 h-9 sm:h-12 text-xs sm:text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg"
                    >
                        {isFinal ? 'Commencer' : 'Suivant'}
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};
