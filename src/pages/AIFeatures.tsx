import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Brain,
  BarChart3,
  MapPin,
  Activity,
  Sparkles,
  Clock,
  TrendingUp,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import aiNetworkImage from "@/assets/ai-network.jpg";

const features = [
  {
    icon: BarChart3,
    title: "AI Match Statistics",
    description:
      "Comprehensive analytics for every point, game, and set. Understand your win rates, error patterns, and shot selection.",
    status: "coming",
  },
  {
    icon: MapPin,
    title: "Player Position Tracking",
    description:
      "Real-time tracking of player positions on the court. Analyze court coverage and positioning strategies.",
    status: "coming",
  },
  {
    icon: Activity,
    title: "Speed & Movement Heatmaps",
    description:
      "Visualize player movement patterns, speed zones, and court coverage with detailed heatmaps.",
    status: "coming",
  },
  {
    icon: Sparkles,
    title: "Automatic Highlights",
    description:
      "AI identifies and clips the best moments from your matches. Share your highlights instantly.",
    status: "coming",
  },
  {
    icon: Clock,
    title: "Smart Match Summary",
    description:
      "Get a complete match summary with key statistics, turning points, and performance insights.",
    status: "coming",
  },
  {
    icon: TrendingUp,
    title: "Performance Evolution",
    description:
      "Track your improvement over time with trend analysis and milestone achievements.",
    status: "coming",
  },
];

const roadmap = [
  {
    phase: "Phase 1",
    title: "Basic AI Analytics",
    items: ["Shot detection", "Rally counting", "Basic statistics"],
    status: "in-progress",
  },
  {
    phase: "Phase 2",
    title: "Advanced Tracking",
    items: ["Player tracking", "Movement analysis", "Heatmaps"],
    status: "planned",
  },
  {
    phase: "Phase 3",
    title: "Smart Features",
    items: ["Auto highlights", "Match summaries", "Performance trends"],
    status: "planned",
  },
];

const AIFeaturesPage = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={aiNetworkImage}
            alt="AI Neural Network"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        </div>

        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 0],
                y: [-20, -100],
                x: Math.random() * 20 - 10,
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
              className="absolute w-1 h-1 bg-accent rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${50 + Math.random() * 50}%`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/10 mb-6">
              <Brain className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">
                Coming Soon
              </span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-gradient">AI-Powered</span>
              <br />
              Performance Analysis
            </h1>

            <p className="text-xl text-muted-foreground mb-8">
              Next-generation artificial intelligence will transform how you
              understand, analyze, and improve your game.
            </p>

            <Link to="/auth?mode=signup">
              <Button variant="neon" size="xl" className="group">
                Get Early Access
                <Zap className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              Upcoming <span className="text-gradient">AI Features</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              We're building the most advanced sports analysis platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative group"
              >
                <div className="p-6 rounded-2xl bg-card border border-border h-full backdrop-blur-sm hover:border-accent/30 transition-all">
                  <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-accent/20 border border-accent/30 text-[10px] font-medium text-accent">
                    Coming Soon
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-accent" />
                  </div>

                  <h3 className="font-display text-xl font-semibold mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              Development <span className="text-gradient">Roadmap</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Our plan to bring AI analysis to life
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {roadmap.map((phase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`p-6 rounded-2xl border ${
                  phase.status === "in-progress"
                    ? "bg-gradient-to-b from-accent/10 to-transparent border-accent/50"
                    : "bg-card border-border"
                }`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      phase.status === "in-progress"
                        ? "bg-accent/20 text-accent"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {phase.phase}
                  </span>
                  {phase.status === "in-progress" && (
                    <span className="flex items-center gap-1 text-xs text-accent">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                      In Progress
                    </span>
                  )}
                </div>

                <h3 className="font-display text-xl font-semibold mb-4">
                  {phase.title}
                </h3>

                <ul className="space-y-2">
                  {phase.items.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          phase.status === "in-progress"
                            ? "bg-accent"
                            : "bg-muted-foreground"
                        }`}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
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
              Be the First to Experience{" "}
              <span className="text-gradient">AI Analysis</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Create your account now to get early access when AI features
              launch
            </p>
            <Link to="/auth?mode=signup">
              <Button variant="hero" size="xl" className="group">
                Get Early Access
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default AIFeaturesPage;
