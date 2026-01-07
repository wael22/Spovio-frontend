import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Building2,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Heart,
  Search,
  Loader2,
} from "lucide-react";
import { playerService } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Club {
  id: number;
  name: string;
  address?: string;
  phone_number?: string;
  email: string;
  created_at: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

const Clubs = () => {
  const { user } = useAuth();
  const [allClubs, setAllClubs] = useState<Club[]>([]);
  const [followedIds, setFollowedIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      setLoading(true);
      setError("");

      // Load both lists in parallel
      const [availableRes, followedRes] = await Promise.all([
        playerService.getAvailableClubs(),
        playerService.getFollowedClubs(),
      ]);

      const followed = followedRes.data.clubs || [];
      const available = availableRes.data.clubs || [];

      //  Create Set of followed club IDs for quick lookup
      const newFollowedIds = new Set<number>(followed.map((c: Club) => c.id));
      setFollowedIds(newFollowedIds);

      // Combine both lists without duplicates
      const combinedClubs = [...followed, ...available.filter((c: Club) => !newFollowedIds.has(c.id))];
      setAllClubs(combinedClubs);
    } catch (err: any) {
      console.error('Error loading clubs:', err);
      setError('Erreur lors du chargement des clubs');
      toast.error('Impossible de charger les clubs');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (clubId: number, isCurrentlyFollowing: boolean) => {
    try {
      if (isCurrentlyFollowing) {
        await playerService.unfollowClub(clubId.toString());
        toast.success("Club retiré de vos favoris");
      } else {
        await playerService.followClub(clubId.toString());
        toast.success("Club ajouté à vos favoris");
      }

      // Reload data to update UI
      await loadClubs();
    } catch (err: any) {
      console.error('Error toggling follow:', err);
      toast.error('Une erreur est survenue');
      // Reload even on error to resync UI
      await loadClubs();
    }
  };

  const filteredClubs = allClubs.filter((club) =>
    club.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar credits={user?.credits_balance || user?.credits || 0} />

      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl lg:text-4xl font-bold font-orbitron mb-2">
              <span className="gradient-text">Clubs</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Suivez vos clubs préférés
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un club..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card/50 border-border/50"
              />
            </div>
          </motion.div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Section Title */}
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-semibold mb-6"
              >
                Tous les Clubs ({filteredClubs.length})
              </motion.h2>

              {/* Clubs Grid */}
              {filteredClubs.length > 0 ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filteredClubs.map((club) => {
                    const isFollowing = followedIds.has(club.id);

                    return (
                      <motion.div
                        key={club.id}
                        variants={itemVariants}
                        className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="font-semibold text-lg">{club.name}</h3>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${isFollowing
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                            }`}>
                            {isFollowing ? "Suivi" : "Non suivi"}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="space-y-2 mb-4">
                          {club.address && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{club.address}</span>
                            </div>
                          )}
                          {club.phone_number && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-4 w-4" />
                              <span>{club.phone_number}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span>{club.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Créé le {formatDate(club.created_at)}</span>
                          </div>
                        </div>

                        {/* Action */}
                        <Button
                          variant={isFollowing ? "ghost" : "neon"}
                          className="w-full gap-2"
                          onClick={() => handleFollowToggle(club.id, isFollowing)}
                        >
                          <Heart className={`h-4 w-4 ${isFollowing ? "" : "fill-current"}`} />
                          {isFollowing ? "Ne plus suivre" : "Suivre"}
                        </Button>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <Building2 className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground text-lg">
                    {searchQuery ? "Aucun club trouvé" : "Aucun club disponible"}
                  </p>
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Clubs;
