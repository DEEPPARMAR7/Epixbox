import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import FeaturesPage from "./pages/Features.tsx";
import PricingPage from "./pages/Pricing.tsx";
import LoginPage from "./pages/Login.tsx";
import SignupPage from "./pages/Signup.tsx";
import ForgotPasswordPage from "./pages/ForgotPassword.tsx";
import DashboardPage from "./pages/Dashboard.tsx";
import ResourcesPage from "./pages/Resources.tsx";
import AboutPage from "./pages/About.tsx";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
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
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Index />} />
					<Route path="/features" element={<FeaturesPage />} />
					<Route path="/pricing" element={<PricingPage />} />
					<Route path="/login" element={<LoginPage />} />
					<Route path="/signup" element={<SignupPage />} />
					<Route path="/register" element={<SignupPage />} />
					<Route path="/forgot-password" element={<ForgotPasswordPage />} />
					<Route path="/resources" element={<ResourcesPage />} />
<Route path="/about" element={<AboutPage />} />
					<Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
					<Route path="/dashboard/*" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
					<Route path="*" element={<NotFound />} />
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	</QueryClientProvider>
);

export default App;
