import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    QrCode,
    Video,
    Cloud,
    Share2,
    CreditCard,
    Smartphone,
    Play,
    ArrowRight,
    Check,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-padel-court.jpg";

const features = [
    {
        icon: QrCode,
        title: "Démarrage par QR Code",
        description:
            "Approchez-vous de n'importe quel court équipé, scannez le QR code et l'enregistrement de votre  match démarre instantanément. Pas d'app à télécharger, pas de configuration compliquée.",
    },
    {
        icon: Video,
        title: "Enregistrement Vidéo HD",
        description:
            "Capture vidéo de qualité professionnelle avec plusieurs angles. Chaque coup, chaque échange, chaque point capturé avec des détails époustouflants.",
    },
    {
        icon: Cloud,
        title: "Stockage Cloud",
        description:
            "Vos matchs sont automatiquement sauvegardés dans le cloud. Accédez à tout votre historique depuis n'importe quel appareil, partout dans le monde.",
    },
    {
        icon: Share2,
        title: "Partage Facile",
        description:
            "Créez des clips de vos meilleurs moments et partagez-les instantanément avec vos amis, entraîneurs ou sur les réseaux sociaux.",
    },
    {
        icon: CreditCard,
        title: "Système de Crédits",
        description:
            "Modèle simple de paiement à l'usage. Achetez des crédits et utilisez-les quand vous voulez enregistrer. Aucun abonnement requis.",
    },
    {
        icon: Smartphone,
        title: "Optimisé Mobile",
        description:
            "Expérience complète sur n'importe quel appareil. Revoyez vos matchs, créez des highlights et gérez votre compte en déplacement.",
    },
];

const pricingTiers = [
    { credits: 5, price: 80, perMatch: 16 },
    { credits: 10, price: 140, perMatch: 14, popular: true },
    { credits: 25, price: 300, perMatch: 12 },
];

const MyServePage = () => {
    return (
        <Layout>
            {/* Hero Section */}
            <section className="relative min-h-[80vh] flex items-center overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={heroImage}
                        alt="Court de tennis avec overlay IA"
                        className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
                </div>

                <div className="container mx-auto px-4 lg:px-8 relative z-10 py-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-3xl"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 mb-6">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-xs font-medium text-primary uppercase tracking-wider">
                                Disponible Maintenant
                            </span>
                        </div>

                        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                            <span className="text-gradient">MyServe</span>
                            <br />
                            <span className="text-foreground">Vidéo Professionnelle Tennis</span>
                        </h1>

                        <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                            La solution vidéo complète pour les joueurs et clubs de tennis. Enregistrez
                            chaque match, revoyez vos meilleurs moments et passez au niveau supérieur.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link to="/auth?mode=signup">
                                <Button variant="hero" size="xl" className="group">
                                    Créer un Compte
                                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                            <Link to="/auth?mode=login">
                                <Button variant="neonOutline" size="xl">
                                    Se Connecter
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-card/30">
                <div className="container mx-auto px-4 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center max-w-3xl mx-auto mb-16"
                    >
                        <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                            Tout Ce Dont Vous Avez Besoin pour{" "}
                            <span className="text-gradient">Capturer Votre Jeu</span>
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            MyServe combine technologie de pointe et design intuitif
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all"
                            >
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                    <feature.icon className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="font-display text-xl font-semibold mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Preview */}
            <section className="py-24">
                <div className="container mx-auto px-4 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center max-w-3xl mx-auto mb-16"
                    >
                        <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                            Tarification Simple <span className="text-gradient">par Crédits</span>
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Payez uniquement ce que vous utilisez. Aucun abonnement mensuel.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {pricingTiers.map((tier, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className={`relative p-6 rounded-2xl border ${tier.popular
                                    ? "bg-gradient-to-b from-primary/10 to-transparent border-primary/50"
                                    : "bg-card border-border"
                                    }`}
                            >
                                {tier.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                                        Le Plus Populaire
                                    </div>
                                )}
                                <div className="text-center mb-6">
                                    <div className="text-4xl font-display font-bold mb-2">
                                        {tier.credits}
                                    </div>
                                    <div className="text-muted-foreground">Crédits</div>
                                </div>
                                <div className="text-center mb-6">
                                    <div className="text-3xl font-bold">{tier.price} TND</div>
                                    <div className="text-sm text-muted-foreground">
                                        {tier.perMatch} TND/match
                                    </div>
                                </div>
                                <Button
                                    variant={tier.popular ? "hero" : "outline"}
                                    className="w-full"
                                >
                                    Commencer
                                </Button>
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
                            Commencez à Enregistrer Vos Matchs{" "}
                            <span className="text-gradient">Aujourd'hui</span>
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            Rejoignez les joueurs de tennis qui utilisent déjà MyServe
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link to="/auth?mode=signup">
                                <Button variant="hero" size="xl" className="group">
                                    Créer un Compte
                                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </Layout>
    );
};

export default MyServePage;
