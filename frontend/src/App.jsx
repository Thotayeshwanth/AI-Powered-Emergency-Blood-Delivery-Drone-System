import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

import Home from './pages/Home';
import HowItWorks from './pages/HowItWorks';
import BloodAccess from './pages/BloodAccess';
import Contact from './pages/Contact';
import Login from './pages/Login';
import HospitalDashboard from './pages/HospitalDashboard';
import BloodBankDashboard from './pages/BloodBankDashboard';
import RequestBlood from './pages/RequestBlood';
import RequestDetails from './pages/RequestDetails';
import DeliveryTracking from './pages/DeliveryTracking';
import NotFound from './pages/NotFound';

function ProtectedRoute({ children, requiredType }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: '#64748B' }}>
        Verifying authorization credentials...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredType && user?.institutionType !== requiredType) {
    return (
      <Navigate
        to={user?.institutionType === 'HOSPITAL' ? '/hospital/dashboard' : '/blood-bank/dashboard'}
        replace
      />
    );
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <main style={{ flex: 1 }}>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/blood-access" element={<BloodAccess />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Login & Portal Entry Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/hospital/login" element={<Login />} />
            <Route path="/blood-bank/login" element={<Login />} />

            {/* Protected Portals */}
            <Route
              path="/hospital/dashboard"
              element={
                <ProtectedRoute requiredType="HOSPITAL">
                  <HospitalDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/blood-bank/dashboard"
              element={
                <ProtectedRoute requiredType="BLOOD_BANK">
                  <BloodBankDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/request-blood"
              element={
                <ProtectedRoute requiredType="HOSPITAL">
                  <RequestBlood />
                </ProtectedRoute>
              }
            />

            <Route
              path="/requests/:id"
              element={
                <ProtectedRoute>
                  <RequestDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/deliveries/:id/tracking"
              element={<DeliveryTracking />}
            />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}
