import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import useAuthStore from "./store/authStore";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import FeaturesPage from "./pages/Features.tsx";
import PricingPage from "./pages/Pricing.tsx";
import LoginPage from "./pages/Login.tsx";
import SignupPage from "./pages/Signup.tsx";
import ForgotPasswordPage from "./pages/ForgotPassword.tsx";
import ResourcesPage from "./pages/Resources.tsx";
import DashboardPage from "./pages/Dashboard.tsx";
import PortfolioHomePage from "./pages/portfolio/PortfolioHomePage";
import PortfolioGalleryPage from "./pages/portfolio/PortfolioGalleryPage";
import ClientProofingPage from "./pages/proofing/ClientProofingPage";
import ShopPage from "./pages/shop/ShopPage";
import CartPage from "./pages/shop/CartPage";
import CheckoutPage from "./pages/shop/CheckoutPage";
import OrderSuccessPage from "./pages/shop/OrderSuccessPage";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = useAuthStore((s: any) => s.isAuthenticated);
  const token = useAuthStore((s: any) => s.token);
  const hasHydrated = useAuthStore((s: any) => s.hasHydrated);

  if (!hasHydrated) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/register" element={<Navigate to="/signup" replace />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/resources" element={<ResourcesPage />} />

          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/*" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

          <Route path="/p/:username" element={<PortfolioHomePage />} />
          <Route path="/p/:username/:slug" element={<PortfolioGalleryPage />} />
          <Route path="/proof/:token" element={<ClientProofingPage />} />

          <Route path="/shop/:photoId" element={<ShopPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
