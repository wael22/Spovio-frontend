import { motion } from "framer-motion";
import { Video, Brain, Share2, Trophy } from "lucide-react";

const features = [
  {
    icon: Video,
    title: "Smart Recording",
    description:
      "Automated video capture triggered by QR code. No manual setup needed.",
  },
  {
    icon: Brain,
    title: "AI Analysis",
    description:
      "Advanced algorithms analyze your gameplay, providing actionable insights.",
  },
  {
    icon: Share2,
    title: "Easy Sharing",
    description:
      "Share your best moments with teammates, coaches, or social media.",
  },
  {
    icon: Trophy,
    title: "Performance Tracking",
    description:
      "Track your improvement over time with detailed statistics and metrics.",
  },
];

export const WhatIsSpovio = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            What is <span className="text-gradient">Spovio</span>?
          </h2>
          <p className="text-lg text-muted-foreground">
            Spovio is an intelligent sports video platform that combines
            automated recording with AI-powered analysis to help athletes and
            clubs unlock their full potential.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-card/50 border border-border hover:border-primary/50 transition-all duration-300 hover-lift"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
