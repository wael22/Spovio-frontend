import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const ContactSection = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement contact form submission
        console.log("Form submitted:", formData);
        alert("Message envoyé ! Nous vous répondrons bientôt.");
        setFormData({ name: "", email: "", message: "" });
    };

    return (
        <section id="contact" className="py-24 bg-card/30 relative overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
                        Contactez
                        <br />
                        <span className="gradient-text">Notre Équipe</span>
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Une question ? Un projet de club ? Nous sommes là pour vous aider.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <div>
                            <h3 className="font-display text-2xl font-bold mb-6">
                                Informations de Contact
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <div className="font-semibold mb-1">Email</div>
                                        <a href="mailto:contact@spovio.com" className="text-muted-foreground hover:text-primary transition-colors">
                                            contact@spovio.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <div className="font-semibold mb-1">Téléphone</div>
                                        <a href="tel:+21612345678" className="text-muted-foreground hover:text-primary transition-colors">
                                            +216 12 345 678
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <div className="font-semibold mb-1">Adresse</div>
                                        <p className="text-muted-foreground">
                                            Tunis, Tunisie
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
                            <h4 className="font-display text-xl font-semibold mb-3">
                                Vous êtes un club ?
                            </h4>
                            <p className="text-muted-foreground mb-4">
                                Découvrez notre solution clé en main pour équiper vos terrains.
                            </p>
                            <a href="/#pricing">
                                <Button variant="neon" className="w-full">
                                    En Savoir Plus
                                </Button>
                            </a>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium mb-2">
                                    Nom
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:outline-none transition-colors"
                                    placeholder="Votre nom"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:outline-none transition-colors"
                                    placeholder="votre@email.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium mb-2">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    required
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    rows={6}
                                    className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:outline-none transition-colors resize-none"
                                    placeholder="Comment pouvons-nous vous aider ?"
                                />
                            </div>

                            <Button type="submit" variant="hero" size="lg" className="w-full">
                                Envoyer le Message
                            </Button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
