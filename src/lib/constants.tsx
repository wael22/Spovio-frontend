import {
    Target,
    Zap,
    Users,
    Globe,
    Brain,
    BarChart3,
    MapPin,
    Activity,
    Sparkles,
    Clock,
    TrendingUp,
    QrCode,
    Video,
    Cloud,
    Film,
    Share2
} from "lucide-react";

export const ABOUT_VALUES = [
    {
        icon: Target,
        title: "Notre Mission",
        description: "Démocratiser l'analyse vidéo sportive pour tous les joueurs, du amateur au professionnel."
    },
    {
        icon: Zap,
        title: "Innovation",
        description: "Utiliser la technologie IA pour transformer l'expérience sportive et aider les athlètes à progresser."
    },
    {
        icon: Users,
        title: "Communauté",
        description: "Créer une plateforme où les sportifs peuvent partager, apprendre et s'améliorer ensemble."
    },
    {
        icon: Globe,
        title: "Expansion",
        description: "Du padel au tennis, et bientôt tous les sports. Notre vision est globale."
    }
];

export const MILESTONES = [
    {
        year: "2025",
        title: "Fondation",
        description: (
            <ul className="space-y-2 text-sm text-left list-none">
                <li>✅ Accompli</li>
                <li>💡 Conception de la plateforme Spovio</li>
                <li>🔬 Dépôt de brevet (technologie de déclenchement intelligent)</li>
                <li>🛠️ Développement du MySmash</li>
                <li>🎯 Validation du concept avec clubs partenaires</li>
            </ul>
        )
    },
    {
        year: "2026",
        title: "Lancement MySmash",
        description: (
            <div className="space-y-4 text-sm text-left">
                <div>
                    <strong className="block text-primary mb-1">🎾 Q1-Q2 : Lancement Tunisie</strong>
                    <ul className="space-y-1 pl-4 border-l-2 border-primary/20">
                        <li>Déploiement premiers clubs pilotes (Padel & Tennis)</li>
                        <li>Système de crédits et packs joueurs</li>
                        <li>Dashboard clubs et statistiques</li>
                    </ul>
                </div>
                <div>
                    <strong className="block text-accent mb-1">📱 Q3-Q4 : Enrichissement</strong>
                    <ul className="space-y-1 pl-4 border-l-2 border-accent/20">
                        <li>Application mobile iOS & Android</li>
                        <li>Amélioration continue basée sur retours utilisateurs</li>
                        <li>Extension du réseau de clubs partenaires</li>
                    </ul>
                </div>
            </div>
        )
    },
    {
        year: "2027",
        title: "Expansion & Intelligence",
        description: (
            <div className="space-y-4 text-sm text-left">
                <div>
                    <strong className="block text-primary mb-1">🌍 Expansion Régionale</strong>
                    <ul className="space-y-1 pl-4 border-l-2 border-primary/20">
                        <li>Ouverture du marché international</li>
                        <li>Nouveaux partenariats clubs premium</li>
                    </ul>
                </div>
                <div>
                    <strong className="block text-accent mb-1">🤖 Fonctionnalités IA</strong>
                    <ul className="space-y-1 pl-4 border-l-2 border-accent/20">
                        <li>Détection automatique des moments forts</li>
                        <li>Statistiques de jeu personnalisées</li>
                        <li>Recommandations d'amélioration</li>
                    </ul>
                </div>
                <div>
                    <strong className="block text-primary mb-1">📊 Expérience Enrichie</strong>
                    <ul className="space-y-1 pl-4 border-l-2 border-primary/20">
                        <li>Suivi de progression dans le temps</li>
                        <li>Comparaison avec d'autres joueurs</li>
                        <li>Classements et challenges communautaires</li>
                    </ul>
                </div>
            </div>
        )
    },
    {
        year: "2028+",
        title: "Nouveaux Horizons",
        description: (
            <div className="space-y-4 text-sm text-left">
                <div>
                    <strong className="block text-primary mb-1">⚽ Nouveaux Sports</strong>
                    <ul className="space-y-1 pl-4 border-l-2 border-primary/20">
                        <li>Extension à d'autres disciplines sportives</li>
                        <li>Plateforme multi-sports complète</li>
                    </ul>
                </div>
                <div>
                    <strong className="block text-accent mb-1">🚀 Innovation Continue</strong>
                    <ul className="space-y-1 pl-4 border-l-2 border-accent/20">
                        <li>Intégrations avec équipements connectés</li>
                        <li>Fonctionnalités communautaires avancées</li>
                    </ul>
                </div>
            </div>
        )

    }
];

