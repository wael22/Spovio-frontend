
import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
// import { supabase } from "@/integrations/supabase/client";
// import { useToast } from "@/components/ui/use-toast";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import EditPlayerDialog from "./EditPlayerDialog";

interface Player {
    id: string;
    first_name: string;
    last_name: string;
    sport: "padel" | "tennis";
    city: string;
}

interface PlayersTableProps {
    players: Player[];
    onUpdate: () => void;
    isAuthenticated: boolean;
}

const PlayersTable = ({ players, onUpdate, isAuthenticated }: PlayersTableProps) => {
    const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
    const [deletingPlayerId, setDeletingPlayerId] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!deletingPlayerId) return;

        try {
            // TODO: Implement delete API
            // const { error } = await supabase
            //   .from("player_interest")
            //   .delete()
            //   .eq("id", deletingPlayerId);

            // if (error) throw error;

            toast.info("La suppression n'est pas activée sur ce dashboard public.");

            // onUpdate();
        } catch (error) {
            console.error("Error deleting player:", error);
            toast.error("Impossible de supprimer le joueur.");
        } finally {
            setDeletingPlayerId(null);
        }
    };

    if (players.length === 0) {
        return (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
                <p className="text-muted-foreground">Aucun joueur inscrit pour le moment.</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-card border border-border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold">Nom</TableHead>
                            <TableHead className="font-semibold">Prénom</TableHead>
                            <TableHead className="font-semibold">Sport</TableHead>
                            <TableHead className="font-semibold">Ville</TableHead>
                            {isAuthenticated && <TableHead className="font-semibold text-right">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {players.map((player) => (
                            <TableRow key={player.id}>
                                <TableCell className="font-medium">{player.last_name}</TableCell>
                                <TableCell>{player.first_name}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                    >
                                        {player.sport === "padel" ? "Padel" : "Tennis"}
                                    </Badge>
                                </TableCell>
                                <TableCell>{player.city}</TableCell>
                                {isAuthenticated && (
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setEditingPlayer(player)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => setDeletingPlayerId(player.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <EditPlayerDialog
                player={editingPlayer}
                open={!!editingPlayer}
                onOpenChange={(open) => !open && setEditingPlayer(null)}
                onSuccess={onUpdate}
            />

            <AlertDialog open={!!deletingPlayerId} onOpenChange={(open) => !open && setDeletingPlayerId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. Cela supprimera définitivement le joueur de la base de données.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default PlayersTable;
