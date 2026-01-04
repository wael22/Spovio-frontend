import { Check, Zap, Crown, Building } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter",
    icon: Zap,
    price: "Free",
    period: "forever",
    description: "Perfect for trying out MySmash",
    features: [
      "2 hours free recording",
      "7-day video storage",
      "Basic video playback",
      "Share via link",
    ],
    cta: "Get Started Free",
    variant: "neonOutline" as const,
    popular: false,
  },
  {
    name: "Pro",
    icon: Crown,
    price: "€19",
    period: "/month",
    description: "For serious players who want more",
    features: [
      "20 hours recording/month",
      "30-day video storage",
      "AI shot analysis",
      "Performance stats",
      "Download videos",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    variant: "hero" as const,
    popular: true,
  },
  {
    name: "Club",
    icon: Building,
    price: "€99",
    period: "/month",
    description: "For clubs and training centers",
    features: [
      "Unlimited recording",
      "1-year video storage",
      "Multi-court support",
      "Team management",
      "Custom branding",
      "API access",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    variant: "neonOutline" as const,
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-radial-glow opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Simple, Transparent
            <br />
            <span className="gradient-text">Pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the plan that fits your game. Upgrade or downgrade anytime.
          </p>
        </div>
        
        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-8 rounded-2xl bg-card border transition-all duration-300 ${
                plan.popular
                  ? "border-primary shadow-[0_0_40px_hsl(var(--primary)/0.2)] scale-105 lg:scale-110"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-neon-cyan text-primary-foreground text-sm font-semibold">
                  Most Popular
                </div>
              )}
              
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl mb-6 flex items-center justify-center ${
                plan.popular
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/10 text-primary"
              }`}>
                <plan.icon className="w-6 h-6" />
              </div>
              
              {/* Plan Name & Price */}
              <h3 className="font-display text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="font-display text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <p className="text-muted-foreground mb-6">{plan.description}</p>
              
              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-accent" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {/* CTA */}
              <Button variant={plan.variant} className="w-full" size="lg">
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
