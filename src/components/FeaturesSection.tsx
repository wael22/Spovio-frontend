import { Video, Zap, Share2, BarChart3, Shield, Clock } from "lucide-react";

const features = [
  {
    icon: Video,
    title: "Enregistrement Automatique",
    description: "Les caméras du terrain démarrent automatiquement l'enregistrement dès le début de votre match. Aucune configuration manuelle nécessaire.",
    color: "primary",
  },
  {
    icon: Zap,
    title: "Analyse par IA",
    description: "Obtenez des insights instantanés sur votre jeu grâce à notre IA avancée qui analyse vos coups, déplacements et stratégies.",
    color: "accent",
  },
  {
    icon: Share2,
    title: "Partage Facile",
    description: "Partagez vos meilleurs moments avec vos coéquipiers, entraîneurs ou sur les réseaux sociaux en un seul clic.",
    color: "primary",
  },
  {
    icon: BarChart3,
    title: "Suivi de Progression",
    description: "Suivez votre amélioration au fil du temps avec des statistiques détaillées et des tendances de performance.",
    color: "accent",
  },
  {
    icon: Shield,
    title: "Stockage Sécurisé",
    description: "Vos vidéos sont cryptées et stockées en toute sécurité dans le cloud. Accédez-y à tout moment, où que vous soyez.",
    color: "primary",
  },
  {
    icon: Clock,
    title: "Système de Crédits Flexible",
    description: "Payez uniquement ce que vous utilisez avec notre système de crédits. Parfait pour les joueurs occasionnels et compétitifs.",
    color: "accent",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 tech-grid opacity-50" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Tout Ce Dont Vous Avez Besoin pour
            <br />
            <span className="gradient-text">Élever Votre Jeu</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Des outils professionnels d'enregistrement vidéo et d'analyse,
            conçus spécifiquement pour les sportifs de tous niveaux.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 card-glow"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${feature.color === 'primary'
                  ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground'
                  : 'bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground'
                } transition-all duration-300`}>
                <feature.icon className="w-6 h-6" />
              </div>

              {/* Content */}
              <h3 className="font-display text-xl font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Glow Effect */}
              <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${feature.color === 'primary'
                  ? 'shadow-[inset_0_0_30px_hsl(var(--primary)/0.1)]'
                  : 'shadow-[inset_0_0_30px_hsl(var(--accent)/0.1)]'
                }`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
