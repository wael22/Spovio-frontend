import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const PrivacyPage = () => {
    return (
        <Layout>
            <section className="py-32 relative overflow-hidden">
                <div className="container mx-auto px-4 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-4xl mx-auto"
                    >
                        <h1 className="font-display text-3xl md:text-5xl font-bold mb-8">
                            Politique de Confidentialité
                        </h1>

                        <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
                            <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

                            <div className="bg-card/50 p-6 rounded-lg border border-border">
                                <p>
                                    SPOVIO accorde une grande importance à la confidentialité de vos données. Cette Politique de Confidentialité fait partie intégrante de nos{" "}
                                    <Link to="/terms" className="text-primary hover:underline">
                                        Conditions Générales d'Utilisation
                                    </Link>.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-foreground mb-2">1. COLLECTE ET STOCKAGE DES DONNÉES</h2>
                                <p>
                                    Les données collectées via les formulaires d'inscription et de contact seront stockées sur des serveurs gérés par des fournisseurs cloud conformes aux normes internationales de sécurité. SPOVIO affirme sa conformité avec les lois tunisiennes applicables en matière de protection des données et de confidentialité, notamment la loi organique n° 2004-63 du 27 juillet 2004 relative à la protection des données à caractère personnel.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-foreground mb-2">2. CONSENTEMENT DES MINEURS</h2>
                                <p>
                                    Les mineurs de moins de 18 ans ne peuvent pas légalement donner leur consentement pour la collecte de leurs données personnelles par une entreprise en ligne. Ce consentement doit être fourni par leurs représentants légaux (c'est-à-dire parents ou tuteurs), sauf dans les cas où le mineur a atteint l'âge de 18 ans, auquel cas son consentement est considéré comme juridiquement valide.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-foreground mb-2">3. DROITS À L'IMAGE</h2>
                                <p>
                                    En scannant le code QR, l'utilisateur consent explicitement à la diffusion de son image sur la plateforme SPOVIO / MySmash. Chaque club est responsable d'informer ses joueurs de la présence de caméras.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-foreground mb-2">4. SUPPRESSION DES DONNÉES</h2>
                                <p>
                                    Vous pouvez supprimer votre compte à tout moment. Après annulation, tout le contenu accumulé sera supprimé après un délai de 30 jours pour des raisons de sécurité et de conformité légale.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-foreground mb-2">5. CONTACT PROTECTION DES DONNÉES</h2>
                                <p>
                                    Pour toute demande concernant vos données personnelles, vous pouvez nous contacter à :{" "}
                                    <a href="mailto:contact@spovio.net" className="text-primary hover:underline">
                                        contact@spovio.net
                                    </a>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </Layout>
    );
};

export default PrivacyPage;
