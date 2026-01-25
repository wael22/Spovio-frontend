import { motion } from "framer-motion";
import { Target, Zap, Users, Globe, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

import { ValuesList } from "@/components/shared/ValuesList";

// Removed local values array as we now use shared constants via ValuesList (single source of truth)



export const AboutSection = () => {
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
                        À Propos de
                        <br />
                        <span className="gradient-text">Spovio</span>
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Spovio est née de la frustration de ne pas pouvoir revoir et analyser
                        ses propres performances sportives. Nous avons créé une solution simple
                        et accessible qui permet à chaque sportif d'enregistrer, analyser et
                        améliorer son jeu grâce à la technologie.
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
                            Notre Histoire
                        </h3>
                        <div className="space-y-4 text-muted-foreground leading-relaxed">
                            <p>
                                Tout a commencé sur un terrain de padel en Tunisie. Après chaque match,
                                nous nous demandions : "Pourquoi est-ce si difficile de revoir nos performances ?"
                            </p>
                            <p>
                                C'est là que l'idée de Spovio est née. Nous avons réuni une équipe passionnée
                                de développeurs, de sportifs et d'experts en IA pour créer la solution que nous
                                aurions aimé avoir.
                            </p>
                            <p>
                                Aujourd'hui, <span className="text-foreground font-semibold">Spovio</span> couvre le padel et le tennis, permettant à des centaines de joueurs d'enregistrer, analyser et partager leurs matchs. Et ce n'est que le début.
                            </p>
                            <p className="text-foreground font-semibold pt-4 text-center">
                                Rejoignez-nous dans cette aventure sportive ! 🎾⚽🏀
                            </p>
                        </div>

                        <div className="mt-8 text-center">
                            <Link to="/about">
                                <Button variant="outline" size="lg" className="group">
                                    En savoir plus sur Spovio
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
