import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";

// Landing pages
import Index from "./pages/Index";
import AIFeatures from "./pages/AIFeatures";
import HowItWorks from "./pages/HowItWorks";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

// Auth pages
import Auth from "./pages/Auth";
import EmailVerification from "./pages/EmailVerification";
import GoogleAuthCallback from "./pages/GoogleAuthCallback";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// ...

// Protected MySmash App pages
import Dashboard from './pages/Dashboard';
import MyClips from './pages/MyClips';
import Clubs from './pages/Clubs';
import Credits from './pages/Credits';
import Profile from './pages/Profile';
import Support from './pages/Support';
import Settings from './pages/Settings';

// Admin & Club pages
import Admin from './pages/Admin';
import Club from './pages/Club';
import SuperAdminLogin from './pages/SuperAdminLogin';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Spovio Landing Pages */}
              <Route path="/" element={<Index />} />
              <Route path="/ai-features" element={<AIFeatures />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />

              {/* Authentication */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/verify-email" element={<EmailVerification />} />
              <Route path="/google-auth-callback" element={<GoogleAuthCallback />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/super-secret-login" element={<SuperAdminLogin />} />

              {/* Protected Admin & Club Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="super_admin">
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/club"
                element={
                  <ProtectedRoute requiredRole="club">
                    <Club />
                  </ProtectedRoute>
                }
              />

              {/* Protected MySmash App Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requiredRole="player">
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-clips"
                element={
                  <ProtectedRoute requiredRole="player">
                    <MyClips />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clubs"
                element={
                  <ProtectedRoute requiredRole="player">
                    <Clubs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/credits"
                element={
                  <ProtectedRoute requiredRole="player">
                    <Credits />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute requiredRole="player">
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/support"
                element={
                  <ProtectedRoute requiredRole="player">
                    <Support />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute requiredRole="player">
                    <Settings />
                  </ProtectedRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

