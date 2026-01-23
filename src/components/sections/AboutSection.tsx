import { motion } from "framer-motion";
import { Target, Zap, Users, Globe } from "lucide-react";

const values = [
    {
        icon: Target,
        title: "Notre Mission",
        description: "Démocratiser l'analyse vidéo sportive pour tous les joueurs, du amateur au professionnel."
    },
    {
        icon: Zap,
        title: "Innovation",
        description: "Utiliser la technologie IA pour transformer l'expérience sportive et aider les athlètes à progresser."
    },
    {
        icon: Users,
        title: "Communauté",
        description: "Créer une plateforme où les sportifs peuvent partager, apprendre et s'améliorer ensemble."
    },
    {
        icon: Globe,
        title: "Expansion",
        description: "Du padel au tennis, et bientôt tous les sports. Notre vision est globale."
    }
];

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
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    {values.map((value, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="text-center"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
                                <value.icon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="font-display text-xl font-semibold mb-3">
                                {value.title}
                            </h3>
                            <p className="text-muted-foreground">
                                {value.description}
                            </p>
                        </motion.div>
                    ))}
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
                                Aujourd'hui, <span className="text-foreground font-semibold">MySmash</span> pour
                                le padel et <span className="text-foreground font-semibold">MyServe</span> pour
                                le tennis permettent à des centaines de joueurs d'enregistrer, analyser et partager
                                leurs matchs. Et ce n'est que le début.
                            </p>
                            <p className="text-foreground font-semibold pt-4 text-center">
                                Rejoignez-nous dans cette aventure sportive ! 🎾⚽🏀
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
