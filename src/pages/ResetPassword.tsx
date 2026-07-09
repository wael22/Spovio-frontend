import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, ArrowRight, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { useTranslation } from "react-i18next";

const ResetPassword = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            toast({
                title: t("auth.invalidLink"),
                description: t("auth.resetLinkMissing"),
                variant: "destructive",
            });
            navigate("/auth");
        }
    }, [token, navigate, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast({
                title: t("common.error"),
                description: t("auth.passwordMismatchShort"),
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);

        try {
            await authService.resetPassword(token!, password);
            setIsSuccess(true);
            toast({
                title: t("common.success"),
                description: t("auth.resetSuccessDesc"),
            });
        } catch (error: any) {
            console.error("Reset password error:", error);
            toast({
                title: t("common.error"),
                description: error.response?.data?.error || t("auth.resetErrorDesc"),
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
                    {!isSuccess ? (
                        <>
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold mb-2">{t("auth.newPassword")}</h1>
                                <p className="text-muted-foreground">
                                    {t("auth.newPasswordDesc")}
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">{t("auth.newPassword")}</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-9 bg-card/50"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="pl-9 bg-card/50"
                                            required
                                            minLength={6}
                                        />
                                    </div>
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
                                            {t("auth.resetButton")}
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-6 space-y-6">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-500">
                                <CheckCircle className="h-10 w-10" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold mb-2">{t("auth.passwordChanged")}</h2>
                                <p className="text-muted-foreground">
                                    {t("auth.passwordChangedDesc")}
                                </p>
                            </div>
                            <Button asChild className="w-full" variant="neon">
                                <Link to="/auth">{t("auth.loginButton")}</Link>
                            </Button>
                        </div>
                    )}
                </motion.div>
            </div>
        </>
    );
};

export default ResetPassword;
