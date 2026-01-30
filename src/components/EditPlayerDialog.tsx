
import { useState } from "react";
// import { supabase } from "@/integrations/supabase/client"; // Removed for Vercel version
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
// import { useToast } from "@/components/ui/use-toast"; // Using sonner in new project maybe? Or use existing hook if available.
import { toast } from "sonner"; // Using sonner as seen in PlayerInterestForm
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";

const formSchema = z.object({
    first_name: z.string().min(2, "Le prénom doit faire au moins 2 caractères"),
    last_name: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
    sport: z.enum(["padel", "tennis"]),
    city: z.string().min(2, "La ville doit faire au moins 2 caractères"),
});

interface Player {
    id: string;
    first_name: string;
    last_name: string;
    sport: "padel" | "tennis";
    city: string;
}

interface EditPlayerDialogProps {
    player: Player | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

const EditPlayerDialog = ({ player, open, onOpenChange, onSuccess }: EditPlayerDialogProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            sport: "padel",
            city: "",
        },
        values: player ? {
            first_name: player.first_name,
            last_name: player.last_name,
            sport: player.sport,
            city: player.city,
        } : undefined,
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!player) return;

        setIsSubmitting(true);
        try {
            // TODO: Implement update via API
            // const { error } = await supabase
            //     .from("player_interest")
            //     .update(values)
            //     .eq("id", player.id);

            // if (error) throw error;

            console.log("Update requested for", values);
            toast.info("La modification n'est pas encore activée sur ce dashboard public.");

            // toast.success("Le joueur a été modifié avec succès.");
            // onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Error updating player:", error);
            toast.error("Une erreur est survenue lors de la modification.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Modifier le joueur</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="first_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Prénom</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="last_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
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
                                    <FormLabel>Sport</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selectionner un sport" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="z-50 bg-popover">
                                            <SelectItem value="padel">Padel</SelectItem>
                                            <SelectItem value="tennis">Tennis</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ville</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default EditPlayerDialog;
