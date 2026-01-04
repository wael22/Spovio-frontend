import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { videoService } from "@/lib/api";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { Button } from "@/components/ui/button";
import {
  Coins,
  CreditCard,
  Smartphone,
  Wallet,
  Check,
  Sparkles,
  Clock,
  Shield,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  price_dt?: number;
  original_price?: number;
  original_price_dt?: number;
  savings?: number;
  savings_dt?: number;
  currency: string;
  description: string;
  popular?: boolean;
  discount?: number;
  badge?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  available: boolean;
  delay?: string;
}

// Helper function to get icon for payment method
const getPaymentIcon = (methodId: string) => {
  switch (methodId) {
    case 'simulation':
      return Sparkles;
    case 'konnect':
      return Smartphone;
    case 'flouci':
      return Wallet;
    case 'card':
    case 'carte_bancaire':
      return CreditCard;
    default:
      return Wallet;
  }
};

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

const Credits = () => {
  const { user, refreshUser } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  // Load credit packages and payment methods from API
  useEffect(() => {
    const loadPackagesAndPaymentMethods = async () => {
      try {
        const [packagesRes, paymentRes] = await Promise.all([
          videoService.getCreditPackages(),
          videoService.getPaymentMethods(),
        ]);

        setPackages(packagesRes.data.packages || []);
        setPaymentMethods(paymentRes.data.payment_methods || []);

        // Set default payment method
        const defaultMethod = paymentRes.data.default_method || 'konnect';
        setSelectedPayment(defaultMethod);
      } catch (error: any) {
        console.error('Failed to load data:', error);
        if (error.response?.status !== 401) {
          toast.error('Impossible de charger les données');
        }
      } finally {
        setLoading(false);
      }
    };

    loadPackagesAndPaymentMethods();
  }, []);

  const handlePurchase = async () => {
    if (!selectedPackage) {
      toast.error("Veuillez sélectionner un pack de crédits");
      return;
    }
    if (!selectedPayment) {
      toast.error("Veuillez sélectionner une méthode de paiement");
      return;
    }

    setPurchasing(true);
    const pkg = packages.find(p => p.id === selectedPackage);

    try {
      // Backend expects package_id as string (e.g., "pack_5", "pack_10") 
      // not as a number
      const response = await videoService.buyCredits({
        package_id: selectedPackage,
        credits_amount: pkg?.credits,
        payment_method: selectedPayment,
        package_type: selectedPackage.startsWith('pack_') ? 'pack' : 'individual'
      });

      toast.success(`Achat de ${pkg?.credits} crédits réussi !`);

      // Refresh user data to update credits balance
      await refreshUser();

      // Reset selections
      setSelectedPackage(null);
      setSelectedPayment(null);
    } catch (error: any) {
      console.error('Purchase failed:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de l\'achat');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Chargement des packages...</p>
        </div>
      </div>
    );
  }

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
              <span className="gradient-text">Crédits</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Achetez des crédits pour débloquer vos vidéos
            </p>
          </motion.div>

          {/* Current Credits Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-card border border-border/50 mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Coins className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Système de Crédits MySmash</h2>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{user?.credits_balance || user?.credits || 0}</p>
                <p className="text-sm text-muted-foreground">Crédits disponibles</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-neon-green">20 DT</p>
                <p className="text-sm text-muted-foreground">Prix par crédit</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-accent">{packages.length}</p>
                <p className="text-sm text-muted-foreground">Packs disponibles</p>
              </div>
            </div>

            <Button variant="neon" className="w-full gap-2" onClick={() => {
              const element = document.getElementById('packages');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}>
              <Coins className="h-4 w-4" />
              Recharger mes crédits
            </Button>
          </motion.div>

          {/* Credit Packages */}
          <motion.div
            id="packages"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Coins className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Packages Disponibles</h2>
            </div>

            {packages.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                {packages.map((pkg) => (
                  <motion.button
                    key={pkg.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`relative p-6 rounded-2xl border text-left transition-all ${selectedPackage === pkg.id
                      ? "border-primary bg-primary/10 shadow-[0_0_30px_hsl(var(--primary)/0.2)]"
                      : "border-border/50 bg-card hover:border-primary/50"
                      }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                        Populaire
                      </span>
                    )}

                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-2xl font-bold">{pkg.credits} crédits</h3>
                      {pkg.badge && (
                        <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                          {pkg.badge}
                        </span>
                      )}
                    </div>

                    <div className="mb-2">
                      <p className="text-xl font-semibold text-primary">
                        {pkg.price_dt || pkg.price} {pkg.currency || 'DT'}
                      </p>
                      {(pkg.original_price_dt || pkg.original_price) && (
                        <p className="text-sm text-muted-foreground line-through">
                          {pkg.original_price_dt || pkg.original_price} {pkg.currency || 'DT'}
                        </p>
                      )}
                      {(pkg.savings_dt || pkg.savings) && (pkg.savings_dt || pkg.savings) > 0 && (
                        <p className="text-xs text-green-600 font-medium mt-1">
                          Économie: {pkg.savings_dt || pkg.savings} {pkg.currency || 'DT'}
                        </p>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground">{pkg.description}</p>

                    {selectedPackage === pkg.id && (
                      <div className="absolute top-4 right-4">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </motion.div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Aucun package disponible pour le moment
              </p>
            )}
          </motion.div>

          {/* Payment Methods */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-card border border-border/50"
          >
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">Méthodes de Paiement Sécurisées</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {paymentMethods.map((method) => {
                const IconComponent = getPaymentIcon(method.id);
                const isAvailable = method.enabled !== false;

                return (
                  <motion.button
                    key={method.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => isAvailable && setSelectedPayment(method.id)}
                    disabled={!isAvailable}
                    className={`p-4 rounded-xl border flex items-center justify-between transition-all ${selectedPayment === method.id
                      ? "border-primary bg-primary/10"
                      : "border-border/50 bg-background/50 hover:border-primary/50"
                      } ${!isAvailable && "opacity-50 cursor-not-allowed"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{method.name}</p>
                        <p className="text-xs text-muted-foreground">{method.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs ${isAvailable
                        ? "bg-neon-green/10 text-neon-green"
                        : "bg-muted text-muted-foreground"
                        }`}>
                        {isAvailable ? "Disponible" : "Bientôt"}
                      </span>
                      {method.processing_time && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-end">
                          <Clock className="h-3 w-3" />
                          {method.processing_time}
                        </p>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <Button
              variant="neon"
              className="w-full gap-2"
              onClick={handlePurchase}
              disabled={!selectedPackage || !selectedPayment || purchasing}
            >
              {purchasing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Traitement en cours...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Procéder au paiement
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Credits;

