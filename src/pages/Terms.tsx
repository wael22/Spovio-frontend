import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";

const TermsPage = () => {
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
                            Conditions Générales d'Utilisation
                        </h1>

                        <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
                            <p>En vigueur à compter du {new Date().toLocaleDateString('fr-FR')}</p>

                            <div className="space-y-4">
                                <p>
                                    Toutes les sections des présentes conditions d'utilisation (« Conditions »), y compris les termes énoncés dans la politique de confidentialité (« Politique de Confidentialité »), s'appliquent à l'utilisation de tous les services (« Services ») fournis par SPOVIO SARL (« SPOVIO ») et ses filiales via toutes les applications logicielles (« Logiciel ») et le site web spovio.vercel.app (« Site Web ») concernant les Services fournis (que ce soit sur le terrain ou en ligne) aux Utilisateurs (« Utilisateur » ou « Vous »). Ces Conditions peuvent être révisées de temps à autre et les Conditions révisées entreront en vigueur dès leur publication sur le Site Web.
                                </p>
                            </div>

                            <div className="bg-card/50 p-6 rounded-lg border border-border">
                                <h2 className="text-xl font-bold text-foreground mb-4">1. INTRODUCTION</h2>
                                <p>
                                    SPOVIO est une plateforme innovante qui transforme l'expérience des joueurs de padel et de tennis grâce à des caméras haute qualité stratégiquement installées sur les terrains. La plateforme est conçue pour offrir une expérience complète, de l'enregistrement et du stockage des matchs à la visualisation et à l'analyse détaillée de chaque jeu.
                                </p>
                                <p className="mt-2">
                                    MySmash, notre premier produit, est spécialement conçu pour les sports de raquette (padel et tennis) et s'adresse aux joueurs de tous niveaux, aux entraîneurs et aux clubs sportifs.
                                </p>
                                <p className="mt-2">Les services sont fournis par SPOVIO aux utilisateurs comme suit :</p>
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>Caméras haute qualité avec transmission avancée installées sur les terrains de padel et de tennis</li>
                                    <li>Code QR pour accéder à la plateforme et activer les caméras</li>
                                    <li>Plateforme web pour gérer et analyser les enregistrements</li>
                                    <li>Stockage Cloud : toutes les données générées à partir des paramètres du compte Utilisateur seront téléchargées sur le Site Web et stockées via le cloud</li>
                                    <li>Système de crédits flexible pour l'achat et le déverrouillage des vidéos</li>
                                </ul>
                                <p className="mt-4">
                                    L'UTILISATEUR, afin de connecter les caméras et d'enregistrer un match de padel ou de tennis dans l'un des Clubs où SPOVIO / MySmash est installé, doit d'abord s'inscrire et créer son propre compte en tant qu'UTILISATEUR SPOVIO.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-bold text-foreground mb-2">2. ACCEPTATION DES CONDITIONS D'UTILISATION</h2>
                                    <p>
                                        En utilisant SPOVIO / MySmash, en vous inscrivant en tant qu'utilisateur sur notre Site Web, en enregistrant ou en diffusant des matchs en direct, en achetant des crédits ou des services premium, en effectuant un paiement pour des comptes d'abonnement, ou tout autre outil fourni dans le cadre des Services, vous acceptez les présentes Conditions Générales ainsi que la Politique de Confidentialité de SPOVIO.
                                    </p>
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-foreground mb-2">3. RESTRICTIONS D'ÂGE</h2>
                                    <p>
                                        Les Services sont destinés aux Utilisateurs âgés de treize (13) ans ou plus. SPOVIO peut fournir des Services aux Utilisateurs qui s'identifient comme ayant moins de 18 ans, uniquement lorsque nous recevons un consentement parental vérifiable.
                                    </p>
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-foreground mb-2">4. CONTENU UTILISATEUR</h2>
                                    <p>
                                        Les Utilisateurs peuvent utiliser leur Contenu personnel uniquement à des fins non commerciales. Les Utilisateurs sont responsables de toutes les activités menées via leurs comptes SPOVIO et doivent garder leurs informations de connexion sécurisées, interdisant tout accès non autorisé.
                                    </p>
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-foreground mb-2">5. CONSENTEMENT DE L'UTILISATEUR</h2>
                                    <p>
                                        En scannant le Code QR à l'entrée du terrain pour connecter la caméra et commencer l'enregistrement ou la diffusion, l'utilisateur donne son plein consentement pour l'enregistrement du match impliquant tous les joueurs participants (2 joueurs pour le tennis en simple, 4 joueurs pour le padel ou le tennis en double).
                                    </p>
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-foreground mb-2">6. CONSENTEMENT DU CLUB</h2>
                                    <p>
                                        Conformément au contrat entre le Club et SPOVIO, chaque club est responsable d'informer ses joueurs et membres, en s'assurant de leur consentement pour être enregistrés et diffusés en direct en ligne.
                                    </p>
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-foreground mb-2">7. INTERACTION UTILISATEUR ET SERVICES DE DIFFUSION</h2>
                                    <p>
                                        Aucun participant ou joueur ne peut initier une diffusion en direct des caméras de match pour des matchs auxquels il ne participe pas. La violation de cette règle donne à SPOVIO le droit d'engager des poursuites judiciaires et de supprimer le compte utilisateur fautif.
                                    </p>
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-foreground mb-2">8. DONNÉES À TRAITER</h2>
                                    <p className="font-semibold text-foreground">Collecte et Stockage des Données</p>
                                    <p>
                                        Les données collectées via les formulaires d'inscription et de contact seront stockées sur des serveurs gérés par des fournisseurs cloud conformes aux normes internationales de sécurité. SPOVIO affirme sa conformité avec les lois tunisiennes applicables en matière de protection des données et de confidentialité, notamment la loi organique n° 2004-63 du 27 juillet 2004 relative à la protection des données à caractère personnel.
                                    </p>
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-foreground mb-2">9. COMMUNICATIONS PAR EMAIL</h2>
                                    <p>
                                        En acceptant ces Conditions Générales, l'utilisateur consent à recevoir des communications marketing de SPOVIO par email depuis l'adresse contact@spovio.net et/ou via le centre de notifications de la plateforme SPOVIO / MySmash.
                                    </p>
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-foreground mb-2">10. PLANS DE SERVICE ET PAIEMENT</h2>
                                    <p>
                                        Le Plan Gratuit permet aux utilisateurs de s'inscrire et de regarder les diffusions en direct des matchs à coût zéro mais avec des fonctionnalités limitées. Les vidéos apparaissent avec un watermark (filigrane) et ne peuvent pas être téléchargées.
                                    </p>
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-foreground mb-2">11. LIMITATION DE RESPONSABILITÉ</h2>
                                    <p>
                                        Dans la mesure maximale permise par la loi, SPOVIO et ses affiliés ne sont pas responsables des dommages directs, accessoires, indirects ou consécutifs.
                                    </p>
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-foreground mb-2">12. ACCÈS AUX AVIS UTILISATEURS</h2>
                                    <p>
                                        Les Utilisateurs peuvent soumettre des avis sur les activités et services du site web en utilisant un formulaire désigné.
                                    </p>
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-foreground mb-2">13. POLITIQUE DE CONFIDENTIALITÉ</h2>
                                    <p>
                                        La Politique de Confidentialité de SPOVIO fait partie intégrante des présentes Conditions par référence.
                                    </p>
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-foreground mb-2">14. DROITS DE PROPRIÉTÉ INTELLECTUELLE</h2>
                                    <p>
                                        Tous les droits de propriété intellectuelle associés aux Services, au Site Web et à l'application mobile de SPOVIO sont la propriété exclusive de SPOVIO.
                                    </p>
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-foreground mb-2">15. RÉSILIATION</h2>
                                    <p>
                                        Vous pouvez résilier votre compte SPOVIO à tout moment via les paramètres de profil du Site Web.
                                    </p>
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-foreground mb-2">16. DISPOSITIONS GÉNÉRALES</h2>
                                    <p>
                                        Ces Conditions sont régies par le droit tunisien. Tout litige relatif à ces Conditions sera soumis à la compétence exclusive des tribunaux de Tunis, Tunisie.
                                    </p>
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-foreground mb-2">17. CONTACT</h2>
                                    <p>Pour toute question concernant ces Conditions Générales d'Utilisation :</p>
                                    <ul className="list-none mt-2">
                                        <li>SPOVIO SARL</li>
                                        <li>Email : contact@spovio.net</li>
                                        <li>Site Web : spovio.net</li>
                                        <li>Adresse : Novation City Technopole de Sousse Sousse, Tunisie</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </Layout>
    );
};

export default TermsPage;
