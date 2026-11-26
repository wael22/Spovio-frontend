import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Mail,
    ArrowRight,
    Zap,
    AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

const EmailVerification = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [email, setEmail] = useState("");

    useEffect(() => {
        // Get email from URL query params or navigation state or redirect to auth
        const queryParams = new URLSearchParams(location.search);
        const queryEmail = queryParams.get('email');
        const stateEmail = location.state?.email;
        
        const finalEmail = queryEmail || stateEmail;
        
        if (!finalEmail) {
            navigate("/auth");
            return;
        }
        setEmail(finalEmail);

        // Auto-fill code if provided in URL
        const queryCode = queryParams.get('code');
        if (queryCode && queryCode.length === 6) {
            setCode(queryCode);
        }
    }, [location, navigate]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();

        if (code.length !== 6) {
            toast({
                title: t("auth.invalidCode"),
                description: t("auth.invalidCodeDesc"),
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await authService.verifyEmail(email, code);

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }

            try {
                const pendingToken = localStorage.getItem('pending_share_token');
                if (pendingToken) {
                    const { videoService } = await import('@/lib/api');
                    const resolveResponse = await videoService.resolveShareLink(pendingToken);
                    const { video_id } = resolveResponse.data;
                    await videoService.claimShare(video_id);
                    localStorage.removeItem('pending_share_token');
                }
            } catch (e) {
                console.error('Failed to claim pending share after verification:', e);
                localStorage.removeItem('pending_share_token');
            }

            toast({
                title: t("auth.emailVerified"),
                description: t("auth.emailVerifiedDesc"),
            });

            navigate("/dashboard");
        } catch (error: any) {
            console.error('Verification error:', error);
            toast({
                title: t("auth.incorrectCode"),
                description: error.response?.data?.error || error.response?.data?.message || t("auth.incorrectCodeDesc"),
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);

        try {
            await authService.resendVerificationCode(email);

            toast({
                title: t("auth.codeResent"),
                description: t("auth.codeResentDesc"),
            });
        } catch (error: any) {
            console.error('Resend error:', error);
            toast({
                title: t("common.error"),
                description: error.response?.data?.error || error.response?.data?.message || t("auth.resendErrorDesc"),
                variant: "destructive",
            });
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
            <div className="absolute inset-0 tech-grid opacity-30 pointer-events-none" />

            {/* Floating orbs */}
            <div className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <Link to="/" className="inline-flex items-center gap-2">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <Zap className="h-7 w-7 text-white" />
                        </div>
                        <span className="text-3xl font-bold font-orbitron gradient-text">MySmash</span>
                    </Link>
                </motion.div>

                {/* Verification Card */}
                <motion.div
                    layout
                    className="glass rounded-2xl p-8 shadow-xl"
                >
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                            <Mail className="h-8 w-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">{t("auth.verifyEmail")}</h2>
                        <p className="text-sm text-muted-foreground">
                            {t("auth.codeSentTo")}
                        </p>
                        <p className="text-sm font-medium text-foreground mt-1">
                            {email}
                        </p>
                    </div>

                    <form onSubmit={handleVerify} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="code" className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                {t("auth.verificationCode")}
                            </Label>
                            <Input
                                id="code"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                placeholder="123456"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                                className="bg-card/50 text-center text-2xl tracking-widest font-mono"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                {t("auth.enterCode")}
                            </p>
                        </div>

                        <Button
                            type="submit"
                            variant="neon"
                            className="w-full gap-2"
                            disabled={isLoading || code.length !== 6}
                        >
                            {isLoading ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {t("auth.verify")}
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center space-y-3">
                        <p className="text-sm text-muted-foreground">
                            {t("auth.noCode")}
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={handleResend}
                            disabled={isResending}
                        >
                            {isResending ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                    {t("auth.sending")}
                                </>
                            ) : (
                                t("auth.resendCode")
                            )}
                        </Button>
                    </div>

                    <div className="mt-6 text-center">
                        <Link
                            to="/auth"
                            className="text-sm text-primary hover:underline"
                        >
                            {t("auth.backToLogin")}
                        </Link>
                    </div>
                </motion.div>

                {/* Footer */}
                <p className="text-center text-sm text-muted-foreground mt-6">
                    {t("footer.copyright", { year: new Date().getFullYear() })}
                </p>
            </motion.div>
        </div>
    );
};

export default EmailVerification;
