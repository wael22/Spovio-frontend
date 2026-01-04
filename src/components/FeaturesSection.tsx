import { Video, Zap, Share2, BarChart3, Shield, Clock } from "lucide-react";

const features = [
  {
    icon: Video,
    title: "Auto Recording",
    description: "Court cameras automatically start recording when you begin your match. No manual setup needed.",
    color: "primary",
  },
  {
    icon: Zap,
    title: "AI Analysis",
    description: "Get instant insights on your gameplay with our advanced AI that tracks shots, movement, and strategy.",
    color: "accent",
  },
  {
    icon: Share2,
    title: "Easy Sharing",
    description: "Share your best moments with teammates, coaches, or on social media with one click.",
    color: "primary",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description: "Monitor your improvement over time with detailed statistics and performance trends.",
    color: "accent",
  },
  {
    icon: Shield,
    title: "Secure Storage",
    description: "Your videos are encrypted and stored safely in the cloud. Access them anytime, anywhere.",
    color: "primary",
  },
  {
    icon: Clock,
    title: "Flexible Plans",
    description: "Pay only for what you use with our credit system. Perfect for casual and competitive players.",
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
            Everything You Need to
            <br />
            <span className="gradient-text">Elevate Your Game</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Professional-grade video recording and analysis tools, 
            designed specifically for padel players of all levels.
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
              <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${
                feature.color === 'primary' 
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
              <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
                feature.color === 'primary' 
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
