import { Check, Building } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-radial-glow opacity-50" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Tarification Simple et
            <br />
            <span className="gradient-text">Transparente</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Achetez des crédits selon vos besoins.
            1 crédit = 1 vidéo déverrouillée.
            Plus vous achetez, plus vous économisez.
          </p>
        </div>

        {/* Pricing Cards Section Hidden - Kept only Club section */}

        {/* Club Section */}
        <div className="max-w-4xl mx-auto">
          <div className="p-8 rounded-2xl bg-card border border-primary/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                  <Building className="w-6 h-6" />
                </div>
                <h3 className="font-display text-2xl font-bold">Vous êtes un Club ?</h3>
              </div>

              <p className="text-lg text-muted-foreground mb-6">
                Offrez à vos membres une expérience premium avec notre solution
                clé en main. Installation, formation et support inclus.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent mt-0.5" />
                  <span className="text-sm">Installation caméras incluse</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent mt-0.5" />
                  <span className="text-sm">Dashboard de gestion dédié</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent mt-0.5" />
                  <span className="text-sm">Commission sur les ventes de crédits</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent mt-0.5" />
                  <span className="text-sm">Support technique prioritaire</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent mt-0.5" />
                  <span className="text-sm">Formation équipe incluse</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent mt-0.5" />
                  <span className="text-sm">Personnalisat ion aux couleurs du club</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button variant="hero" size="lg" className="w-full sm:w-auto">
                  Contacter l'Équipe Commerciale
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
