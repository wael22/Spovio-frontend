import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/hooks/useAuth";
import { TutorialProvider } from "@/contexts/TutorialContext";
import { TutorialOverlay } from "@/components/tutorial";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";

// Landing pages — lazy loaded
const Index = lazy(() => import("./pages/Index"));
const AIFeatures = lazy(() => import("./pages/AIFeatures"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Auth pages — lazy loaded
const Auth = lazy(() => import("./pages/Auth"));
const EmailVerification = lazy(() => import("./pages/EmailVerification"));
const GoogleAuthCallback = lazy(() => import("./pages/GoogleAuthCallback"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const PlayerInterest = lazy(() => import("./pages/PlayerInterest"));
const InterestDashboard = lazy(() => import("./pages/InterestDashboard"));

// Protected MySmash App pages — lazy loaded
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MyClips = lazy(() => import("./pages/MyClips"));
const Clubs = lazy(() => import("./pages/Clubs"));
const Credits = lazy(() => import("./pages/Credits"));
const Profile = lazy(() => import("./pages/Profile"));
const Support = lazy(() => import("./pages/Support"));
const Settings = lazy(() => import("./pages/Settings"));

// Admin & Club pages — lazy loaded
const Admin = lazy(() => import("./pages/Admin"));
const Club = lazy(() => import("./pages/Club"));
const SuperAdminLogin = lazy(() => import("./pages/SuperAdminLogin"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <TutorialProvider>
              {/* Tutorial Overlay - rendered globally for all routes */}
              <TutorialOverlay />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Spovio Landing Pages */}
                  <Route path="/" element={<Index />} />
                  <Route path="/ai-features" element={<AIFeatures />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />

                  {/* Authentication */}
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/verify-email" element={<EmailVerification />} />
                  <Route path="/google-auth-callback" element={<GoogleAuthCallback />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/super-secret-login" element={<SuperAdminLogin />} />
                  <Route path="/player-interest" element={<PlayerInterest />} />
                  <Route path="/interest-dashboard" element={<InterestDashboard />} />

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
                  <Route element={<DashboardLayout />}>
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
                        <ProtectedRoute requiredRole={['player', 'club', 'super_admin']}>
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
                  </Route>

                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </TutorialProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
