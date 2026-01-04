import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "./NotificationBell";
import { UserDropdown } from "./UserDropdown";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  CreditCard,
  Video,
  Scissors,
  Building2,
  MessageSquare,
  Coins
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardNavbarProps {
  credits: number;
}

export function DashboardNavbar({ credits }: DashboardNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const navLinks = [
    { href: "/dashboard", label: "Mes Vidéos", icon: Video },
    { href: "/my-clips", label: "Mes Clips", icon: Scissors },
    { href: "/clubs", label: "Clubs", icon: Building2 },
    { href: "/support", label: "Support", icon: MessageSquare },
    { href: "/credits", label: "Crédits", icon: Coins },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center neon-glow-blue">
              <Video className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold font-orbitron gradient-text hidden sm:block">
              MySmash
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${isActive
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                    }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Credits Badge */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-accent/30"
            >
              <CreditCard className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-accent">{credits}</span>
            </motion.div>

            {/* Notifications */}
            <NotificationBell />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Dropdown */}
            <UserDropdown user={user ? { name: user.name, email: user.email, avatar: user.avatar } : undefined} />

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-border/50"
          >
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-card/50 transition-colors"
                >
                  <link.icon className="h-4 w-4 text-primary" />
                  {link.label}
                </Link>
              ))}

              {/* Mobile Credits */}
              <div className="flex items-center gap-2 px-4 py-2">
                <CreditCard className="h-4 w-4 text-accent" />
                <span className="text-sm font-semibold">{credits} crédits</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}


