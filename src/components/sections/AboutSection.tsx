import { motion } from "framer-motion";
import { Target, Zap, Users, Globe, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

import { ValuesList } from "@/components/shared/ValuesList";

export const AboutSection = () => {
    const { t } = useTranslation();

    return (
        <section id="about" className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
                        {t("landing.about.title")}
                        <br />
                        <span className="gradient-text">Spovio</span>
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        {t("landing.about.description")}
                    </p>
                </motion.div>

                {/* Values Grid */}
                <div className="mb-16">
                    <ValuesList />
                </div>

                {/* Story */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="p-8 md:p-12 rounded-2xl bg-card border border-border">
                        <h3 className="font-display text-2xl md:text-3xl font-bold mb-6 text-center">
                            {t("landing.about.storyTitle")}
                        </h3>
                        <div className="space-y-4 text-muted-foreground leading-relaxed">
                            {(t("landing.about.story", { returnObjects: true }) as string[]).map((paragraph, index) => (
                                <p key={index} dangerouslySetInnerHTML={{ __html: paragraph }} />
                            ))}
                        </div>

                        <div className="mt-8 text-center">
                            <Link to="/about">
                                <Button variant="outline" size="lg" className="group">
                                    {t("landing.about.cta")}
                                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
