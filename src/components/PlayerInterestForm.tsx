
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// import api from "@/lib/api"; // Not used for this form anymore
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is available or use existing toast

const formSchema = z.object({
    firstName: z.string().min(1, "Le prénom est obligatoire").max(100),
    lastName: z.string().min(1, "Le nom est obligatoire").max(100),
    phone: z.string().min(8, "Numéro de téléphone invalide").max(20),
    age: z.string().refine((val) => {
        const num = parseInt(val);
        return !isNaN(num) && num > 0 && num < 120;
    }, "L'âge doit être un nombre valide"),
    sport: z.enum(["padel", "tennis", "both"], {
        required_error: "Veuillez sélectionner un sport",
    }),
    city: z.string().min(1, "La ville est obligatoire").max(100),
    club: z.string().max(200).optional(),
    consent: z.boolean().refine((val) => val === true, {
        message: "Vous devez accepter les conditions",
    }),
});

type FormValues = z.infer<typeof formSchema>;

const PlayerInterestForm = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            phone: "",
            age: "",
            sport: undefined,
            city: "",
            club: "",
            consent: false,
        },
    });

    const onSubmit = async (data: FormValues) => {
        setIsLoading(true);
        try {
            // Mapping API payload to snake_case backend expectation
            const payload = {
                first_name: data.firstName.trim(),
                last_name: data.lastName.trim(),
                phone: data.phone.trim(),
                age: parseInt(data.age),
                sport: data.sport,
                city: data.city.trim(),
                club: data.club?.trim() || null,
            };

            await fetch('/api/interest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            }).then(async (res) => {
                if (!res.ok) throw new Error('Failed to submit');
                return res.json();
            });

            setIsSubmitted(true);
            toast.success("Formulaire envoyé avec succès !");
        } catch (error) {
            console.error("Erreur lors de la soumission:", error);
            toast.error("Erreur lors de l'envoi du formulaire. Veuillez réessayer.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="bg-card border border-border rounded-lg p-8 text-center max-w-md mx-auto">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Merci !</h2>
                <p className="text-muted-foreground">
                    Votre intérêt pour MySmash a bien été enregistré.
                </p>
                <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => {
                        setIsSubmitted(false);
                        form.reset();
                    }}
                >
                    Envoyer une autre réponse
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-lg p-6 md:p-8 max-w-md mx-auto shadow-sm">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-foreground mb-2">
                    Rejoignez MySmash
                </h1>
                <p className="text-muted-foreground text-sm mb-4">
                    Manifestez votre intérêt pour notre plateforme de padel et tennis.
                </p>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                    <p className="text-sm text-foreground/80 leading-relaxed">
                        <strong>MySmash</strong> est la solution ultime pour les passionnés de sports de raquette.
                        Enregistrez vos matchs en haute définition, analysez vos performances grâce à notre
                        Intelligence Artificielle avancée, et revivez vos meilleurs points.
                        Rejoignez la liste d'attente pour transformer votre jeu ! 🚀
                    </p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Prénom *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Jean" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Dupont" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Téléphone *</FormLabel>
                                <FormControl>
                                    <Input placeholder="+216 XX XXX XXX" type="tel" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="age"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Âge *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="25" type="number" min="1" max="119" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="sport"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sport *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choisir..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-popover border border-border z-50">
                                            <SelectItem value="padel">Padel</SelectItem>
                                            <SelectItem value="tennis">Tennis</SelectItem>
                                            <SelectItem value="both">Padel + Tennis</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ville *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Tunis" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="club"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Club fréquenté (optionnel)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nom du club" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="consent"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel className="text-sm font-normal text-muted-foreground cursor-pointer">
                                        J'accepte que mes informations soient utilisées uniquement dans le cadre de l'étude d'intérêt pour la plateforme SPOVIO / MySmash. *
                                    </FormLabel>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Envoi en cours...
                            </>
                        ) : (
                            "Envoyer"
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    );
};

export default PlayerInterestForm;
