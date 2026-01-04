import { motion } from "framer-motion";

const sports = [
  { name: "Padel", status: "active", color: "from-primary to-neon-blue" },
  { name: "Tennis", status: "coming", color: "from-muted to-muted-foreground" },
  { name: "Basketball", status: "coming", color: "from-muted to-muted-foreground" },
  { name: "Football", status: "coming", color: "from-muted to-muted-foreground" },
  { name: "Volleyball", status: "coming", color: "from-muted to-muted-foreground" },
  { name: "Squash", status: "coming", color: "from-muted to-muted-foreground" },
];

export const MultiSportVision = () => {
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
            One Platform,{" "}
            <span className="text-gradient">Multiple Sports</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Starting with padel, expanding to serve athletes across all sports
          </p>
        </motion.div>

        {/* Sports Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {sports.map((sport, index) => (
            <motion.div
              key={sport.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="relative group"
            >
              <div
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-3 border transition-all duration-300 ${
                  sport.status === "active"
                    ? "bg-gradient-to-br from-primary/20 to-accent/10 border-primary/50 hover:border-primary"
                    : "bg-card/50 border-border hover:border-muted-foreground/50"
                }`}
              >
                <span
                  className={`font-display text-lg font-semibold ${
                    sport.status === "active"
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {sport.name}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    sport.status === "active"
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {sport.status === "active" ? "Live" : "Coming Soon"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
