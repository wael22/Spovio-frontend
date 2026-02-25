import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MapPin, Users, Heart, Loader2, Phone } from "lucide-react";
import { toast } from "sonner";
import { playerService, getAssetUrl } from "@/lib/api";
import { useTranslation } from "react-i18next";

interface Club {
  id: number;
  name: string;
  logo?: string;
  address?: string;
  phone_number?: string;
  location?: string;
  member_count?: number;
  followers_count?: number; // Backend returns this
  is_followed: boolean;
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
  const { t } = useTranslation();
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [followingId, setFollowingId] = useState<number | null>(null);

  useEffect(() => {
    const loadClubs = async () => {
      try {
        setLoading(true);
        // Load both lists in parallel
        const [availableRes, followedRes] = await Promise.all([
          playerService.getAvailableClubs(),
          playerService.getFollowedClubs(),
        ]);

        const followed = followedRes.data.clubs || [];
        const available = availableRes.data.clubs || [];

        const newFollowedIds = new Set<number>(followed.map((c: Club) => c.id));

        const mergedClubs = [
          ...followed.map((c: Club) => ({ ...c, is_followed: true })),
          ...available.filter((c: Club) => !newFollowedIds.has(c.id)).map((c: Club) => ({ ...c, is_followed: false }))
        ];
        setClubs(mergedClubs);
      } catch (error: any) {
        console.error('Failed to load clubs:', error);
        if (error.response?.status !== 401) {
          toast.error(t('pages.clubs.loadError'));
        }
      } finally {
        setLoading(false);
      }
    };

    loadClubs();
  }, [t]);

  const handleFollow = async (clubId: number, currentStatus: boolean) => {
    setFollowingId(clubId);
    try {
      if (currentStatus) {
        await playerService.unfollowClub(clubId.toString());
        toast.success(t('pages.clubs.unfollowSuccess'));
      } else {
        await playerService.followClub(clubId.toString());
        toast.success(t('pages.clubs.followSuccess'));
      }

      // Update local state
      setClubs(clubs.map(club =>
        club.id === clubId ? { ...club, is_followed: !currentStatus } : club
      ));
    } catch (error) {
      console.error('Failed to update follow status:', error);
      toast.error(t('pages.clubs.error'));
    } finally {
      setFollowingId(null);
    }
  };

  const filteredClubs = clubs.filter(club =>
    club.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (club.address || club.location)?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl lg:text-4xl font-bold font-orbitron mb-2">
            <span className="gradient-text">{t('pages.clubs.title')}</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('pages.clubs.subtitle')}
          </p>
        </motion.div>

        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('pages.clubs.searchPlaceholder')}
            className="pl-10 bg-card border-border/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Clubs Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredClubs.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-xl font-semibold">
              <Users className="h-5 w-5 text-primary" />
              <h2>{t('pages.clubs.allClubs')}</h2>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredClubs.map((club) => (
                <motion.div
                  key={club.id}
                  variants={itemVariants}
                  className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary/20 bg-background">
                          <AvatarImage
                            src={club.logo ? getAssetUrl(club.logo) : undefined}
                            alt={club.name}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                            {club.name?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                            {club.name}
                          </h3>
                          {(club.address || club.location) && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3" />
                              <span className="line-clamp-1">{club.address || club.location}</span>
                            </div>
                          )}
                          {club.phone_number && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                              <Phone className="h-3 w-3" />
                              <span className="text-xs">{club.phone_number}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="text-xs opacity-70">
                          {t('pages.clubs.createdOn')} {new Date(club.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      <Button
                        variant={club.is_followed ? "outline" : "neon"}
                        size="sm"
                        className={club.is_followed ? "border-primary text-primary hover:bg-primary/10" : ""}
                        onClick={() => handleFollow(club.id, club.is_followed)}
                        disabled={followingId === club.id}
                      >
                        {followingId === club.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : club.is_followed ? (
                          <>
                            <Heart className="h-4 w-4 mr-2 fill-current" />
                            {t('pages.clubs.followed')}
                          </>
                        ) : (
                          <>
                            <Heart className="h-4 w-4 mr-2" />
                            {t('pages.clubs.follow')}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? t('pages.clubs.noClubsFound') : t('pages.clubs.noClubsAvailable')}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default Clubs;
