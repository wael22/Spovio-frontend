import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import Navbar from "@/components/common/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Loader2, User, Key, Camera, Mail, Phone, Save, X, Shield, Lock
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { authService, getAssetUrl } from "@/lib/api";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Profile = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { user, fetchUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    avatar: "",
  });

  // Load user data from AuthContext
  useEffect(() => {
    if (user) {
      const nameParts = user.name?.split(' ') || ['', ''];
      setProfile({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
      });
      console.log('Profile updated from user:', user);
      console.log('Avatar URL:', getAssetUrl(user.avatar || ''));
    }
  }, [user]);

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const updatedName = `${profile.firstName} ${profile.lastName}`.trim();

      await authService.updateProfile({
        name: updatedName,
        email: profile.email,
        phone: profile.phone,
      });

      await fetchUser();

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées avec succès.",
      });
      setIsEditing(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Impossible de mettre à jour le profil",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone: user?.phone || "",
    email: user?.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t('pages.profile.fileTooBig'),
        description: t('pages.profile.fileTooBigDesc'),
        variant: "destructive",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("avatar", file);
      await authService.updateAvatar(formData);
      await fetchUser();
      toast({
        title: t('pages.profile.avatarSuccess'),
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        title: t('pages.profile.error'),
        description: error.response?.data?.message || t('pages.profile.avatarUpdateError'),
        variant: "destructive",
      });
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.updateProfile({
        name: `${formData.first_name} ${formData.last_name}`,
        phone_number: formData.phone,
        email: formData.email
      });
      await fetchUser();
      toast({
        title: t('pages.profile.profileSuccess'),
      });
      setIsEditing(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        title: t('pages.profile.error'),
        description: error.response?.data?.message || t('pages.profile.profileUpdateError'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: t('pages.profile.passwordMismatch'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await authService.updatePassword({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });
      toast({
        title: t('pages.profile.passwordSuccess'),
      });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setIsChangingPassword(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        title: t('pages.profile.error'),
        description: error.response?.data?.message || t('pages.profile.passwordUpdateError'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClubInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.first_name); // Using first_name as club name
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('email', formData.email);
      // Club specific fields
      if (user?.role === 'club') {
        // Add address if available in state, currently mapped to standard profile fields
        // We might need to add address to initial state if it's missing
      }

      await authService.updateClubInfo(formDataToSend);
      await fetchUser();
      toast({
        title: "Informations du club mises à jour",
      });
      setIsEditing(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Impossible de mettre à jour les informations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const [clubData, setClubData] = useState({
    name: "",
    address: "",
    phone: "",
    email: ""
  });

  useEffect(() => {
    if (user?.role === 'club' && user.club) {
      setClubData({
        name: user.club.name || "",
        address: user.club.address || "",
        phone: user.club.phone_number || "",
        email: user.club.email || ""
      });
    }
  }, [user]);

  const handleClubLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t('pages.profile.fileTooBig'),
        description: t('pages.profile.fileTooBigDesc'),
        variant: "destructive",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("logo", file);
      // We use the same update endpoint but just for logo
      await authService.updateClubInfo(formData);
      await fetchUser();
      toast({
        title: "Logo mis à jour",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Impossible de mettre à jour le logo",
        variant: "destructive",
      });
    }
  };

  const handleSaveClubInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', clubData.name);
      formData.append('address', clubData.address);
      formData.append('phone', clubData.phone);
      formData.append('email', clubData.email);

      await authService.updateClubInfo(formData);
      await fetchUser();
      toast({
        title: "Informations du club enregistrées",
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Erreur lors de la mise à jour",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (user?.role === 'club') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar title="Profil Club" />

        <main className="pt-20 pb-12">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Retour au tableau de bord
              </button>
              <h1 className="text-3xl font-bold font-orbitron mb-2">
                <span className="gradient-text">Profil Club</span>
              </h1>
              <p className="text-muted-foreground">
                Gérez les informations de votre club
              </p>
            </motion.div>

            <div className="grid gap-8">
              {/* Club Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card border border-border/50 rounded-2xl p-6"
              >
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="relative group mx-auto md:mx-0">
                    <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                      <AvatarImage src={getAssetUrl(user.club?.logo || user.club?.overlays?.[0]?.image_url || '')} className="object-cover" />
                      <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                        {user.club?.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={handleAvatarClick}
                      className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleClubLogoChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  <div className="flex-1 w-full space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">
                          {user.club?.name}
                        </h2>
                        <div className="flex items-center gap-2 text-muted-foreground mt-1">
                          <Shield className="w-4 h-4 text-neon-green" />
                          <span className="text-sm">Club Vérifié</span>
                        </div>
                      </div>
                      <Button
                        variant={isEditing ? "ghost" : "outline"}
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        {isEditing ? t('pages.profile.cancel') : t('pages.profile.edit')}
                      </Button>
                    </div>

                    <form onSubmit={handleSaveClubInfo} className="grid gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" />
                          Nom du Club
                        </label>
                        <Input
                          value={clubData.name}
                          onChange={(e) => setClubData({ ...clubData, name: e.target.value })}
                          disabled={!isEditing}
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" />
                          Adresse
                        </label>
                        <Input
                          value={clubData.address}
                          onChange={(e) => setClubData({ ...clubData, address: e.target.value })}
                          disabled={!isEditing}
                          className="bg-background/50"
                          placeholder="Adresse complète"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Mail className="w-4 h-4 text-primary" />
                          Email de contact
                        </label>
                        <Input
                          value={clubData.email}
                          onChange={(e) => setClubData({ ...clubData, email: e.target.value })}
                          disabled={!isEditing}
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Phone className="w-4 h-4 text-primary" />
                          Téléphone
                        </label>
                        <Input
                          value={clubData.phone}
                          onChange={(e) => setClubData({ ...clubData, phone: e.target.value })}
                          disabled={!isEditing}
                          className="bg-background/50"
                        />
                      </div>

                      {isEditing && (
                        <div className="flex justify-end mt-4">
                          <Button type="submit" variant="neon" disabled={loading}>
                            {loading ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4 mr-2" />
                            )}
                            {loading ? t('pages.profile.saving') : t('pages.profile.save')}
                          </Button>
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              </motion.div>

              {/* Security Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card border border-border/50 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{t('pages.profile.changePassword')}</h2>
                    </div>
                  </div>
                  <Button
                    variant={isChangingPassword ? "ghost" : "outline"}
                    onClick={() => setIsChangingPassword(!isChangingPassword)}
                  >
                    {isChangingPassword ? t('pages.profile.cancel') : t('pages.profile.changePassword')}
                  </Button>
                </div>

                {isChangingPassword && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    onSubmit={handleUpdatePassword}
                    className="space-y-4 max-w-md"
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('pages.profile.currentPassword')}</label>
                      <Input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, currentPassword: e.target.value })
                        }
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('pages.profile.newPassword')}</label>
                      <Input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                        }
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('pages.profile.confirmPassword')}</label>
                      <Input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                        }
                        className="bg-background/50"
                      />
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button type="submit" variant="neon" disabled={loading}>
                        {loading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        {t('pages.profile.updatePassword')}
                      </Button>
                    </div>
                  </motion.form>
                )}
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar credits={user?.credits_balance || user?.credits || 0} />

      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold font-orbitron mb-2">
              <span className="gradient-text">{t('pages.profile.title')}</span>
            </h1>
            <p className="text-muted-foreground">
              {t('pages.profile.subtitle')}
            </p>
          </motion.div>

          <div className="grid gap-8">
            {/* Profile Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border/50 rounded-2xl p-6"
            >
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="relative group mx-auto md:mx-0">
                  <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                    <AvatarImage src={getAssetUrl(user?.avatar || '')} className="object-cover" />
                    <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                      {user?.first_name?.[0]}
                      {user?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={handleAvatarClick}
                    className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div className="flex-1 w-full space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">
                        {user?.first_name} {user?.last_name}
                      </h2>
                      <div className="flex items-center gap-2 text-muted-foreground mt-1">
                        <Shield className="w-4 h-4 text-neon-green" />
                        <span className="text-sm">{t('pages.profile.verifiedPlayer')}</span>
                      </div>
                    </div>
                    <Button
                      variant={isEditing ? "ghost" : "outline"}
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? t('pages.profile.cancel') : t('pages.profile.edit')}
                    </Button>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        {t('pages.profile.firstName')}
                      </label>
                      <Input
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        disabled={!isEditing}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        {t('pages.profile.lastName')}
                      </label>
                      <Input
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        disabled={!isEditing}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Mail className="w-4 h-4 text-primary" />
                        {t('pages.profile.email')}
                      </label>
                      <Input
                        value={formData.email}
                        disabled={true}
                        className="bg-background/50 opacity-70"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Phone className="w-4 h-4 text-primary" />
                        {t('pages.profile.phone')}
                      </label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!isEditing}
                        className="bg-background/50"
                      />
                    </div>

                    {isEditing && (
                      <div className="md:col-span-2 flex justify-end mt-4">
                        <Button type="submit" variant="neon" disabled={loading}>
                          {loading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          {loading ? t('pages.profile.saving') : t('pages.profile.save')}
                        </Button>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </motion.div>

            {/* Security Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border/50 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{t('pages.profile.changePassword')}</h2>
                  </div>
                </div>
                <Button
                  variant={isChangingPassword ? "ghost" : "outline"}
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                >
                  {isChangingPassword ? t('pages.profile.cancel') : t('pages.profile.changePassword')}
                </Button>
              </div>

              {isChangingPassword && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  onSubmit={handleUpdatePassword}
                  className="space-y-4 max-w-md"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('pages.profile.currentPassword')}</label>
                    <Input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('pages.profile.newPassword')}</label>
                    <Input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('pages.profile.confirmPassword')}</label>
                    <Input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                      className="bg-background/50"
                    />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button type="submit" variant="neon" disabled={loading}>
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {t('pages.profile.updatePassword')}
                    </Button>
                  </div>
                </motion.form>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
