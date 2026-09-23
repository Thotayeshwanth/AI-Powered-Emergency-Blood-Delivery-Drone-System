import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useSettingsStore } from './store/useSettingsStore';
import { useSimulationTicker } from './hooks/useSimulationTicker';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BloodRequestsPage from './pages/BloodRequestsPage';
import NewBloodRequestPage from './pages/NewBloodRequestPage';
import BloodInventoryPage from './pages/BloodInventoryPage';
import DroneTrackingPage from './pages/DroneTrackingPage';
import TemperatureMonitoringPage from './pages/TemperatureMonitoringPage';
import DeliveriesPage from './pages/DeliveriesPage';
import DeliveryDetailPage from './pages/DeliveryDetailPage';
import DeliveryHistoryPage from './pages/DeliveryHistoryPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';

// Protected Route Guard
function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  // Activate background drone telemetry and temperature tick engine
  useSimulationTicker();

  const darkMode = useSettingsStore((state) => state.darkMode);

  // Sync dark mode class on mount and update
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Authenticated Dashboard Shell */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="blood-requests" element={<BloodRequestsPage />} />
          <Route path="blood-requests/new" element={<NewBloodRequestPage />} />
          <Route path="blood-inventory" element={<BloodInventoryPage />} />
          <Route path="drone-tracking" element={<DroneTrackingPage />} />
          <Route path="temperature-monitoring" element={<TemperatureMonitoringPage />} />
          <Route path="deliveries" element={<DeliveriesPage />} />
          <Route path="deliveries/:id" element={<DeliveryDetailPage />} />
          <Route path="delivery-history" element={<DeliveryHistoryPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback to Dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
