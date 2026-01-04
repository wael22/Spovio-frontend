import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Brain,
  Activity,
  MapPin,
  Sparkles,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import aiNetworkImage from "@/assets/ai-network.jpg";

const aiFeatures = [
  {
    icon: BarChart3,
    title: "Match Statistics",
    description: "Detailed analytics for every point",
  },
  {
    icon: MapPin,
    title: "Position Tracking",
    description: "Player movement analysis",
  },
  {
    icon: Activity,
    title: "Performance Heatmaps",
    description: "Visualize court coverage",
  },
  {
    icon: Sparkles,
    title: "Auto Highlights",
    description: "AI-generated best moments",
  },
];

export const AIFeaturesPreview = () => {
  return (
    <section className="py-24 relative bg-card/30 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-10">
        <img
          src={aiNetworkImage}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/10 mb-6">
            <Brain className="w-4 h-4 text-accent" />
            <span className="text-xs font-medium text-accent uppercase tracking-wider">
              Coming Soon
            </span>
          </div>

          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-gradient">AI-Powered</span> Analysis
          </h2>

          <p className="text-lg text-muted-foreground">
            Next-generation artificial intelligence will transform how you
            understand and improve your game.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {aiFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="p-6 rounded-2xl bg-card/80 border border-border backdrop-blur-sm h-full">
                {/* Coming Soon Badge */}
                <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-accent/20 border border-accent/30 text-[10px] font-medium text-accent">
                  Soon
                </div>

                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <Link to="/ai-features">
            <Button variant="neon" size="lg" className="group">
              Explore AI Features
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
