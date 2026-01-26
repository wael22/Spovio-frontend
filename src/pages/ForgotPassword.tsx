import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/api";
import { Navbar } from "@/components/Navbar";

const ForgotPassword = () => {
    const { toast } = useToast();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await authService.forgotPassword(email);
            // We always show success message for security reasons
            setIsSubmitted(true);
            toast({
                title: "Email envoyé",
                description: "Si un compte existe, vous recevrez un lien de réinitialisation.",
            });
        } catch (error) {
            console.error("Forgot password error:", error);
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la demande.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden pt-20">
                <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
                <div className="absolute inset-0 tech-grid opacity-30 pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md relative z-10 glass rounded-2xl p-8 shadow-xl"
                >
                    <div className="mb-6">
                        <Link to="/auth" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Retour à la connexion
                        </Link>
                        <h1 className="text-2xl font-bold mb-2">Mot de passe oublié ?</h1>
                        <p className="text-muted-foreground">
                            Entrez votre email pour recevoir un lien de réinitialisation.
                        </p>
                    </div>

                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="votre@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-card/50"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                variant="neon"
                                className="w-full gap-2"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Envoyer le lien
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center py-6 space-y-4">
                            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto text-primary">
                                <Mail className="h-8 w-8" />
                            </div>
                            <p className="text-lg font-medium">Vérifiez votre boîte mail</p>
                            <p className="text-sm text-muted-foreground">
                                Nous avons envoyé un lien de réinitialisation à <strong>{email}</strong>
                            </p>
                            <Button
                                variant="outline"
                                className="w-full mt-4"
                                onClick={() => setIsSubmitted(false)}
                            >
                                Renvoyer un email
                            </Button>
                        </div>
                    )}
                </motion.div>
            </div>
        </>
    );
};

export default ForgotPassword;
