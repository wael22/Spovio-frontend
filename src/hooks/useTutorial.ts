import { useState, useEffect, useCallback } from 'react';
import { tutorialSteps, TUTORIAL_STORAGE_KEY, TUTORIAL_COMPLETED_KEY } from '@/config/tutorialSteps';

interface UseTutorialReturn {
    isActive: boolean;
    currentStep: number;
    totalSteps: number;
    currentStepData: typeof tutorialSteps[0] | null;
    startTutorial: () => void;
    nextStep: () => void;
    skipTutorial: () => void;
    completeTutorial: () => void;
    isCompleted: boolean;
}

export const useTutorial = (): UseTutorialReturn => {
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);

    // Charger l'état du tutoriel depuis localStorage au montage
    useEffect(() => {
        const savedStep = localStorage.getItem(TUTORIAL_STORAGE_KEY);
        const completed = localStorage.getItem(TUTORIAL_COMPLETED_KEY);

        if (completed === 'true') {
            setIsCompleted(true);
        } else if (savedStep) {
            const step = parseInt(savedStep, 10);
            setCurrentStep(step);
        }
    }, []);

    // Démarrer le tutoriel
    const startTutorial = useCallback(() => {
        setIsActive(true);
        setCurrentStep(0);
        localStorage.setItem(TUTORIAL_STORAGE_KEY, '0');
    }, []);

    // Passer à l'étape suivante
    const nextStep = useCallback(() => {
        const next = currentStep + 1;

        if (next >= tutorialSteps.length) {
            completeTutorial();
        } else {
            setCurrentStep(next);
            localStorage.setItem(TUTORIAL_STORAGE_KEY, next.toString());
        }
    }, [currentStep]);

    // Passer le tutoriel
    const skipTutorial = useCallback(() => {
        setIsActive(false);
        localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
        localStorage.removeItem(TUTORIAL_STORAGE_KEY);
        setIsCompleted(true);
    }, []);

    // Terminer le tutoriel
    const completeTutorial = useCallback(() => {
        setIsActive(false);
        localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
        localStorage.removeItem(TUTORIAL_STORAGE_KEY);
        setIsCompleted(true);
    }, []);

    // Obtenir les données de l'étape actuelle
    const currentStepData = isActive && currentStep < tutorialSteps.length
        ? tutorialSteps[currentStep]
        : null;

    return {
        isActive,
        currentStep,
        totalSteps: tutorialSteps.length,
        currentStepData,
        startTutorial,
        nextStep,
        skipTutorial,
        completeTutorial,
        isCompleted,
    };
};
