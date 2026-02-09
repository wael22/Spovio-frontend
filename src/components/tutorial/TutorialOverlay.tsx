import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { CoachMark } from './CoachMark';
import { useTutorialContext } from '@/contexts/TutorialContext';

// Mapping des targetTab vers les routes React Router
const TAB_ROUTES: Record<string, string> = {
    videos: '/dashboard',
    clubs: '/clubs',
    clips: '/my-clips',
    support: '/support',
    credits: '/credits',
    profile: '/profile',
};

export const TutorialOverlay = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Utiliser le context partagé au lieu d'une instance locale
    const {
        isActive,
        currentStep,
        totalSteps,
        currentStepData,
        nextStep,
        skipTutorial,
    } = useTutorialContext();

    // Navigation automatique vers l'onglet/route spécifié
    useEffect(() => {
        if (isActive && currentStepData?.targetTab) {
            const targetRoute = TAB_ROUTES[currentStepData.targetTab];

            if (targetRoute && location.pathname !== targetRoute) {
                // Délai de 300ms pour laisser l'animation se terminer
                const timer = setTimeout(() => {
                    navigate(targetRoute);
                }, 300);

                return () => clearTimeout(timer);
            }
        }
    }, [isActive, currentStepData, navigate, location.pathname]);

    // Ne rien afficher si le tutoriel n'est pas actif
    if (!isActive || !currentStepData) {
        return null;
    }

    return (
        <AnimatePresence>
            {/* Overlay sombre avec spotlight */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-50"
                style={{
                    pointerEvents: 'all',
                }}
            >
                {/* Fond sombre */}
                <div
                    className="absolute inset-0 bg-black/50"
                    onClick={skipTutorial}
                />

                {/* Spotlight sur l'élément cible (si défini) */}
                {currentStepData.targetElement && (
                    <div
                        className="absolute pointer-events-none"
                        style={{
                            // Le spotlight sera géré par un effet de découpe
                            mixBlendMode: 'normal',
                        }}
                    >
                        {/* Zone de lumière - à implémenter avec le positionnement de l'élément cible */}
                    </div>
                )}

                {/* Coach Mark */}
                <CoachMark
                    title={currentStepData.title}
                    message={currentStepData.message}
                    secondaryMessage={currentStepData.secondaryMessage}
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                    position={currentStepData.position}
                    onNext={nextStep}
                    onSkip={skipTutorial}
                    isFinal={currentStepData.isFinal}
                />
            </motion.div>
        </AnimatePresence>
    );
};
