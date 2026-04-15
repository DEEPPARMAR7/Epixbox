import { Navigate, Route, Routes } from "react-router-dom";

import DashboardHome from "./dashboard/DashboardHome.jsx";
import GalleryOrganizerPage from "./dashboard/GalleryOrganizerPage.jsx";
import GalleryEditorPage from "./dashboard/GalleryEditorPage.jsx";
import UploadManagerPage from "./dashboard/UploadManagerPage.jsx";
import PhotoDetailsPage from "./dashboard/PhotoDetailsPage.jsx";
import ClientProofingAdminPage from "./dashboard/ClientProofingAdminPage.jsx";
import PricingEditorPage from "./dashboard/PricingEditorPage.jsx";
import AccountSettingsPage from "./dashboard/AccountSettingsPage.jsx";
import EditProfilePage from "./dashboard/EditProfilePage.jsx";
import AdminPanelPage from "./dashboard/AdminPanelPage.jsx";
import PaymentsPage from "./dashboard/PaymentsPage.jsx";
import SubscriptionPlansPage from "./dashboard/SubscriptionPlansPage.jsx";
import AnalyticsPage from "./dashboard/AnalyticsPage.jsx";

const DashboardPage = () => {
  return (
    <Routes>
      <Route index element={<DashboardHome />} />
      <Route path="galleries" element={<GalleryOrganizerPage />} />
      <Route path="organize" element={<GalleryOrganizerPage />} />
      <Route path="galleries/:id/edit" element={<GalleryEditorPage />} />
      <Route path="galleries/:id/upload" element={<UploadManagerPage />} />
      <Route path="photos/:id" element={<PhotoDetailsPage />} />
      <Route path="proofing" element={<ClientProofingAdminPage />} />
      <Route path="pricing" element={<PricingEditorPage />} />
      <Route path="payments" element={<PaymentsPage />} />
      <Route path="subscriptions" element={<SubscriptionPlansPage />} />
      <Route path="analytics" element={<AnalyticsPage />} />
      <Route path="settings" element={<AccountSettingsPage />} />
      <Route path="profile" element={<EditProfilePage />} />
      <Route path="admin" element={<AdminPanelPage />} />

      {/* Legacy aliases to keep old links working */}
      <Route path="photos" element={<Navigate to="/dashboard/galleries" replace />} />
      <Route path="website" element={<Navigate to="/dashboard/settings" replace />} />
      <Route path="sales" element={<Navigate to="/dashboard/pricing" replace />} />
      <Route path="clients" element={<Navigate to="/dashboard/proofing" replace />} />
      <Route path="insights" element={<Navigate to="/dashboard/analytics" replace />} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default DashboardPage;
