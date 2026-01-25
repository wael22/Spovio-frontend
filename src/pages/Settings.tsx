import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { User, Lock, Bell, Moon, Sun, Shield } from "lucide-react";

const Settings = () => {
    const { theme, setTheme } = useTheme();
    const { user } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // Password Change State
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // Notification State (Mocked)
    const [notifications, setNotifications] = useState({
        email: true,
        marketing: false,
        security: true,
    });

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast({
                title: "Erreur",
                description: "Les nouveaux mots de passe ne correspondent pas.",
                variant: "destructive",
            });
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            toast({
                title: "Erreur",
                description: "Le mot de passe doit contenir au moins 6 caractères.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            await authService.changePassword({
                old_password: passwordForm.oldPassword,
                new_password: passwordForm.newPassword,
            });

            toast({
                title: "Succès",
                description: "Votre mot de passe a été mis à jour.",
            });

            setPasswordForm({
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.response?.data?.error || "Erreur lors du changement de mot de passe.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto py-10 pt-24 max-w-4xl px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Paramètres</h1>
                    <p className="text-muted-foreground">
                        Gérez vos préférences de compte et votre sécurité.
                    </p>
                </div>

                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-8">
                        <TabsTrigger value="general" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="hidden sm:inline">Général</span>
                        </TabsTrigger>
                        <TabsTrigger value="security" className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            <span className="hidden sm:inline">Sécurité</span>
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            <span className="hidden sm:inline">Notifications</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* GENERAL TAB */}
                    <TabsContent value="general">
                        <Card>
                            <CardHeader>
                                <CardTitle>Préférences Générales</CardTitle>
                                <CardDescription>
                                    Personnalisez l'apparence et consultez vos informations.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label className="text-base">Apparence</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Choisissez entre le mode clair et le mode sombre.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-muted p-1 rounded-full">
                                        <Button
                                            variant={theme === "light" ? "default" : "ghost"}
                                            size="sm"
                                            className="rounded-full h-8 w-8 p-0"
                                            onClick={() => setTheme("light")}
                                        >
                                            <Sun className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant={theme === "dark" ? "default" : "ghost"}
                                            size="sm"
                                            className="rounded-full h-8 w-8 p-0"
                                            onClick={() => setTheme("dark")}
                                        >
                                            <Moon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium">Informations du compte</h3>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Nom</Label>
                                            <Input value={user?.name || ""} disabled readOnly className="bg-muted" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <Input value={user?.email || ""} disabled readOnly className="bg-muted" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Pour modifier ces informations, veuillez contacter le support.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* SECURITY TAB */}
                    <TabsContent value="security">
                        <Card>
                            <CardHeader>
                                <CardTitle>Sécurité</CardTitle>
                                <CardDescription>
                                    Gérez votre mot de passe et la sécurité de votre compte.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handlePasswordChange} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="current-password">Mot de passe actuel</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="current-password"
                                                type="password"
                                                className="pl-9"
                                                placeholder="••••••••"
                                                value={passwordForm.oldPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="new-password">Nouveau mot de passe</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="new-password"
                                                type="password"
                                                className="pl-9"
                                                placeholder="••••••••"
                                                value={passwordForm.newPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="confirm-password"
                                                type="password"
                                                className="pl-9"
                                                placeholder="••••••••"
                                                value={passwordForm.confirmPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <Button type="submit" disabled={isLoading}>
                                            {isLoading ? "Modification..." : "Mettre à jour le mot de passe"}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* NOTIFICATIONS TAB */}
                    <TabsContent value="notifications">
                        <Card>
                            <CardHeader>
                                <CardTitle>Notifications</CardTitle>
                                <CardDescription>
                                    Choisissez comment vous souhaitez être informé.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between space-x-2">
                                    <Label htmlFor="email-notifs" className="flex flex-col space-y-1">
                                        <span>Emails de transaction</span>
                                        <span className="font-normal text-xs text-muted-foreground">
                                            Rejoignez des parties, confirmations d'achat, etc.
                                        </span>
                                    </Label>
                                    <Switch
                                        id="email-notifs"
                                        checked={notifications.email}
                                        onCheckedChange={(c) => setNotifications({ ...notifications, email: c })}
                                    />
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between space-x-2">
                                    <Label htmlFor="security-notifs" className="flex flex-col space-y-1">
                                        <span>Alertes de sécurité</span>
                                        <span className="font-normal text-xs text-muted-foreground">
                                            Connexions suspectes, changements de mot de passe.
                                        </span>
                                    </Label>
                                    <Switch
                                        id="security-notifs"
                                        checked={notifications.security}
                                        disabled // Toujours actif pour sécurité
                                    />
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between space-x-2">
                                    <Label htmlFor="marketing-notifs" className="flex flex-col space-y-1">
                                        <span>Emails Marketing</span>
                                        <span className="font-normal text-xs text-muted-foreground">
                                            Nouveautés, offres spéciales et actualités MySmash.
                                        </span>
                                    </Label>
                                    <Switch
                                        id="marketing-notifs"
                                        checked={notifications.marketing}
                                        onCheckedChange={(c) => setNotifications({ ...notifications, marketing: c })}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="w-full" onClick={() => toast({ title: "Préférences sauvegardées" })}>
                                    Enregistrer les préférences
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default Settings;
