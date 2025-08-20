import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { initializeSmartPlatform } from "./utils/smartPlatform";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Catalog from "./pages/Catalog";
import Categories from "./pages/Categories";
import Pricing from "./pages/Pricing";
import Creators from "./pages/Creators";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Subscribe from "./pages/Subscribe";
import Premium from "./pages/Premium";
import BetweenHeavenHell from "./pages/BetweenHeavenHell";
import Dashboard from "./pages/Dashboard";
import Series from "./pages/Series";
import Category from "./pages/Category";
import CreatorPortal from "./pages/CreatorPortal";
import CreatorLogin from "./pages/CreatorLogin";
import CreatorPayments from "./pages/CreatorPayments";
import ContentCreator from "./pages/ContentCreator";
import SmartDashboard from "./pages/SmartDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CreatorTerms from "./pages/CreatorTerms";
import ForgotPassword from "./pages/ForgotPassword";
import Welcome from "./pages/Welcome";
import UserDashboard from "./pages/UserDashboard";
import SubscriberDashboard from "./pages/SubscriberDashboard";
import EditProfile from "./pages/EditProfile";
import PaymentHistory from "./pages/PaymentHistory";
import PublicCatalog from "./pages/PublicCatalog";
import VisitorLanding from "./pages/VisitorLanding";
import CreatorDashboard from "./pages/CreatorDashboard";
import Watch from "./pages/Watch";
import SeriesDetail from "./pages/SeriesDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import VisitorDashboard from "./pages/VisitorDashboard";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";
import PaymentOptions from "./pages/PaymentOptions";
import ContentInfo from "./pages/ContentInfo";
import PasswordRecovery from "./pages/PasswordRecovery";
import AreaSelection from "./pages/AreaSelection";
import PlatformAnalytics from "./pages/PlatformAnalytics";
import EmailConfirmed from "./pages/EmailConfirmed";

const queryClient = new QueryClient();

// Initialize smart platform
initializeSmartPlatform();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* Rotas públicas */}
              <Route path="/visitor" element={<VisitorLanding />} />
              <Route path="/public-catalog" element={<PublicCatalog />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/premium" element={<Premium />} />
              <Route path="/creators" element={<Creators />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/password-recovery" element={<PasswordRecovery />} />
              <Route path="/confirmed" element={<EmailConfirmed />} />
              <Route path="/area-selection" element={<AreaSelection />} />
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/subscribe" element={<Subscribe />} />

              {/* Rotas protegidas - Usuários Básicos */}
              <Route
                path="/user-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-profile"
                element={
                  <ProtectedRoute
                    allowedRoles={["user", "subscriber", "creator", "admin"]}
                  >
                    <EditProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment-history"
                element={
                  <ProtectedRoute allowedRoles={["subscriber", "admin"]}>
                    <PaymentHistory />
                  </ProtectedRoute>
                }
              />

              {/* Rotas protegidas - Assinantes */}
              <Route
                path="/subscriber-dashboard"
                element={
                  <ProtectedRoute
                    allowedRoles={["subscriber"]}
                    requireSubscription={true}
                  >
                    <SubscriberDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/between-heaven-hell"
                element={
                  <ProtectedRoute
                    allowedRoles={["subscriber"]}
                    requireSubscription={true}
                  >
                    <BetweenHeavenHell />
                  </ProtectedRoute>
                }
              />
              {/* Smart Dashboard Router */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute
                    allowedRoles={["subscriber", "creator", "admin", "user"]}
                  >
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Visitor Dashboard (Public) */}
              <Route path="/visitor-dashboard" element={<VisitorDashboard />} />

              {/* Role-specific Dashboards */}
              <Route
                path="/user-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subscriber-dashboard"
                element={
                  <ProtectedRoute
                    allowedRoles={["subscriber"]}
                    requireSubscription={true}
                  >
                    <SubscriberDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/creator-dashboard"
                element={
                  <ProtectedRoute
                    allowedRoles={["creator"]}
                    requireApproval={true}
                  >
                    <CreatorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/series" element={<Series />} />
              <Route path="/category/:categoryId" element={<Category />} />
              <Route
                path="/watch/:contentId"
                element={
                  <ProtectedRoute
                    allowedRoles={["subscriber"]}
                    requireSubscription={true}
                  >
                    <Watch />
                  </ProtectedRoute>
                }
              />
              <Route path="/series/:seriesId" element={<SeriesDetail />} />

              {/* Rotas protegidas - Criadores */}
              <Route
                path="/creator-dashboard"
                element={
                  <ProtectedRoute
                    allowedRoles={["creator"]}
                    requireApproval={true}
                  >
                    <CreatorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/creator-portal"
                element={
                  <ProtectedRoute
                    allowedRoles={["creator"]}
                    requireApproval={true}
                  >
                    <CreatorPortal />
                  </ProtectedRoute>
                }
              />
              <Route path="/creator-login" element={<CreatorLogin />} />
              <Route
                path="/creator-payments"
                element={
                  <ProtectedRoute
                    allowedRoles={["creator"]}
                    requireApproval={true}
                  >
                    <CreatorPayments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/content-creator"
                element={
                  <ProtectedRoute
                    allowedRoles={["creator"]}
                    requireApproval={true}
                  >
                    <ContentCreator />
                  </ProtectedRoute>
                }
              />

              {/* Rotas protegidas - Admin */}
              <Route
                path="/smart-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <SmartDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/creator-terms" element={<CreatorTerms />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/content/:id" element={<ContentInfo />} />
              <Route path="/payment-options" element={<PaymentOptions />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-cancelled" element={<PaymentCancelled />} />
              <Route
                path="/platform-analytics"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PlatformAnalytics />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
