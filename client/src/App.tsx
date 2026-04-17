import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { ReactElement } from "react";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import FeaturesPage from "./pages/Features";
import PricingPage from "./pages/Pricing";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import ForgotPasswordPage from "./pages/ForgotPassword";
import ResetPasswordPage from "./pages/ResetPassword";
import DashboardPage from "./pages/Dashboard";
import ResourcesPage from "./pages/Resources";
import AboutPage from "./pages/About";
import PortfolioHomePage from "./pages/portfolio/PortfolioHomePage.jsx";
import PortfolioGalleryPage from "./pages/portfolio/PortfolioGalleryPage.jsx";
import ClientProofingPage from "./pages/proofing/ClientProofingPage.jsx";
import ShopPage from "./pages/shop/ShopPage.jsx";
import CartPage from "./pages/shop/CartPage.jsx";
import CheckoutPage from "./pages/shop/CheckoutPage.jsx";
import OrderSuccessPage from "./pages/shop/OrderSuccessPage.jsx";
import OrderStatusPage from "./pages/shop/OrderStatusPage.jsx";
import SubscribePage from "./pages/subscriptions/SubscribePage.jsx";
import ManageSubscriptionPage from "./pages/subscriptions/ManageSubscriptionPage.jsx";
import SubscriptionSuccessPage from "./pages/subscriptions/SubscriptionSuccessPage.jsx";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: ReactElement }) => {
	const { isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return <div className="min-h-screen bg-background" />;
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	return children;
};

const App = () => (
	<QueryClientProvider client={queryClient}>
		<AuthProvider>
			<HelmetProvider>
				<BrowserRouter>
					<Routes>
						<Route path="/" element={<Index />} />
						<Route path="/features" element={<FeaturesPage />} />
						<Route path="/pricing" element={<PricingPage />} />
						<Route path="/login" element={<LoginPage />} />
						<Route path="/signup" element={<SignupPage />} />
						<Route path="/register" element={<SignupPage />} />
						<Route path="/forgot-password" element={<ForgotPasswordPage />} />
						<Route path="/reset-password" element={<ResetPasswordPage />} />
						<Route path="/resources" element={<ResourcesPage />} />
						<Route path="/about" element={<AboutPage />} />
						<Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
						<Route path="/dashboard/*" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
						<Route path="/p/:username" element={<PortfolioHomePage />} />
						<Route path="/p/:username/:slug" element={<PortfolioGalleryPage />} />
						<Route path="/shop/:photoId" element={<ShopPage />} />
						<Route path="/cart" element={<CartPage />} />
						<Route path="/checkout" element={<CheckoutPage />} />
						<Route path="/order-success" element={<OrderSuccessPage />} />
						<Route path="/order-status" element={<OrderStatusPage />} />
						<Route path="/proof/:token" element={<ClientProofingPage />} />
						<Route path="/subscribe/:username" element={<SubscribePage />} />
						<Route path="/subscribe/:username/manage" element={<ManageSubscriptionPage />} />
						<Route path="/subscribe/:username/success" element={<SubscriptionSuccessPage />} />
						<Route path="*" element={<NotFound />} />
					</Routes>
				</BrowserRouter>
			</HelmetProvider>
		</AuthProvider>
	</QueryClientProvider>
);

export default App;
