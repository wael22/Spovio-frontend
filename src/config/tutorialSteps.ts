// Configuration des étapes du tutoriel MySmash
export interface TutorialStep {
    id: number;
    title?: string;
    message: string;
    secondaryMessage?: string;
    targetTab?: 'videos' | 'clubs' | 'clips' | 'support' | 'credits' | 'profile';
    targetElement?: string;
    position: 'top' | 'bottom' | 'center';
    isFinal?: boolean;
}

export const tutorialSteps: TutorialStep[] = [
    // Écran de bienvenue - Onglet "Mes Vidéos"
    {
        id: 0,
        title: 'tutorial.steps.step0.title',
        message: 'tutorial.steps.step0.message',
        targetTab: 'videos',
        position: 'center',
    },

    // Étape 1 - Onglet "Clubs"
    {
        id: 1,
        message: 'tutorial.steps.step1.message',
        targetTab: 'clubs',
        position: 'top',
    },

    // Étape 2 - Onglet "Mes Clips"
    {
        id: 2,
        message: 'tutorial.steps.step2.message',
        secondaryMessage: 'tutorial.steps.step2.secondaryMessage',
        targetTab: 'clips',
        position: 'top',
    },

    // Étape 3 - Onglet "Support"
    {
        id: 3,
        message: 'tutorial.steps.step3.message',
        targetTab: 'support',
        position: 'top',
    },

    // Étape 4 - Onglet "Crédits"
    {
        id: 4,
        message: 'tutorial.steps.step4.message',
        targetTab: 'credits',
        position: 'top',
    },

    // Étape 5 - Retour à "Mes Vidéos" → Créer votre première vidéo
    {
        id: 5,
        message: 'tutorial.steps.step5.message',
        secondaryMessage: 'tutorial.steps.step5.secondaryMessage',
        targetTab: 'videos',
        targetElement: '#create-video-button',
        position: 'bottom',
    },

    // Étape 6 - Onglet "Mon Profil"
    {
        id: 6,
        message: 'tutorial.steps.step6.message',
        targetTab: 'profile',
        position: 'top',
    },

    // Écran final
    {
        id: 7,
        title: 'tutorial.steps.step7.title',
        message: 'tutorial.steps.step7.message',
        targetTab: 'videos',
        position: 'center',
        isFinal: true,
    },
];

export const TUTORIAL_STORAGE_KEY = 'mysmash_tutorial_status';
export const TUTORIAL_COMPLETED_KEY = 'mysmash_tutorial_completed';
