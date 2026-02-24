import { Play, Video, Zap, ChevronRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute inset-0 bg-radial-glow" />
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-radial-accent" />

      {/* Animated Orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-float animation-delay-500" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 mb-8 animate-slide-up">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              {t("landing.hero.badge")}
            </span>
            <ChevronRight className="w-4 h-4 text-primary" />
          </div>

          {/* Main Heading */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-slide-up animation-delay-100">
            {t("landing.hero.title")}
            <br />
            <span className="gradient-text">Spovio</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up animation-delay-200">
            {t("landing.hero.subtitle")}
          </p>

          {/* Sport Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10 animate-slide-up animation-delay-250">
            <div className="p-4 rounded-xl glass border border-primary/20 transition-all">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-primary" />
                <div className="text-left">
                  <div className="font-semibold">{t("landing.hero.products.mysmash.title")}</div>
                  <div className="text-xs text-muted-foreground">{t("landing.hero.products.mysmash.desc")}</div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl glass border border-border/50 opacity-60">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-muted-foreground" />
                <div className="text-left">
                  <div className="font-semibold">{t("landing.hero.products.mygoal.title")}</div>
                  <div className="text-xs text-muted-foreground">{t("landing.hero.products.mygoal.desc")}</div>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl glass border border-border/50 opacity-60">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-muted-foreground" />
                <div className="text-left">
                  <div className="font-semibold">{t("landing.hero.products.mydunk.title")}</div>
                  <div className="text-xs text-muted-foreground">{t("landing.hero.products.mydunk.desc")}</div>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl glass border border-border/50 opacity-60">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-muted-foreground" />
                <div className="text-left">
                  <div className="font-semibold">{t("landing.hero.products.myshot.title")}</div>
                  <div className="text-xs text-muted-foreground">{t("landing.hero.products.myshot.desc")}</div>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl glass border border-border/50 opacity-60">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-muted-foreground" />
                <div className="text-left">
                  <div className="font-semibold">{t("landing.hero.products.more.title")}</div>
                  <div className="text-xs text-muted-foreground">{t("landing.hero.products.more.desc")}</div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons (Removed) */}


        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
