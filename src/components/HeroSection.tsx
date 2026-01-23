import { Play, Video, Zap, ChevronRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function HeroSection() {
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
              Plateforme d'Analyse Sportive Propulsée par l'IA
            </span>
            <ChevronRight className="w-4 h-4 text-primary" />
          </div>

          {/* Main Heading */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-slide-up animation-delay-100">
            Révolutionnez Votre Sport avec
            <br />
            <span className="gradient-text">Spovio</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up animation-delay-200">
            La plateforme complète propulsée par l'IA pour enregistrer,
            analyser et améliorer votre jeu. Du padel au football,
            nous couvrons tous vos sports.
          </p>

          {/* Sport Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10 animate-slide-up animation-delay-250">
            <div className="p-4 rounded-xl glass border border-primary/20 transition-all">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-primary" />
                <div className="text-left">
                  <div className="font-semibold">MySmash</div>
                  <div className="text-xs text-muted-foreground">Padel</div>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl glass border border-primary/20 transition-all">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-primary" />
                <div className="text-left">
                  <div className="font-semibold">MyServe</div>
                  <div className="text-xs text-muted-foreground">Tennis</div>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl glass border border-border/50 opacity-60">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-muted-foreground" />
                <div className="text-left">
                  <div className="font-semibold">MyGoal</div>
                  <div className="text-xs text-muted-foreground">Football</div>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl glass border border-border/50 opacity-60">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-muted-foreground" />
                <div className="text-left">
                  <div className="font-semibold">MyDunk</div>
                  <div className="text-xs text-muted-foreground">Basketball</div>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl glass border border-border/50 opacity-60">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-muted-foreground" />
                <div className="text-left">
                  <div className="font-semibold">MyShot</div>
                  <div className="text-xs text-muted-foreground">Handball</div>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl glass border border-border/50 opacity-60">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-muted-foreground" />
                <div className="text-left">
                  <div className="font-semibold">More</div>
                  <div className="text-xs text-muted-foreground">Coming Soon</div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up animation-delay-300">
            <Link to="/mysmash">
              <Button variant="hero" size="xl" className="group">
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Découvrir MySmash
              </Button>
            </Link>
            <Button variant="neonOutline" size="xl" className="group">
              <Video className="w-5 h-5 mr-2" />
              Voir la Démo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-border/30 animate-slide-up animation-delay-400">
            <div className="text-center">
              <div className="font-display text-3xl md:text-4xl font-bold gradient-text mb-2">
                1K+
              </div>
              <div className="text-sm text-muted-foreground">Joueurs Actifs</div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl md:text-4xl font-bold gradient-text-accent mb-2">
                5K+
              </div>
              <div className="text-sm text-muted-foreground">Heures Enregistrées</div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl md:text-4xl font-bold gradient-text mb-2">
                10+
              </div>
              <div className="text-sm text-muted-foreground">Clubs Partenaires</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}

