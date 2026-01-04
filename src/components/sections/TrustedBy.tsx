import { motion } from "framer-motion";

const clubs = [
  "Elite Padel Club",
  "Centro Deportivo Madrid",
  "Dubai Sports Complex",
  "Paris Padel Academy",
  "London Court Club",
  "Barcelona Tennis Center",
];

export const TrustedBy = () => {
  return (
    <section className="py-16 border-y border-border bg-card/30">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <p className="text-sm text-muted-foreground uppercase tracking-wider">
            Trusted by leading sports clubs
          </p>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {clubs.map((club, index) => (
            <motion.div
              key={club}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="text-lg md:text-xl font-display font-semibold text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              {club}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
