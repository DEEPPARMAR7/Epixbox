import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'

// Public pages
import LandingPage from './pages/public/LandingPage'
import LoginPage from './pages/public/LoginPage'
import RegisterPage from './pages/public/RegisterPage'

// Dashboard pages
import DashboardHome from './pages/dashboard/DashboardHome'
import GalleryOrganizerPage from './pages/dashboard/GalleryOrganizerPage'
import GalleryEditorPage from './pages/dashboard/GalleryEditorPage'
import UploadManagerPage from './pages/dashboard/UploadManagerPage'
import PhotoDetailsPage from './pages/dashboard/PhotoDetailsPage'
import ClientProofingAdminPage from './pages/dashboard/ClientProofingAdminPage'
import PricingEditorPage from './pages/dashboard/PricingEditorPage'
import AccountSettingsPage from './pages/dashboard/AccountSettingsPage'

// Portfolio pages
import PortfolioHomePage from './pages/portfolio/PortfolioHomePage'
import PortfolioGalleryPage from './pages/portfolio/PortfolioGalleryPage'

// Proofing
import ClientProofingPage from './pages/proofing/ClientProofingPage'

// Shop pages
import ShopPage from './pages/shop/ShopPage'
import CartPage from './pages/shop/CartPage'
import CheckoutPage from './pages/shop/CheckoutPage'
import OrderSuccessPage from './pages/shop/OrderSuccessPage'

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function NotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-200">404</h1>
        <p className="text-xl text-gray-600 mt-4">Page not found</p>
        <a href="/" className="mt-6 inline-block text-indigo-600 hover:underline">Go home</a>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Dashboard */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardHome /></ProtectedRoute>} />
      <Route path="/dashboard/galleries" element={<ProtectedRoute><GalleryOrganizerPage /></ProtectedRoute>} />
      <Route path="/dashboard/galleries/:id/edit" element={<ProtectedRoute><GalleryEditorPage /></ProtectedRoute>} />
      <Route path="/dashboard/galleries/:id/upload" element={<ProtectedRoute><UploadManagerPage /></ProtectedRoute>} />
      <Route path="/dashboard/photos/:id" element={<ProtectedRoute><PhotoDetailsPage /></ProtectedRoute>} />
      <Route path="/dashboard/proofing" element={<ProtectedRoute><ClientProofingAdminPage /></ProtectedRoute>} />
      <Route path="/dashboard/pricing" element={<ProtectedRoute><PricingEditorPage /></ProtectedRoute>} />
      <Route path="/dashboard/settings" element={<ProtectedRoute><AccountSettingsPage /></ProtectedRoute>} />

      {/* Public Portfolio */}
      <Route path="/p/:username" element={<PortfolioHomePage />} />
      <Route path="/p/:username/:slug" element={<PortfolioGalleryPage />} />

      {/* Client Proofing (token-based) */}
      <Route path="/proof/:token" element={<ClientProofingPage />} />

      {/* Shop */}
      <Route path="/shop/:photoId" element={<ShopPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/order-success" element={<OrderSuccessPage />} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
