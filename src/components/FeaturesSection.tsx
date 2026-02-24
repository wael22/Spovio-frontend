import { Video, Zap, Share2, BarChart3, Shield, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

export function FeaturesSection() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Video,
      title: t("landing.features.items.autoRecording.title"),
      description: t("landing.features.items.autoRecording.desc"),
      color: "primary",
    },
    {
      icon: Zap,
      title: t("landing.features.items.aiAnalysis.title"),
      description: t("landing.features.items.aiAnalysis.desc"),
      color: "accent",
    },
    {
      icon: Share2,
      title: t("landing.features.items.easySharing.title"),
      description: t("landing.features.items.easySharing.desc"),
      color: "primary",
    },
    {
      icon: BarChart3,
      title: t("landing.features.items.progressTracking.title"),
      description: t("landing.features.items.progressTracking.desc"),
      color: "accent",
    },
    {
      icon: Shield,
      title: t("landing.features.items.secureStorage.title"),
      description: t("landing.features.items.secureStorage.desc"),
      color: "primary",
    },
    {
      icon: Clock,
      title: t("landing.features.items.flexibleCredits.title"),
      description: t("landing.features.items.flexibleCredits.desc"),
      color: "accent",
    },
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 tech-grid opacity-50" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            {t("landing.features.title")}
            <br />
            <span className="gradient-text">{t("landing.features.titleHighlight")}</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("landing.features.subtitle")}
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
