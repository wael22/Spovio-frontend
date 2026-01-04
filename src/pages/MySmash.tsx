import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  QrCode,
  Video,
  Cloud,
  Share2,
  CreditCard,
  Smartphone,
  Play,
  ArrowRight,
  Check,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-padel-court.jpg";

const features = [
  {
    icon: QrCode,
    title: "QR Code Start",
    description:
      "Walk up to any equipped court, scan the QR code, and your match recording begins instantly. No apps to download, no complicated setup.",
  },
  {
    icon: Video,
    title: "HD Video Recording",
    description:
      "Professional-quality video capture with multiple angles. Every shot, every rally, every point captured in stunning detail.",
  },
  {
    icon: Cloud,
    title: "Cloud Storage",
    description:
      "Your matches are automatically saved to the cloud. Access your entire match history from any device, anywhere in the world.",
  },
  {
    icon: Share2,
    title: "Easy Sharing",
    description:
      "Create clips of your best moments and share them instantly with friends, coaches, or on social media.",
  },
  {
    icon: CreditCard,
    title: "Credit System",
    description:
      "Simple pay-per-use model. Purchase credits and use them whenever you want to record. No subscriptions required.",
  },
  {
    icon: Smartphone,
    title: "Mobile Optimized",
    description:
      "Full experience on any device. Review matches, create highlights, and manage your account on the go.",
  },
];

const pricingTiers = [
  { credits: 5, price: 15, perMatch: 3 },
  { credits: 10, price: 25, perMatch: 2.5, popular: true },
  { credits: 25, price: 50, perMatch: 2 },
];

const MySmashPage = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Padel court with AI overlay"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-primary uppercase tracking-wider">
                Available Now
              </span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-gradient">MySmash</span>
              <br />
              <span className="text-foreground">Professional Padel Video</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              The complete video solution for padel players and clubs. Record
              every match, replay your best moments, and take your game to the
              next level.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/auth?mode=signup">
                <Button variant="hero" size="xl" className="group">
                  Create Account
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/auth?mode=login">
                <Button variant="heroOutline" size="xl">
                  Login
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              Everything You Need to{" "}
              <span className="text-gradient">Capture Your Game</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              MySmash combines cutting-edge technology with intuitive design
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              Simple <span className="text-gradient">Credit-Based</span> Pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Pay only for what you use. No monthly subscriptions.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative p-6 rounded-2xl border ${
                  tier.popular
                    ? "bg-gradient-to-b from-primary/10 to-transparent border-primary/50"
                    : "bg-card border-border"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <div className="text-4xl font-display font-bold mb-2">
                    {tier.credits}
                  </div>
                  <div className="text-muted-foreground">Credits</div>
                </div>
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold">€{tier.price}</div>
                  <div className="text-sm text-muted-foreground">
                    €{tier.perMatch}/match
                  </div>
                </div>
                <Button
                  variant={tier.popular ? "hero" : "outline"}
                  className="w-full"
                >
                  Get Started
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              Start Recording Your Matches{" "}
              <span className="text-gradient">Today</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of padel players already using MySmash
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/auth?mode=signup">
                <Button variant="hero" size="xl" className="group">
                  Create Account
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default MySmashPage;
