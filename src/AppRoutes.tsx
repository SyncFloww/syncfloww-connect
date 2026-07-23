import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Index from "./pages/Index";
import DashboardPage from "./pages/DashboardPage";
import Generate from "./pages/Generate";
import MyProjects from "./pages/MyProjects";
import IdeaGenerator from "./pages/IdeaGenerator";
import Templates from "./pages/Templates";
import AITools from "./pages/AITools";
import Settings from "./pages/Settings";
import Welcome from "./pages/Welcome";
import BrandManagement from "./pages/BrandManagement";
import Customers from "./pages/Customers";
import Referral from "./pages/Referral";
import NotFound from "./pages/NotFound";
import { InstallPrompt } from "./components/InstallPrompt";
import { WorkspaceProvider } from "./contexts/WorkspaceContext";
import Onboarding from "./pages/Onboarding";
import { ThemeProvider } from "@/contexts/ThemeContext";

const QA_MODE = import.meta.env.VITE_QA_MODE === "true";
const QA_BYPASS_PATHS = ["/customers", "/brand-management", "/brands"];

if (
  typeof window !== "undefined" &&
  QA_MODE &&
  import.meta.env.VITE_QA_TEST_TOKEN &&
  !localStorage.getItem("access_token")
) {
  localStorage.setItem("access_token", import.meta.env.VITE_QA_TEST_TOKEN as string);
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (
    QA_MODE &&
    typeof window !== "undefined" &&
    QA_BYPASS_PATHS.some((p) => window.location.pathname.startsWith(p))
  ) {
    return <>{children}</>;
  }
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

function InnerRoutes() {
  const { loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <img src="/Icon.png" alt="SyncFloww" className="w-12 h-12 mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/auth/login" element={<Auth />} />
      <Route path="/auth/register" element={<Navigate to="/auth?mode=signup" replace />} />
      <Route path="/auth/forgot-password" element={<Auth />} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />
      <Route path="/auth/verify-email" element={<VerifyEmail />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
      <Route
        path="/welcome"
        element={
          <ProtectedRoute>
            <Welcome />
          </ProtectedRoute>
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/generate" element={<Generate />} />
        <Route path="/ai-studio" element={<Generate />} />
        <Route path="/my-projects" element={<MyProjects />} />
        <Route path="/content" element={<MyProjects />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/referrals" element={<Referral />} />
        <Route path="/calendar" element={<DashboardPage />} />
        <Route path="/analytics" element={<DashboardPage />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/ai-tools" element={<AITools />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/brands" element={<BrandManagement />} />
        <Route path="/brand-management" element={<BrandManagement />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}



import { useSyncExternalStore } from "react";
function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function AppRoutes() {
  const hydrated = useHydrated();
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <img
            src="/Icon.png"
            alt="SyncFloww"
            className="w-12 h-12 mx-auto mb-4 animate-pulse"
          />
        </div>
      </div>
    );
  }
  return (
    <ThemeProvider>
      <BrowserRouter>
        <WorkspaceProvider>
          <InnerRoutes />
          <InstallPrompt />
        </WorkspaceProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

