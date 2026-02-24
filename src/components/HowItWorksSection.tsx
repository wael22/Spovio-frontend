import { UserPlus, MapPin, Play, Video } from "lucide-react";
import { useTranslation } from "react-i18next";

export function HowItWorksSection() {
  const { t } = useTranslation();

  const steps = [
    {
      number: "01",
      icon: UserPlus,
      title: t("landing.howItWorks.steps.step1.title"),
      description: t("landing.howItWorks.steps.step1.desc"),
    },
    {
      number: "02",
      icon: MapPin,
      title: t("landing.howItWorks.steps.step2.title"),
      description: t("landing.howItWorks.steps.step2.desc"),
    },
    {
      number: "03",
      icon: Play,
      title: t("landing.howItWorks.steps.step3.title"),
      description: t("landing.howItWorks.steps.step3.desc"),
    },
    {
      number: "04",
      icon: Video,
      title: t("landing.howItWorks.steps.step4.title"),
      description: t("landing.howItWorks.steps.step4.desc"),
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-secondary/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            {t("landing.howItWorks.title")}
            <br />
            <span className="gradient-text-accent">{t("landing.howItWorks.titleHighlight")}</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("landing.howItWorks.subtitle")}
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[calc(50%+2rem)] right-[-2rem] h-px bg-gradient-to-r from-primary/50 to-accent/50" />
              )}

              <div className="text-center group">
                {/* Number Badge */}
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-card border border-border group-hover:border-primary/50 transition-all duration-300 mb-6 relative overflow-hidden card-glow">
                  <span className="font-display text-4xl font-bold gradient-text">
                    {step.number}
                  </span>

                  {/* Icon Overlay on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center bg-primary opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <step.icon className="w-10 h-10 text-primary-foreground" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-semibold mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
