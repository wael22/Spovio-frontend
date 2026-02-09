import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useTutorial as useTutorialHook } from '@/hooks/useTutorial';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';

interface TutorialContextType {
    isActive: boolean;
    currentStep: number;
    totalSteps: number;
    currentStepData: any;
    startTutorial: () => void;
    nextStep: () => void;
    skipTutorial: () => void;
    completeTutorial: () => void;
    isCompleted: boolean;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const useTutorialContext = () => {
    const context = useContext(TutorialContext);
    if (!context) {
        throw new Error('useTutorialContext must be used within TutorialProvider');
    }
    return context;
};

interface TutorialProviderProps {
    children: ReactNode;
}

export const TutorialProvider = ({ children }: TutorialProviderProps) => {
    const { user } = useAuth();
    const location = useLocation();
    const tutorial = useTutorialHook();

    // Démarrer le tutoriel automatiquement au premier login
    // DÉSACTIVÉ TEMPORAIREMENT - Utilisez le bouton manuel pour démarrer
    /*
    useEffect(() => {
        // Vérifier si l'utilisateur est connecté, est un "player", et est sur le dashboard
        if (
            user &&
            user.role === 'player' &&
            location.pathname === '/dashboard' &&
            !tutorial.isCompleted &&
            !tutorial.isActive
        ) {
            // Délai pour laisser le temps au dashboard de se charger
            const timer = setTimeout(() => {
                tutorial.startTutorial();
            }, 1500); // 1.5s delay

            return () => clearTimeout(timer);
        }
    }, [user, location.pathname, tutorial.isCompleted, tutorial.isActive, tutorial.startTutorial]);
    */

    const value: TutorialContextType = {
        isActive: tutorial.isActive,
        currentStep: tutorial.currentStep,
        totalSteps: tutorial.totalSteps,
        currentStepData: tutorial.currentStepData,
        startTutorial: tutorial.startTutorial,
        nextStep: tutorial.nextStep,
        skipTutorial: tutorial.skipTutorial,
        completeTutorial: tutorial.completeTutorial,
        isCompleted: tutorial.isCompleted,
    };

    return (
        <TutorialContext.Provider value={value}>
            {children}
        </TutorialContext.Provider>
    );
};
