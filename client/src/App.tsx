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
import DashboardHome from "./pages/dashboard/DashboardHome";
import GalleryOrganizerPage from "./pages/dashboard/GalleryOrganizerPage";
import GalleryEditorPage from "./pages/dashboard/GalleryEditorPage";
import UploadManagerPage from "./pages/dashboard/UploadManagerPage";
import PhotoDetailsPage from "./pages/dashboard/PhotoDetailsPage";
import ClientProofingAdminPage from "./pages/dashboard/ClientProofingAdminPage";
import PricingEditorPage from "./pages/dashboard/PricingEditorPage";
import AccountSettingsPage from "./pages/dashboard/AccountSettingsPage";
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

          <Route path="/dashboard" element={<ProtectedRoute><DashboardHome /></ProtectedRoute>} />
          <Route path="/dashboard/galleries" element={<ProtectedRoute><GalleryOrganizerPage /></ProtectedRoute>} />
          <Route path="/dashboard/galleries/:id/edit" element={<ProtectedRoute><GalleryEditorPage /></ProtectedRoute>} />
          <Route path="/dashboard/galleries/:id/upload" element={<ProtectedRoute><UploadManagerPage /></ProtectedRoute>} />
          <Route path="/dashboard/photos/:id" element={<ProtectedRoute><PhotoDetailsPage /></ProtectedRoute>} />
          <Route path="/dashboard/proofing" element={<ProtectedRoute><ClientProofingAdminPage /></ProtectedRoute>} />
          <Route path="/dashboard/pricing" element={<ProtectedRoute><PricingEditorPage /></ProtectedRoute>} />
          <Route path="/dashboard/settings" element={<ProtectedRoute><AccountSettingsPage /></ProtectedRoute>} />

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