export const AI_FEATURES = [
    {
        icon: BarChart3,
        title: "Statistiques de Match par IA",
        description: "Analyses complètes pour chaque point, jeu et set. Comprenez vos taux de réussite, vos fautes et votre sélection de coups.",
        status: "coming",
    },
    {
        icon: MapPin,
        title: "Suivi de Position",
        description: "Suivi en temps réel des positions sur le terrain. Analysez la couverture du terrain et les stratégies de placement.",
        status: "coming",
    },
    {
        icon: Activity,
        title: "Heatmaps de Vitesse",
        description: "Visualisez les modèles de déplacement, les zones de vitesse et la couverture du terrain avec des cartes thermiques détaillées.",
        status: "coming",
    },
    {
        icon: Sparkles,
        title: "Moments Forts Auto",
        description: "L'IA identifie et découpe les meilleurs moments de vos matchs. Partagez vos highlights instantanément.",
        status: "coming",
    },
    {
        icon: Clock,
        title: "Résumé Intelligent",
        description: "Obtenez un résumé complet avec les statistiques clés, les tournants du match et des insights de performance.",
        status: "coming",
    },
    {
        icon: TrendingUp,
        title: "Évolution Performance",
        description: "Suivez votre progression au fil du temps avec des analyses de tendances et des jalons atteints.",
        status: "coming",
    },
];

export const HOW_IT_WORKS_STEPS = [
    {
        number: "01",
        icon: QrCode,
        title: "Scanner le QR Code",
        description: "Scannez simplement le QR code à l'entrée du terrain équipé par Spovio. Le système vous reconnaît instantanément.",
        color: "primary",
    },
    {
        number: "02",
        icon: Video,
        title: "Lancer l'Enregistrement",
        description: "La caméra commence à enregistrer automatiquement après confirmation. Plusieurs angles capturent chaque moment.",
        color: "primary",
    },
    {
        number: "03",
        icon: Cloud,
        title: "Sauvegarde Cloud Auto",
        description: "Votre match est sauvegardé automatiquement. Pas d'upload manuel nécessaire - c'est prêt dès la fin du match.",
        color: "primary",
    },
    {
        number: "04",
        icon: Film,
        title: "Regarder & Clipper",
        description: "Revoyez tout votre match, créez des clips de vos meilleures actions et marquez les points clés.",
        color: "primary",
    },
    {
        number: "05",
        icon: Share2,
        title: "Partager Facilement",
        description: "Partagez vos matchs et highlights avec vos coéquipiers, coachs ou sur les réseaux sociaux en un clic.",
        color: "primary",
    },
    {
        number: "06",
        icon: Brain,
        title: "Analyse IA",
        description: "Bientôt : Obtenez des insights, statistiques et recommandations pour améliorer votre jeu.",
        color: "accent",
        badge: "Bientôt",
    },
];

export const NAV_LINKS = [
    { href: "/ai-features", label: "Fonctionnalités IA" },
    { href: "/how-it-works", label: "Comment ça marche" },
    { href: "/about", label: "À propos" },
    { href: "/contact", label: "Contact" },
];

export const FOOTER_LINKS = {
    product: [
        { label: "Fonctionnalités", href: "/ai-features" },
        { label: "Tarifs", href: "/#pricing" },
        { label: "Pour les Clubs", href: "/contact?type=club" },
        { label: "API", href: "/api" },
    ],
    company: [
        { label: "À propos", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Carrières", href: "/careers" },
        { label: "Presse", href: "/press" },
    ],
    support: [
        { label: "Centre d'aide", href: "/help" },
        { label: "Contact", href: "/contact" },
        { label: "Statut", href: "/status" },
        { label: "Communauté", href: "/community" },
    ],
    legal: [
        { label: "Confidentialité", href: "/privacy" },
        { label: "CGU", href: "/terms" },
        { label: "Cookies", href: "/cookies" },
    ],
};
