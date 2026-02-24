import { Check, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export function PricingSection() {
  const { t } = useTranslation();

  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-radial-glow opacity-50" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            {t("landing.pricing.title")}
            <br />
            <span className="gradient-text">{t("landing.pricing.titleHighlight")}</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("landing.pricing.subtitle")}
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
                <h3 className="font-display text-2xl font-bold">{t("landing.pricing.club.title")}</h3>
              </div>

              <p className="text-lg text-muted-foreground mb-6">
                {t("landing.pricing.club.subtitle")}
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {(t("landing.pricing.club.features", { returnObjects: true }) as string[]).map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-accent mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={() => window.location.href = '/contact?type=club'}
                >
                  {t("landing.pricing.club.cta")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
