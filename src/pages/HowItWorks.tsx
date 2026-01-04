import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  QrCode,
  Video,
  Cloud,
  Film,
  Share2,
  Brain,
  ArrowRight,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "01",
    icon: QrCode,
    title: "Scan QR Code",
    description:
      "Walk up to any Spovio-equipped court and scan the QR code displayed near the court entrance. The system instantly recognizes you.",
    color: "primary",
  },
  {
    number: "02",
    icon: Video,
    title: "Start Recording",
    description:
      "The camera automatically starts recording when you confirm. Multiple angles capture every moment of your match.",
    color: "primary",
  },
  {
    number: "03",
    icon: Cloud,
    title: "Auto Cloud Save",
    description:
      "Your match is automatically saved to the cloud. No manual uploads needed - it's ready when your match ends.",
    color: "primary",
  },
  {
    number: "04",
    icon: Film,
    title: "Watch & Clip",
    description:
      "Review your full match, create clips of your best moments, and mark key points for easy reference.",
    color: "primary",
  },
  {
    number: "05",
    icon: Share2,
    title: "Share Easily",
    description:
      "Share your matches and highlights with teammates, coaches, or on social media with a single click.",
    color: "primary",
  },
  {
    number: "06",
    icon: Brain,
    title: "AI Analysis",
    description:
      "Coming soon: Get AI-powered insights, statistics, and performance recommendations to improve your game.",
    color: "accent",
    badge: "Coming Soon",
  },
];

const HowItWorksPage = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[150px]"
          />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              How <span className="text-gradient">Spovio</span> Works
            </h1>
            <p className="text-xl text-muted-foreground">
              From scan to share in minutes. Experience the simplest way to
              record and analyze your matches.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="pb-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-8 top-24 bottom-0 w-px bg-gradient-to-b from-border to-transparent" />
                )}

                <div className="flex gap-8 pb-16">
                  {/* Number & Icon */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                        step.color === "accent"
                          ? "bg-accent/10 border border-accent/30"
                          : "bg-primary/10 border border-primary/30"
                      }`}
                    >
                      <step.icon
                        className={`w-7 h-7 ${
                          step.color === "accent"
                            ? "text-accent"
                            : "text-primary"
                        }`}
                      />
                    </div>
                    <div
                      className={`absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        step.color === "accent"
                          ? "bg-accent text-accent-foreground"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {step.number}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-display text-2xl font-bold">
                        {step.title}
                      </h3>
                      {step.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-accent/20 border border-accent/30 text-xs font-medium text-accent">
                          {step.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-lg">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-card/30 border-y border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "<10s", label: "Setup Time" },
              { value: "1080p", label: "Video Quality" },
              { value: "∞", label: "Cloud Storage" },
              { value: "1-Click", label: "Share Time" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="font-display text-3xl md:text-4xl font-bold text-gradient-cyan mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              Ready to Get <span className="text-gradient">Started</span>?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Create your account and start recording your matches today
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/auth?mode=signup">
                <Button variant="hero" size="xl" className="group">
                  Create Account
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="heroOutline" size="xl">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default HowItWorksPage;
