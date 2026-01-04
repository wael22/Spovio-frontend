import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { QrCode, Video, Cloud, Share2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: QrCode,
    title: "QR Code Start",
    description: "Simply scan to begin recording",
  },
  {
    icon: Video,
    title: "HD Recording",
    description: "Crystal clear video quality",
  },
  {
    icon: Cloud,
    title: "Cloud Storage",
    description: "Access matches anywhere",
  },
  {
    icon: Share2,
    title: "Easy Sharing",
    description: "Share with one click",
  },
];

export const MySmashPreview = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-primary uppercase tracking-wider">
                Available Now
              </span>
            </div>

            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              <span className="text-gradient">MySmash</span> for Padel
            </h2>

            <p className="text-lg text-muted-foreground mb-8">
              The first Spovio product, designed specifically for padel. Record
              every match, replay your best moments, and share highlights with
              friends and coaches.
            </p>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                >
                  <feature.icon className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{feature.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Link to="/mysmash">
                <Button variant="hero" size="lg" className="group">
                  Learn More
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button variant="outline" size="lg">
                  Create Account
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-md mx-auto">
              {/* Outer Ring */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/20 animate-[spin_20s_linear_infinite]" />
              
              {/* Inner Ring */}
              <div className="absolute inset-8 rounded-full border border-primary/30 animate-[spin_15s_linear_infinite_reverse]" />
              
              {/* Center Content */}
              <div className="absolute inset-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center backdrop-blur-sm border border-primary/20">
                <div className="text-center">
                  <div className="font-display text-4xl font-bold text-gradient mb-2">
                    MySmash
                  </div>
                  <div className="text-sm text-muted-foreground">
                    For Padel
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              {features.map((feature, index) => {
                const angle = (index * 90 - 45) * (Math.PI / 180);
                const radius = 160;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    className="absolute top-1/2 left-1/2 w-12 h-12 -ml-6 -mt-6 rounded-xl bg-card border border-border flex items-center justify-center shadow-lg"
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                    }}
                  >
                    <feature.icon className="w-5 h-5 text-primary" />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
