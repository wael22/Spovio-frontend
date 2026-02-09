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
        title: 'Bienvenue sur MySmash 👋',
        message: 'Voici votre tableau de bord. Consultez vos statistiques et toutes vos vidéos enregistrées.',
        targetTab: 'videos',
        position: 'center',
    },

    // Étape 1 - Onglet "Clubs"
    {
        id: 1,
        message: 'Suivez un club partenaire pour pouvoir lancer vos enregistrements. Retrouvez ici tous les clubs disponibles sur MySmash.',
        targetTab: 'clubs',
        position: 'top',
    },

    // Étape 2 - Onglet "Mes Clips"
    {
        id: 2,
        message: 'Tous vos meilleurs moments sont regroupés ici. Créez un clip en sélectionnant Début et Fin, prévisualisez, nommez-le puis appuyez sur Créer le clip.',
        secondaryMessage: 'Votre clip est prêt en quelques secondes ! Partagez-le sur TikTok, Instagram, Facebook ou téléchargez-le en MP4.',
        targetTab: 'clips',
        position: 'top',
    },

    // Étape 3 - Onglet "Support"
    {
        id: 3,
        message: 'Une question ou un problème ? Contactez-nous ou proposez vos idées pour améliorer MySmash.',
        targetTab: 'support',
        position: 'top',
    },

    // Étape 4 - Onglet "Crédits"
    {
        id: 4,
        message: 'Découvrez nos packs de crédits et choisissez le mode de paiement qui vous convient.',
        targetTab: 'credits',
        position: 'top',
    },

    // Étape 5 - Retour à "Mes Vidéos" → Créer votre première vidéo
    {
        id: 5,
        message: 'Créez votre première vidéo en quelques secondes.',
        secondaryMessage: 'Sélectionnez votre club → choisissez votre terrain → scannez le QR code → appuyez sur Démarrer l\'enregistrement.',
        targetTab: 'videos',
        targetElement: '#create-video-button',
        position: 'bottom',
    },

    // Étape 6 - Onglet "Mon Profil"
    {
        id: 6,
        message: 'Modifiez vos informations personnelles et changez votre mot de passe à tout moment.',
        targetTab: 'profile',
        position: 'top',
    },

    // Écran final
    {
        id: 7,
        title: '🎉 Vous êtes prêt à jouer !',
        message: 'Lancez votre premier enregistrement et analysez vos performances avec MySmash.',
        targetTab: 'videos',
        position: 'center',
        isFinal: true,
    },
];

export const TUTORIAL_STORAGE_KEY = 'mysmash_tutorial_status';
export const TUTORIAL_COMPLETED_KEY = 'mysmash_tutorial_completed';
