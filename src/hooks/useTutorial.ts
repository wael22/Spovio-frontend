import { useState, useEffect, useCallback } from 'react';
import { tutorialSteps, TUTORIAL_STORAGE_KEY, TUTORIAL_COMPLETED_KEY } from '@/config/tutorialSteps';
import { tutorialService } from '@/lib/api';

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
    const startTutorial = useCallback(async () => {
        setIsActive(true);
        setCurrentStep(0);
        localStorage.setItem(TUTORIAL_STORAGE_KEY, '0');
        try {
            await tutorialService.reset();
        } catch (error) {
            console.error('Failed to reset tutorial on backend:', error);
        }
    }, []);

    // Passer à l'étape suivante
    const nextStep = useCallback(async () => {
        const next = currentStep + 1;

        if (next >= tutorialSteps.length) {
            completeTutorial();
        } else {
            setCurrentStep(next);
            localStorage.setItem(TUTORIAL_STORAGE_KEY, next.toString());
            try {
                await tutorialService.updateStep(next + 1); // API expects 1-based steps
            } catch (error) {
                console.error('Failed to update tutorial step on backend:', error);
            }
        }
    }, [currentStep]);

    // Passer le tutoriel
    const skipTutorial = useCallback(async () => {
        setIsActive(false);
        localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
        localStorage.removeItem(TUTORIAL_STORAGE_KEY);
        setIsCompleted(true);
        try {
            await tutorialService.skip();
        } catch (error) {
            console.error('Failed to skip tutorial on backend:', error);
        }
    }, []);

    // Terminer le tutoriel
    const completeTutorial = useCallback(async () => {
        setIsActive(false);
        localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
        localStorage.removeItem(TUTORIAL_STORAGE_KEY);
        setIsCompleted(true);
        try {
            await tutorialService.complete();
        } catch (error) {
            console.error('Failed to complete tutorial on backend:', error);
        }
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
