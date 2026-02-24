import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Globe,
  Rocket,
  ArrowRight,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ValuesList } from "@/components/shared/ValuesList";
import { useTranslation } from "react-i18next";

const AboutPage = () => {
  const { t } = useTranslation();

  const timelineYears = ["2025", "2026", "2027", "2028"];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]"
          />
          <motion.div
            animate={{ opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 12, repeat: Infinity }}
            className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px]"
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
              {t('pages.about.title')} <span className="text-gradient">Spovio</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('pages.about.mission.description')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                {t('pages.about.hero.title')} <span className="text-gradient">{t('pages.about.hero.titleHighlight')}</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                {t('pages.about.hero.description')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              {/* Abstract Globe Visualization */}
              <div className="aspect-square max-w-md mx-auto relative">
                <div className="absolute inset-0 rounded-full border border-primary/20 animate-[spin_30s_linear_infinite]" />
                <div className="absolute inset-8 rounded-full border border-primary/30 animate-[spin_25s_linear_infinite_reverse]" />
                <div className="absolute inset-16 rounded-full border border-primary/40 animate-[spin_20s_linear_infinite]" />
                <div className="absolute inset-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Globe className="w-16 h-16 text-primary" />
                </div>

                {/* Region Markers */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-1/4 right-1/4 w-3 h-3 bg-primary rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-accent rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  className="absolute top-1/3 left-1/3 w-3 h-3 bg-primary rounded-full"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              {t('pages.about.values.title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('pages.about.values.subtitle')}
            </p>
          </motion.div>


          <div className="mb-16">
            <ValuesList />
          </div>

        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              {t('pages.about.timeline.title')}
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border" />

              {timelineYears.map((year, index) => {
                const title = t(`pages.about.timeline.${year}.title`);
                // Use type assertion to tell TypeScript this is an array of strings
                const items = t(`pages.about.timeline.${year}.items`, { returnObjects: true }) as string[];

                return (
                  <motion.div
                    key={year}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`relative flex items-center gap-8 pb-12 ${index % 2 === 0 ? "md:flex-row-reverse" : ""
                      }`}
                  >
                    {/* Dot */}
                    <div className="absolute left-4 md:left-1/2 w-3 h-3 -ml-1.5 rounded-full bg-primary" />

                    {/* Content */}
                    <div
                      className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${index % 2 === 0 ? "md:text-right" : ""
                        }`}
                    >
                      <div className="font-display text-primary font-bold mb-1">
                        {year}
                      </div>
                      <h3 className="font-display text-xl font-semibold mb-2">
                        {title}
                      </h3>
                      <div className="text-muted-foreground w-full">
                        {Array.isArray(items) ? (
                          <ul className={`space-y-1 ${index % 2 === 0 ? "md:mr-0 inline-block text-left" : ""}`}>
                            {items.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p>{typeof items === 'string' ? items : "..."}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
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
            <Rocket className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              {t('pages.about.cta.title')} <span className="text-gradient"></span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t('pages.about.cta.description')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/auth?mode=signup">
                <Button variant="hero" size="xl" className="group">
                  {t('nav.signup')}
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="neonOutline" size="xl">
                  {t('nav.contact')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
