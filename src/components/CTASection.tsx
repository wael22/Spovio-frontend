import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export function CTASection() {
  const { t } = useTranslation();

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      <div className="absolute inset-0 tech-grid opacity-30" />

      {/* Glowing Orbs */}
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/30 rounded-full blur-3xl animate-float" />
      <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-accent/30 rounded-full blur-3xl animate-float animation-delay-500" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Content */}
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
            {t("landing.cta.title")}
            <br />
            <span className="gradient-text">{t("landing.cta.titleHighlight")}</span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            {t("landing.cta.subtitle")}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/auth">
              <Button variant="hero" size="xl" className="group">
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                {t("landing.cta.buttons.signup")}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
            <Button
              variant="glass"
              size="xl"
              onClick={() => window.location.href = '/contact'}
            >
              {t("landing.cta.buttons.expert")}
            </Button>
          </div>

          {/* Trust Signals */}
          <p className="mt-8 text-sm text-muted-foreground">
            {t("landing.cta.trust")}
          </p>
        </div>
      </div>
    </section>
  );
}
